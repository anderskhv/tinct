import { createHash, randomInt } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const dimensions = ['grounding', 'depth', 'relevance', 'clarity', 'attribution'];
export const weights = [25, 25, 25, 15, 10];
export const system = 'You are a thoughtful reading companion. Answer the current question directly, using the supplied passage, conversation and source packet. Distinguish speaker from author, interpretation from fact, and paraphrase from quotation. Do not invent sources, quotations or page numbers. Respect requests about spoilers and spoken length. These are literary questions, not statements about the reader. External research tools are unavailable. For outside-author claims rely on the source packet; say when it cannot establish the requested detail. Be warm, precise and accessible.';
const assert = (ok, message) => { if (!ok) throw new Error(message); };
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const save = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const lines = path => readFileSync(path, 'utf8').split(/\r?\n/).filter(x => x.trim()).map(JSON.parse);
const key = r => [r.case_id, r.repeat, r.candidate].join('/');
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function validateSuite(suite, root) {
  assert(suite.version === 1 && suite.cases.length > 0, 'Unsupported or empty suite');
  const ids = new Set();
  for (const c of suite.cases) {
    assert(!ids.has(c.id), 'Duplicate case: ' + c.id); ids.add(c.id);
    assert(['regression','calibration','holdout'].includes(c.split), 'Invalid split');
    assert(c.passage && c.question && c.checks.length && c.family, 'Incomplete case: ' + c.id);
    if (root) {
      const raw = readFileSync(join(root, c.source.path));
      const sha = createHash('sha1').update('blob ' + raw.length + '\0').update(raw).digest('hex');
      assert(sha === c.source.blob_sha, 'Source changed; review and version fixture: ' + c.id);
      const chapter = JSON.parse(raw).chapters.find(x => x.number === c.source.chapter);
      assert(chapter, 'Missing chapter: ' + c.id);
      assert(chapter.paragraphs.slice(c.source.paragraph_start, c.source.paragraph_end + 1).join('\n\n') === c.passage, 'Excerpt mismatch: ' + c.id);
    }
  }
}

export function prepare(suite, config, split = 'all') {
  validateSuite(suite);
  assert(['all','calibration','regression','holdout'].includes(split), 'Invalid split');
  assert(config.run_id && config.candidates?.length === 2, 'Need run_id and two candidates');
  assert(Number.isInteger(config.repeats) && config.repeats > 0, 'Invalid repeats');
  assert(new Set(config.candidates.map(c => c.id)).size === 2, 'Duplicate candidates');
  for (const c of config.candidates) {
    assert(c.id && c.provider && c.model && c.endpoint && c.effort && c.temperature !== undefined &&
      c.max_output_tokens > 0 && c.tools === 'none', 'Incomplete candidate configuration');
    assert(!JSON.stringify(c).includes('REPLACE_'), 'Resolve candidate settings before preparing');
  }
  const selected = suite.cases.filter(c => split === 'all' || c.split === split);
  assert(selected.length > 0, 'No cases selected');
  const requests = [];
  for (const c of selected) for (let repeat = 1; repeat <= config.repeats; repeat++) {
    const prompt = {
      system,
      context: {title:c.source.title, passage:c.passage, sources:c.sources},
      history:c.history,
      question:c.question,
      response_style: c.mode === 'spoken' ? 'Natural spoken answer, usually 2–3 sentences unless explicitly asked for more.' : 'A short opening explanation, followed by useful detail; normally 120–220 words, unless the question asks otherwise.'
    };
    const request_hash = hash(prompt);
    for (const candidate of config.candidates) requests.push({
      run_id:config.run_id, case_id:c.id, repeat, candidate:candidate.id,
      request_hash, config_hash:hash(candidate), prompt, settings:candidate
    });
  }
  return {version:1, run_id:config.run_id, suite_hash:hash(suite), split, config, cases:selected, requests};
}

