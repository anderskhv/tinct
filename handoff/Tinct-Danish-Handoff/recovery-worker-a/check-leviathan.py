import pathlib,json,hashlib,subprocess,copy
p=pathlib.Path(__file__).parent/'reconstructed/leviathan';h=json.loads((p.parent.parent/'leviathan-historical-manifest-output.txt').read_text());checks=[]
for x in h['files']:
 f=p/pathlib.Path(x['path']).name
 checks.append({'name':f.name,'exists':f.exists(),'expectedSha256':x['sha256'],'actualSha256':hashlib.sha256(f.read_bytes()).hexdigest()if f.exists()else None,'historicalHashMatches':f.exists()and hashlib.sha256(f.read_bytes()).hexdigest()==x['sha256']})
(p/'HISTORICAL-HASH-VERIFICATION.json').write_text(json.dumps(checks,indent=2)+'\n')
qa={'releaseDecision':'HOLD-bodies-not-exactly-recovered','nativeReview':'pending','languages':{}}
for l in ['da','en']:
 a=json.loads((p/f'source-modern-{l}.json').read_text());b=json.loads((p/f'leviathan-modern-{l}.json').read_text());reb=copy.deepcopy(a);ledger=json.loads((p/f'modern-{l}-changes.json').read_text())
 for x in ledger:
  assert reb['chapters'][x['section']-1]['paragraphs'][x['slot']-1]==x['before'];reb['chapters'][x['section']-1]['paragraphs'][x['slot']-1]=x['after']
 for x in json.loads((p/f'modern-{l}-title-changes.json').read_text()):reb['chapters'][x['section']-1]['title']=x['after']
 assert reb==b
 main=json.loads(subprocess.check_output(['git','--git-dir='+str(p.parents[2]/'recovery-git.git'),'show',f'current-main:app/public/data/editions/leviathan-modern-{l}.json']))
 qa['languages'][l]={'chapters':len(b['chapters']),'slots':sum(len(c['paragraphs'])for c in b['chapters']),'changedSlots':len(ledger),'exactInternalLedgerReplay':True,'sourceEqualsCurrentMain':a==main,'historicalExpectedChangedSlots':1335 if l=='da' else 733}
(p/'RECOVERY-QA.json').write_text(json.dumps(qa,indent=2)+'\n')
(p/'RECOVERY-STATUS.md').write_text('''# Leviathan: partial recovery — hold publication

Both reading guides exactly match historical final hashes. Neither body matches its historical final hash. Danish has the expected 1,335 changed slots but is393bytes shorter than the historical final file. English has731changed slots against the recorded733. These remain unresolved recovery differences.

Both bodies have49sections and1,337aligned slots. Exact paragraph/title ledgers replay to these candidates; source bodies equal current-main. This establishes internal consistency, not complete recovery of historical corrections.

The Gutenberg3207 witness was recovered from GITenberg. Molesworth73957 remains unavailable (Gutenberg503;mirror timeout). Later marginal-heading lists were recovered from historical output; this map is partial (sections26–39,41–48), as are source-gap notes. This likely explains English differences; the Danish difference remains unresolved. Consult HISTORICAL-HASH-VERIFICATION.json rather than treating the regenerated historical manifest as proof of identity.

All recovered fragments,49chapter checkpoints,both guides,dedication supplements,bodies and evidence are saved. Guides,supplements,title ledger,onboarding ledger,source metadata and editorial notes match historical hashes. Native review remains pending. Keep bodies on hold until exact recovery or a fresh comparison resolves differences.
''')
print(qa)
