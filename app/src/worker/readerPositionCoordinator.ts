import { DurableObject } from 'cloudflare:workers'
import { mergeLabPositionStatesByTime, parseLabPositionState, type LabPositionState } from '../lab/labPosition'
import { isValidUUID } from './lib/security'

interface PositionEnv { RATE_LIMIT?: KVNamespace }

/** Private account state. The public route verifies identity before choosing this object. */
export class ReaderPositionCoordinator extends DurableObject<PositionEnv> {
  private importing: Promise<void> | null = null
  constructor(ctx: DurableObjectState, env: PositionEnv) {
    super(ctx, env)
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS reader_position (id INTEGER PRIMARY KEY, value TEXT NOT NULL)')
  }
  private stored(): LabPositionState | null {
    const rows=this.ctx.storage.sql.exec<{value:string}>('SELECT value FROM reader_position WHERE id=1').toArray()
    return rows.length ? JSON.parse(rows[0].value) : null
  }
  private cutoverAt(): number | null {
    const row=this.ctx.storage.sql.exec<{value:string}>('SELECT value FROM reader_position WHERE id=3').toArray()[0]
    return row ? Number(row.value) : null
  }
  private save(state: LabPositionState): void {
    this.ctx.storage.sql.exec('INSERT INTO reader_position VALUES (1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value',JSON.stringify(state))
  }
  private async prepare(owner: string): Promise<void> {
    if(!isValidUUID(owner))throw new Error('Invalid account')
    if(!this.stored()){
      if(!this.importing)this.importing=(async()=>{
        if(!this.env.RATE_LIMIT)throw new Error('Legacy position store unavailable')
        // Failed reads never become an empty canonical record. Concurrent first
        // requests share this promise, without holding a gate over external I/O.
        const raw=await this.env.RATE_LIMIT.get('lab-position:'+owner,'json')
        if(!this.stored()){
          this.ctx.storage.sql.exec('INSERT INTO reader_position VALUES (2,?)',JSON.stringify(raw))
          this.save({...parseLabPositionState(raw,owner),owner})
          // Let any invocation of the previous worker finish and KV propagate
          // before the new coordinator first mirrors over that legacy key.
          this.ctx.storage.sql.exec('INSERT INTO reader_position VALUES (3,?)',String(Date.now()+120_000))
        }
      })().finally(()=>{this.importing=null})
      await this.importing
    }
    if(this.stored()?.owner!==owner)throw new Error('Account mismatch')
    const cutover=this.cutoverAt()
    if(cutover!==null && await this.ctx.storage.getAlarm()===null)
      await this.ctx.storage.setAlarm(Math.max(Date.now()+1500,cutover))
  }
  async read(owner: string): Promise<LabPositionState> {
    await this.prepare(owner)
    return this.stored()!
  }
  async update(owner: string, incoming: LabPositionState): Promise<LabPositionState> {
    await this.prepare(owner)
    // No await separates read, merge and durable write. Both devices' pins and
    // finished lists survive; the newest acknowledged intentional resume wins.
    const stored={...mergeLabPositionStatesByTime(this.stored()!,incoming,{requireSettleAcknowledgement:true}),owner}
    this.save(stored)
    // Maintain the old key for recovery/rollback and old optional observers.
    // A coalesced alarm avoids KV's per-key write-rate limit.
    const alarm=await this.ctx.storage.getAlarm()
    if(alarm===null)await this.ctx.storage.setAlarm(Math.max(Date.now()+1500,this.cutoverAt()??0))
    return stored
  }
  async alarm(): Promise<void> {
    let state=this.stored()
    if(!state || !this.env.RATE_LIMIT)return
    try {
      const cutover=this.cutoverAt()
      if(cutover!==null){
        if(Date.now()<cutover){await this.ctx.storage.setAlarm(cutover);return}
        const legacy=await this.env.RATE_LIMIT.get('lab-position:'+state.owner,'json')
        // Merge against the current row after I/O, preserving saves made while
        // this final legacy read was in flight. Keep both migration snapshots.
        state={...mergeLabPositionStatesByTime(this.stored()!,parseLabPositionState(legacy,state.owner),{requireSettleAcknowledgement:true}),owner:state.owner}
        this.ctx.storage.sql.exec('INSERT INTO reader_position VALUES (4,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value',JSON.stringify(legacy))
        this.save(state)
        this.ctx.storage.sql.exec('DELETE FROM reader_position WHERE id=3')
      }
      const raw=JSON.stringify(state)
      await this.env.RATE_LIMIT.put('lab-position:'+state.owner,raw)
      // Another request may have arrived during the mirror write.
      if(JSON.stringify(this.stored())!==raw)await this.ctx.storage.setAlarm(Date.now()+1500)
    }catch{
      await this.ctx.storage.setAlarm(Date.now()+60_000)
      console.log(JSON.stringify({event:'reader_position_mirror',outcome:'retry'}))
    }
  }
}
