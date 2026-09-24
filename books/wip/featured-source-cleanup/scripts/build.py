#!/usr/bin/env python3
"""Build the featured source-structure cleanup package.

Reads every input straight from a pinned git commit (never from the working
tree), applies the enumerated structural corrections with exact-match
assertions, and writes corrected copies, paragraph maps, change records,
downstream-coordinate impact and hashes into books/wip/featured-source-cleanup/.

Run from the repo root:  python3 books/wip/featured-source-cleanup/scripts/build.py
Nothing outside books/wip/featured-source-cleanup/ is written.
"""
import hashlib, json, os, subprocess, sys

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
PKG = os.path.join(ROOT, 'books/wip/featured-source-cleanup')

JE_COMMIT = 'd47d80f8e849819c67b4879f925d1493619478e3'   # claude/laughing-hypatia-svxsjf
PP_COMMIT = 'e004aad94981ccd203f7d603588d38392158cff5'   # claude/upbeat-dirac-jw9ghg
OD_COMMIT = '0a76d6ce725af920a01afcbb86237d28c3529696'   # claude/odyssey-modern-en-completion
MAIN_COMMIT = 'b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec'  # origin/main at package time

INPUTS = {
    'jane-eyre': {
        'original-en': (JE_COMMIT, 'books/wip/green-jane-eyre/source.json',
                        '055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96'),
        'modern-en': (JE_COMMIT, 'books/wip/green-jane-eyre/candidate.json',
                      '5e270560909297f7f9ccb4e0914a79923b29471008b23e1e70a251a882dce7d7'),
    },
    'pride-and-prejudice': {
        'original-en': (PP_COMMIT, 'books/wip/green-pride-and-prejudice/source.json',
                        '5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6'),
        'modern-en': (PP_COMMIT, 'books/wip/green-pride-and-prejudice/candidate.json',
                      '5ba867fe5e13a7c7c1f1f94946c6b6a575f342951467245a0d816723dd3f4c77'),
    },
    'odyssey': {
        'original-en': (MAIN_COMMIT, 'app/public/data/editions/odyssey-original-en.json',
                        'da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07'),
        'modern-en': (OD_COMMIT, 'books/staged-replacements/odyssey/edition/odyssey-modern-en.candidate.json',
                      None),  # hash taken from the packet below and asserted
    },
}
OD_PACKET = (OD_COMMIT, 'books/staged-replacements/odyssey/edition/RELEASE-PACKET.md')

# Live files on main that are affected but are NOT prepared here (Danish is not a
# delivery requirement; card files belong to the coding agent).
LIVE_AFFECTED = {
    'jane-eyre': ['app/public/data/editions/jane-eyre-modern-da.json',
                  'app/public/data/characters/jane-eyre.v1.json',
                  'app/public/data/editions-chapters/jane-eyre-original-en/manifest.json',
                  'app/public/data/editions-chapters/jane-eyre-modern-da/manifest.json'],
    'pride-and-prejudice': ['app/public/data/editions/pride-and-prejudice-modern-da.json',
                            'app/public/data/characters/pride-and-prejudice.v1.json'],
    'odyssey': ['app/public/data/editions/odyssey-modern-da.json',
                'app/public/data/characters/odyssey.v1.json'],
}

# ---------------------------------------------------------------- operations
# Coordinates are chapter NUMBER (1-based) and paragraph INDEX (0-based) in the
# pinned input, matching both handoffs' convention.  Every op asserts the exact
# text it expects, so a drifted input fails loudly instead of being edited.

