/** Live, opt-in voice probe. Sends only a public-domain test question.
 * node scripts/realtime-audio-probe.mjs <output-directory> [pcm24k-file]
 * Uses the same short-lived guest credentials as the reader; never logs them.
 * Tests the real speech service, not browser microphone/echo cancellation.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
const out = process.argv[2]
if (!out) throw new Error('Provide an output directory')
await mkdir(out, { recursive: true })
const tokenResponse = await fetch('https://tinct.app/api/lab-voice-session', { method: 'POST', headers: {'Content-Type':'application/json'} })
if (!tokenResponse.ok) throw new Error(`Session endpoint HTTP ${tokenResponse.status}`)
const { value: token, model } = await tokenResponse.json()
if (!token) throw new Error('No ephemeral session credential')
const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, ['realtime', `openai-insecure-api-key.${token}`])
const chunks = [], events = []
let transcript = '', inputTranscript = '', started, firstAudio, requested = false
const send = e => ws.send(JSON.stringify(e))
const pcm = process.argv[3] ? await readFile(process.argv[3]) : null
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => { ws.close(); reject(new Error('Voice probe timed out after 45s')) }, 45000)
  const fail = e => { clearTimeout(timer); ws.close(); reject(e) }
  ws.addEventListener('error', () => fail(new Error('Realtime WebSocket failed')))
  ws.addEventListener('open', () => send({type:'session.update',session:{type:'realtime',instructions:'You are Tinct, a thoughtful reading companion. Explain the firmament in Genesis 1, using the text that it separates the waters above from those below. Answer directly in two concise sentences. Do not announce looking anything up.',audio:{input:{format:{type:'audio/pcm',rate:24000},transcription:{model:'gpt-4o-mini-transcribe'},turn_detection:null},output:{format:{type:'audio/pcm',rate:24000},voice:'marin'}}}}))
  ws.addEventListener('message', ({data}) => {
    const e=JSON.parse(data); events.push({type:e.type,ms:started ? Date.now()-started : 0})
    if(e.type==='error') return fail(new Error(e.error?.message || 'Realtime error'))
    if(e.type==='session.updated' && !requested) {
      requested=true; started=Date.now()
      if(pcm){ send({type:'input_audio_buffer.append',audio:pcm.toString('base64')}); send({type:'input_audio_buffer.commit'}) }
      else send({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:'What is the firmament in Genesis?'}]}})
      send({type:'response.create'})
    }
    if(e.type==='conversation.item.input_audio_transcription.completed') inputTranscript=e.transcript || ''
    if(e.type==='response.output_audio.delta') {firstAudio ??= Date.now(); chunks.push(Buffer.from(e.delta,'base64'))}
    if(e.type==='response.output_audio_transcript.delta') transcript+=e.delta
    if(e.type==='response.done') {
      if(e.response?.status !== 'completed') return fail(new Error(`Response ${e.response?.status}`))
      clearTimeout(timer); ws.close(); resolve()
    }
  })
})
const audio=Buffer.concat(chunks), header=Buffer.alloc(44)
header.write('RIFF');header.writeUInt32LE(audio.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(audio.length,40)
const report={model,input:pcm?'synthetic spoken question':'text question',inputTranscript,transcript,firstAudioMs:firstAudio-started,audioSeconds:audio.length/48000,events}
await writeFile(path.join(out,'answer.wav'),Buffer.concat([header,audio]));await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2))
if(!audio.length || transcript.trim().split(/\s+/).length<12) throw new Error('Incomplete spoken answer')
console.log(JSON.stringify({model,inputTranscript,transcript,firstAudioMs:report.firstAudioMs,audioSeconds:report.audioSeconds}))
