# Each entry is an attested misspelling in the retained file. Leave representations
# of individual speech and French, German and Church Slavonic quotations alone.
corrections = '''
abejde|arbejde
abejdede|arbejdede
afregnedefor|afregnede for
altsammen|alt sammen
ammunitionsvogens|ammunitionsvognens
arværede|arrede
batiststskjorte|batistskjorte
bebreejdet|bebrejdet
bebreidende|bebrejdende
begejstringstårter|begejstringstårer
besluttsomhed|beslutsomhed
blodstenkte|blodstænkede
brimfyldt|sprængfyldt
ceremionens|ceremoniens
deroplve|deroppe
dragondkaptajn|dragonkaptajn
dronnningsløs|dronningløs
dåsede|døsede
dæsede|døsede
dæset|døset
dødblegr|dødbleg
dørhavlvdele|dørhalvdele
englelsjæl|englesjæl
enogtredivsårig|enogtrediveårig
ertappede|pågreb
eskadronnens|eskadronens
eskortten|eskorten
esorteret|eskorteret
feltfeldflaskerne|feltflaskerne
feltogs|felttogs
felttoglets|felttogets
felttogtes|felttogets
flammertunger|flammetunger
fletede|flettede
flygtere|flygter
forbavet|forbavset
forkulllede|forkullede
forlængst|for længst
formindsede|formindskede
forrrådte|forrådte
forrædderier|forræderier
forseglerr|forsegler
forsvarserne|forsvarerne
forvildret|forvildet
forårsbogveden|vårboghveden
fyrstesse|fyrstinde
fyrstessen|fyrstinden
fyrstessens|fyrstindens
fyrstesser|fyrstinder
galoppperet|galopperet
genindsatt|genindsat
genindssat|genindsat
glattbarberede|glatbarberede
gledestårer|glædestårer
gloer|glor
granatrild|granatild
grimase|grimasse
guldbrodereret|guldbroderet
handskekladte|handskeklædte
hemmelighdsfuldt|hemmelighedsfuldt
hentydedte|hentydede
herrskaberne|herskaberne
herrskabet|herskabet
hjerneverksted|hjerneværksted
hjertligt|hjerteligt
hofolk|hoffolk
hovders|hoveders
håndbaldader|håndflader
hærkomanndanter|hærkommandanter
indhendte|indhentede
kameraters|kammeraters
karabinererne|karabinerne
kardætskskud|kardæskskud
kavalleriet|kavaleriet
kavalleriregimentet|kavaleriregimentet
kavallerisadel|kavalerisadel
kavallerister|kavalerister
kavalleristernes|kavaleristernes
kavallerivagtposter|kavalerivagtposter
klemmede|klemte
knittrede|knitrede
kopparret|koparret
korslagde benene|lagde benene over kors
kosakoffiser|kosakofficer
krampagtge|krampagtige
krågerne|kragerne
kuskedædet|kuskesædet
kvinderstemmer|kvindestemmer
kønnne|kønne
lakajjen|lakajen
langtborte|langt borte
letttet|lettet
leirildes|lejrbåls
mejlet ned|mejet ned
menofficer|officerskammerat
militsuniforner|militsuniformer
modrede|modnede
monssieur|monsieur
mudderpletttede|mudderplettede
mursteinsrøde|murstensrøde
mutt|mut
nyanlægt|nyanlagt
overbebyrdret|overbebyrdet
patrullje|patrulje
politimestrens|politimesters
pøbelpack|pøbelpak
rammte|ramte
raseriandald|raserianfald
rendtee|rendte
ryckkede|rykkede
rykvst|rykvist
rådlagde|rådslog
rædselsskrigt|rædselsskrig
sacket bagud|sakket bagud
sammenflettinger|sammenfletninger
sejge|seje
skarpsyndige|skarpsynede
sjælskræfter|sjælekræfter
skorfuldedækkede|skorpedækkede
smakkede med tungen|smældede med tungen
smaating|småting
sneddig|snedig
solsveskede|solsvedne
stofovertrurkket|stofbetrukket
strammsnørede|stramsnørede
strålat|strålet
studeredørens|studerekammerdørens
svogerns|svogerens
syvogtve|syvogtyve
tidobblede|tidoblede
tilfældighedder|tilfældigheder
tilraunede|hviskede
tilsyneladvis|tilsyneladende
tiltrakte|tiltrak
tjensteiver|tjenesteiver
træddede|trådte
tætklinpet|tætklippet
ubeslutesomhed|ubeslutsomhed
ubeslutstomt|ubeslutsomt
ubesluttsomhed|ubeslutsomhed
ubesluttsomme|ubeslutsomme
ubetvingligt|ubetvingeligt
ubeærket|ubemærket
uddeelt|uddelt
udstyrret|udstyret
udtalesfejl|udtalefejl
underminderede|underminerede
utydligt|utydeligt
uværssky|uvejrssky
velhandskede|behandskede
vekselvirkingen|vekselvirkningen
vigtigbed|vigtighed
vildet væk|vildtet væk
vistne|visne
voticlys|votivlys
åndsfraveræende|åndsfraværende
åndsfraveærende|åndsfraværende
æggerskal|æggeskal
ændsede|ænsede
ærkehertugininden|ærkehertuginden
ærsgæsten|æresgæsten
'''.strip()
mapping=dict(line.split('|') for line in corrections.splitlines());pat=re.compile(r'\b(?:'+'|'.join(re.escape(t) for t in sorted(mapping,key=len,reverse=True))+r')\b',re.I)
def repl(m):
 word=m[0];v=mapping[word.lower()]
 return v[:1].upper()+v[1:] if word[0].isupper() else v
for c in da['chapters']:
 for p,t in enumerate(c['paragraphs'],1):
  v=pat.sub(repl,t)
  if v!=t:fix('da',c['number'],p,v,'Correct Danish spelling, inflection or noble title; preserve speech differences.')
