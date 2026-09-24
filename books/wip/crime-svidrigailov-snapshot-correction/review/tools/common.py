import json, re, os
BASE = os.path.join(os.path.dirname(__file__), '..', '..', 'inputs')
def load(name):
    return json.load(open(os.path.join(BASE, name), encoding='utf-8'))
def norm(t):
    return re.sub(r' {2,}', ' ', t.replace('\n', ' '))
def u16len(s):
    return len(s.encode('utf-16-le')) // 2
def u16slice(s, n):
    b = s.encode('utf-16-le')[:2*n]
    return b.decode('utf-16-le')
def para(ed, ch, pi):
    d = ED[ed] if isinstance(ed, str) else ed
    c = d['chapters'][ch-1]
    assert c['number'] == ch, (c['number'], ch)
    p = c['paragraphs'][pi]
    if isinstance(p, dict):
        p = p.get('text')
    return norm(p)
ED = {}
def editions():
    if not ED:
        ED['original-en'] = load('source.json')
        ED['modern-en'] = load('baseline-live-modern-en.json')
        ED['candidate'] = load('candidate.json')
    return ED
