from prep import *
def setslot(lang,c,i,s):
 key=f'{c} {i} ';found=False
 for f in sorted(p.glob(f'patch-{lang}-*.txt')):
  lines=f.read_text().splitlines()
  for n,line in enumerate(lines):
   if line.startswith(key):lines[n]=key+s.replace('\n',' | ');found=True;f.write_text('\n'.join(lines)+'\n');break
  if found:break
 if not found:
  f=p/f'patch-{lang}-audit.txt'
  with f.open('a') as h:h.write(key+s.replace('\n',' | ')+'\n')
def fix(lang,c,i,reps):
 doc=rd('modern-'+lang+'.json');s=doc['chapters'][c-1]['paragraphs'][i-1]
 for a,b in reps:
  assert a in s,(lang,c,i,a)
  s=s.replace(a,b)
 setslot(lang,c,i,s)
fix('da',13,114,[('på havets bund','i Davy Jones’ gemme på havets bund')])
fix('da',17,476,[('Master Percy','den unge Percy'),('ungdoms-venskab','ungdomsvenskab'),('koloni- (f.eks. canadisk) ekspansion','kolonial (f.eks. canadisk) ekspansion'),('_The Descent of Man_ og _The Origin of Species_','_Menneskets afstamning_ og _Arternes oprindelse_'),('agrar-politik','landbrugspolitik'),('blandt en træs forgreninger','mellem et træs grene'),('laugs-korporationer','håndværkerlav')])
fix('da',17,482,[('det vældige antal af de andre','det vældige antal af de sidstnævnte dyr')])
fix('da',17,498,[('delvis oprullede gummikondomer','delvis udrullede gummikondomer')])
# Restore deliberate sonic transformations that had been mechanically flattened.
for i in [121,131,135,173,209,355,629]:setslot('en',11,i,' '.join(en[10]['paragraphs'][i-1].split()))
for i in [204,618]:fix('en',11,i,[(' (Bloom\'s pen name)','')])
# Removing intrusive repeated narrative explanations; the Citizen remains named in the guide.
for i,s in enumerate(modern[11]['paragraphs'],1):
 if 'Citizen (the nationalist)' in s:setslot('en',12,i,s.replace('Citizen (the nationalist)','Citizen'))
fix('en',12,160,[('the why and the why','the why and the wherefore')])
fix('en',12,263,[('yet as well somewhat ruddy','yet also somewhat ruddy')])
fix('en',12,472,[('So servest you','So you serve')])
fix('en',13,68,[('all and various','all and sundry')])
for i,s in enumerate(modern[12]['paragraphs'],1):
 n=s.replace('Oh’Hare','O’Hare').replace('Oh’Hara','O’Hara').replace('Oh’Connor','O’Connor').replace('Oh’Hanlon','O’Hanlon').replace('P. Oh.','P. O.').replace(' (the headland)','')
 if n!=s:setslot('en',13,i,n)
fix('en',13,72,[('_Art you real, my ideal?_','_Are you real, my ideal?_')])
# Preserve intentional archaising style where token swaps produced broken grammar.
for i in [9,10,18,20,24,28,55,57]:setslot('en',14,i,' '.join(en[13]['paragraphs'][i-1].split()))
fix('en',14,46,[('O no, Vincent Lenehan said','O no, Vincent, Lenehan said'),('as was the ancient accustomed','as was the ancient custom')])
fix('en',14,41,[('until now silent','Until now silent')])
fix('en',14,56,[('from there they advanced','From there they advanced')])
fix('en',15,16,[('turn and turn back','turn and retort in reply')])
fix('en',15,13,[('THE fierce woman:','THE FIERCE WOMAN:')])
fix('en',15,1290,[('THE fierce woman:','THE FIERCE WOMAN:')])
for i in [40,119,656,669,707,832,875,1076]:setslot('en',15,i,' '.join(en[14]['paragraphs'][i-1].split()))
fix('en',15,812,[('from now on you are','From now on you are')])
fix('en',16,1,[('before anything else','Before anything else'),('so after a few','So after a few')])
fix('en',16,11,[('as much as a penny','as much as a farthing')])
fix('en',16,21,[('then being','Then being')])
fix('en',16,47,[('so his first','So his first')])
fix('en',16,264,[('at this point he','At this point he')])
fix('en',16,272,[('so he passed','So he passed'),('led him on so.','led him on accordingly.')])
for i in [4,10]:fix('en',17,i,[('light-seeking','paraheliotropic')])
fix('en',17,18,[('evenly spaced uneven numbers','equally spaced odd numbers')])
fix('en',17,28,[('standard weight measure','avoirdupois measure')])
fix('en',17,89,[('What beyond what is required marks of special hospitality','What marks of special hospitality beyond what was required')])
fix('en',17,474,[('uttermost penny','uttermost farthing')])
fix('en',18,1,[('never left us a penny','never left us a farthing'),('under my skirts','under my petticoats'),('Jesus Christ the child','Jesusjack the child')])
fix('en',18,2,[('the orange skirts','the orange petticoat')])
fix('en',18,5,[('skirts bodice','petticoat bodice'),('inside my skirts','inside my petticoat'),('my skirts began','my petticoat began')])
fix('en',18,7,[('with the low necklines','with the low neckline')])
fix('en',18,8,[('my short skirts','my short petticoat')])
