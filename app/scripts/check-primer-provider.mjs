import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const root=process.cwd();
const require=createRequire(path.join(root,'app/package.json'));
const {buildSync}=require('esbuild');
const compiled=buildSync({stdin:{contents:`export {bookPrimerRequest} from './app/src/bookPrimers/prompt'; export {parseGeneratedPrimer} from './app/src/bookPrimers/parse'; export {COMPANION_MODEL} from './app/src/companionModel';`,resolveDir:root},bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
const mod={exports:{}};new Function('module','exports','require',compiled)(mod,mod.exports,require);
const {bookPrimerRequest,parseGeneratedPrimer,COMPANION_MODEL}=mod.exports;
assert.equal(COMPANION_MODEL,'claude-sonnet-5','Recheck published pricing before changing the model');
const output=process.env.PRIMER_CHECK_OUTPUT || '/tmp/tinct-primer-provider-results';
fs.mkdirSync(output,{recursive:true});
const stateFile=path.join(output,'budget.json');
const state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile)): {limitMicros:1_000_000,committedMicros:0,attempts:[]};
assert.equal(state.limitMicros,1_000_000);
const save=()=>fs.writeFileSync(stateFile,JSON.stringify(state,null,2));
const files=['frankenstein-original-en-book.json','meditations-original-en-book.json','frankenstein-original-en-chapter-1.json','meditations-original-en-chapter-1.json','bible-web-en-chapter-1047.json'];
const dry=process.argv.includes('--dry-run');
for(const file of files){
 const draft=JSON.parse(fs.readFileSync(path.join(root,'books/wip/book-primer-candidates-20261028',file)));
 const id=draft.primer.identity;assert.equal(id.scope.kind,'public');
 const raw=fs.readFileSync(path.join(root,draft.source.path));
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),draft.source.fileSha256);
 const edition=JSON.parse(raw),units=edition.chapters.map(c=>({id:`chapter-${c.number}`,label:c.title}));
 const selected=edition.chapters.filter(c=>id.type==='book'||`chapter-${c.number}`===id.unitId);
 const passages=selected.flatMap(c=>c.paragraphs.flatMap((p,i)=>{const text=p.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();return text?[{id:`chapter-${c.number}:paragraph-${i}`,unitId:`chapter-${c.number}`,text}]:[]}));
 assert.equal(crypto.createHash('sha256').update(JSON.stringify({units,passages})).digest('hex'),id.sourceVersion);
 const title=id.workId; // Supported endpoint caller without a display title.
 const request=bookPrimerRequest({identity:id,title,unitLabel:id.type==='chapter'?selected[0].title:undefined,reliable:true,units,passages});
 const content=`Location: ${selected[0].title}.\n\n${request.data}\n\nWrite the card as JSON.`;
 const payload={model:COMPANION_MODEL,max_tokens:2400,system:request.system,messages:[{role:'user',content}],output_config:{effort:'low'}};
 // Byte-based upper allowance for input, plus 8192 tokens for request framing.
 // Sonnet 5 standard prices: $2/M input and $10/M output; no cache, tools, or retries.
 const reservedMicros=(Buffer.byteLength(request.system)+Buffer.byteLength(content)+8192)*2+2400*10;
 fs.writeFileSync(path.join(output,file+'.request.json'),JSON.stringify(payload,null,2));
 if(dry){console.log(JSON.stringify({file,reservedUsd:reservedMicros/1e6,promptVersion:request.promptVersion,mode:'offline-preflight'}));continue;}
 if(state.attempts.some(x=>x.file===file)){console.log(file,'already attempted; no retry');continue;}
 if(state.committedMicros+reservedMicros>state.limitMicros){console.log(file,'SKIP: conservative reservation exceeds remaining budget');continue;}
 const key=process.env.ANTHROPIC_API_KEY;if(!key)throw new Error('Missing ANTHROPIC_API_KEY; no request sent');
 const attempt={file,reservedMicros,status:'reserved',startedAt:new Date().toISOString()};state.attempts.push(attempt);state.committedMicros+=reservedMicros;save();
 const started=Date.now();
 try{
  const response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify(payload),signal:AbortSignal.timeout(180000)});
  attempt.httpStatus=response.status;attempt.elapsedMs=Date.now()-started;
  if(!response.ok)throw new Error(`Provider HTTP ${response.status}; reservation retained, no retry`);
  const result=await response.json();fs.writeFileSync(path.join(output,file+'.response.json'),JSON.stringify(result,null,2));
  const usage=result.usage;assert.ok(Number.isInteger(usage?.input_tokens)&&Number.isInteger(usage?.output_tokens));
  assert.ok(!usage.cache_creation_input_tokens&&!usage.cache_read_input_tokens);
  const actualMicros=usage.input_tokens*2+usage.output_tokens*10;
  assert.ok(actualMicros<=reservedMicros,'Usage exceeded reservation: stop');
  state.committedMicros+=actualMicros-reservedMicros;attempt.actualMicros=actualMicros;attempt.usage=usage;save();
  assert.equal(result.stop_reason,'end_turn');
  const text=result.content.filter(x=>x.type==='text').map(x=>x.text).join('');
  const parsed=parseGeneratedPrimer(text,passages);const words=parsed.opening.split(/\s+/).length;
  assert.ok(words>=(id.type==='book'?60:50)&&words<=90,`Opening length ${words}`);
  attempt.status='structural-pass-needs-semantic-review';attempt.openingWords=words;
  fs.writeFileSync(path.join(output,file+'.primer.json'),JSON.stringify({identity:id,content:parsed,resources:[],origin:'generated',promptVersion:request.promptVersion,createdAt:new Date().toISOString()},null,2));
  save();console.log(JSON.stringify(attempt));
 }catch(error){attempt.status='failed';attempt.error=String(error.message).slice(0,300);save();console.log(JSON.stringify(attempt));process.exitCode=1;break;}
}
console.log(JSON.stringify({mode:dry?'offline-preflight':'provider-check',committedUsd:state.committedMicros/1e6,semanticReview:'not performed by this script'}));