export function validateResults(manifest, results) {
  assert(results.length === manifest.requests.length, 'Every scheduled request needs an outcome, including errors');
  const expected = new Map(manifest.requests.map(r => [key(r),r]));
  const seen = new Set();
  for (const r of results) {
    const k = key(r), e = expected.get(k);
    assert(e && !seen.has(k), 'Unexpected or duplicate outcome: ' + k); seen.add(k);
    assert(r.run_id === manifest.run_id && r.request_hash === e.request_hash && r.config_hash === e.config_hash, 'Mismatched request/config: ' + k);
    assert(['ok','error','timeout','truncated'].includes(r.status), 'Invalid status: ' + k);
    assert(typeof r.response === 'string' && (r.status !== 'ok' || r.response.trim()), 'Missing response: ' + k);
    assert(Number.isFinite(r.elapsed_ms) && r.elapsed_ms >= 0, 'Invalid elapsed_ms: ' + k);
    assert(r.ttft_ms === null || (Number.isFinite(r.ttft_ms) && r.ttft_ms >= 0 && r.ttft_ms <= r.elapsed_ms), 'Invalid ttft_ms: ' + k);
    assert(typeof r.resolved_model === 'string' && r.resolved_model.length > 0, 'Record resolved_model or explicit provider-unreported: ' + k);
    assert(r.cost_usd === null || (Number.isFinite(r.cost_usd) && r.cost_usd >= 0), 'Invalid cost_usd: ' + k);
  }
}
export function blind(manifest, results, coin = () => randomInt(2)) {
  validateResults(manifest, results);
  const lookup = new Map(results.map(r => [key(r), r]));
  const pairs = [], mapping = {}, ratings = [];
  for (const c of manifest.cases) for (let repeat = 1; repeat <= manifest.config.repeats; repeat++) {
    const outcomes = manifest.config.candidates.map(candidate => lookup.get(key({case_id:c.id, repeat, candidate:candidate.id})));
    if (outcomes.some(r => r.status !== 'ok')) continue;
    if (coin()) outcomes.reverse();
    const id = 'pair-' + String(pairs.length + 1).padStart(3, '0');
    mapping[id] = {case_id:c.id, repeat, A:outcomes[0].candidate, B:outcomes[1].candidate};
    pairs.push({id, case_id:c.id, title:c.source.title, passage:c.passage, question:c.question, history:c.history, sources:c.sources, checks:c.checks, A:outcomes[0].response, B:outcomes[1].response});
    const blank = () => ({scores:Object.fromEntries(dimensions.map(d=>[d,null])), severe:[], notes:''});
    ratings.push({id, preference:null, A:blank(), B:blank()});
  }
  // Shuffle review order separately from A/B placement. No identities, timings or configs enter the public review.
  for (let i=pairs.length-1; i>0; i--) { const j=randomInt(i+1); [pairs[i],pairs[j]]=[pairs[j],pairs[i]]; }
  const review = {version:1, pairs};
  const review_hash = hash(review);
  return {review, ratings:{version:1, review_hash, reviewer:'', ratings}, privateKey:{version:1, review_hash, manifest, results, mapping}};
}
export function summarize(privateKey, ratingFile) {
  assert(ratingFile.review_hash === privateKey.review_hash && ratingFile.reviewer?.trim(), 'Wrong review or missing reviewer');
  const ids = Object.keys(privateKey.mapping);
  assert(ratingFile.ratings.length === ids.length, 'Rate every successful pair');
  const seen = new Set(), byCase = {}, totals = {};
  for (const c of privateKey.manifest.config.candidates) {
    const rs = privateKey.results.filter(r=>r.candidate === c.id);
    const ok = rs.filter(r=>r.status === 'ok');
    const quantile = (xs,p) => { xs=xs.filter(x=>x!==null).sort((a,b)=>a-b); return xs.length ? xs[Math.max(0,Math.ceil(xs.length*p)-1)] : null; };
    totals[c.id] = {
      scheduled:rs.length, successful:ok.length,
      outcomes:Object.fromEntries(['ok','error','timeout','truncated'].map(s=>[s,rs.filter(r=>r.status===s).length])),
      latency_success_ms:{p50:quantile(ok.map(r=>r.elapsed_ms),.5),p95:quantile(ok.map(r=>r.elapsed_ms),.95)},
      ttft_success_ms:{measured:ok.filter(r=>r.ttft_ms!==null).length,p50:quantile(ok.map(r=>r.ttft_ms),.5)},
      cost_usd:rs.every(r=>r.cost_usd!==null) ? rs.reduce((s,r)=>s+r.cost_usd,0) : null,
      severe:0
    };
  }
  for (const r of ratingFile.ratings) {
    const m = privateKey.mapping[r.id];
    assert(m && !seen.has(r.id), 'Unexpected/duplicate rating'); seen.add(r.id);
    assert(['A','B','tie','both-poor'].includes(r.preference), 'Set preference for ' + r.id);
    const c = byCase[m.case_id] ||= {preferences:[], candidates:{}};
    c.preferences.push(['A','B'].includes(r.preference) ? m[r.preference] : r.preference);
    for (const side of ['A','B']) {
      assert(Array.isArray(r[side].severe) && typeof r[side].notes === 'string', 'Missing flags/notes');
      const scores = dimensions.map(d=>r[side].scores[d]);
      assert(scores.every(x=>Number.isInteger(x)&&x>=0&&x<=4), 'Scores must be 0–4 for ' + r.id);
      assert(r[side].notes.trim(), 'Add evidence notes for ' + r.id + ' ' + side);
      const list = c.candidates[m[side]] ||= [];
      list.push({weighted:scores.reduce((s,x,i)=>s+x*weights[i]/4,0),scores});
      totals[m[side]].severe += r[side].severe.length ? 1 : 0;
    }
  }
  const sections = {};
  for (const split of ['calibration','regression','holdout']) {
    const cases = privateKey.manifest.cases.filter(c=>c.split===split);
    const rated = cases.filter(c=>byCase[c.id]);
    sections[split] = {scheduled_cases:cases.length,rated_cases:rated.length,families:[...new Set(rated.map(c=>c.family))],candidates:{}};
    for (const candidate of privateKey.manifest.config.candidates) {
      const avgs = rated.map(c=>{
        const rs=byCase[c.id].candidates[candidate.id];
        return {weighted:rs.reduce((s,r)=>s+r.weighted,0)/rs.length,
          dimensions:dimensions.map((_,i)=>rs.reduce((s,r)=>s+r.scores[i],0)/rs.length)};
      });
      sections[split].candidates[candidate.id] = {
        mean_score:avgs.length ? avgs.reduce((s,r)=>s+r.weighted,0)/avgs.length : null,
        mean_dimensions:Object.fromEntries(dimensions.map((d,i)=>[d,avgs.length ? avgs.reduce((s,r)=>s+r.dimensions[i],0)/avgs.length : null]))
      };
    }
  }
  return {run_id:privateKey.manifest.run_id,reviewer:ratingFile.reviewer,
    warning:'Descriptive pilot only. Repeats are averaged within cases; related cases are not independent. No significance claim or automatic winner. Text latency is not audible voice latency. Review failures and severe flags before choosing.',
    successful_pairs:ids.length, scheduled_pairs:privateKey.manifest.requests.length/2,
    totals, sections, by_case:byCase};
}

