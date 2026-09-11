"""Copy canary evidence into artifacts/audio-normalisation-2026-09-11/ (no audio bytes)."""
import json,shutil,os,hashlib,glob
S='/tmp/claude-0/-home-user-tinct/b170f9cf-e13e-598b-88f2-32cbed11be37/scratchpad'
A='/tmp/claude-0/audio-norm/artifacts/audio-normalisation-2026-09-11'
os.makedirs(A,exist_ok=True)
def cp(src,dst):
    os.makedirs(os.path.dirname(dst),exist_ok=True);shutil.copy2(src,dst)
# cohort inputs (paths + hashes, no audio)
cp(f'{S}/cohort/cohort.json',f'{A}/cohort/cohort.json');cp(f'{S}/cohort/cohort-dropped.json',f'{A}/cohort/cohort-dropped.json');cp(f'{S}/targets.json',f'{A}/cohort/targets.json')
# runs
for run in sorted(glob.glob(f'{S}/out/*')):
    name=os.path.basename(run)
    if not os.path.exists(f'{run}/run.json'):continue
    for f in ['run.json','model-load.json','process.log']:
        if os.path.exists(f'{run}/{f}'):cp(f'{run}/{f}',f'{A}/runs/{name}/{f}')
    for arm_dir in glob.glob(f'{run}/*/*/*/*'):
        rel=os.path.relpath(arm_dir,run)
        for f in ['chapter.json','words.candidate.json']:
            if os.path.exists(f'{arm_dir}/{f}'):cp(f'{arm_dir}/{f}',f'{A}/runs/{name}/{rel}/{f}')
        # diagnostics: full for the two small canaries, only the changed paragraph for the manifesto
        keep=None if 'communist' not in name else {'p19.diagnostic.json'}
        for f in glob.glob(f'{arm_dir}/p*.diagnostic.json'):
            if keep is None or os.path.basename(f) in keep:cp(f,f'{A}/runs/{name}/{rel}/{os.path.basename(f)}')
# verification + replay + logs
for f in ['replay-local.json','verify-macbeth-published.json','verify-macbeth-candidate-off.json','verify-macbeth-candidate-auto.json','replay-run1-chapters.json','run-canary.log','replay.py','verify_candidate.py','compare.py','run-canary.sh','assemble.py']:
    if os.path.exists(f'{S}/{f}'):cp(f'{S}/{f}',f'{A}/{"tools/" if f.endswith((".py",".sh")) else ""}{f}')
# condensed replay: summary, chapters, and only the paragraph attempts that carry markup or changed
r=json.load(open(f'{S}/replay-run1.json'))
json.dump(dict(summary=r['summary'],chapters=r['chapters'],changed_paragraph_attempts=[p for p in r['paragraphs'] if p['markup'] or not p['identical'] or not p['fidelity']]),open(f'{A}/replay-run1.json','w'),indent=1)
# checksums
lines=[]
for f in sorted(glob.glob(f'{A}/**/*',recursive=True)):
    if os.path.isfile(f) and os.path.basename(f)!='SHA256SUMS.txt':lines.append(hashlib.sha256(open(f,'rb').read()).hexdigest()+'  '+os.path.relpath(f,A))
open(f'{A}/SHA256SUMS.txt','w').write('\n'.join(lines)+'\n');print(len(lines),'files')
