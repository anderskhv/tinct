import { readFileSync } from 'node:fs';

// Summarise a sweep: the scroll range each beat owns, plus the legible run of the three target beats.
const files = process.argv.slice(2);
for (const f of files) {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  const runs = [];
  for (const s of d.samples) {
    const last = runs[runs.length - 1];
    if (last && last.key === s.key) last.end = s.y; else runs.push({ key: s.key, start: s.y, end: s.y });
  }
  const legible = (pick, min = 0.6) => {
    const ys = d.samples.filter(s => { const p = pick(s); return p && p.op >= min && p.vis >= 0.6; }).map(s => s.y);
    return ys.length ? { from: ys[0], to: ys[ys.length - 1], px: ys[ys.length - 1] - ys[0] + d.step } : null;
  };
  console.log(`\n=== ${f}  (${d.vp.name}, scrollHeight ${d.total}, step ${d.step})`);
  console.log('-- beat runs (key: start..end, px)');
  for (const r of runs) console.log(`   ${r.key.padEnd(26)} ${String(r.start).padStart(6)}..${String(r.end).padStart(6)}  ${r.end - r.start + d.step}px`);
  console.log('-- target beats, legible scroll distance');
  console.log('   bridge (So what could we do about it?) :', JSON.stringify(legible(s => s.bridge)));
  console.log('   talk panel (Talk to the book)          :', JSON.stringify(legible(s => s.talkPanel)));
  console.log('   talk answer text                       :', JSON.stringify(legible(s => s.talkAnswer)));
  const stopOnly = { ...d, samples: d.samples.filter(s => s.key.startsWith('stop')) };
  const lg = (pick, min = 0.6) => { const ys = stopOnly.samples.filter(s => { const p = pick(s); return p && p.op >= min && p.vis >= 0.6; }).map(s => s.y); return ys.length ? { from: ys[0], to: ys[ys.length - 1], px: ys[ys.length - 1] - ys[0] + d.step } : null; };
  console.log('   stop headline (Is this really…)        :', JSON.stringify(lg(s => s.stopH)));
  console.log('   stop "…or"                             :', JSON.stringify(lg(s => s.stopOr)));
}
