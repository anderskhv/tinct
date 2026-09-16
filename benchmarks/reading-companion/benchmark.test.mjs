import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateSuite, prepare, blind, summarize, reviewHtml, dimensions } from './benchmark.mjs';
const suite=JSON.parse(readFileSync(new URL('./cases.json',import.meta.url)));
const config=JSON.parse(readFileSync(new URL('./candidates.json',import.meta.url)));
const root=fileURLToPath(new URL('../../',import.meta.url));
const manifest=()=>prepare(suite,{...config,repeats:2});
function outcomes(m) {
  return m.requests.map(r=>({...r,status:'ok',response:'Synthetic test answer <script>alert(1)</script>',
    elapsed_ms:1000,ttft_ms:100,cost_usd:null,resolved_model:r.settings.model}));
}
function rated(b) {
  const r=structuredClone(b.ratings); r.reviewer='synthetic-test';
  for(const p of r.ratings) {
    p.preference='tie';
    for(const side of ['A','B']) {
      p[side].scores=Object.fromEntries(dimensions.map(d=>[d,3]));
      p[side].notes='Synthetic fixture, not a model assessment';
    }
  }
  return r;
}
test('24 exact excerpts match pinned repository sources; no book crosses split',()=>{
  validateSuite(suite,root);
  assert.equal(suite.cases.length,24);
  const families={};
  for(const c of suite.cases) (families[c.family] ||= new Set()).add(c.split);
  for(const splits of Object.values(families)) assert.equal(splits.size,1);
});
test('matched prompts exclude evaluator checks and preserve supplied history',()=>{
  const m=manifest();
  assert.equal(m.requests.length,96);
  for(let i=0;i<m.requests.length;i+=2){
    assert.equal(m.requests[i].request_hash,m.requests[i+1].request_hash);
    assert.deepEqual(m.requests[i].prompt,m.requests[i+1].prompt);
    assert.equal(m.requests[i].prompt.checks,undefined);
  }
  assert.ok(m.requests.find(r=>r.case_id==='keller-correction').prompt.history.length);
});
test('duplicate, missing, foreign and stale outcomes are rejected',()=>{
  const m=manifest();
  for(const mutate of [
    rs=>rs.pop(),
    rs=>rs[1]=structuredClone(rs[0]),
    rs=>rs[0].request_hash='stale',
    rs=>rs[0].config_hash='stale',
    rs=>rs[0].candidate='foreign',
    rs=>rs[0].elapsed_ms=-1,
    rs=>rs[0].ttft_ms=1001,
    rs=>rs[0].response=''
  ]){
    const rs=outcomes(m);mutate(rs);assert.throws(()=>blind(m,rs));
  }
});
test('blinded public artifacts omit candidate configuration and timings',()=>{
  const m=manifest(), b=blind(m,outcomes(m),()=>1);
  assert.equal(b.review.pairs.length,48);
  const publicText=JSON.stringify({review:b.review,ratings:b.ratings});
  for(const candidate of config.candidates) assert.equal(publicText.includes(candidate.model),false);
  assert.equal(publicText.includes('elapsed_ms'),false);
  assert.equal(b.privateKey.mapping['pair-001'].A,config.candidates[1].id);
});
test('review escapes HTML and never executes model output',()=>{
  const m=manifest(),html=reviewHtml(blind(m,outcomes(m)).review);
  assert.equal(html.includes('<script>alert'),false);
  assert.ok(html.includes('&lt;script&gt;'));
});
test('failures and truncation remain counted and cannot masquerade as poor quality scores',()=>{
  const m=manifest(), rs=outcomes(m);
  rs[0].status='timeout';rs[0].response='';
  rs[2].status='truncated';
  const b=blind(m,rs);
  assert.equal(b.review.pairs.length,46);
  const report=summarize(b.privateKey,rated(b));
  assert.equal(report.scheduled_pairs,48);
  assert.equal(report.successful_pairs,46);
  assert.equal(report.totals[config.candidates[0].id].outcomes.timeout,1);
  assert.equal(report.totals[config.candidates[0].id].outcomes.truncated,1);
});
test('scores are 0–100, splits separate, repeated samples averaged within cases',()=>{
  const m=manifest(), b=blind(m,outcomes(m));
  const report=summarize(b.privateKey,rated(b));
  for(const split of Object.values(report.sections)) {
    for(const c of Object.values(split.candidates)) assert.equal(c.mean_score,75);
  }
  assert.equal(report.sections.holdout.rated_cases,9);
  assert.equal(report.totals[config.candidates[0].id].cost_usd,null);
});
test('unrated, duplicate, wrong-key and out-of-range ratings fail closed',()=>{
  const m=manifest(),b=blind(m,outcomes(m));
  assert.throws(()=>summarize(b.privateKey,b.ratings));
  for(const mutate of [
    r=>r.ratings[0].A.scores.depth=5,
    r=>r.ratings[0].A.notes='',
    r=>r.review_hash='wrong',
    r=>r.ratings[1]=structuredClone(r.ratings[0]),
    r=>r.ratings.pop()
  ]){ const r=rated(b);mutate(r);assert.throws(()=>summarize(b.privateKey,r)); }
});
test('invalid configurations and split names fail before producing requests',()=>{
  assert.throws(()=>prepare(suite,{...config,repeats:0}));
  assert.throws(()=>prepare(suite,config,'typo'));
  const c=structuredClone(config);c.candidates[1].id=c.candidates[0].id;
  assert.throws(()=>prepare(suite,c));
});
