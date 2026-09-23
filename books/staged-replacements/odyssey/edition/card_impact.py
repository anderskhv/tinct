# card_impact.py <assembled.json> <out.json> : read-only dry run of the existing reanchor() against the Odyssey card
import json,sys,importlib.util,hashlib
R='/home/user/tinct-ody/'
spec=importlib.util.spec_from_file_location('pre',R+'app/scripts/prepare-reviewed-editions.py'); pre=importlib.util.module_from_spec(spec); spec.loader.exec_module(pre)
before=open(R+'app/public/data/editions/odyssey-modern-en.json','rb').read()
after=open(sys.argv[1],'rb').read()
asset=json.load(open(R+'app/public/data/characters/odyssey.v1.json'))
new,rep=pre.reanchor(asset,before,after,'DRY-RUN')
blk=asset['editions']['modern-en']; old=pre.paragraphs(json.loads(before)); nw=pre.paragraphs(json.loads(after))
changed={(k,i) for k in old for i in range(len(old[k])) if old[k][i]!=nw[k][i]}
inchg=[m for m in blk['mentions'] if (str(m['chapterNumber']),m['paragraphIndex']) in changed]
# points (firstMention/roleVisibleAt/snapshots) in changed paragraphs
pts=[]
for ch in blk['characters']:
    for lab,p in [('firstMention',ch['firstMention']),('roleVisibleAt',ch['roleVisibleAt'])]+[('snapshot',s['availableAt']) for s in ch['snapshots']]:
        if (str(p['chapterNumber']),p['paragraphIndex']) in changed: pts.append({'character':ch['id'],'point':lab,**p})
out={'before_sha256':hashlib.sha256(before).hexdigest(),'after_sha256':hashlib.sha256(after).hexdigest(),
 'card':'app/public/data/characters/odyssey.v1.json','card_contentVersion':asset['contentVersion'],
 'changed_paragraphs':len(changed),'mentions_total':len(blk['mentions']),'mentions_in_changed_paragraphs':len(inchg),
 'retained':rep['retainedMentions'],'dropped':rep['droppedMentions'],'progression_points_in_changed_paragraphs':pts,
 'original_en_block_unchanged':new['editions']['original-en']==asset['editions']['original-en']}
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
print({k:(len(v) if isinstance(v,list) else v) for k,v in out.items()})
