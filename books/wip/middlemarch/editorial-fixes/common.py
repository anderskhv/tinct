import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
MOD = os.path.join(ROOT, 'app/public/data/editions/middlemarch-modern-en.json')
ORG = os.path.join(ROOT, 'app/public/data/editions/middlemarch-original-en.json')


def load(p):
    return json.load(open(p, encoding='utf-8'))


def save_mod(d):
    with open(MOD, 'w', encoding='utf-8') as f:
        f.write(json.dumps(d, ensure_ascii=False, indent=2))
        f.write(RAW_TAIL)


RAW_TAIL = '\n' if open(MOD, encoding='utf-8').read().endswith('\n') else ''
