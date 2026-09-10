import hashlib,json,unittest
from build_symposium import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class SymposiumContractTests(unittest.TestCase):
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
 def test_framing_does_not_invent_glaucon(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['glaucon']['firstMention']['chapterNumber'],7);self.assertIn('Charmides’ father',cs['glaucon']['snapshots'][0]['body'])
   self.assertIn('unnamed',cs['listener']['snapshots'][0]['body']);self.assertEqual(cs['listener']['firstMention']['chapterNumber'],1)
   self.assertIn('retelling',cs['apollodorus']['snapshots'][0]['body']);self.assertIn('eyewitness',cs['aristodemus']['snapshots'][0]['body'])
 def test_alcibiades_does_not_appear_in_title_citation(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='alcibiades');self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(7,69))
   self.assertFalse(any(m['characterId'] in ['alcibiades','gorgias'] and (m['chapterNumber'],m['paragraphIndex'])==(7,45) for m in d['mentions']))
 def test_ordinary_occupations_and_relations(self):
  for d in self.asset['editions'].values():
   cs={c['id']:reminder(d,c['id'],c['firstMention']) for c in d['characters']}
   for id,phrase in [('agathon','tragic playwright'),('aristophanes','comic playwright'),('eryximachus','physician'),('pausanias','Agathon’s lover'),('diotima','teaching')]:self.assertIn(phrase,cs[id]['body'])
   self.assertEqual(cs['socrates']['role'],'central');self.assertEqual(cs['diotima']['role'],'major');self.assertEqual(cs['eros']['role'],'reference')
   self.assertNotIn('father',cs['eros']['body']);self.assertNotIn('eldest',cs['eros']['body'])
 def test_reused_god_and_named_allusions(self):
  for d in self.asset['editions'].values():
   for ch,pi,id in [(2,7,'eros'),(5,5,'zeus'),(5,6,'eros')]:self.assertTrue(any(m['text']=='God' and m['characterId']==id and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']))
   self.assertTrue(any(m['text']=='God of War' and m['characterId']=='ares' for m in d['mentions']))
   cs={c['id']:c for c in d['characters']};self.assertIn('musician',cs['olympus']['snapshots'][0]['body']);self.assertIn('son of Diocles',cs['euthydemus']['snapshots'][0]['body'])
 def test_staff_roles_are_scoped(self):
  for d in self.asset['editions'].values():
   for id,ch,pi in [('welcoming-servant',1,16),('reporting-servant',1,21),('first-flute-girl',1,34),('second-flute-girl',7,69),('late-revellers',8,0)]:
    c=next(c for c in d['characters'] if c['id']==id);self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(ch,pi))
   self.assertFalse(any(m['characterId'] in ['first-flute-girl','second-flute-girl'] and (m['chapterNumber'],m['paragraphIndex'])==(7,92) for m in d['mentions']))
 def test_source_coverage_without_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),93 if ed=='original-en' else 91);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[] if ed=='original-en' else ['aristotle','pope'])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
