import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepare,validateResults} from './benchmark.mjs';
import {wireRequest,reservation,usageCost,sseEvents,collectOne,schedule} from './collect.mjs';
const suite=JSON.parse(readFileSync(new URL('./cases.json',import.meta.url)));
const config=JSON.parse(readFileSync(new URL('./candidates.json',import.meta.url)));
const m=prepare(suite,config,'calibration');
const req=provider=>m.requests.find(r=>r.settings.provider===provider);
const stream=events=>new Response(events.map(e=>'data: '+JSON.stringify(e)+'\n\n').join(''),{headers:{'x-request-id':'fixture-request'}});
test('providers receive identical system and user text; no evaluation checks or credentials in payload',()=>{
  const a=wireRequest(req('anthropic')),b=wireRequest(req('openai'));
  assert.equal(a.user,b.user);assert.equal(a.system,b.system);
  assert.equal(a.body.output_config.effort,'low');
  assert.equal(b.body.reasoning,undefined);assert.equal(b.body.store,false);
  assert.equal(a.body.temperature,undefined);assert.equal(b.body.tools,undefined);
  assert.equal(JSON.stringify(a.body).includes('checks'),false);
});
test('usage cost includes reasoning output and OpenAI cache discount',()=>{
  assert.equal(usageCost('openai',{input_tokens:1000,output_tokens:1000,input_tokens_details:{cached_tokens:500}}),.0131);
  assert.equal(usageCost('anthropic',{input_tokens:1000,output_tokens:1000}),.012);
  assert.equal(usageCost('anthropic',{input_tokens:1000,output_tokens:1000,cache_creation_input_tokens:20}),null);
  assert.equal(usageCost('openai',null),null);
  assert.ok(reservation(req('openai'))>.012288);
});
test('SSE handles split UTF-8, CRLF and comments without splitting words',async()=>{
  const encoded=new TextEncoder().encode(': keepalive\r\ndata: {"text":"æøå"}\r\n\r\n');
  async function* chunks(){for(const byte of encoded)yield new Uint8Array([byte]);}
  const events=[];for await(const e of sseEvents(chunks()))events.push(e);
  assert.deepEqual(events,[{text:'æøå'}]);
});
test('OpenAI TTFT begins at answer text; reasoning events do not count',async()=>{
  let time=0;
  const r=await collectOne(req('openai'),{now:()=>time+=10,env:{OPENAI_API_KEY:'fixture'},fetchImpl:async()=>stream([
    {type:'response.reasoning_summary_text.delta',delta:'Not answer text'},
    {type:'response.output_text.delta',delta:'Actual answer'},
    {type:'response.completed',response:{model:'fixture-model',status:'completed',reasoning:{effort:'medium'},usage:{input_tokens:10,output_tokens:20}}}
  ])});
  assert.equal(r.status,'ok');assert.equal(r.response,'Actual answer');assert.equal(r.ttft_ms,10);
  assert.equal(r.resolved_effort,'medium');assert.equal(r.request_id,'fixture-request');
});
test('Anthropic usage survives separate start and terminal events',async()=>{
  const r=await collectOne(req('anthropic'),{env:{ANTHROPIC_API_KEY:'fixture'},fetchImpl:async()=>stream([
    {type:'message_start',message:{model:'fixture-model',usage:{input_tokens:100,output_tokens:1}}},
    {type:'content_block_delta',delta:{type:'thinking_delta',thinking:'Not answer text'}},
    {type:'content_block_delta',delta:{type:'text_delta',text:'Actual answer'}},
    {type:'message_delta',delta:{stop_reason:'end_turn'},usage:{output_tokens:50}},
    {type:'message_stop'}
  ])});
  assert.equal(r.status,'ok');assert.equal(r.response,'Actual answer');
  assert.equal(r.usage.input_tokens,100);assert.equal(r.usage.output_tokens,50);
});
test('truncation, terminal errors, empty answers and premature EOF are not successes',async()=>{
  const scenarios=[
    ['openai',[{type:'response.incomplete',response:{status:'incomplete',incomplete_details:{reason:'max_output_tokens'}}}],'truncated'],
    ['anthropic',[{type:'message_delta',delta:{stop_reason:'max_tokens'}},{type:'message_stop'}],'truncated'],
    ['openai',[{type:'response.output_text.delta',delta:'Partial'}],'error'],
    ['openai',[{type:'response.completed',response:{status:'completed'}}],'error'],
    ['anthropic',[{type:'error',error:{type:'overloaded_error'}},{type:'message_stop'}],'error']
  ];
  for(const [provider,events,status] of scenarios){
    const r=await collectOne(req(provider),{env:{},fetchImpl:async()=>stream(events)});
    assert.equal(r.status,status);
  }
});
test('HTTP failure and timeout are classified without persisting sensitive error bodies',async()=>{
  const a=await collectOne(req('openai'),{env:{OPENAI_API_KEY:'private'},fetchImpl:async()=>new Response('do not store this body',{status:401})});
  assert.equal(a.error_code,'http_401');assert.equal(a.response,'');
  assert.equal(JSON.stringify(a).includes('do not store'),false);
  const b=await collectOne(req('openai'),{env:{},fetchImpl:async()=>{throw new DOMException('timeout','TimeoutError');}});
  assert.equal(b.status,'timeout');
});
test('scheduler preserves pairs, repeats and balanced provider ordering',()=>{
  const s=schedule(m.requests,()=>0);
  assert.equal(s.length,m.requests.length);
  assert.equal(new Set(s.map(r=>[r.case_id,r.repeat,r.candidate].join('/'))).size,s.length);
  for(let i=0;i<s.length;i+=2){
    assert.equal(s[i].case_id,s[i+1].case_id);assert.equal(s[i].repeat,s[i+1].repeat);
    if(i>=2)assert.notEqual(s[i].candidate,s[i-2].candidate);
  }
});
test('collector output integrates with offline outcome validation',async()=>{
  const manifest=prepare({...suite,cases:suite.cases.slice(0,1)},{...config,repeats:1});
  const results=[];
  for(const request of manifest.requests){
    const events=request.settings.provider==='openai'?[
      {type:'response.output_text.delta',delta:'Synthetic fixture'},
      {type:'response.completed',response:{model:'fixture-model',status:'completed'}}
    ]:[
      {type:'message_start',message:{model:'fixture-model'}},
      {type:'content_block_delta',delta:{type:'text_delta',text:'Synthetic fixture'}},
      {type:'message_delta',delta:{stop_reason:'end_turn'}},{type:'message_stop'}
    ];
    results.push(await collectOne(request,{env:{},fetchImpl:async()=>stream(events)}));
  }
  validateResults(manifest,results);
});