export function reviewHtml(review) {
  const cards = review.pairs.map(p=>'<section><h2>'+escape(p.id)+' · '+escape(p.title)+'</h2><details><summary>Passage and context</summary><pre>'+escape(p.passage)+'\n\n'+escape(JSON.stringify({history:p.history,sources:p.sources},null,2))+'</pre></details><h3>'+escape(p.question)+'</h3><ul>'+p.checks.map(c=>'<li>'+escape(c)+'</li>').join('')+'</ul><div class="pair">'+['A','B'].map(s=>'<article><h3>Answer '+s+'</h3><pre>'+escape(p[s])+'</pre></article>').join('')+'</div></section>').join('');
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Blind reading benchmark</title><style>body{max-width:1100px;margin:32px auto;padding:20px;background:#f4f0e6;color:#29251e;font:18px Georgia}section{border-top:1px solid #aaa;padding:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}article{background:#fff9;padding:20px;border-radius:16px}pre{white-space:pre-wrap;font:inherit;line-height:1.6}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Blind reading benchmark</h1><p>Score both answers in ratings.json using README rubric. Judge evidence and usefulness, not length or perceived model identity. A/B identity changes between pairs. Do not inspect private-key.json until ratings are locked.</p>'+cards;
}

function main(args) {
  const [command, ...a] = args;
  if (command === 'validate') { validateSuite(read(a[0]),a[1]); console.log('Suite and source excerpts verified'); }
  else if (command === 'prepare') {
    const [suite,config,out,split] = a;
    assert(out && !existsSync(out), 'Use a new output directory');
    const m=prepare(read(suite),read(config),split);
    mkdirSync(out,{recursive:true}); save(join(out,'manifest.json'),m);
    writeFileSync(join(out,'requests.jsonl'),m.requests.map(r=>JSON.stringify(r)).join('\n')+'\n');
    console.log(m.requests.length + ' requests prepared; no network calls made');
  } else if (command === 'blind') {
    const [manifest,results,out]=a;
    assert(out && !existsSync(out), 'Use a new output directory');
    const b=blind(read(manifest),lines(results));
    mkdirSync(out,{recursive:true});
    save(join(out,'private-key.json'),b.privateKey); save(join(out,'review.json'),b.review);
    save(join(out,'ratings.json'),b.ratings);
    writeFileSync(join(out,'review.html'),reviewHtml(b.review));
    console.log(b.review.pairs.length+' successful pairs blinded; keep private-key.json away from reviewers');
  } else if (command === 'report') {
    const [secret,ratings,out]=a; assert(out,'Provide output path');
    save(out,summarize(read(secret),read(ratings))); console.log('Report written');
  } else throw Error('Commands: validate SUITE [REPO_ROOT] | prepare SUITE CONFIG NEW_OUT [SPLIT] | blind MANIFEST RESULTS_JSONL NEW_OUT | report PRIVATE_KEY RATINGS OUTPUT_JSON');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch(e) { console.error(e.message); process.exitCode=1; }
}
