const { chromium, webkit } = require('../../app/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
(async()=>{const results=[];for(const [name,engine,width,height] of [['desktop',chromium,1440,900],['phone',webkit,390,844]]){const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}:{})});const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
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

const requests=[];
await page.route('**/api/**',r=>{
 if(r.request().url().endsWith('/voice-lab'))return r.fulfill({json:{allowed:true}});
 if(r.request().url().includes('voice-session')){requests.push(r.request().postDataJSON());return r.fulfill({json:{transport:{sdp:'fixture'}}})}
 return r.fulfill({status:503,json:{error:'Providers disabled'}})
});
await page.goto((process.env.BASE||'http://127.0.0.1:3001')+'/lab/voice');
await page.getByRole('heading',{name:'Voice test room'}).waitFor();
await page.getByLabel('Preset',{exact:true}).selectOption('1');
await page.getByLabel('Test name').fill('Follow-up trial');
await page.getByLabel('Reasoning model').selectOption('gpt-5.6-sol');
await page.getByRole('button',{name:'Save preset',exact:true}).click();
await page.getByText('Preset saved on this device.').waitFor();
await page.screenshot({path:__dirname+'/'+name+'-settings.png'});
await page.getByRole('button',{name:'Hide test controls'}).click();
await page.getByTestId('lab-super').click();await page.getByTestId('lab-super-row-talk').click();
await page.getByText('Connected',{exact:true}).waitFor();
assert.equal(requests.length,1);assert.equal(requests[0].voiceExperiment.model,'gpt-5.6-sol');assert(requests[0].instructions.includes('nearby')===false);assert(!requests[0].instructions.includes('{{passage}}'));assert(requests[0].instructions.includes('Job 8'));
await page.evaluate(()=>{
 window.emit({type:'session.input_transcript.delta',delta:'Why?'});
 window.emit({type:'response.event',delegation_id:'d1',event:{type:'response.created',response:{id:'r1'}}});
 window.emit({type:'response.event',delegation_id:'d1',event:{type:'response.output_text.delta',delta:'Backend evidence.'}});
 window.emit({type:'response.event',delegation_id:'d1',event:{type:'response.completed'}});
 window.emit({type:'session.output_transcript.delta',delta:'A new spoken point.'});
});
await page.getByRole('button',{name:'Voice test · recording diagnostics'}).click();
await page.getByRole('button',{name:'Results (1)'}).click();
await page.getByText('Backend evidence.',{exact:true}).waitFor();await page.getByText('A new spoken point.',{exact:false}).waitFor();
await page.getByRole('button',{name:'Mark useful answer'}).click();
await page.screenshot({path:__dirname+'/'+name+'-results.png'});
await page.getByRole('button',{name:'Hide test controls'}).click();await page.getByRole('button',{name:'End conversation',exact:true}).click();
const history=await page.evaluate(()=>localStorage.getItem('tinct:chat-history:bible')||'');assert(!history.includes('A new spoken point.'));
await page.getByRole('button',{name:'Voice test',exact:true}).click();
const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export all tests'}).click();const download=await downloadPromise;const downloadPath=await download.path();const report=JSON.parse(fs.readFileSync(downloadPath,'utf8'));assert(report.events.some(e=>e.type==='useful-answer.mark'));assert(report.events.some(e=>e.type==='call.started'&&e.settings.label==='Follow-up trial'));
await page.reload();await page.getByLabel('Preset',{exact:true}).selectOption('2');assert.equal(await page.getByLabel('Test name').inputValue(),'Follow-up trial');
const bundle=await page.locator('script[src*="assets/index-"]').count()?await page.locator('script[src*="assets/index-"]').getAttribute('src'):'development';assert.deepEqual(errors,[]);results.push({name,bundle,settingsSent:true,exported:true,historyIsolated:true,presetSurvivedReload:true,errors});await browser.close();}
fs.writeFileSync(__dirname+'/'+(process.env.BASE?'production':'local')+'.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results))})().catch(e=>{console.error(e);process.exit(1)});
