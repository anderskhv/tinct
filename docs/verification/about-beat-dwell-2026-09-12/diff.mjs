import { readFileSync } from 'node:fs';

// Compare the scroll distance of every beat before and after, run by run in story order.
const runsOf = d => {
  const runs = [];
  for (const s of d.samples) {
    const last = runs[runs.length - 1];
    if (last && last.key === s.key) last.end = s.y; else runs.push({ key: s.key, start: s.y, end: s.y });
  }
  return runs.map(r => ({ ...r, px: r.end - r.start + d.step }));
};
for (const vp of ['phone-393x852', 'desktop-1440x900']) {
  const b = JSON.parse(readFileSync(`data/before-${vp}.json`, 'utf8'));
  const a = JSON.parse(readFileSync(`data/after-${vp}.json`, 'utf8'));
  const rb = runsOf(b), ra = runsOf(a);
  console.log(`\n=== ${vp}   page height ${b.total} -> ${a.total}  (${a.total - b.total >= 0 ? '+' : ''}${a.total - b.total}px)`);
  console.log('  beat                          before     after      delta');
  const n = Math.max(rb.length, ra.length);
  for (let i = 0; i < n; i++) {
    const x = rb[i], y = ra[i];
    if (!x || !y) { console.log('  MISMATCH at', i, x && x.key, y && y.key); continue; }
    const flag = x.key !== y.key ? '  <-- KEY MISMATCH' : (Math.abs(x.px - y.px) > 100 ? '   <== changed' : '');
    console.log(`  ${x.key.padEnd(26)} ${String(x.px).padStart(7)}px ${String(y.px).padStart(7)}px ${String(y.px - x.px).padStart(7)}px${flag}`);
  }
}
