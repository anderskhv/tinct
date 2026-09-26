import json, re
from pathlib import Path

ROOT = Path('/home/user/tinct')

SPEAKER_TO_ID = {
    'FAUST': 'faust',
    'MEPHISTOPHELES': 'mephistopheles',
    'MARGARET': 'margaret',
    'WAGNER': 'wagner',
    'THE LORD': 'the-lord',
    'RAPHAEL': 'raphael',
    'GABRIEL': 'gabriel',
    'MICHAEL': 'michael',
    'VALENTINE': 'valentine',
    'MARTHA': 'martha',
    'FROSCH': 'frosch',
    'BRANDER': 'brander',
    'SIEBEL': 'siebel',
    'ALTMAYER': 'altmayer',
    'THE WITCH': 'witch',
}
NAME_ALIASES = {
    'faust': [r'\bFaust\b'],
    'mephistopheles': [r'\bMephistopheles\b'],
    'margaret': [r'\bMargaret\b'],
    'wagner': [r'\bWagner\b'],
    'valentine': [r'\bValentine\b'],
    'martha': [r'\bMartha\b'],
    'the-lord': [r'\bthe Lord\b'],
}
STUDENT_CHAPTER = 7

def normalized(s):
    return re.sub(r' {2,}', ' ', s.replace('\n', ' '))

def u16(s):
    return len(s.encode('utf-16-le')) // 2

# Matches "NAME." or "NAME (parenthetical)." at paragraph start, followed by
# whitespace. The captured speaker-label span is ONLY the NAME itself.
SPEAKER_RE = re.compile(r'^([A-Z][A-Z ]+?)(?:\s*\([^)]*\))?\.\s')

def compile_edition(edition_path, ids):
    source = json.loads(edition_path.read_bytes())
    mentions = []
    for c in source['chapters']:
        ch = c['number']
        for pi, raw in enumerate(c['paragraphs']):
            text = normalized(raw)
            candidates = []
            m = SPEAKER_RE.match(text)
            if m:
                label = m.group(1)
                owner = SPEAKER_TO_ID.get(label)
                if label == 'STUDENT':
                    owner = 'student' if ch == STUDENT_CHAPTER else None
                if owner:
                    candidates.append((0, len(label), owner, 'reviewed-speaker'))
            for cid, patterns in NAME_ALIASES.items():
                for pat in patterns:
                    for mm in re.finditer(pat, text):
                        candidates.append((mm.start(), mm.end(), cid, 'reviewed-name'))
            chosen = []
            for a, b, cid, how in sorted(set(candidates), key=lambda x: (-(x[1]-x[0]), x[0])):
                overlap = [c2 for c2 in chosen if a < c2[1] and b > c2[0]]
                if overlap:
                    continue
                chosen.append((a, b, cid, how))
            for a, b, cid, how in sorted(chosen):
                assert cid in ids, cid
                mentions.append(dict(
                    characterId=cid, chapterNumber=ch, paragraphIndex=pi,
                    startOffset=u16(text[:a]), endOffset=u16(text[:b]),
                    text=text[a:b], resolution=how,
                ))
    return source, mentions

if __name__ == '__main__':
    import sys
    edition = sys.argv[1]
    path_map = {
        'original-en': ROOT / 'books/wip/faust-part-1-english-repair/editions/faust-part-1-original-en.json',
        'modern-en': ROOT / 'books/wip/faust-part-1-english-repair/editions/faust-part-1-modern-en.json',
    }
    ids = set(SPEAKER_TO_ID.values()) | set(NAME_ALIASES.keys()) | {'gabriel','michael','raphael','student'}
    source, mentions = compile_edition(path_map[edition], ids)
    out = {
        'sourceSha256': __import__('hashlib').sha256(path_map[edition].read_bytes()).hexdigest(),
        'chapterCount': len(source['chapters']),
        'paragraphCount': sum(len(c['paragraphs']) for c in source['chapters']),
        'mentions': mentions,
    }
    outpath = ROOT / f'books/wip/faust-part-1-character-card/mentions-{edition}.json'
    outpath.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(edition, 'mentions:', len(mentions), 'chapters:', out['chapterCount'], 'paragraphs:', out['paragraphCount'])
    seen = {}
    for m in mentions:
        cid = m['characterId']
        if cid not in seen:
            seen[cid] = m
    for cid, m in sorted(seen.items()):
        print(' first:', cid, m['chapterNumber'], m['paragraphIndex'], m['startOffset'], repr(m['text']))
