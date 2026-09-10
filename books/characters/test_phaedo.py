import hashlib,json,unittest
from build_phaedo import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class PhaedoContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_framing_speakers_and_attendees(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};cards={id:reminder(d,id,c['firstMention']) for id,c in cs.items()}
   self.assertEqual(cards['socrates']['role'],'central');self.assertEqual(cards['phaedo']['role'],'central');self.assertIn('narrates',cards['phaedo']['body']);self.assertIn('Phlius',cards['echecrates']['body'])
   for id in ['simmias','cebes','crito']:self.assertEqual(cards[id]['role'],'major')
   for id in ['critobulus','euclid','aeschines','terpison']:self.assertEqual(cards[id]['role'],'supporting')
   self.assertEqual(cards['plato']['role'],'reference');self.assertIn('absent',cards['plato']['body']);self.assertIn('wife',cards['xanthippe']['body'])
 def test_prison_roles_and_servants_are_distinct(self):
  for d in self.asset['editions'].values():
   for id,ch,pi in [('doorkeeper',1,25),('prison-officer',9,6),('poison-attendant',1,55),('crito-servant',9,10)]:
    c=next(c for c in d['characters'] if c['id']==id);self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(ch,pi))
   ms=[m for m in d['mentions'] if m['chapterNumber']==9 and m['paragraphIndex']==10]
   self.assertTrue(any(m['characterId']=='crito-servant' for m in ms));self.assertTrue(any(m['characterId']=='poison-attendant' for m in ms));self.assertFalse(any(m['characterId']=='prison-officer' for m in ms))
 def test_references_and_title_exclusions(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertIn('craftsman',cs['glaucus']['snapshots'][0]['body']);self.assertIn('harmony argument',cs['harmonia']['snapshots'][0]['body']);self.assertIn('Cebes',cs['cadmus']['snapshots'][0]['body'])
   self.assertFalse(any(m['text'] in ['Meno','Comus','Telephus','Hades','Tartarus','Oceanus'] for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='heracles' and (m['chapterNumber'],m['paragraphIndex'])==(8,34) for m in d['mentions']))
   self.assertIn('translator',cs['milton']['snapshots'][0]['body'])
 def test_complete_coverage_and_no_running_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),54);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
