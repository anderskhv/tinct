import json,pathlib
p=pathlib.Path(__file__).parent
DA={1:[('var ved at afslutte universitetet','havde afsluttet universitetet'),('bunker af kapper og galocher','bunker af pelse og galocher')],5:[('Sviazjskij','Svijazjskij')],6:[('Hvor blev De af?','Hvorfor kommer du så sent?')],8:[('ålesuppe','fiskesuppe med knude')],11:[('blivende munterhed','stadig munterhed')],14:[('Er De lige kommet?','Er du lige kommet?'),('Har De fået Deres vodka?','Har du fået din vodka?')],15:[('to dusin lækkerier','tyve forskellige småretter')],17:[('De kender den','Du kender den')],20:[('De mødte ham hjemme hos mig engang, husker De ikke?','Du mødte ham hjemme hos mig engang, husker du ikke?')],22:[('om hvad de havde haft for den dag, og om Vronskijs Atlas’','og om Vronskijs Atlasnyjs'),("om hvad de havde haft for den dag, og om Vronskijs Atlas'",'og om Vronskijs Atlasnyjs'),('smarte sejr i førstepræmieløbet','flotte sejr, der sikrede førsteprisen')],23:[('en høj gardeofficer','en høj oberst fra garden')],28:[('spiste De','spiste du')]}
DA[22]=[(a,b)for a,b in DA[22] if 'Atlas’' not in a]
EN={1:[('was finishing up at the university','had finished university'),('piled cloaks and galoshes','piled fur coats and galoshes')],8:[('eel soup','burbot soup')],15:[('two dozen delicacies','twenty appetizers')],22:[('the races, what they had been up to that day, and the smart victory of Vronsky\'s Atlas in the first prize race','that day’s races, and how splendidly Vronsky’s Atlasny had won first prize')],23:[('a tall officer of the Guards','a tall colonel of the Guards')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][195]
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=196,paragraph=sn,before=a,after=b,reason='Russian VII.VII: graduated not finishing, burbot not eel, twenty not twentyfour, racehorse Atlasny not Atlas, first prize, family du and colonel rank.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-196.txt').write_text('Full Russian VII.VII DA EN read.196.8 налим burbot/knude, not eel: Danish museum species https://www.naturhistoriskmuseum.dk/viden-forskning/naturlex/fisk/knude .196.15 двадесятка20not24.196.22 horse Атласный Atlasny/Atlasnyj notAtlas, exact glossary globalpending.196.6/14/17/20/28 informal familyты restored.196.1 postuniversity notfinishing.196.30 infernal cardroom nicknameguide;196.18 champagne fadingeffervescence nuancepending polish. Native pending.\n')
