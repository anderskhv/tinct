# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('standjagten','sneppetrækket'),('ikke langt oppe ad en bæk','ikke langt væk, oven for åen'),('espeskov','aspekrat'),('tunge frakke','kaftan')],2:[('espeskoven','aspekrattet')],3:[('vandstråler','vandløb')],5:[('espeblad','aspeblad'),('hvide stribede skyer','hvide skystriber')],6:[('En ugle','En hornugle')],8:[('Nu kommer den!','Nu varer det ikke længe.')],10:[('lød knaldet','klikkede det'),('hanen på sit gevær','hanerne på sit gevær')],11:[('en fole','et føl')],12:[('en hare','en hanhare'),('hanen på sit gevær','hanerne på sit gevær')],14:[('espeskuds vildtvoksende masse','aspeskuds sammenflydende masse')],16:[('Tillykke med, at det lykkedes','Jeg er glad for, at det lykkedes dig')],18:[('uden at skrige','uden at knorre'),('vendte snepperne sig i hurtige kolbøtter i luften','slog snepperne et hurtigt sving')],19:[('Standjagten','Sneppetrækket'),('Arcturus','den mørke Arkturus'),('Karlsvognens krop med dens stang','Karlsvognens vognkasse med vognstangen')],26:[('fattet og sindsro','fattet og rolig')],29:[('lå Laska med ørerne spidset op og så','spidsede Laska ørerne og så skiftevis')],30:[('De vil ramme forbi','De overser den')],34:[('Hun har fundet den! Er hun ikke en klog en?','Du fandt den! Dygtig hund!') ]}
EN={1:[('stand-shooting','woodcock flight'),('not far above a stream','not far away, above the river')],6:[('An owl','An eagle-owl')],8:[("Now it's coming!","It won't be long now.")],12:[("That's the hare","That's a male hare")],18:[('not crying','not croaking'),('turned swift somersaults in the air','made a swift turn')],19:[('The stand-shooting','The woodcock flight'),('of Arcturus','of somber Arcturus'),('the body of the Great Bear with its shaft','the Great Bear’s wagon with its shaft')],34:[("She's found it! Isn't she a clever thing?","You've found it! Clever girl!")]}
# The birds in this whole chapter are specifically woodcock, not snipe.
d0=json.loads((p/'candidate-anna-karenina-modern-en.json').read_text())['chapters'][48]
for sn,t in enumerate(d0['paragraphs'],1):
 if 'snipe' in t:EN.setdefault(sn,[]).append(('snipe','woodcock'))
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][48]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=49,paragraph=sn,before=a,after=b,reason='Russian PartII.XV full comparison: woodcock not snipe, just soon not already approaching, male hare/eagle owl, gun hammers click not shot, turn not somersault, not invented lying dog, direct praise to dog, fluent Danish.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTE-049.json').write_text(json.dumps({'chapter':49,'notes':['Source Venus moves above branch as evening grows dark: retained author astronomy rather than silently correcting it.','Oblonsky says Kitty never contemplated marriage despite preceding proposal plot: character report retained.','Laska thoughts are explicit source narration and retained, not an accidental anthropomorphism.']},ensure_ascii=False,indent=2)+'\n')
