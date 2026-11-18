import json,pathlib,hashlib
p=pathlib.Path(__file__).parent;dump=lambda f,d:(p/f).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
gaps=[{'kind':'front_matter','location':'before Act I','description':'PG1524 full dramatis personae absent in retained original/candidates; separately translated and included in SUPPLEMENTAL-DRAMATIS-PERSONAE.json. Existing body slots unchanged.'},{'kind':'attribution','location':'9.23–24','description':'Entrance continuation wrongly prefixed HAMLET. DA/EN now continuous bracketed direction over two slots.'},{'kind':'attribution','location':'10.16','description':'The King rises and advances wrongly prefixed HAMLET after Hamlet exit. DA/EN corrected to stage direction.'},{'kind':'attribution','location':'19.97–98','description':'Funeral entrance continuation wrongly prefixed HAMLET; DA/EN separate bracketed continuation from real Hamlet speech within same slots.'},{'kind':'attribution','location':'20.150','description':'OSRIC AND LORDS treason cry wrongly prefixed HAMLET; extra prefix removed in DA/EN.'},{'kind':'body_coverage','description':'All1391 retained original slots sequentially matched PG1524 after normalization; inspected interstices contain headings/speaker labels, no missing dramatic body passage identified. This is not a Q1/Q2/F1 critical collation.'}]
dump('EDITORIAL-GAPS.json',gaps)
review={'status':'full first-pass candidate; not independently or natively approved','native_review':'user-arranged, pending','independent_review':'pending','release':'none; local preparation only','priority_followups':[
{'locations':['9.108–109','19.14–16'],'issue':'Wordplay not fully recreated in Danish: lost expected-rhyme ass/pajock joke, arms=heraldry/physical arms. Native recasting or integrated reader notes needed.'},
{'locations':['18.43'],'issue':'Botanical Danish krageblomster/lange purpurblomster are provisional literal source-name renderings. Resolve historical plant identification/Danish naming without falsely declaring species.'},
{'locations':['19.45','20.59','20.97','20.102'],'issue':'Historical English property-law vocabulary and obscure fencing wager/scoring: specialist or independent source check.'},
{'locations':['1.49','2.4','2.24','4.12','5.19','7.69','7.114','7.157','8.24','15.23','16.77','18.34','19.126','20.84','20.119'],'issue':'Selected-witness cruxes and historical senses documented in REVIEW-NOTES-WORKING.txt. Important: solid/sullied, dram-of-evil, unidentified hebenon, carrion syntax, great argument/straw, wheel, pleurisy, eisel, has/knows, fat.'},
{'locations':['all songs','play-within-play','rhetorical speeches'],'issue':'Meaning-led Danish free verse, not strict pentameter or fully rhymed singable version. Songs retained lineation and content but require native performance/poetry review; do not claim metrical equivalence.'},
{'locations':['2.1–3','9.23–24','19.97–98'],'issue':'Directions span existing slots. Chapter brackets balance; actual app display not exercised. Validate reader presentation without recombining slots silently.'},
{'locations':['whole book','both guides'],'issue':'Native fluency, rank pronouns I/jer/du, character names, and independent semantic follow-up still pending. Historical terms carry meaning and are not automatically archaic Danish defects.'}
]};dump('REVIEW-REMAINING.json',review)
progress={'reviewed_scenes':list(range(1,21)),'reviewed_slots':1391,'total_scenes':20,'total_slots':1391,'status':'full-first-pass-local-handoff','both_guides':'rewritten and exact replay checked','native_review':'pending','independent_review':'pending','no_release':True};dump('PROGRESS.json',progress)
qa=json.loads((p/'REPLAY-QA-FINAL.json').read_text());da=qa['languages']['da'];en=qa['languages']['en']
(p/'HANDOFF.txt').write_text(f'''HAMLET — LOCAL CONTENT PREPARATION HANDOFF
Prepared by /root/nietzsche. No repository/app/project edits, uploads, merges or releases.
Full first pass: 20/20 scenes, 1391/1391 slots; five acts preserved.
Danish: {da['operations']} exact ledger operations across {da['distinct_changed_slots']} distinct slots.
English: {en['operations']} targeted exact operations across {en['distinct_changed_slots']} distinct slots.
Both reading guides rewritten and checked. Supplementary full dramatis personae prepared.
Status: independent follow-up and native Danish review PENDING. This is not a release-ready quality claim.

FILES TO REVIEW / REPLAY
candidate-hamlet-modern-da.json -> app/public/data/editions/hamlet-modern-da.json
candidate-hamlet-modern-en.json -> app/public/data/editions/hamlet-modern-en.json
candidate-hamlet.da.json -> app/public/data/onboarding/hamlet.da.json
candidate-hamlet.json -> app/public/data/onboarding/hamlet.json
DANISH-REPAIRS.json and ENGLISH-REPAIRS.json are sequential exact before/after operations (1-based chapter, paragraph). Repeated slots are intentional, including final fluency edits.
ONBOARDING-REPAIRS-DA.json / -EN.json replace complete top-level fields with exact before values.
SUPPLEMENTAL-DRAMATIS-PERSONAE.json is a proposal for separate front matter, not inserted body slots.
EDITORIAL-GAPS.json includes four original-corpus attribution defects corrected in candidates but NOT original source files. Claude should consider original-en corrections separately; no original-en mutation in this packet.

SOURCE PIN / WITNESS
anderskhv/tinct commit d9c42967c77942a0b3de9765e8526d4d012ed1ff.
All five GitHub source blob SHAs independently re-fetched at pin and matched; SOURCE-IDENTITIES.json / SOURCE-PIN-VERIFICATION.json.
Production witness: Project Gutenberg1524, https://www.gutenberg.org/ebooks/1524.txt.utf-8, local source-pg1524.txt. Exact underlying print imprint not established; do not label as a specific Q/F edition.
All original slots mapped to PG1524 in SOURCE-SLOT-MAP.json; SOURCE-MAP-UNRESOLVED.json empty. SOURCE-INTERSTICES.json inspected; no missing body passage found; cast list missing separately supplied. Normalization ignores punctuation; not diplomatic collation.
source-pg1787.txt is provenance comparison ONLY and bears World Library restrictions. Do NOT deploy or use that file as production source. Folger consulted for orientation only; no modern editorial text copied.

CONTENT / LIMITATIONS
Full meaning-led modern Danish dramatic rewrite with free verse, speeches, songs, allusions and stage action retained. Not strict pentameter and not all rhyme reproduced. Targeted modern-English accuracy repair, not complete English style rewrite.
Priority outstanding: song/rhyme wordplay (9.108,19.14–16), provisional Danish plant names18.43, historical property law19.45 and fencing scores20.59/97/102, source cruxes listed in REVIEW-REMAINING.json. Reader annotations/integration remain needed for irreducible puns and historical imagery. REVIEW-NOTES-WORKING.txt records choices scene by scene and supporting lookup URLs.
Both guides correct significant factual/interpretive overstatements, remove unverified acclaim, align names/opening, and add missing principal figures. They do not state Ophelia definitely committed suicide or that Hamlet killed Claudius after Hamlet was dead.

CHECKS
REPLAY-QA-FINAL.json: exact full-body replay for both languages; exact guide replay;1391 nonempty slots; all chapter/section/title keys preserved; no zero-width/replacement chars; per-chapter stage brackets balanced. Not tested in app, no native performance check, no independent review completed here.
Renderer review needed for stage directions crossing slots2.1–3,9.23–24,19.97–98. Do not silently merge/add body slots.

CLAUDE HANDOFF
Refresh current branch/version before applying. Compare source blobs: if content drifted, replay only confirmed exact operations or do three-way reconciliation; never overwrite newer shared content. Preserve no-release coordination until user explicitly asks Claude to upload/release. No enablement/config/code changes supplied or authorized by this packet.
''')
files=['candidate-hamlet-modern-da.json','candidate-hamlet-modern-en.json','candidate-hamlet.da.json','candidate-hamlet.json','DANISH-REPAIRS.json','ENGLISH-REPAIRS.json','ONBOARDING-REPAIRS-DA.json','ONBOARDING-REPAIRS-EN.json','SUPPLEMENTAL-DRAMATIS-PERSONAE.json','EDITORIAL-GAPS.json','REVIEW-REMAINING.json','REVIEW-NOTES-WORKING.txt','REPLAY-QA-FINAL.json','PROGRESS.json','HANDOFF.txt','SOURCE-IDENTITIES.json','SOURCE-PIN-VERIFICATION.json','SOURCE-SLOT-MAP.json','SOURCE-MAP-UNRESOLVED.json','SOURCE-INTERSTICES.json','source-hamlet-original-en.json','source-hamlet-modern-da.json','source-hamlet-modern-en.json','source-hamlet.json','source-hamlet.da.json','source-pg1524.txt','CLAIM.json','RANKING-CHECK.json']
dump('MANIFEST.json',{'book':'hamlet','status':progress['status'],'no_upload_or_release':True,'native_review':'pending','independent_review':'pending','files':[{ 'path':f,'bytes':(p/f).stat().st_size,'sha256':hashlib.sha256((p/f).read_bytes()).hexdigest()}for f in files]});print('Manifest',len(files),'files')
