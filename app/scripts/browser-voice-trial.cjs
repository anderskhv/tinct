/** Opt-in real WebRTC test. Uses a fresh browser profile and synthetic speech,
 * never the user's microphone. No response or AI endpoint is stubbed.
 * Run from app/: node scripts/browser-voice-trial.cjs <full|mini> <fixtures> <output> [base] [conversation|resume|disconnect]
 */
const { createRequire } = require('node:module');
const req = createRequire(process.cwd() + '/package.json');
const { chromium } = req('playwright');
const fs = require('node:fs');
const path = require('node:path');
const [model, fixtures, out, base = 'https://tinct.app', scenario = 'conversation'] = process.argv.slice(2);
if (!['full', 'mini'].includes(model) || !fixtures || !out)
    throw Error('Expected model, fixtures directory and output directory');
fs.mkdirSync(out, { recursive: true });
const INIT = () => {
    const p = window.__voiceProbe = { events: [], chunks: [], pc: null, ctx: null, dest: null, recorders: [] };
    const log = (direction, e) => p.events.push({ direction, at: performance.now(), ...e });
    navigator.mediaDevices.getUserMedia = async () => {
        p.ctx = new AudioContext();
        p.dest = p.ctx.createMediaStreamDestination();
        const bed = p.ctx.createConstantSource();
        const gain = p.ctx.createGain();
        gain.gain.value = 0.00001;
        bed.connect(gain).connect(p.dest);
        bed.start();
        await p.ctx.resume();
        return p.dest.stream;
    };
    p.speak = async (b64) => {
        const bytes = Uint8Array.from(atob(b64), x => x.charCodeAt(0));
        const buffer = await p.ctx.decodeAudioData(bytes.buffer);
        await p.ctx.resume();
        const source = p.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(p.dest);
        log('test', { type: 'input.start', tracks: p.pc.getSenders().map(s => ({ enabled: s.track?.enabled, state: s.track?.readyState })), context: p.ctx.state });
        source.start();
        await new Promise(r => source.onended = r);
        log('test', { type: 'input.end' });
    };
    const Native = window.RTCPeerConnection;
    window.RTCPeerConnection = class extends Native {
        constructor(...args) {
            super(...args);
            p.pc = this;
            this.addEventListener('track', e => {
                const recorder = new MediaRecorder(new MediaStream([e.track]));
                p.recorders.push(recorder);
                recorder.ondataavailable = e => { if (e.data.size)
                    p.chunks.push(e.data); };
                recorder.start(500);
            });
        }
        createDataChannel(...args) {
            const dc = super.createDataChannel(...args);
            p.dc = dc;
            const send = dc.send.bind(dc);
            dc.send = data => { try {
                log('out', JSON.parse(data));
            }
            catch { } ; send(data); };
            dc.addEventListener('message', e => { try {
                log('in', JSON.parse(e.data));
            }
            catch { } });
            return dc;
        }
    };
    p.recording = async () => { await Promise.all(p.recorders.filter(r => r.state !== 'inactive').map(r => new Promise(resolve => { r.addEventListener('stop', resolve, { once: true }); r.stop(); }))); const buffer = await new Blob(p.chunks, { type: 'audio/webm' }).arrayBuffer(); let str = ''; for (const b of new Uint8Array(buffer))
        str += String.fromCharCode(b); return btoa(str); };
};
(async () => {
    const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
    await context.addInitScript(INIT);
    const page = await context.newPage();
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { const u = new URL(r.url()); if (u.pathname.startsWith('/api/'))
        requests.push({ path: u.pathname, method: r.method() }); });
    const results = [];
    const capture = async () => {
        if (requests.some(r => r.path === '/api/lab-chat' || r.path === '/api/chat')) {
            errors.push('Direct trial called a separate companion');
            process.exitCode = 1;
        }
        const events = await page.evaluate(() => window.__voiceProbe.events);
        // SDP and ephemeral HTTP credentials are never included in this event log.
        fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ model, scenario, results, errors, requests, events }, null, 2));
        try {
            const b64 = await page.evaluate(() => window.__voiceProbe.recording());
            fs.writeFileSync(path.join(out, 'conversation.webm'), Buffer.from(b64, 'base64'));
        }
        catch { }
        await page.screenshot({ path: path.join(out, 'final.png') });
    };
    try {
        await page.goto(`${base}/lab/phone?chrome=v2&voiceTrial=${model}`, { waitUntil: 'domcontentloaded' });
        await page.getByTestId('lab-header-chapter').waitFor({ timeout: 20000 });
        await page.getByTestId('lab-v2-play').click();
        await page.waitForFunction(() => document.querySelector('[data-testid="lab-listen-status"]')?.dataset.playing === 'true', {}, { timeout: 30000 });
        await page.getByTestId('lab-super').click();
        await page.getByTestId('lab-super-row-talk').click();
        await page.waitForFunction(() => window.__voiceProbe.events.some(e => e.type === 'session.updated'), {}, { timeout: 30000 });
        const actualModel = await page.evaluate(() => window.__voiceProbe.events.find(e => e.type === 'session.updated').session.model);
        if (actualModel !== (model === 'full' ? 'gpt-realtime-2.1' : 'gpt-realtime-2.1-mini'))
            throw Error(`Unexpected model: ${actualModel}`);
        async function utterance(name, { interrupt = false } = {}) {
            const start = await page.evaluate(() => window.__voiceProbe.events.length);
            const b64 = fs.readFileSync(path.join(fixtures, name + '.wav')).toString('base64');
            await page.evaluate(b64 => window.__voiceProbe.speak(b64), b64);
            await page.waitForFunction(start => {
                const events = window.__voiceProbe.events.slice(start);
                const transcript = events.find(e => e.type === 'conversation.item.input_audio_transcription.completed');
                const responses = new Set(events.filter(e => e.type === 'response.created' && e.at >= transcript?.at).map(e => e.response.id));
                return events.some(e => e.type === 'output_audio_buffer.started' && responses.has(e.response_id));
            }, start, { timeout: 60000 });
            if (interrupt)
                return start;
            await page.waitForFunction(start => {
                const events = window.__voiceProbe.events.slice(start);
                const transcript = events.find(e => e.type === 'conversation.item.input_audio_transcription.completed');
                const responses = new Set(events.filter(e => e.type === 'response.created' && e.at >= transcript?.at).map(e => e.response.id));
                const lastStarted = events.filter(e => e.type === 'output_audio_buffer.started').at(-1);
                return lastStarted && responses.has(lastStarted.response_id) && events.some(e => e.type === 'output_audio_buffer.stopped' && e.response_id === lastStarted.response_id);
            }, start, { timeout: 90000 });
            const ev = await page.evaluate(start => window.__voiceProbe.events.slice(start), start);
            const transcription = ev.find(e => e.type === 'conversation.item.input_audio_transcription.completed');
            const started = new Set(ev.filter(e => e.type === 'response.created' && e.at >= transcription?.at).map(e => e.response.id));
            const answer = ev.filter(e => started.has(e.response_id) && (e.type === 'response.output_audio_transcript.done' || e.type === 'response.audio_transcript.done')).map(e => e.transcript).join('\n');
            const input = ev.find(e => e.type === 'conversation.item.input_audio_transcription.completed')?.transcript;
            const ended = ev.find(e => e.type === 'input.end')?.at;
            const audio = ev.find(e => e.type === 'output_audio_buffer.started' && started.has(e.response_id))?.at;
            const report = { name, input, answer, firstAudioAfterInputMs: Math.round(audio - ended), tools: ev.filter(e => e.type === 'response.function_call_arguments.done').map(e => e.name), cancellations: ev.filter(e => e.direction === 'out' && e.type === 'response.cancel').length };
            results.push(report);
            console.log(JSON.stringify(report));
            if (!input || !answer)
                throw Error(`Missing transcript/answer for ${name}`);
            return start;
        }
        if (scenario === 'resume') {
            await utterance('resume');
            await page.waitForFunction(() => document.querySelector('[data-testid="lab-listen-status"]')?.dataset.playing === 'true', {}, { timeout: 12000 });
            results.push({ name: 'spoken_resume', audiobookPlaying: true });
            await capture();
            return;
        }
        if (scenario === 'disconnect') {
            await page.evaluate(() => window.__voiceProbe.dc.close());
            await page.getByTestId('lab-call-reconnect').waitFor({ timeout: 15000 });
            await page.screenshot({ path: path.join(out, 'disconnected.png') });
            await page.getByTestId('lab-call-reconnect').click();
            await page.waitForTimeout(2000);
            const accountRequired = (await page.locator('body').innerText()).includes('Create a free account to keep chatting');
            if (!accountRequired) throw Error('Expected the existing guest account gate on a second session');
            results.push({ name: 'guest_reconnect', accountRequired, signedInReconnectTested: false });
            await capture();
            return;
        }
        for (const name of ['firmament', 'interpretation', 'retrieval'])
            await utterance(name);
        const silence = await page.evaluate(() => window.__voiceProbe.events.filter(e => e.direction === 'out' && e.type === 'response.create').length);
        await page.waitForTimeout(5000);
        const afterSilence = await page.evaluate(() => window.__voiceProbe.events.filter(e => e.direction === 'out' && e.type === 'response.create').length);
        results.push({ name: 'silence', unexpectedResponses: afterSilence - silence });
        if (afterSilence !== silence)
            throw Error('Assistant responded to silence');
        await utterance('long', { interrupt: true });
        await utterance('interrupt');
        if (results.at(-1).cancellations !== 1)
            throw Error('Expected exactly one confirmed interruption');
        await page.getByTestId('lab-call-transcript').click();
        await page.getByTestId('lab-call-bar').waitFor();
        await page.getByTestId('lab-call-bar-end').click();
        await page.waitForFunction(() => !document.querySelector('[data-testid="lab-call-bar"]'), {}, { timeout: 10000 });
        // Back to book is the approved return path after a call from playback.
        if (await page.getByTestId('lab-ask-done').count())
            await page.getByTestId('lab-ask-done').click();
        const playing = await page.getByTestId('lab-listen-status').getAttribute('data-playing');
        results.push({ name: 'hangup_and_return', audiobookPlaying: playing });
        if (playing !== 'true')
            throw Error('Audiobook did not resume after hangup and return');
        if (playing === 'true')
            await page.getByTestId('lab-v2-play').click();
        if (requests.some(r => r.path === '/api/lab-chat' || r.path === '/api/chat'))
            throw Error('Direct trial called a separate companion');
        await capture();
        console.log('Browser trial complete');
    }
    catch (e) {
        errors.push(e.message);
        await capture();
        console.error(e.message);
        process.exitCode = 1;
    }
    finally {
        await browser.close();
    }
})();
