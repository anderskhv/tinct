import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { randomInt } from 'node:crypto';
import { hash, validateResults } from './benchmark.mjs';

const providers = {
  openai: { origin:'https://api.openai.com', path:'/v1/responses', model:'gpt-5.6-terra', key:'OPENAI_API_KEY', input:2, output:12, cached:.2 },
  anthropic: { origin:'https://api.anthropic.com', path:'/v1/messages', model:'claude-sonnet-5', key:'ANTHROPIC_API_KEY', input:2, output:10, cached:.2 }
};
export const MAX_USD = 10;
export function wireRequest(r) {
  const p=providers[r.settings.provider];
  if (!p || r.settings.model!==p.model || r.settings.tools!=='none' ||
      r.settings.temperature!=='provider-default' || !Number.isInteger(r.settings.max_output_tokens) ||
      r.settings.max_output_tokens<1 || r.settings.max_output_tokens>8192) throw Error('Unsupported collection configuration');
  const {system,...context}=r.prompt;
  const user=JSON.stringify(context,null,2);
  let body;
  if(r.settings.provider==='openai') {
    body={model:p.model,instructions:system,input:[{role:'user',content:user}],store:false,stream:true,max_output_tokens:r.settings.max_output_tokens,service_tier:'default'};
    if(r.settings.effort!=='provider-default') body.reasoning={effort:r.settings.effort};
  } else {
    body={model:p.model,system,messages:[{role:'user',content:user}],stream:true,max_tokens:r.settings.max_output_tokens};
    if(r.settings.effort!=='provider-default') body.output_config={effort:r.settings.effort};
  }
  return {url:p.origin+p.path,body,user,system,provider:p};
}
export function reservation(r) {
  const w=wireRequest(r);
  // UTF-8 bytes upper-bound ordinary BPE input tokens; include generous envelope overhead.
  return ((Buffer.byteLength(w.system+w.user)+2048)*w.provider.input+
    r.settings.max_output_tokens*w.provider.output)/1e6;
}
export function usageCost(provider, usage) {
  if(!usage) return null;
  const p=providers[provider];
  const i=usage.input_tokens,o=usage.output_tokens;
  if(!Number.isFinite(i)||!Number.isFinite(o)||i<0||o<0) return null;
  if(provider==='openai') {
    const cached=usage.input_tokens_details?.cached_tokens||0;
    return ((i-cached)*p.input+cached*p.cached+o*p.output)/1e6;
  }
  // Explicit caching is not enabled. If writes unexpectedly occur, avoid pretending to know their TTL/rate.
  if(usage.cache_creation_input_tokens) return null;
  return (i*p.input+(usage.cache_read_input_tokens||0)*p.cached+o*p.output)/1e6;
}
export async function* sseEvents(body) {
  const decoder=new TextDecoder();
  let buffer='';
  for await(const chunk of body) {
    buffer+=decoder.decode(chunk,{stream:true});
    // Normalize CRLF only after a complete line has arrived.
    let index;
    while((index=buffer.search(/\r?\n\r?\n/))>=0) {
      const separator=buffer.slice(index).match(/^\r?\n\r?\n/)[0];
      const block=buffer.slice(0,index); buffer=buffer.slice(index+separator.length);
      const data=block.split(/\r?\n/).filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trimStart()).join('\n');
      if(data && data!=='[DONE]') yield JSON.parse(data);
    }
  }
  buffer+=decoder.decode();
  if(buffer.trim()) throw Error('Incomplete SSE frame');
}
export async function collectOne(r,{fetchImpl=fetch,env=process.env,now=()=>performance.now(),timeoutMs=120000}={}) {
  const w=wireRequest(r),start=now(),started_at=new Date().toISOString();
  let response='',ttft=null,terminal=false,complete=false,status='error',stop_reason=null,usage=null,model='provider-unreported',effort='provider-unreported',error_code=null,request_id=null;
  const headers={'content-type':'application/json'};
  if(r.settings.provider==='openai') headers.authorization='Bearer '+env[w.provider.key];
  else { headers['x-api-key']=env[w.provider.key];headers['anthropic-version']='2023-06-01'; }
  try {
    const res=await fetchImpl(w.url,{method:'POST',headers,body:JSON.stringify(w.body),signal:AbortSignal.timeout(timeoutMs)});
    request_id=res.headers.get('x-request-id')||res.headers.get('request-id');
    if(!res.ok) { error_code='http_'+res.status; }
    else {
      for await (const e of sseEvents(res.body)) {
        let delta='';
        if(r.settings.provider==='openai') {
          if(e.type==='response.output_text.delta') delta=e.delta;
          if(e.response?.model) model=e.response.model;
          if(e.response?.reasoning?.effort) effort=e.response.reasoning.effort;
          if(['response.completed','response.incomplete','response.failed'].includes(e.type)) {
            terminal=true;usage=e.response?.usage||null;
            complete=e.type==='response.completed';
            stop_reason=e.response?.incomplete_details?.reason||e.response?.status||e.type;
            status=complete?'ok':e.type==='response.incomplete'?'truncated':'error';
          }
          if(e.type==='error') {error_code='provider_stream_error';status='error';}
        } else {
          if(e.type==='message_start') { model=e.message.model||model;usage=e.message.usage||null; }
          if(e.type==='content_block_delta' && e.delta?.type==='text_delta') delta=e.delta.text;
          if(e.type==='message_delta') {
            usage={...usage,...e.usage};stop_reason=e.delta?.stop_reason||null;
            status=stop_reason==='max_tokens'?'truncated':['end_turn','stop_sequence','refusal'].includes(stop_reason)?'ok':'error';
          }
          if(e.type==='message_stop') terminal=true;
          if(e.type==='error') {error_code='provider_stream_error';status='error';}
        }
        if(delta) {if(ttft===null)ttft=now()-start;response+=delta;}
      }
      if(!terminal) {status='error';error_code ||= 'missing_terminal_event';}
      if(status==='ok'&&!response.trim()) {status='error';error_code='empty_answer';}
      if(error_code) status='error';
    }
  } catch(e) {status=['TimeoutError','AbortError'].includes(e.name)?'timeout':'error';error_code=status==='timeout'?'request_timeout':'stream_or_network_error';}
  return {
    run_id:r.run_id,case_id:r.case_id,repeat:r.repeat,candidate:r.candidate,
    request_hash:r.request_hash,config_hash:r.config_hash,status,response,resolved_model:model,
    elapsed_ms:Math.max(0,now()-start),ttft_ms:ttft,cost_usd:usageCost(r.settings.provider,usage),
    usage,started_at,stop_reason,error_code,request_id,resolved_effort:effort,
    wire_hash:hash(w.body),word_count:response.trim()?response.trim().split(/\s+/).length:0
  };
}
export function schedule(requests, coin=()=>randomInt(2)) {
  const groups=new Map();
  for(const r of requests) {const k=r.repeat+'/'+r.case_id;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
  const pairs=[...groups.values()].sort((a,b)=>a[0].repeat-b[0].repeat);
  // Balanced first-provider order within every pass, randomized initial parity.
  let parity=coin();
  return pairs.flatMap((pair,i)=>{if(pair.length!==2)throw Error('Every case/repeat must have two candidates');return (i+parity)%2?[...pair].reverse():pair;});
}
async function main([manifestPath,out]) {
  if(!manifestPath||!out||existsSync(out)) throw Error('Usage: collect.mjs MANIFEST NEW_OUTPUT_DIRECTORY');
  const m=JSON.parse(readFileSync(manifestPath,'utf8'));
  if(m.requests.length>144 || !m.requests.length) throw Error('This approved pilot allows at most 144 requests');
  for(const p of Object.values(providers)) if(!process.env[p.key])throw Error('Missing cloud credential: '+p.key);
  for(const r of m.requests) {
    wireRequest(r);
    if(r.run_id!==m.run_id||r.request_hash!==hash(r.prompt)||r.config_hash!==hash(r.settings)) throw Error('Manifest integrity failure');
  }
  mkdirSync(out,{recursive:true});
  const order=schedule(m.requests);
  writeFileSync(join(out,'collection.json'),JSON.stringify({
    run_id:m.run_id,manifest_hash:hash(m),created_at:new Date().toISOString(),
    authorization:'Anders approved the paired benchmark and Anthropic exception in the task on 2026-09-16.',
    max_usd:MAX_USD,max_requests:144,timeout_ms:120000,retries:0,concurrency:1,
    pricing_date:'2026-09-16',pricing_sources:['https://developers.openai.com/api/docs/models/gpt-5.6-terra','https://platform.claude.com/docs/en/models/sonnet-5/whats-new-sonnet-5'],
    cost_note:'Calculated from reported token usage at documented standard rates; not an invoice. Unknown usage retains its conservative reservation.',
    region:'provider-unreported',execution_environment:process.env.RUNNER_ENVIRONMENT||'provider-unreported',
    rendering:'System instruction unchanged. Remaining prompt fields serialized once as pretty-printed JSON in one user message for both providers. No tools or shared sessions.',
    order:order.map(r=>({case_id:r.case_id,repeat:r.repeat,candidate:r.candidate})),
    payloads:order.map(r=>({case_id:r.case_id,repeat:r.repeat,candidate:r.candidate,...wireRequest(r),provider:undefined}))
  },null,2)+'\n');
  const results=[];let accounted=0,halt=null;
  for(const r of order) {
    const reserve=reservation(r);
    let result;
    if(halt||accounted+reserve>MAX_USD) {
      result={run_id:r.run_id,case_id:r.case_id,repeat:r.repeat,candidate:r.candidate,request_hash:r.request_hash,config_hash:r.config_hash,status:'error',response:'',resolved_model:'provider-unreported',elapsed_ms:0,ttft_ms:null,cost_usd:0,error_code:halt||'budget_guard_not_attempted'};
    } else {
      result=await collectOne(r);
      accounted+=result.cost_usd ?? reserve;
      if(['http_401','http_403','http_404'].includes(result.error_code))halt='not_attempted_after_access_error';
    }
    results.push(result);appendFileSync(join(out,'results.jsonl'),JSON.stringify(result)+'\n');
    console.log('Collected '+results.length+'/'+order.length+' outcomes');
  }
  validateResults(m,results);
  writeFileSync(join(out,'collection-summary.json'),JSON.stringify({
    run_id:m.run_id,scheduled:results.length,
    outcomes:Object.fromEntries(['ok','truncated','error','timeout'].map(s=>[s,results.filter(r=>r.status===s).length])),
    cost_usd:results.every(r=>r.cost_usd!==null)?results.reduce((s,r)=>s+r.cost_usd,0):null,
    conservative_accounted_usd:accounted,halt
  },null,2)+'\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
