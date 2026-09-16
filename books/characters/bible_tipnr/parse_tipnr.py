#!/usr/bin/env python3
"""Parse the STEPBible TIPNR person records into a clean JSON list.

Source: STEPBible-Data, "TIPNR - Translators Individualised Proper Names
with all References" (CC BY 4.0, Tyndale House Cambridge / STEPBible.org).
Downloaded 2026-09-16 from
https://github.com/STEPBible/STEPBible-Data/blob/master/Proper%20Nouns/TIPNR%20-%20Translators%20Individualised%20Proper%20Names%20with%20all%20References%20-%20STEPBible.org%20CC%20BY.txt
Saved verbatim as TIPNR-raw.txt in this directory for provenance.

Only PERSON records are extracted (PLACE/OTHER sections are skipped). Each
record becomes one dict: {unified, ref_key, strong, description_type,
parents, tribe, summary_html, named_forms: [{name, strong, translated,
refs_raw}], briefest, brief, short, article, ambiguity_note}.
"""
import json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAW = HERE / 'TIPNR-raw.txt'


def main():
    lines = RAW.read_text(encoding='utf-8').split('\n')
    # PERSON section: from the first '$==========PERSON(s)' after the header
    # block to the first '$==========PLACE' (module-wide, not per-record).
    start = next(i for i, l in enumerate(lines) if l.startswith('$========== PERSON(s)'))
    # skip the header/example block: real records begin after the second
    # '‖==================' banner block ends, i.e. after line ~160 (first
    # real record starts with a line containing '@' and '=' and a book ref).
    end = next(i for i, l in enumerate(lines) if i > start and l.startswith('$========== PLACE'))

    records = []
    cur = None

    def flush():
        if cur and cur.get('unified'):
            records.append(cur)

    i = start
    while i < end:
        line = lines[i]
        cols = line.split('\t')
        first = cols[0]
        if first.startswith('$=========='):
            flush()
            cur = None
            i += 1
            continue
        if not cur and '@' in first and re.search(r'=[HG]\w+$|=[HG]\w+\(\?\)$', first):
            flush()
            cur = {'unified': first, 'description_type': cols[1] if len(cols) > 1 else '',
                   'parents': cols[2] if len(cols) > 2 else '', 'tribe': cols[6] if len(cols) > 6 else '',
                   'summary_html': cols[7] if len(cols) > 7 else '', 'named_forms': [],
                   'briefest': '', 'brief': '', 'short': '', 'article': ''}
            i += 1
            continue
        if cur is None:
            i += 1
            continue
        if first.strip() == '– Named':
            cur['named_forms'].append({
                'name': cols[1] if len(cols) > 1 else '',
                'strong': cols[2] if len(cols) > 2 else '',
                'translated': cols[3] if len(cols) > 3 else '',
                'refs_raw': cols[4] if len(cols) > 4 else '',
            })
        elif first.startswith('@Briefest='):
            cur['briefest'] = first[len('@Briefest='):].strip()
        elif first.startswith('@Brief='):
            cur['brief'] = first[len('@Brief='):].strip()
        elif first.startswith('@Short='):
            cur['short'] = first[len('@Short='):].strip()
        elif first.startswith('@Article='):
            cur['article'] = first[len('@Article='):].strip()
        elif first.startswith('@Ambiguity='):
            cur['ambiguity_note'] = first[len('@Ambiguity='):].strip()
        i += 1
    flush()

    out = HERE / 'tipnr_persons.json'
    out.write_text(json.dumps(records, ensure_ascii=False, indent=1))
    print(f'{len(records)} PERSON records parsed -> {out}')
    with_short = sum(1 for r in records if r['short'])
    print(f'{with_short} have a @Short summary')


if __name__ == '__main__':
    main()
