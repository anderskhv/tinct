"""Replay every recorded run-2 recognition through helpers v2 and v3.

No audio, no model, no network: each recorded attempt's heard words are fed
straight back through both pinned helpers.

  fidelity  v2 replay must reproduce the candidate words and stats the pod
            recorded, or the replay is not measuring what ran.
  identity  attempts where v3 changes nothing must be byte-identical.
  movement  paragraphs crossing the 0.85 gate upward and downward under v3.

Then re-decide each chapter/arm from the same recorded attempts.

usage: replay.py <out.json> <root>...
"""
import json, sys, glob, os, collections
from concurrent.futures import ProcessPoolExecutor

sys.path.insert(0, '/home/user/tinct/tools/audio-highlight/aligner')
import pinned_words_sidecar_lib_v2 as v2
import pinned_words_sidecar_lib_v3 as v3

GATE = .85


def one(path):
    d = json.load(open(path))
    if not d.get('attempts'):
        return None
    directory = os.path.dirname(path)
    arm = os.path.basename(directory)
    key = '/'.join(directory.split('/')[-4:-1])
    pindex = int(os.path.basename(path)[1:].split('.')[0])
    rows = []
    best2 = best3 = None
    for a in d['attempts']:
        exp = a['expected_tokens']
        heard = [v2.HeardWord(h['raw'], h['start'], h['end']) for h in a['heard_words']]
        r2 = v2.align_tokens_detailed(exp, heard)
        r3 = v3.align_tokens_detailed(exp, heard)
        fidelity = (json.dumps(r2.words) == json.dumps(a['candidate_words'])
                    and r2.stats.__dict__ == a['stats'])
        identical = (json.dumps(r2.words) == json.dumps(r3.words)
                     and r2.stats.__dict__ == r3.stats.__dict__)
        rows.append(dict(
            key=key, arm=arm, paragraph=pindex, mode=a['mode'],
            fidelity=fidelity, identical=identical,
            touched=bool(len(r3.merges) != len(r2.merges) or r3.groups),
            v2_matched=r2.stats.matched_words, v2_expected=r2.stats.expected_words,
            v2_ratio=r2.stats.match_ratio,
            v3_matched=r3.stats.matched_words, v3_expected=r3.stats.expected_words,
            v3_ratio=r3.stats.match_ratio,
            merges=[m['text'] for m in r3.merges],
            groups=[g['text'] for g in r3.groups],
        ))
        ok2 = (r2.stats.match_ratio, bool(r2.words) or not exp)
        ok3 = (r3.stats.match_ratio, bool(r3.words) or not exp)
        if best2 is None or ok2[0] > best2[0]:
            best2 = ok2
        if best3 is None or ok3[0] > best3[0]:
            best3 = ok3
    return (key, arm, pindex, best2, best3, rows)


def main():
    out = sys.argv[1]
    roots = sys.argv[2:]
    files = []
    for root in roots:
        files += glob.glob(os.path.join(root, '**', 'p*.diagnostic.json'), recursive=True)
    files.sort()
    print(f'{len(files)} diagnostic files', file=sys.stderr)
    summary = collections.Counter()
    chapters = {}
    changed_rows = []
    with ProcessPoolExecutor() as pool:
        for n, res in enumerate(pool.map(one, files, chunksize=64)):
            if n % 5000 == 0:
                print(f'  {n}', file=sys.stderr, flush=True)
            if res is None:
                continue
            key, arm, pindex, best2, best3, rows = res
            for r in rows:
                summary['attempts'] += 1
                summary['fidelity_ok'] += r['fidelity']
                summary['identical'] += r['identical']
                summary['touched'] += r['touched']
                if not r['touched']:
                    summary['untouched'] += 1
                    summary['untouched_identical'] += r['identical']
                summary['ratio_down'] += r['v3_ratio'] < r['v2_ratio'] - 1e-12
                summary['ratio_up'] += r['v3_ratio'] > r['v2_ratio'] + 1e-12
                summary['matched_down'] += r['v3_matched'] < r['v2_matched']
                summary['crossed_gate_up'] += (r['v2_ratio'] < GATE <= r['v3_ratio'])
                summary['crossed_gate_down'] += (r['v3_ratio'] < GATE <= r['v2_ratio'])
                if not r['identical']:
                    changed_rows.append(r)
            ch = chapters.setdefault((key, arm), {})
            ch[pindex] = (best2, best3)
    chapter_rows = []
    for (key, arm), paras in chapters.items():
        v2_below = [p for p, (b2, b3) in sorted(paras.items()) if not (b2[0] >= GATE and b2[1])]
        v3_below = [p for p, (b2, b3) in sorted(paras.items()) if not (b3[0] >= GATE and b3[1])]
        chapter_rows.append(dict(key=key, arm=arm, paragraphs=len(paras),
                                 v2_pass=not v2_below, v3_pass=not v3_below,
                                 v2_below=v2_below, v3_below=v3_below,
                                 v3_worst=min(b3[0] for _b2, b3 in paras.values()) if paras else None))
    by_chapter = {}
    for r in chapter_rows:
        c = by_chapter.setdefault(r['key'], {'v2': False, 'v3': False})
        c['v2'] |= r['v2_pass']
        c['v3'] |= r['v3_pass']
    summary['chapters'] = len(by_chapter)
    summary['chapters_pass_v2'] = sum(1 for c in by_chapter.values() if c['v2'])
    summary['chapters_pass_v3'] = sum(1 for c in by_chapter.values() if c['v3'])
    json.dump(dict(summary=dict(summary), chapters=chapter_rows,
                   chapter_decisions=by_chapter, changed=changed_rows[:4000]),
              open(out, 'w'), indent=1)
    print(json.dumps(dict(summary), indent=1))


if __name__ == '__main__':
    main()
