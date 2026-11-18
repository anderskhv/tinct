import json
p='/tmp/tinct-da-prep-20261104/beyond-good-and-evil/'
e=json.load(open(p+'beyond-good-and-evil-modern-en.json'));src=json.load(open(p+'source-beyond-good-and-evil-modern-en.json'));ch=json.load(open(p+'modern-en-changes.json'))
def edit(c,n,old,new,reason):
 s=e['chapters'][c-1]['paragraphs'][n-1]
 if old not in s:raise ValueError((c,n,old))
 a=s.replace(old,new);e['chapters'][c-1]['paragraphs'][n-1]=a
 r=next((x for x in ch if x['chapter']==c and x['paragraph']==n),None)
 if r:r['after']=a;r['reason']+='; '+reason
 else:ch.append({'chapter':c,'paragraph':n,'before':src['chapters'][c-1]['paragraphs'][n-1],'after':a,'reason':reason})
edit(3,1,'Indeed, we must hope that LANGUAGE, here as elsewhere, will not overcome its clumsiness, and will go on speaking of opposites where there are only differences of degree and many subtle gradations. We must likewise hope that the incarnate Tartuffery of morality, now part of our unconquerable “flesh and blood,” will twist the words in the mouths of those of us who see through it.','Even if LANGUAGE, here as elsewhere, cannot overcome its clumsiness and continues speaking of opposites where there are only differences of degree and many subtle gradations; even if the ingrained hypocrisy of morality, now part of our unconquerable “flesh and blood,” twists the words in the mouths of those of us who know:','German concessive mag auch does not express a hope; inherited Zimmern/modernEN reversed force.')
edit(3,2,'so that people may mistake you for what you are','so that people may mistake you for someone else','German verwechsele calls for concealment, not recognition of actual identity.')
edit(3,3,'most disagreeable, hateful, and disappointing part','most disagreeable, foul-smelling, and disappointing part','German übelriechend preserves smell image, not hateful.')
edit(3,5,'the average TEMPO at which that race assimilates its food','the average TEMPO of its metabolism','German Stoffwechsel means metabolism, not narrowly food assimilation.')
for f,x in [('beyond-good-and-evil-modern-en.json',e),('modern-en-changes.json',ch)]:json.dump(x,open(p+f,'w'),ensure_ascii=False,indent=2)
