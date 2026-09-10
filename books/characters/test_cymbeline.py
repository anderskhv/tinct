import hashlib,json,unittest
from build_cymbeline import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class CymbelineTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_sources(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_assumed_names(self):
  for d in self.asset['editions'].values():
   for name,id in [('Fidele','imogen'),('Polydore','guiderius'),('Cadwal','arviragus'),('Morgan','belarius')]:
    got=[m for m in d['mentions'] if m['text']==name]
    self.assertTrue(got,name);self.assertEqual({m['characterId'] for m in got},{id},name)
   # Richard du Champ is a name Imogen makes up; it is bound as an unresolved name
   # and never turned into a person of the play.
   c={x['id']:x for x in d['characters']}
   self.assertEqual(c['richard-du-champ']['kind'],'unresolved-name')
   got=[m for m in d['mentions'] if m['characterId']=='richard-du-champ']
   self.assertEqual([(m['chapterNumber'],m['paragraphIndex']) for m in got],[(22,152)])
 def test_two_caesars(self):
  for ed,d in self.asset['editions'].items():
   full='Cæsar' if ed=='original-en' else 'Caesar'
   at=lambda ch,pi:[(m['text'],m['characterId']) for m in sorted(d['mentions'],key=lambda x:x['startOffset']) if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) and m['characterId'] in ('augustus','julius-caesar')]
   self.assertEqual(at(11,5),[('Julius '+full,'julius-caesar')])
   self.assertEqual(at(13,2),[('Julius '+full,'julius-caesar'),(full,'julius-caesar')])
   self.assertEqual(at(13,5),[(full,'julius-caesar'),(full,'julius-caesar')])
   self.assertEqual(at(13,9),[(full,'julius-caesar')])
   # One paragraph, both men: the message goes to Augustus, the sword was Julius's.
   self.assertEqual(at(13,11),[(full,'augustus'),(full,'julius-caesar')])
   self.assertEqual(at(13,12),[('Augustus '+full,'augustus'),(full,'augustus'),(full,'augustus')])
   self.assertEqual(at(13,13),[(full,'augustus'),(full,'augustus')])
   # "There be many Caesars ere such another Julius": the plural is not bound.
   self.assertEqual(at(13,4),[('Julius','julius-caesar')])
 def test_scene_local_roles(self):
  for d in self.asset['editions'].values():
   where=lambda id:{m['chapterNumber'] for m in d['mentions'] if m['characterId']==id}
   # One LADY cue serves Imogen's woman and one of the Queen's.
   self.assertEqual(where('helen'),{4,9,10});self.assertEqual(where('queen-lady'),{6})
   # One LORD cue serves the court and the battlefield.
   self.assertEqual(where('court-lord'),{23});self.assertEqual(where('battle-lord'),{27})
   self.assertEqual(where('court-messenger'),{10});self.assertEqual(where('prison-messenger'),{28})
   # Helen answers to her name at the bedside; Dorothy is named once and never appears.
   self.assertTrue(any(m['text']=='Helen' and m['characterId']=='helen' for m in d['mentions']))
   self.assertEqual({(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='dorothy'},{(10,58)})
 def test_concealments_are_gated(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   # Nothing about the stolen princes before Belarius says it at 15:11.
   for id in ['guiderius','arviragus']:
    first=c[id]['snapshots'][0]['body']
    for word in ['Cymbeline','stolen','son']:self.assertNotIn(word,first,(id,word))
   self.assertNotIn('banish',c['belarius']['snapshots'][0]['body'])
   self.assertNotIn('stole',c['belarius']['snapshots'][0]['body'])
   for id in ['belarius','guiderius','arviragus']:
    self.assertEqual([(s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex']) for s in c[id]['snapshots'][1:]],[(15,11)],id)
   # Imogen's disguise and its name arrive where she takes them.
   self.assertNotIn('Fidele',c['imogen']['snapshots'][0]['body'])
   self.assertNotIn('boy',c['imogen']['snapshots'][0]['body'])
   self.assertEqual([(s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex']) for s in c['imogen']['snapshots'][1:]],[(16,38),(19,18),(29,90)])
   self.assertEqual([(s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex']) for s in c['posthumus']['snapshots'][1:]],[(25,1),(27,19)])
   # The Queen is never given a name the play does not give her.
   self.assertIn('no name',c['queen']['snapshots'][0]['body'])
 def test_edition_omissions(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  self.assertEqual(self.report['editions']['original-en']['omittedEntities'],[])
  self.assertEqual(self.report['editions']['modern-en']['omittedEntities'],['titan'])
  self.assertTrue(any(x['characterId']=='titan' for x in o['mentions']))
  # The two settings spell the imperial name differently.
  self.assertTrue(any(x['text']=='Cæsar' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Caesar' for x in m['mentions']))
  self.assertFalse(any(x['text']=='Caesar' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Æneas' and x['characterId']=='aeneas' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Aeneas' and x['characterId']=='aeneas' for x in m['mentions']))
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(29,1133))
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
