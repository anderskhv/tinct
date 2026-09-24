"""Check every quote in EVIDENCE.md against the pinned text at the stated chapter.paragraph, and its stated paragraph-end length."""
import re, os
from texts import load, u16, BASE
ED = {'source (original-en, Garnett)': 'original-en', 'live modern-en': 'modern-en', 'accepted candidate modern-en': 'candidate'}
sec = None; n = bad = 0
for line in open(os.path.join(BASE, 'EVIDENCE.md'), encoding='utf-8'):
    m = re.match(r'## (\d+)\.(\d+)', line)
    if m: sec = (int(m.group(1)), int(m.group(2))); continue
    m = re.match(r'- \*\*(.+?)\*\* \(end (\d+)\): (.*)$', line.rstrip('\n'))
    if not m or not sec: continue
    ed = ED[m.group(1)]; end = int(m.group(2)); q = m.group(3)
    q = re.sub(r'\s*⟦[^⟧]*⟧\s*$', '', q).strip()
    q = q.strip('…')
    t = load(ed)[sec[0]][sec[1]]
    ok_q = q in t; ok_e = u16(t) == end
    n += 1
    if not (ok_q and ok_e):
        bad += 1
        print('MISMATCH', sec, ed, 'quote' if not ok_q else '', f'end {end} vs {u16(t)}' if not ok_e else '')
print(f'{n} quotes checked, {bad} mismatches')
