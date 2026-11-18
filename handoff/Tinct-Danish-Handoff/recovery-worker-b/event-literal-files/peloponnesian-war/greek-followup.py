import pathlib,json
p=pathlib.Path(__file__).parent;E=[]
for lang in ['modern-da','modern-en']:
 d=json.loads((p/f'candidate-peloponnesian-war-{lang}.json').read_text())
 def change(c,s,old,new,r):
  b=d['chapters'][c-1]['paragraphs'][s-1];assert old in b
  a=b.replace(old,new);E.append(dict(language=lang,chapter=c,slot=s,before=b,after=a,reason=r));d['chapters'][c-1]['paragraphs'][s-1]=a
 if lang=='modern-da':
  change(1,6,'linnedundertøj','tunikaer af hør','Greek1.6.3 χιτῶνάς λινοῦς: linen chitons, not modern underwear.')
  change(1,6,'gyldne græshopper','guldsmykker formet som cikader','Greek1.6.3 χρυσῶν τεττίγων; cicada hair ornaments, not grasshoppers.')
  change(1,14,'galejer','trierer','Greek1.13–14 τριήρεις; specific warship class needed against fifty-oared ships.')
  change(1,14,'det Ioniske Hav','havet ud for deres egen kyst','Greek1.13.6 τῆς καθ’ ἑαυτοὺς θαλάσσης; avoid conflation with modern western Ionian Sea.')
 else:
  change(1,6,'linen undergarments','linen tunics','Greek1.6.3 χιτῶνάς λινοῦς.')
  change(1,6,'golden grasshoppers','gold ornaments shaped like cicadas','Greek1.6.3 χρυσῶν τεττίγων.')
  change(1,14,'galleys','triremes','Greek1.13–14 τριήρεις; distinguish specific class from other galleys.')
  change(1,14,'the Ionian sea','the sea off their own coast','Greek1.13.6 geographical wording; avoid misleading modern Ionian Sea identification.')
(p/'edits-002z-greek.json').write_text(json.dumps(E,ensure_ascii=False,indent=2)+'\n')
f=p/'SOURCE-IDENTITIES.json';s=json.loads(f.read_text());s['GreekTargetedWitness']={'url':'https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0003/tlg001/tlg0003.tlg001.perseus-grc2.xml','editor':'Henry Stuart Jones','title':'Historiae','imprint':'Oxford University Press1910; reprint1942; volumes1–2','digitalCredit':'Perseus Project, Tufts University; Gregory Crane; supervised Lisa Cerrato, William Merrill, Elli Mylonas, David Smith','digitalLicence':'XML header CC BY-SA4.0; consulted ancient Greek for independent translation, XML itself retained as attributed reference, not republished app content','coverage':'Targeted Greek1.5,1.6,1.13–14,1.63 only so far; not full Greek collation.'};f.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