JE_CAPTIONS = [  # (chapter, index, exact source text, exact modern-en text, neighbour index that carries it)
    (4, 83, 'How dare I, Mrs. Reed? How dare I? Because it is the truth',
            'How dare I, Mrs. Reed? How dare I? Because it is the truth.', 82),
    (12, 46, 'I was mortally afraid of its trampling forefeet',
             'I was terrified of its stamping front hooves.', 45),
    (15, 45, '“What is it and who did it?” he asked',
             '"What is it and who did it?" he asked.', 43),
    (18, 92, 'During all that time she never turned a page',
             'During all that time she never turned a page.', 91),
    (19, 78, 'She did not stoop towards me, but only gazed, leaning back in her chair',
             'She did not lean toward me but only gazed, reclining in her chair.', 79),
    (25, 83, 'It removed my veil from its gaunt head, rent it in two parts, and flinging both on the floor, trampled on them',
             'It removed my veil from its gaunt head, tore it in two, and flinging both pieces on the floor, trampled on them.', 82),
    (28, 6, 'I said my evening prayers', 'I said my evening prayers.', 5),
    (28, 51, '“Will you give me that?” I asked', '"Will you give me that?" I asked.', 50),
    (28, 117, 'Hush, Hannah; I have a word to say to the woman',
              'Hush, Hannah; I have a word to say to the woman.', 116),
    (33, 92, 'And I am a hard woman,—impossible to put off',
             'And I am a hard woman—impossible to put off.', 91),
    (34, 114, 'He threw himself down on a swell of heath, and there lay still',
              'He threw himself down on a swell of heath, and there lay still.', 113),
    (36, 53, 'The next minute she lay smashed on the pavement',
             'The next moment she lay smashed on the pavement.', 52),
    (38, 17, 'And have you a pale blue dress on?', 'And have you a pale blue dress on?', 16),
]
# The one caption the modern text relies on: fold its sentence into 36.52 first.
JE_FOLD = (36, 52, 'And then, ma\'am, she yelled and gave a leap—"',
           'And then, ma\'am, she yelled and gave a leap, and the next moment she lay smashed on the pavement."')

PP_BREAKS = [  # (chapter, head index, exact source tail, exact source head-of-next, modern tail, modern head-of-next)
    (3, 3, 'by starting the idea of his', 'being gone to London only',
           'by suggesting that he had', 'gone to London only'),
    (14, 12, 'glad to invite him', 'to read aloud to the ladies.',
             'he was glad to invite him', 'to read aloud to the ladies.'),
    (22, 3, 'more interest than the matter had ever', 'excited before, how many years',
            'more interest than the matter had ever', 'inspired before, how many years'),
    (30, 6, 'into Hunsford Lane, in order to have', 'the earliest assurance of it;',
            'onto Hunsford Lane, in order to have', 'the earliest confirmation of it.'),
    (36, 3, 'nothing had been known in Hertfordshire but what he told', 'himself. As to his real character',
            "nothing had been known in Hertfordshire except what he'd told", 'them himself. As to his real character'),
    (46, 10, 'could only say something indistinctly of his', 'concern, and observe her',
             'could only murmur something indistinct about his', 'concern, and watch her'),
    (48, 11, 'that this licentiousness of behaviour in your', 'daughter has proceeded from',
             'that this moral', 'depravity in your daughter has resulted from'),
]

OD_CLAUSE = 'Now when the sun had set and darkness was over the land,'   # PG #1727, Book III, last line
OD_MODERN_38 = 'Now when the sun had set and darkness lay over the land,'  # accepted candidate B03-P038


# ------------------------------------------------------------------- helpers
def git_bytes(commit, path):
    return subprocess.run(['git', '-C', ROOT, 'show', f'{commit}:{path}'], capture_output=True, check=True).stdout

def sha(b):
    return hashlib.sha256(b).hexdigest()

def dump(d):
    return json.dumps(d, indent=2, ensure_ascii=False).encode('utf-8')

def u16(s):
    return len(s.encode('utf-16-le')) // 2

def load(book, ed):
    commit, path, want = INPUTS[book][ed]
    b = git_bytes(commit, path)
    if want is None and book == 'odyssey':
        packet = git_bytes(*OD_PACKET).decode()
        want = sha(b)
        assert want in packet, 'Odyssey candidate hash not recorded in its release packet'
        INPUTS[book][ed] = (commit, path, want)
    assert sha(b) == want, f'{book} {ed}: pinned input hash mismatch {sha(b)} != {want}'
    d = json.loads(b)
    assert dump(d) == b, f'{book} {ed}: serialization is not indent=2/ensure_ascii=False/no trailing newline'
    return d, b

def ch(d, n):
    c = d['chapters'][n - 1]
    assert c['number'] == n
    return c['paragraphs']


