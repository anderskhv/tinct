/** Streams 24 kHz signed 16-bit PCM. Audio stays ordered; one following chunk prefetches. */
export class ChainSpeechPlayer {
  private queue: { text: string; response?: Promise<Response> }[] = []
  private sources = new Set<AudioBufferSourceNode>()
  private epoch = 0
  private running = false
  private nextTime = 0
  private release = new Set<() => void>()
  constructor(
    private context: AudioContext,
    private destination: AudioNode,
    private request: (text: string) => Promise<Response>,
    private started: (text: string) => void,
    private completed: (text: string) => void,
    private drained: () => void,
    private failed: (error: unknown) => void,
  ) {}
  get busy() { return this.running || this.queue.length > 0 }
  enqueue(text: string) {
    if (!text.trim()) return
    this.queue.push({ text })
    this.prefetch()
    if (!this.running) void this.pump(this.epoch)
  }
  private prefetch() {
    for (const job of this.queue.slice(0, this.running ? 1 : 2)) {
      if (!job.response) { job.response = this.request(job.text); void job.response.catch(() => {}) }
    }
  }
  private async pump(epoch: number) {
    this.running = true
    try {
      while (this.queue.length && epoch === this.epoch) {
        const job = this.queue.shift()!
        job.response ??= this.request(job.text)
        this.prefetch()
        const response = await job.response
        if (epoch !== this.epoch) { await response.body?.cancel(); return }
        if (!response.ok || !response.body) throw new Error('Speech could not be generated.')
        await this.play(response.body, job.text, epoch)
        if (epoch === this.epoch) this.completed(job.text)
      }
    } catch (error) { if (epoch === this.epoch) this.failed(error) }
    finally {
      if (epoch === this.epoch) { this.running = false; this.drained() }
    }
  }
  private async play(body: ReadableStream<Uint8Array>, text: string, epoch: number) {
    const reader = body.getReader()
    let remainder = new Uint8Array(0), first = true
    const endings: Promise<void>[] = []
    try {
      while (epoch === this.epoch) {
        const { done, value } = await reader.read()
        if (done) break
        if (epoch !== this.epoch) break
        const bytes = new Uint8Array(remainder.length + value.length)
        bytes.set(remainder); bytes.set(value, remainder.length)
        const count = Math.floor(bytes.length / 2)
        remainder = bytes.slice(count * 2)
        if (!count) continue
        const buffer = this.context.createBuffer(1, count, 24000), samples = buffer.getChannelData(0)
        const view = new DataView(bytes.buffer)
        for (let i = 0; i < count; i++) samples[i] = view.getInt16(i * 2, true) / 32768
        const source = this.context.createBufferSource()
        source.buffer = buffer; source.connect(this.destination)
        const time = Math.max(this.nextTime, this.context.currentTime + 0.025)
        this.nextTime = time + buffer.duration
        this.sources.add(source)
        endings.push(new Promise<void>(resolve => {
          const finish = () => { this.release.delete(finish); this.sources.delete(source); source.disconnect(); resolve() }
          this.release.add(finish); source.onended = finish
        }))
        // Notification is tied to the audio clock, including pauses.
        if (first) {
          first = false
          const notify = () => {
            if (epoch !== this.epoch) return
            if (this.context.state === 'running' && this.context.currentTime >= time) this.started(text)
            else setTimeout(notify, 20)
          }
          setTimeout(notify, 30)
        }
        source.start(time)
      }
      if (remainder.length) throw new Error('Incomplete speech audio.')
      await Promise.all(endings)
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
  }
  pause() { return this.context.suspend() }
  resume() { return this.context.resume() }
  cancel() {
    this.epoch++
    this.queue = []; this.running = false; this.nextTime = 0
    for (const source of this.sources) { try { source.stop() } catch { /* Already ended. */ } }
    this.sources.clear()
    for (const finish of this.release) finish()
    this.release.clear()
  }
}
