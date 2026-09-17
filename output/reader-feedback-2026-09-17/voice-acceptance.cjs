const { chromium } = require('../../app/node_modules/playwright');
const fs = require('fs');
const assert = require('assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', email: 'fixture@example.com' };
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: 'fixture-token', refresh_token: 'fixture-refresh', expires_at: Math.floor(Date.now()/1000)+3600, user }));
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'web-en', savedPlace: { bookId: 'bible', chapterNumber: 444, paragraphIndex: 0, page: 0 } }));
    window.sent = [];
    navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [], getAudioTracks: () => [] });
    window.RTCPeerConnection = class {
      iceGatheringState = 'complete';
      addTrack() {}
      createDataChannel() { const dc = new EventTarget(); dc.readyState = 'open'; dc.send = data => window.sent.push(JSON.parse(data)); dc.close = () => {}; window.dc = dc; return dc; }
      async createOffer() { return { type: 'offer', sdp: 'fixture' }; }
      async setLocalDescription(description) { this.localDescription = description; }
      async setRemoteDescription() { window.dc.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'session.started' }) })); }
      close() {}
    };
    window.emit = event => window.dc.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(event) }));
  });
  await page.route('**/*.supabase.co/**', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  const voiceRequests=[];
  await page.route('**/api/**', route => {
    const url = route.request().url();
    if (url.includes('voice-session')) {voiceRequests.push(route.request().postDataJSON());return route.fulfill({ json: { transport: { sdp: 'fixture' } } });}
    if (/\/(lab-)?chat$/.test(url)) return route.fulfill({json:{content:[{text:'An explanation saved before voice begins.'}]}});
    if (url.includes('voice-research')) return route.fulfill({ json: { ok: true, notes: 'Controlled source fixture for link acceptance.', sources: [{ title: 'Source fixture', url: 'https://example.com/source' }] } });
    return route.fulfill({ status: 503, json: { error: 'Provider calls disabled during acceptance' } });
  });
  await page.goto((process.env.BASE||'http://127.0.0.1:3001')+'/lab/phone?chrome=v2', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid=lab-word]').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  const a=await page.locator('[data-testid=lab-word]').nth(1).boundingBox(),z=await page.locator('[data-testid=lab-word]').nth(8).boundingBox();
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(z.x+z.width/2,z.y+z.height/2,{steps:10});await page.mouse.up();
  await page.getByRole('button',{name:'Explain',exact:true}).click();
  await page.getByText('An explanation saved before voice begins.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Talk about this explanation'}).click();
  await page.waitForFunction(() => window.dc);
  await page.getByTestId('lab-call-status').filter({ hasText: 'Live' }).waitFor();
  assert(JSON.stringify(voiceRequests).includes('An explanation saved before voice begins.'),'voice context keeps explanation');
  assert.equal(await page.locator('.lab-call').getByText('An explanation saved before voice begins.',{exact:true}).count(),0,'call does not display old explanation');
  await page.screenshot({path:__dirname+'/voice-handoff.png'});
  await page.evaluate(() => {
    window.emit({ type: 'session.input_transcript.delta', delta: 'Which sources discuss this?' });
    for (const event of [
      { type: 'response.created', response: { id: 'response-test' } },
      { type: 'response.output_item.done', item: { type: 'function_call', name: 'search_reading_sources', call_id: 'research-test', arguments: '{"query":"A public source question"}' } },
      { type: 'response.completed' },
    ]) window.emit({ type: 'response.event', delegation_id: 'delegation-test', event });
  });
  await page.waitForFunction(() => window.sent.some(event => event.item?.call_id === 'research-test'));
  const tool = await page.evaluate(() => JSON.parse(window.sent.find(event => event.item?.call_id === 'research-test').item.output));
  assert(JSON.stringify(tool).includes("I've added the source links in chat."), JSON.stringify(tool));
  await page.evaluate(() => window.emit({ type: 'session.output_transcript.delta', delta: "Here is the sourced answer. I've added the source links in chat." }));
  await page.getByTestId('lab-call-end').click();
  await page.getByTestId('lab-super').click();
  await page.getByTestId('lab-super-row-chat').click();
  await page.getByRole('link', { name: '1', exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: '1', exact: true }).getAttribute('href'), 'https://example.com/source');
  const history = await page.evaluate(() => localStorage.getItem('tinct:chat-history:bible'));
  assert(history.includes('https://example.com/source'));
  const bundle = await page.locator('script[src*="assets/index-"]').count() ? await page.locator('script[src*="assets/index-"]').getAttribute('src') : 'development';
  const result = { bundle, sourceLinkRendered: true, sourceLinkPersisted: true, acknowledgmentInstructionDelivered: true, transportAndResearch: 'mocked; no live microphone, voice inference or authenticated research', viewport: '390x844' };
  await page.screenshot({ path: __dirname + '/voice-chat.png' });
  fs.writeFileSync(__dirname + '/voice-acceptance.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