# ------------------------------------------------------------------ builders
def build_jane_eyre():
    src, sb = load('jane-eyre', 'original-en')
    mod, mb = load('jane-eyre', 'modern-en')
    osrc, omod = json.loads(sb), json.loads(mb)
    records, ops = [], {}
    # fold 36.53 into modern 36.52 before deletions
    c, i, old, new = JE_FOLD
    p = ch(mod, c)[i]
    assert p.count(old) == 1 and p.endswith(old)
    ch(mod, c)[i] = p.replace(old, new)
    records.append({'edition': 'modern-en', 'op': 'edit', 'at': f'{c}.{i}', 'before': p, 'after': ch(mod, c)[i],
                    'reason': 'absorbs the sentence previously carried only by caption paragraph 36.53, mirroring source 36.52 ("…gave a spring, and the next minute she lay smashed on the pavement.”")'})
    # deletions, descending per chapter so indices stay valid
    for c, i, s_txt, m_txt, nb in sorted(JE_CAPTIONS, key=lambda x: (x[0], -x[1])):
        assert ch(src, c)[i] == s_txt, f'JE src {c}.{i}: {ch(src, c)[i]!r}'
        assert ch(mod, c)[i] == m_txt, f'JE mod {c}.{i}: {ch(mod, c)[i]!r}'
        for ed, d in (('original-en', src), ('modern-en', mod)):
            removed = ch(d, c).pop(i)
            records.append({'edition': ed, 'op': 'delete', 'at': f'{c}.{i}', 'before': removed, 'after': None,
                            'duplicate_of': f'{c}.{nb}', 'reason': 'Gutenberg illustration caption repeating a line of the neighbouring narrative'})
        ops.setdefault(c, []).append(('delete', i))
    return 'jane-eyre', osrc, omod, src, mod, ops, records

def build_pride():
    src, sb = load('pride-and-prejudice', 'original-en')
    mod, mb = load('pride-and-prejudice', 'modern-en')
    osrc, omod = json.loads(sb), json.loads(mb)
    records, ops = [], {}
    for c, i, st, sh, mt, mh in sorted(PP_BREAKS, key=lambda x: (x[0], -x[1])):
        for ed, d, tail, head in (('original-en', src, st, sh), ('modern-en', mod, mt, mh)):
            P = ch(d, c)
            a, b = P[i], P[i + 1]
            assert a.endswith(tail), f'PP {ed} {c}.{i} tail {a[-60:]!r}'
            assert b.startswith(head), f'PP {ed} {c}.{i+1} head {b[:60]!r}'
            assert a[-1] not in '.!?"”’:;' and b[0].islower(), f'PP {ed} {c}.{i}: not a mid-sentence break'
            P[i:i + 2] = [a + ' ' + b]
            records.append({'edition': ed, 'op': 'merge', 'at': f'{c}.{i}+{c}.{i+1}', 'before': [a, b], 'after': P[i],
                            'reason': 'mid-sentence split at a 1894 George Allen illustration; rejoined with one space'})
        ops.setdefault(c, []).append(('merge', i))
    return 'pride-and-prejudice', osrc, omod, src, mod, ops, records

def build_odyssey():
    src, sb = load('odyssey', 'original-en')
    mod, mb = load('odyssey', 'modern-en')
    osrc, omod = json.loads(sb), json.loads(mb)
    P = ch(src, 3)
    assert len(P) == 38
    before = P[37]
    assert before.startswith(OD_CLAUSE + ' Nestor said, "It is getting late;') and len(before.split()) == 208
    P[37] = OD_CLAUSE
    assert ch(mod, 3)[37] == OD_MODERN_38, 'accepted modern B03-P038 changed'
    records = [{'edition': 'original-en', 'op': 'edit', 'at': '3.37', 'before': before, 'after': OD_CLAUSE,
                'reason': 'served paragraph splices 196 words of non-Butler prose (an invented Nestor speech and a modern paraphrase of 3.36) onto Butler\'s final clause of Book III; truncated to PG #1727 exactly'}]
    return 'odyssey', osrc, omod, src, mod, {}, records


