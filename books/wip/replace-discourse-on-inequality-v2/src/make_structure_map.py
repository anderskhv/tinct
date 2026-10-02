#!/usr/bin/env python3
"""Build structure-map.json: old live coordinates -> new coordinates. COUNT-BASED ONLY (no old text read)."""
import json, os, math
here = os.path.dirname(os.path.abspath(__file__))
new = json.load(open(os.path.join(here, '..', 'editions', 'discourse-on-inequality-original-en.json'), encoding='utf-8'))['chapters']
newc = [len(c['paragraphs']) for c in new]          # 23, 13, 8, 51, 59
old = [26, 25, 52, 67]                                # identical in original-en, modern-en, modern-da and original-fr at origin/main 7569e91
# Assumed correspondence of divisions (UNVERIFIED): old1=Dedication, old2=Preface+Exordium, old3=First Part, old4=Second Part
groups = {1: [1], 2: [2, 3], 3: [4], 4: [5]}
def flat(chs): return [(c, p) for c in chs for p in range(1, newc[c - 1] + 1)]
mapping = {}
for oc, n_old in enumerate(old, 1):
    tgt = flat(groups[oc]); n_new = len(tgt)
    rows = []
    for op in range(1, n_old + 1):
        # proportional position (center-of-paragraph)
        k = min(n_new - 1, int((op - 0.5) * n_new / n_old))
        rows.append({'old': [oc, op], 'new': list(tgt[k])})
    mapping[str(oc)] = rows
out = {
    'book_id': 'discourse-on-inequality',
    'status': 'LOW-CONFIDENCE, COUNT-BASED ONLY. Not safe for automatic migration of highlights/notes/chat anchors without human review.',
    'method': ('Only chapter numbers and paragraph-array lengths of the old live editions were read (no old wording). Old live editions at '
               'origin/main 7569e91 all have 4 chapters x [26, 25, 52, 67] paragraphs (original-en, modern-en, modern-da, original-fr), i.e. a '
               'structure inherited from the French original, which does not line up one-to-one with the 1761 English translation. '
               'Assumed (unverified) divisions: old 1 = Dedication, old 2 = Preface + Exordium, old 3 = First Part, old 4 = Second Part. '
               'Within each assumed division the old paragraph is placed at the proportionally corresponding new paragraph.'),
    'coordinate_base': 1,
    'old_counts': {'chapters': old, 'total_paragraphs': sum(old)},
    'new_counts': {'chapters': [{'number': i + 1, 'title': c['title'], 'paragraphs': len(c['paragraphs'])} for i, c in enumerate(new)],
                   'total_paragraphs': sum(newc)},
    'chapter_map': [
        {'old_chapter': 1, 'new_chapters': [1], 'confidence': 'low'},
        {'old_chapter': 2, 'new_chapters': [2, 3], 'confidence': 'low'},
        {'old_chapter': 3, 'new_chapters': [4], 'confidence': 'low-medium (51 new vs 52 old)'},
        {'old_chapter': 4, 'new_chapters': [5], 'confidence': 'low (59 new vs 67 old)'},
    ],
    'notes': ['Rousseau\'s own Notes and the Advertisement Concerning the Notes are not included in the new editions; anchors that pointed into note text, if any existed, have no target.',
              'Old paragraph k and new paragraph j are not asserted to contain the same passage.'],
    'paragraph_map': mapping,
}
json.dump(out, open(os.path.join(here, '..', 'structure-map.json'), 'w'), indent=1)
print('ok', sum(len(v) for v in mapping.values()))
