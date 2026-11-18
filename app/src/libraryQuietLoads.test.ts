// A tapped book has the connection to itself (phone QA, 2026-10-15): on a throttled phone the
// hero book took 9.5 s to open while the other featured books' scenes (~300 KB each), sketches
// and covers were still downloading. While a book opens, the optional warming stops and waits.
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { createQuietLoads, stopOnAbort } from '../public/lab/library_2/quiet-loads.js'

const tick = () => new Promise(r => setTimeout(r, 0))
/** A download that settles when told to, and records whether it was stopped. */
function download() {
  let finish = () => {}
  const state = { started: 0, stopped: 0 }
  const task = vi.fn((signal: AbortSignal) => {
    state.started++
    return new Promise<void>((resolve, reject) => {
      finish = resolve
      signal.addEventListener('abort', () => { state.stopped++; reject(new Error('stopped')) })
    })
  })
  return { task, state, finish: () => finish() }
}

describe('quiet loads (library_2/quiet-loads.js)', () => {
  it('runs a warming load at once when no book is opening', () => {
    const quiet = createQuietLoads(), d = download()
    quiet.run('scene:odyssey', d.task)
    expect(d.state.started).toBe(1)
    expect(quiet.active).toEqual(['scene:odyssey'])
  })

  it('stops the loads in flight when a book opens, and restarts them once it is open', async () => {
    const quiet = createQuietLoads(), d = download()
    quiet.run('scene:odyssey', d.task)
    const release = quiet.hold()
    expect(d.state.stopped).toBe(1)
    expect(quiet.pending).toEqual(['scene:odyssey'])
    await tick()
    release()
    expect(d.state.started).toBe(2)
    expect(quiet.active).toEqual(['scene:odyssey'])
  })

  it('keeps new loads waiting while a book opens', () => {
    const quiet = createQuietLoads(), d = download()
    const release = quiet.hold()
    quiet.run('sheet:meditations', d.task)
    expect(d.state.started).toBe(0)
    release()
    expect(d.state.started).toBe(1)
  })

  it('does not restart a load that finished before the book opened', async () => {
    const quiet = createQuietLoads(), d = download()
    quiet.run('cover:the-prince', d.task)
    d.finish(); await tick(); await tick()
    expect(quiet.active).toEqual([])
    quiet.hold()()
    expect(d.state.started).toBe(1)
    expect(d.state.stopped).toBe(0)
  })

  it('waits for the last of several openings, and a release counts once', () => {
    const quiet = createQuietLoads(), d = download()
    const first = quiet.hold(), second = quiet.hold()
    quiet.run('scene:odyssey', d.task)
    first(); first()
    expect(quiet.held).toBe(true)
    expect(d.state.started).toBe(0)
    second()
    expect(quiet.held).toBe(false)
    expect(d.state.started).toBe(1)
  })

  it('runs one load per key, and survives a task that throws', () => {
    const quiet = createQuietLoads(), d = download()
    quiet.run('scene:odyssey', d.task); quiet.run('scene:odyssey', d.task)
    expect(d.state.started).toBe(1)
    expect(() => quiet.run('broken', () => { throw new Error('no') })).not.toThrow()
  })

  it('stops an image only when nothing came to need it', async () => {
    const image = () => ({ removeAttribute: vi.fn() })
    const warming = image(), needed = image(), plain = image()
    const controller = new AbortController()
    let need = false
    const stopped = stopOnAbort(warming as unknown as HTMLImageElement, controller.signal)
    const kept = stopOnAbort(needed as unknown as HTMLImageElement, controller.signal, () => need)
    stopOnAbort(plain as unknown as HTMLImageElement, undefined)
    let keptSettled = false
    kept.then(() => { keptSettled = true }, () => { keptSettled = true })
    need = true
    controller.abort()
    // The stopped image's load is over (its decode() may never settle); a kept one goes on.
    await expect(stopped).rejects.toThrow('Stopped for an opening book')
    await tick()
    expect(keptSettled).toBe(false)
    expect(warming.removeAttribute).toHaveBeenCalledWith('src')
    expect(needed.removeAttribute).not.toHaveBeenCalled()
    expect(plain.removeAttribute).not.toHaveBeenCalled()
  })
})

describe('the library wires the quiet loads (library_2/app.js)', () => {
  const app = readFileSync('public/lab/library_2/app.js', 'utf8')
  it('holds the warming for as long as a book is opening', () => {
    expect(app).toContain('async function openBook(book,canvas){if(activeBook)return;const release=quiet.hold();try{await openingBook(book,canvas);}finally{release();}}')
    // The opening book's own cover asks first; its sketches follow once the cover, introduction and flap are in.
    expect(app).toContain("if(need>=COVER_HERO_PX)im.fetchPriority='high'")
    expect(app).toMatch(/if\(activeBook\)return;warmSheet\(book\.id\);activeBook=book;/)
  })
  it('lets covers coming near the screen wait while a book opens', () => {
    expect(app).toContain("observer().unobserve(entry.target);quiet.run('shelf:'+book.id,()=>shelfCover(book));")
  })
  it('warms the other featured books only through the quiet loads', () => {
    expect(app).toContain("const warm=()=>featuredBooks.forEach(b=>{quiet.run('sheet:'+b.id,signal=>warmSheet(b.id,signal));quiet.run('cover:'+b.id,signal=>ensureCover(b,COVER_HERO_PX,signal));if(sceneIds.has(b.id))quiet.run('scene:'+b.id,signal=>loadScene(b.id,true,signal));});")
  })
})
