#!/usr/bin/env python3
"""Assemble the Fear and Trembling Tinct Modern English candidate from drafts/*.json.

Outputs (in ./candidate/):
  fear-and-trembling-modern-en.candidate.json   edition format {"chapters":[{number,title,paragraphs}]}; main text only
  footnotes.json      Johannes's footnotes, separately identifiable, with exact attachment points
  structure.json      section numerals and dividers (fields, not text)
  review/chNN.md      review copy: paragraphs with [* Note: ...] appended at paragraph end (review format only)
Checks: paragraph counts equal the final Danish source; no empty paragraph; every source note present
exactly once; every anchorAfterEn found in its paragraph; no note text or '*' marker in main text.
Usage: python3 assemble.py
"""
import json, os, glob, hashlib, sys

H = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(H, 'source/original-da-final.json')))
TITLES = {1: 'Preface', 2: 'Attunement', 3: 'Eulogy on Abraham', 4: 'Preliminary Expectoration',
          5: 'Problema I — Is there a teleological suspension of the ethical?',
          6: 'Problema II — Is there an absolute duty to God?',
          7: 'Problema III — Was it ethically defensible for Abraham to keep silent about his undertaking to Sarah, to Eliezer and to Isaac?',
          8: 'Epilogue'}


def utf16_len(s):
    return len(s.encode('utf-16-le')) // 2


def load_drafts():
    slots = {}
    for f in sorted(glob.glob(os.path.join(H, 'drafts', '*.json'))):
        d = json.load(open(f))
        for s in d['slots']:
            key = (d['chapter'], s['index'])
            if key in slots:
                sys.exit(f'duplicate paragraph {key} in {f}')
            slots[key] = dict(s, _file=os.path.basename(f))
    return slots


def main():
    slots = load_drafts()
    errors = []
    ed = {'chapters': []}
    notes_out = []
    struct = []
    os.makedirs(os.path.join(H, 'candidate', 'review'), exist_ok=True)
    for c in SRC['chapters']:
        n = c['number']
        paras = []
        review = [f"# {TITLES[n]}\n"]
        for i, sp in enumerate(c['paragraphs']):
            s = slots.get((n, i))
            if s is None:
                errors.append(f'missing ch{n} ¶{i}')
                paras.append('')
                continue
            text = s['text'].strip()
            if not text:
                errors.append(f'empty ch{n} ¶{i}')
            if '[* Note' in text or ' *' in text or text.endswith('*'):
                errors.append(f'marker or note text inside main text ch{n} ¶{i}')
            paras.append(text)
            src_ids = sorted(x['id'] for x in sp['notes'])
            got_ids = sorted(x['id'] for x in s.get('notes', []))
            if src_ids != got_ids:
                errors.append(f'notes mismatch ch{n} ¶{i}: source {src_ids} draft {got_ids}')
            if sp.get('sectionHeading') or sp.get('dividerBefore'):
                struct.append({'chapter': n, 'paragraph': i, 'sectionHeading': sp.get('sectionHeading'),
                               'dividerBefore': sp.get('dividerBefore')})
            tail = ''
            for x in s.get('notes', []):
                a = x.get('anchorAfterEn', '')
                k = text.rfind(a) if a else -1
                if k < 0:
                    errors.append(f'anchor not found ch{n} ¶{i} {x["id"]}: {a!r}')
                    off = None
                else:
                    off = utf16_len(text[:k + len(a)])
                srcn = next(y for y in sp['notes'] if y['id'] == x['id'])
                notes_out.append({'id': x['id'], 'chapter': n, 'paragraph': i, 'marker': srcn.get('marker', '*'),
                                  'anchorAfterEn': a, 'anchorOffsetUtf16': off, 'text': x['text'].strip(),
                                  'danishAnchorAfter': srcn['anchorAfter'], 'danishText': srcn['text']})
                tail += f" [{srcn.get('marker', '*')} Note: {x['text'].strip()}]"
            head = ''
            if sp.get('dividerBefore'):
                review.append({'rule': '———', 'asterism': '* * *'}.get(sp['dividerBefore'], '———') + '\n')
            if sp.get('sectionHeading'):
                head = f"**{sp['sectionHeading']}** "
            review.append(f"**[{i}]** {head}{text}{tail}\n")
        ed['chapters'].append({'number': n, 'title': TITLES[n], 'paragraphs': paras})
        open(os.path.join(H, 'candidate', 'review', f'ch{n:02d}.md'), 'w').write('\n'.join(review))
    extra = set(slots) - {(c['number'], i) for c in SRC['chapters'] for i in range(len(c['paragraphs']))}
    if extra:
        errors.append(f'draft paragraphs outside the source structure: {sorted(extra)}')
    js = json.dumps(ed, ensure_ascii=False, indent=2) + '\n'
    open(os.path.join(H, 'candidate', 'fear-and-trembling-modern-en.candidate.json'), 'w').write(js)
    json.dump({'book': 'fear-and-trembling', 'edition': 'modern-en', 'offsetUnit': 'utf16',
               'note': 'Johannes de Silentio\'s own footnotes. anchorOffsetUtf16 = position in the paragraph string immediately after anchorAfterEn, where the marker belongs. Presentation is an integration decision.',
               'footnotes': notes_out}, open(os.path.join(H, 'candidate', 'footnotes.json'), 'w'), ensure_ascii=False, indent=2)
    json.dump({'structuralFields': struct}, open(os.path.join(H, 'candidate', 'structure.json'), 'w'), ensure_ascii=False, indent=2)
    # corrected Danish original in the same 184-paragraph structure (main text only; notes in footnotes.json danishText)
    served_da = json.load(open(os.path.join(H, '..', '..', '..', 'app/public/data/editions/fear-and-trembling-original-da.json')))
    da = {'chapters': [{'number': c['number'], 'title': served_da['chapters'][c['number'] - 1]['title'],
                        'paragraphs': [p['text'].strip() for p in c['paragraphs']]} for c in SRC['chapters']]}
    for c in da['chapters']:
        for i, p in enumerate(c['paragraphs']):
            if not p:
                errors.append(f'empty Danish ch{c["number"]} ¶{i}')
    dajs = json.dumps(da, ensure_ascii=False, indent=2) + '\n'
    open(os.path.join(H, 'candidate', 'fear-and-trembling-original-da.candidate.json'), 'w').write(dajs)
    print('original-da candidate sha256', hashlib.sha256(dajs.encode()).hexdigest())
    counts = [len(c['paragraphs']) for c in ed['chapters']]
    words = sum(len(p.split()) for c in ed['chapters'] for p in c['paragraphs'])
    print('chapters', counts, 'total', sum(counts), 'words', words, 'footnotes', len(notes_out))
    print('sha256', hashlib.sha256(js.encode()).hexdigest())
    if errors:
        print('ERRORS:'); [print(' ', e) for e in errors]
        sys.exit(1)
    print('ASSEMBLY CHECKS: PASS')


if __name__ == '__main__':
    main()
