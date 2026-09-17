#!/usr/bin/env python3
"""merry-wives-of-windsor: bind short-form speaker labels that bind_speaker_labels.py
missed because the character's display name is multi-word/titled (e.g. "Sir John
Falstaff") while the actual text's speaker labels use a short form ("FALSTAFF.").

Every short form below was checked by hand against all its occurrences in the
source text: each one is used exclusively for the one character listed (no other
same-named character in this play's cast), so a bare-word bind is safe. In
particular "PAGE" alone (13 occurrences) is always the stage-direction form for
Master Page -- this play's other Page-surnamed characters ("Mistress Page",
"Master Thomas Page", "George") never appear as a bare "PAGE".
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'merry-wives-of-windsor'

SHORT_FORMS = {
    'falstaff': 'FALSTAFF',
    'evans': 'EVANS',
    'quickly': 'QUICKLY',
    'shallow': 'SHALLOW',
    'caius': 'CAIUS',
    'anne': 'ANNE',
    'page': 'PAGE',
}


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def process():
    char_path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in list(pkg['editions'].keys()):
        ed = pkg['editions'][ek]
        ed_path = ROOT / f'app/public/data/editions/{BOOK}-{ek}.json'
        if not ed_path.exists():
            continue
        data = json.loads(ed_path.read_bytes())
        paras = {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}
        existing_spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in ed['mentions']}
        char_ids = {c['id'] for c in ed['characters']}
        added_total = 0
        for cid, upper in SHORT_FORMS.items():
            if cid not in char_ids:
                continue
            pat = re.compile(r'(?<![A-Za-z])' + re.escape(upper) + r'(?![A-Za-z])')
            new_mentions = []
            for (chn, pi), text in paras.items():
                for m in pat.finditer(text):
                    key = (chn, pi, u16(text[:m.start()]), u16(text[:m.end()]))
                    if key in existing_spans:
                        continue
                    existing_spans.add(key)
                    new_mentions.append({'chapterNumber': chn, 'paragraphIndex': pi,
                                          'startOffset': key[2], 'endOffset': key[3],
                                          'text': m.group(), 'characterId': cid,
                                          'resolution': 'reviewed-speaker-label'})
            ed['mentions'].extend(new_mentions)
            added_total += len(new_mentions)
            print(BOOK, ek, cid, len(new_mentions), 'short-form mentions added')
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        print(BOOK, ek, added_total, 'total short-form mentions added')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    process()