def paragraph_map(old, new, ops):
    """Explicit old->new map for every paragraph of every chapter that changes shape."""
    rows = []
    for c in old['chapters']:
        n = c['number']
        if n not in ops:
            continue
        kinds = dict((i, k) for k, i in ops[n])
        shift, j = 0, 0
        P = c['paragraphs']
        i = 0
        while i < len(P):
            k = kinds.get(i)
            if k == 'delete':
                rows.append((n, i, n, '', 'delete', '', ''))
                i += 1
                continue
            if k == 'merge':
                rows.append((n, i, n, j, 'merge-head', 0, ''))
                rows.append((n, i + 1, n, j, 'merge-tail', None, ''))  # offset filled per edition
                i += 2; j += 1
                continue
            rows.append((n, i, n, j, 'keep' if i == j else 'renumber', 0, ''))
            i += 1; j += 1
    return rows


def main():
    os.makedirs(PKG, exist_ok=True)
    summary = {'pins': {'jane-eyre': JE_COMMIT, 'pride-and-prejudice': PP_COMMIT, 'odyssey': OD_COMMIT, 'main': MAIN_COMMIT},
               'books': {}}
    for builder in (build_jane_eyre, build_pride, build_odyssey):
        book, osrc, omod, src, mod, ops, records = builder()
        out = os.path.join(PKG, book)
        os.makedirs(out, exist_ok=True)
        files = {}
        for ed, old, new in (('original-en', osrc, src), ('modern-en', omod, mod)):
            b = dump(new)
            fn = f'{book}-{ed}.json'
            open(os.path.join(out, fn), 'wb').write(b)
            files[ed] = {'file': f'{book}/{fn}', 'sha256': sha(b), 'bytes': len(b),
                         'input_sha256': INPUTS[book][ed][2], 'input': f'{INPUTS[book][ed][0]}:{INPUTS[book][ed][1]}',
                         'chapters': len(new['chapters']),
                         'paragraphs': sum(len(c['paragraphs']) for c in new['chapters']),
                         'input_paragraphs': sum(len(c['paragraphs']) for c in old['chapters']),
                         'per_chapter_changes': {c['number']: [len(o['paragraphs']), len(c['paragraphs'])]
                                                 for o, c in zip(old['chapters'], new['chapters'])
                                                 if len(o['paragraphs']) != len(c['paragraphs'])}}
        # paragraph map (identical for both editions; merge-tail offsets differ per edition)
        rows = paragraph_map(osrc, src, ops)
        with open(os.path.join(out, 'paragraph-map.tsv'), 'w') as f:
            f.write('# Coordinates: chapter number (1-based) . paragraph index (0-based), in the pinned input.\n')
            f.write('# Chapters not listed map by identity (same chapter, same index, same text).\n')
            f.write('# merge-tail offset = UTF-16 code units to ADD to any character offset in the old tail paragraph\n')
            f.write('# (= UTF-16 length of the old head paragraph + 1 for the joining space). It differs per edition.\n')
            f.write('old_chapter\told_index\tnew_chapter\tnew_index\top\toffset_shift_original_en\toffset_shift_modern_en\n')
            for (c, i, nc, ni, op, _, _) in rows:
                if op == 'merge-tail':
                    so = u16(ch(osrc, c)[i - 1]) + 1
                    sm = u16(ch(omod, c)[i - 1]) + 1
                    f.write(f'{c}\t{i}\t{nc}\t{ni}\t{op}\t{so}\t{sm}\n')
                elif op == 'delete':
                    f.write(f'{c}\t{i}\t\t\tdelete\t\t\n')
                else:
                    f.write(f'{c}\t{i}\t{nc}\t{ni}\t{op}\t0\t0\n')
            if book == 'odyssey':
                f.write('# Odyssey: no paragraph is added, removed or moved. 3.37 keeps its index; only its original-en text changes (see CHANGES.json).\n')
        json.dump(records, open(os.path.join(out, 'CHANGES.json'), 'w'), indent=2, ensure_ascii=False)
        summary['books'][book] = {'files': files, 'ops': {str(k): v for k, v in ops.items()}, 'records': len(records)}
    json.dump(summary, open(os.path.join(PKG, 'build-summary.json'), 'w'), indent=2, ensure_ascii=False)
    print(json.dumps(summary, indent=2))

if __name__ == '__main__':
    main()
