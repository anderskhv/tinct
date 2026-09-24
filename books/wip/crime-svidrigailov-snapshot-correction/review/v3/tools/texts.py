"""Load the three pinned texts and expose normalized paragraphs with UTF-16 lengths."""
import json, os, re, sys
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
FILES = {
    'original-en': 'inputs/source.json',
    'modern-en': 'inputs/baseline-live-modern-en.json',
    'candidate': 'inputs/candidate.json',
}
def norm(t):
    return re.sub(r' {2,}', ' ', t.replace('\n', ' '))
def u16(s):
    return len(s.encode('utf-16-le')) // 2
def u16_to_py(s, off):
    """Convert UTF-16 offset to Python index."""
    n = 0
    for i, ch in enumerate(s):
        if n >= off: return i
        n += 2 if ord(ch) > 0xFFFF else 1
    return len(s)
_cache = {}
def load(ed):
    if ed not in _cache:
        d = json.load(open(os.path.join(BASE, FILES[ed]), encoding='utf-8'))
        out = {}
        for ch in d['chapters']:
            paras = []
            for p in ch['paragraphs']:
                t = p if isinstance(p, str) else p.get('text', '')
                paras.append(norm(t))
            out[ch['number']] = paras
        _cache[ed] = out
    return _cache[ed]
def para(ed, c, p):
    return load(ed)[c][p]
if __name__ == '__main__':
    ed, c, p = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    t = para(ed, c, p)
    print(f'[{ed} {c}.{p} len16={u16(t)}]')
    print(t)
