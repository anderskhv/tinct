"""Replay recorded run-1 heard words through the v1 and v2 helpers.

For every paragraph attempt recorded by a run-1 pod (or a local run):
  fidelity   v1 replay must reproduce the recorded candidate words and stats exactly
  identity   where the paragraph carries none of the approved markup classes, v2 must
             equal v1 byte for byte (words and stats)
  change     where it does, record what changed
Then re-decide each chapter/arm under v2 from the same recorded attempts.
No audio, no model, no network.
"""
import json,sys,glob,os,collections
sys.path.insert(0,'/tmp/claude-0/audio-norm/tools/audio-highlight/aligner')
import pinned_words_sidecar_lib as v1, pinned_words_sidecar_lib_v2 as v2
GATE=.85
roots=sys.argv[1:-1];out=sys.argv[-1]
paragraph_rows=[];chapters={}
for root in roots:
    for path in sorted(glob.glob(os.path.join(root,'**','p*.diagnostic.json'),recursive=True)):
        d=json.load(open(path))
        if not d.get('attempts'):continue
        directory=os.path.dirname(path);arm=os.path.basename(directory);key='/'.join(directory.split('/')[-4:-1])
        pindex=int(os.path.basename(path)[1:].split('.')[0])
        best=None
        for a in d['attempts']:
            exp=a['expected_tokens'];heard=[v1.HeardWord(h['raw'],h['start'],h['end']) for h in a['heard_words']]
            w1,s1=v1.align_tokens_with_stats(exp,heard);r2=v2.align_tokens_detailed(exp,heard)
            fidelity=(json.dumps(w1)==json.dumps(a['candidate_words']) and s1.__dict__==a['stats'])
            keys1=[v1.canonical_alignment_token(t) for t in exp];keys2=v2.expected_comparison_keys(exp)
            markup=keys1!=keys2 or bool(r2.merges)
            identical=json.dumps(w1)==json.dumps(r2.words) and s1.__dict__==r2.stats.__dict__
            row=dict(root=root,key=key,arm=arm,paragraph=pindex,mode=a['mode'],fidelity=fidelity,markup=markup,identical=identical,v1_matched=s1.matched_words,v1_expected=s1.expected_words,v1_ratio=s1.match_ratio,v2_matched=r2.stats.matched_words,v2_expected=r2.stats.expected_words,v2_ratio=r2.stats.match_ratio,unspoken=len(r2.unspoken),merges=len(r2.merges),classes=sorted({('underscore' if '_' in exp[i] else 'bracket' if '[' in exp[i] or ']' in exp[i] else 'dash' if '--' in exp[i] else 'ellipsis') for i in r2.unspoken}|{'hyphen' for _ in r2.merges}|{('underscore' if '_' in exp[i] else 'bracket' if '[' in exp[i] or ']' in exp[i] else 'dash' if '--' in exp[i] else 'other') for i in range(len(exp)) if keys1[i]!=keys2[i] and keys2[i] is not None}))
            paragraph_rows.append(row)
            if best is None or r2.stats.matched_words>best[0]:best=(r2.stats.matched_words,r2.stats.match_ratio,bool(r2.words) or not exp,a['mode'])
        ch=chapters.setdefault((root,key,arm),dict(root=root,key=key,arm=arm,paragraphs={}))
        ch['paragraphs'][pindex]=dict(v2_ratio=best[1],v2_ok=best[1]>=GATE and best[2],v2_mode=best[3],v1_ratio=next(a for a in d['attempts'] if a['mode']==d.get('selected_mode',d['attempts'][-1]['mode']))['match_ratio'] if d.get('selected_mode') else None)
summary=collections.Counter()
for r in paragraph_rows:
    summary['attempts']+=1;summary['fidelity_ok']+=r['fidelity'];summary['markup']+=r['markup']
    if not r['markup']:summary['no_markup']+=1;summary['no_markup_identical']+=r['identical']
    else:summary['markup_changed']+=not r['identical']
    summary['v2_matched_below_v1']+=r['v2_matched']<r['v1_matched'];summary['v2_ratio_below_v1']+=r['v2_ratio']<r['v1_ratio']-1e-12
    summary['crossed_gate_up']+=(r['v1_ratio']<GATE<=r['v2_ratio']);summary['crossed_gate_down']+=(r['v2_ratio']<GATE<=r['v1_ratio'])
chapter_rows=[]
for (root,key,arm),ch in chapters.items():
    try:
        cj=json.load(open(os.path.join(root,*key.split('/'),arm,'chapter.json')));v1_status=cj.get('status')
    except Exception:v1_status=None
    ps=ch['paragraphs'];v2_ok=all(p['v2_ok'] for p in ps.values());below=[i for i,p in sorted(ps.items()) if not p['v2_ok']]
    chapter_rows.append(dict(root=root,key=key,arm=arm,paragraphs=len(ps),v1_status=v1_status,v2_all_paragraphs_pass=v2_ok,v2_below_gate=below,v2_worst=min(p['v2_ratio'] for p in ps.values()) if ps else None))
json.dump(dict(summary=dict(summary),chapters=chapter_rows,paragraphs=paragraph_rows),open(out,'w'),indent=1)
print(json.dumps(dict(summary)))
