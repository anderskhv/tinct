#!/usr/bin/env python3
"""Rebind first-generation person/deity cards whose mentions are sentence
fragments rather than names.

The first-generation packages for many essays and treatises bound each
card to one or two *phrases* -- "Abraham was greater than all", "Rousseau
was more consistent", "Socrates proposes", "the judicious Hooker" -- and
never to the bare name. Two consequences: the phrase is untappable in the
reader (the tap resolves a whitespace token, and "was" is not a name), and
rebind_capped_names.py, which expands each card's *known forms*, had no
plain form to expand. Fear and Trembling shipped with Abraham x266 in the
text and one bound phrase.

For every original (no `resolution`) person/deity card:
  * derive plain name forms from the card's `name` -- the full name, the
    name without a leading honorific (Dr./Mrs./Mr./Sir/St./Lord/Lady/
    Madame/King/Queen), and the surname (last token) when the name has 2+
    tokens, the token is capitalised, 4+ chars, and no other card in the
    book shares it;
  * drop the card's original mentions whose text is not one of those forms
    (the fragments);
  * bind every occurrence of the forms, longest first, skipping spans any
    other mention already claims;
  * move firstMention / roleVisibleAt / earliest snapshot availableAt back
    if a new mention lands earlier.

Cards whose `name` contains "the" ("Alexander the grammarian") or whose
derived forms are in SKIP (God, Lord, ...) get only their exact full name.
Names in AMBIGUOUS_SURNAMES never get a surname form. Bible is excluded.

Usage: rebind_junk_cards.py [--dry-run] [--apply] BOOK... | --all
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHAR_DIR = ROOT / 'app/public/data/characters'
HONORIFICS = ('Dr. ', 'Mrs. ', 'Mr. ', 'Sir ', 'St. ', 'Lord ', 'Lady ', 'Madame ', 'King ', 'Queen ', 'Emperor ', 'Prince ', 'Miss ', 'Master ', 'Captain ', 'General ', 'Colonel ', 'Father ', 'Brother ', 'Uncle ', 'Aunt ', 'Old ', 'Young ')
PARTICLES = {'of', 'the', 'de', 'von', 'van', 'da', 'di', 'du', 'la', 'le', 'del', 'and', 'y', 'der', 'den', 'af', 'zu'}
SKIP = {'God', 'Lord', 'LORD', 'Father', 'Son', 'Spirit', 'Holy Spirit', 'Man', 'Nature', 'Reason', 'Law', 'Will', 'Death', 'Time', 'Love', 'Fate', 'Fortune', 'Truth', 'Virtue', 'Justice', 'Soul', 'Mind', 'Author', 'Reader', 'Narrator', 'The Narrator'}
AMBIGUOUS_SURNAMES = {'Story', 'Smith', 'Price', 'Young', 'Long', 'Grant', 'Chase', 'Bell', 'Hill', 'Wood', 'Green', 'Brown', 'White', 'Black', 'King', 'Bishop', 'Marshal', 'Pope', 'Dean', 'Miller', 'Baker', 'Cook', 'Hunter', 'Rose', 'May', 'June', 'Mark', 'Job', 'Grace', 'Hope', 'Faith', 'Will', 'Sand', 'Paul', 'John', 'James', 'Peter', 'Mary', 'Anne', 'Anna', 'Jane', 'George', 'Henry', 'Charles', 'William', 'Richard', 'Edward', 'Thomas', 'Robert', 'Francis', 'Frederick', 'Philip', 'Alexander', 'Louis', 'Lewis', 'Bruno', 'Vinci', 'Great', 'First', 'Second', 'Third'}


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def point_key(p):
    return (p['chapterNumber'], p['paragraphIndex'], p['offset'])


def mention_end_point(m):
    return (m['chapterNumber'], m['paragraphIndex'], m['endOffset'])


def card_name(c):
    return c.get('name') or c['snapshots'][0]['name']


def derive_forms(name, other_tokens):
    name = name.strip()
    forms = {name}
    base = name
    for h in HONORIFICS:
        if base.startswith(h):
            base = base[len(h):]
            if not (len(base.split()) == 1 and base in AMBIGUOUS_SURNAMES):
                forms.add(base)
            break
    toks = base.split()
    if any(t.lower() in ('the', 'of') for t in toks):
        return {f for f in forms if f not in SKIP}
    if len(toks) >= 2:
        last = toks[-1].rstrip('.,')
        if last[:1].isupper() and len(last) >= 4 and last not in AMBIGUOUS_SURNAMES and last not in other_tokens:
            forms.add(last)
    return {f for f in forms if f not in SKIP and len(f) >= 3}


def is_fragment(text, forms):
    if text in forms:
        return False
    toks = [t.strip('.,;:!?"\'()[]“”‘’') for t in text.split()]
    if any(t and t[:1].islower() and t not in PARTICLES for t in toks):
        return True
    return len(toks) > 3


def process(book, apply=False):
    path = CHAR_DIR / f'{book}.v1.json'
    pkg = json.loads(path.read_text())
    report = []
    for ek, ed in pkg['editions'].items():
        ed_path = ROOT / f'app/public/data/editions/{book}-{ek}.json'
        if not ed_path.exists():
            continue
        data = json.loads(ed_path.read_bytes())
        paras = {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}
        chars = {c['id']: c for c in ed['characters']}
        person_ids = {cid for cid, c in chars.items() if c.get('kind') in ('person', 'deity')}
        by_char = {}
        for m in ed['mentions']:
            by_char.setdefault(m['characterId'], []).append(m)
        original_ids = [cid for cid in person_ids if any('resolution' not in m for m in by_char.get(cid, []))]
        # tokens of every other card's name, so shared surnames are never expanded
        name_tokens = {cid: set(card_name(chars[cid]).replace('.', '').split()) for cid in chars}
        jobs = {}
        for cid in original_ids:
            others = set().union(*(name_tokens[o] for o in chars if o != cid)) if len(chars) > 1 else set()
            forms = derive_forms(card_name(chars[cid]), others)
            # forms a later restricted pass already bound deliberately (e.g. the
            # Democracy in America "Washington" split) are never re-expanded here
            forms -= {m['text'] for m in by_char[cid] if 'resolution' in m}
            originals = [m for m in by_char[cid] if 'resolution' not in m]
            fragments = [m for m in originals if is_fragment(m['text'], forms)]
            if not fragments or not forms:
                continue
            jobs[cid] = (forms, fragments)
        if not jobs:
            continue
        drop = {id(m) for _, (_, frs) in jobs.items() for m in frs}
        kept = [m for m in ed['mentions'] if id(m) not in drop]
        taken = {}
        for m in kept:
            taken.setdefault((m['chapterNumber'], m['paragraphIndex']), []).append((m['startOffset'], m['endOffset']))
        new_mentions = []
        added = {}
        for form, cid in sorted(((f, cid) for cid, (fs, _) in jobs.items() for f in fs), key=lambda z: -len(z[0])):
            pat = re.compile(r'(?<!\w)' + re.escape(form) + r'(?!\w)')
            for key, text in paras.items():
                for mm in pat.finditer(text):
                    a, b = u16(text[:mm.start()]), u16(text[:mm.end()])
                    if any(a < tb and b > ta for ta, tb in taken.get(key, [])):
                        continue
                    taken.setdefault(key, []).append((a, b))
                    new_mentions.append({'chapterNumber': key[0], 'paragraphIndex': key[1], 'startOffset': a, 'endOffset': b,
                                         'text': mm.group(), 'characterId': cid, 'resolution': 'reviewed-name'})
                    added[cid] = added.get(cid, 0) + 1
        # a card that gained nothing keeps its fragments rather than being orphaned
        for cid, (forms, frs) in list(jobs.items()):
            if not added.get(cid):
                kept.extend(frs)
                del jobs[cid]
        for cid, (forms, frs) in jobs.items():
            report.append((book, ek, cid, sorted(forms), len(frs), added.get(cid, 0)))
        if not apply:
            continue
        ed['mentions'] = kept + new_mentions
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        for c in ed['characters']:
            ms = [m for m in ed['mentions'] if m['characterId'] == c['id']]
            if not ms:
                continue
            earliest = min(ms, key=mention_end_point)
            if mention_end_point(earliest) < point_key(c['firstMention']):
                pt = {'chapterNumber': earliest['chapterNumber'], 'paragraphIndex': earliest['paragraphIndex'], 'offset': earliest['endOffset']}
                c['firstMention'] = pt
                c['roleVisibleAt'] = dict(pt)
                snaps = sorted(c.get('snapshots', []), key=lambda s: point_key(s['availableAt']))
                if snaps and point_key(snaps[0]['availableAt']) > point_key(pt):
                    snaps[0]['availableAt'] = dict(pt)
    if apply and report:
        path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
    return report


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    apply = '--apply' in sys.argv
    if '--all' in sys.argv:
        args = sorted(p.name[:-len('.v1.json')] for p in CHAR_DIR.glob('*.v1.json') if p.name != 'bible.v1.json')
    total = 0
    for book in args:
        for book_, ek, cid, forms, dropped, added in process(book, apply=apply):
            total += added
            print(f'{book_}\t{ek}\t{cid}\tforms={forms}\tdropped={dropped}\tadded={added}')
    print('total added', total, '(applied)' if apply else '(dry run)')


if __name__ == '__main__':
    main()
