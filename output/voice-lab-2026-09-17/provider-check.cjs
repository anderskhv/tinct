// Cloud-only diagnostics. Never log credentials, SDP or private transcripts.
if (process.platform === 'darwin') throw new Error('Run voice diagnostics in cloud CI only.');
const fs=require('fs');
(async()=>{
  const cf=process.env.CLOUDFLARE_API_TOKEN;
  if(cf){
    const headers={Authorization:'Bearer '+cf,'Content-Type':'application/json'};
    const accounts=await fetch('https://api.cloudflare.com/client/v4/accounts',{headers}).then(r=>r.json());
    if(!accounts.success) console.log('Cloudflare log access unavailable:',accounts.errors?.map(e=>e.code));
    else for(const account of accounts.result){
      const query={queryId:'voice-startup-diagnostic',timeframe:{from:Date.now()-21600000,to:Date.now()},view:'events',limit:20,parameters:{filters:[{key:'$metadata.message',operation:'includes',type:'string',value:'voice-chain provider error'}]}};
      const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+account.id+'/workers/observability/telemetry/query',{method:'POST',headers,body:JSON.stringify(query)}).then(r=>r.json());
      if(!r.success){console.log('Cloudflare log query unavailable:',r.errors?.map(e=>e.code));continue;}
      const rows=r.result?.events?.events||[];
      // Print only the deliberately minimal provider classification logged by voiceChain.
      for(const row of rows){
        const message=String(row.$metadata?.message||'');
        if(/^voice-chain provider error [a-z_\/]+ \d{3}(?: [a-zA-Z0-9_.-]+)*$/.test(message)) console.log('Provider classification:',message);
      }
      console.log('Matching provider classifications:',rows.length);
    }
  }
  const key=process.env.OPENAI_API_KEY;
  if(!key){
    console.log('REAL_PROVIDER_CHECK_UNAVAILABLE: no OpenAI key in this CI environment; no real handshake was verified.');
    return;
  }
  const {chromium}=require('../../app/node_modules/playwright');
  const browser=await chromium.launch({headless:true,args:['--mute-audio']});
  try{
    const context=await browser.newContext();
    const page=await context.newPage();
    // Silent generated media, never a physical microphone.
    const offer=await page.evaluate(async()=>{
      window.audio=new AudioContext();
      const destination=window.audio.createMediaStreamDestination();
      window.peer=new RTCPeerConnection();
      destination.stream.getTracks().forEach(t=>window.peer.addTrack(t,destination.stream));
      window.channel=window.peer.createDataChannel('oai-events');
      window.opened=new Promise(resolve=>{window.channel.onopen=()=>resolve(true);setTimeout(()=>resolve(false),20000);});
      await window.peer.setLocalDescription(await window.peer.createOffer());
      return window.peer.localDescription.sdp;
    });
    const session={type:'transcription',audio:{input:{noise_reduction:{type:'near_field'},transcription:{model:'gpt-4o-transcribe'},turn_detection:{type:'server_vad',threshold:0.6,prefix_padding_ms:300,silence_duration_ms:900}}}};
    const made=await fetch('https://api.openai.com/v1/realtime/client_secrets',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({session})});
    const data=await made.json();
    if(!made.ok||!data.value) throw new Error('Provider session rejected: '+made.status+' '+(data.error?.code||'unknown'));
    const call=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:'Bearer '+data.value,'Content-Type':'application/sdp'},body:offer});
    if(!call.ok) throw new Error('Provider SDP rejected: '+call.status);
    const sdp=await call.text();
    const connected=await page.evaluate(async sdp=>{await window.peer.setRemoteDescription({type:'answer',sdp});return await window.opened;},sdp);
    if(!connected) throw new Error('Real transcription data channel did not open.');
    await page.evaluate(()=>{window.peer.close();void window.audio.close();});
    console.log('REAL_PROVIDER_CHECK_PASSED: silent transcription WebRTC data channel opened.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exit(1)});
