#!/usr/bin/env python3
"""Remove mentions the reader can never resolve by tapping.

The Lab reader's word anchors are whitespace tokens (\\S+), trimmed of a
few leading quote/bracket characters, trailing punctuation, and a
possessive 's (see wordSelectionOffsets in
app/src/services/characters/characterCards.ts). resolveCharacter() then
matches a tap only if some mention *contains* the trimmed token range. So
a mention whose every overlapping token, after trimming, sticks out past
the mention's edges is dead: "thus:--Lycurgos" (the-histories), "The
Spouter Inn:--Peter" (moby-dick), "pastor's Frithjof--and" (niels-lyhne)
all failed real-browser verification this way. Three books in a row made
it a class, not a fluke, so this is now a standard post-step after any
binding, run before validation and browser verification.

For each dead mention: drop it; if it was the character's firstMention,
re-anchor firstMention/roleVisibleAt/earliest snapshot availableAt to the
next earliest surviving mention (or drop the character entirely if none
survive -- reported loudly, never silently).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

LEAD = set('“”"\'([{_')
TRAIL = set('.,;:!?…”"\')]}_')
POSS = re.compile(r"[’']s$")
# The reader's trim sets (above) omit the curly single quotes U+2018/U+2019,
# so a name like `‘Sancho,’` is untappable today. That is an app-side
# gap (one regex), not a data problem, so such mentions are KEPT and only
# reported: they come back to life the moment the app trims curly quotes.
# Only mentions that stay dead even with curly quotes trimmed are pruned.
LEAD_CURLY = LEAD | {'‘', '’', '-', '—', '–'}
TRAIL_CURLY = TRAIL | {'‘', '’', '-', '—', '–'}
# Also kept under the same "app-side" category: names glued to a LEADING
# or TRAILING dash ("--Seneca, Ep. 98", "Marcaret—"), which a one-line
# trim fix in the reader would make tappable. A dash INSIDE a token
# ("Achilles—Achilles") cannot be fixed by trimming and stays pruned.


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def trimmed_tokens(text, lead=LEAD, trail=TRAIL):
    """(start, end) in UTF-16 units for every whitespace token after the reader's trimming."""
    out = []
    for m in re.finditer(r'\S+', text):
        s, e = m.start(), m.end()
        while s < e and text[s] in lead:
            s += 1
        while e > s and text[e - 1] in trail:
            e -= 1
        if POSS.search(text[s:e]):
            e -= 2
        if e > s:
            out.append((u16(text[:s]), u16(text[:e])))
    return out


def tappable(m, toks):
    s, e = m['startOffset'], m['endOffset']
    return any(ts >= s and te <= e for ts, te in toks if ts < e and te > s)


def point_key(p):
    return (p['chapterNumber'], p['paragraphIndex'], p['offset'])


def prune(book, editions=('original-en', 'modern-en'), write=True):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    report = {}
    for ek in editions:
        ed = pkg['editions'].get(ek)
        ed_path = ROOT / f'app/public/data/editions/{book}-{ek}.json'
        if not ed or not ed_path.exists():
            continue
        data = json.loads(ed_path.read_bytes())
        tokens, tokens_curly = {}, {}
        for c in data['chapters']:
            for pi, p in enumerate(c['paragraphs']):
                t = normalized(p)
                tokens[(c['number'], pi)] = trimmed_tokens(t)
                tokens_curly[(c['number'], pi)] = trimmed_tokens(t, LEAD_CURLY, TRAIL_CURLY)
        keep, dead, curly_only = [], [], []
        for m in ed['mentions']:
            key = (m['chapterNumber'], m['paragraphIndex'])
            if tappable(m, tokens.get(key, [])):
                keep.append(m)
            elif tappable(m, tokens_curly.get(key, [])):
                keep.append(m)
                curly_only.append(m)
            else:
                dead.append(m)
        if curly_only:
            print(f'{book} {ek}: {len(curly_only)} mention(s) untappable ONLY because the reader does not trim curly single quotes / leading-trailing dashes (kept; app-side fix)')
        if not dead:
            report[ek] = (0, [], [])
            continue
        original = ed['mentions']
        ed['mentions'] = keep
        reanchored, dropped = [], []
        dead_ids = {m['characterId'] for m in dead}
        for c in list(ed['characters']):
            if c['id'] not in dead_ids:
                continue
            ms = [m for m in keep if m['characterId'] == c['id']]
            if not ms:
                ed['characters'].remove(c)
                dropped.append(c['id'])
                continue
            order = lambda m: (m['chapterNumber'], m['paragraphIndex'], m['endOffset'])
            earliest = min(ms, key=order)
            earliest_original = min((m for m in original if m['characterId'] == c['id']), key=order)
            ep = {'chapterNumber': earliest['chapterNumber'], 'paragraphIndex': earliest['paragraphIndex'], 'offset': earliest['endOffset']}
            # Only re-anchor when the mention that WAS the earliest got pruned;
            # older packages use their own firstMention conventions and must
            # not be churned just because a later mention was removed.
            if order(earliest) != order(earliest_original):
                assert c['roleVisibleAt'] == c['firstMention'], f'{book}/{ek}/{c["id"]}: roleVisibleAt != firstMention'
                snap = min(c['snapshots'], key=lambda s: point_key(s['availableAt']))
                assert point_key(snap['availableAt']) == point_key(c['firstMention']), f'{book}/{ek}/{c["id"]}: earliest snapshot != firstMention'
                c['firstMention'] = dict(ep)
                c['roleVisibleAt'] = dict(ep)
                snap['availableAt'] = dict(ep)
                if snap.get('evidence'):
                    snap['evidence'][0] = {'chapterNumber': ep['chapterNumber'], 'paragraphIndex': ep['paragraphIndex'], 'throughOffset': ep['offset']}
                reanchored.append(c['id'])
        report[ek] = (len(dead), reanchored, dropped)
        for m in dead:
            print(f'  {book} {ek} DEAD {m["characterId"]!r} @ {m["chapterNumber"]}/{m["paragraphIndex"]} {m["text"]!r}')
    if write and any(n for n, _, _ in report.values()):
        char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
    for ek, (n, re_, dr) in report.items():
        print(f'{book} {ek}: removed {n} untappable mention(s); re-anchored {re_ or "none"}; DROPPED CHARACTERS {dr or "none"}')
    return report


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    for b in args:
        prune(b, write=not dry)
