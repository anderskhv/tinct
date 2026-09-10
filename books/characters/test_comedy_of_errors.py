import hashlib,json,unittest
from build_comedy_of_errors import compile_package,BASE
from build_pilot import ROOT,normalized,u16,point
from lookup_reference import resolve,reminder,gallery
class ComedyErrorsContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);t=ps[k[:2]]
    self.assertEqual(t.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,t)['id'],m['characterId'])
 def test_abbess_identity_gate_and_separate_early_wife(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};gate=cs['abbess']['snapshots'][1]['availableAt'];before=dict(gate,offset=gate['offset']-1)
   self.assertEqual(cs['abbess']['firstMention']['chapterNumber'],11)
   self.assertNotIn('Emilia',reminder(d,'abbess',before)['name']);self.assertNotIn('Egeon',reminder(d,'abbess',before)['body'])
   self.assertIn('Emilia',reminder(d,'abbess',gate)['name']);self.assertIn('wife',reminder(d,'abbess',gate)['body'])
   self.assertNotIn('abbess',reminder(d,'egeon-wife',before)['body']);self.assertIn('abbess',reminder(d,'egeon-wife',gate)['body'])
 def test_twin_addresses_and_recalled_errands(self):
  cases=[(2,18,'Dromio','dromio-ephesus'),(4,60,'Dromio','dromio-ephesus'),(4,71,'Dromio','dromio-syracuse'),(4,58,'Antipholus','antipholus-syracuse'),(6,57,'Antipholus','antipholus-syracuse'),(10,50,'Dromio','dromio-ephesus'),(11,69,'Antipholus','antipholus-ephesus'),(11,138,'Dromio','dromio-syracuse')]
  for d in self.asset['editions'].values():
   for ch,pi,t,id in cases:self.assertTrue(any(m['text']==t and m['characterId']==id and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']),(ch,pi,t,id))
   for ch,pi in [(7,2),(9,30),(11,123)]:self.assertFalse(any(m['text']=='Antipholus' and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']))
 def test_merchants_and_jailers_are_distinct(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch in [('first-merchant',2),('second-merchant',7),('jailer',1),('officer',7)]:self.assertEqual(cs[id]['firstMention']['chapterNumber'],ch)
   self.assertTrue(any(m['characterId']=='officer' and m['text']=='jailer' and m['chapterNumber']==10 for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='syracuse-duke' and m['text']=='your Duke' for m in d['mentions']))
 def test_adam_joke_and_allusions(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(9,5) and m['text']=='Adam'];self.assertEqual([m['characterId'] for m in ms],['adam','officer'])
   self.assertTrue(any(m['characterId']=='nell' and m['text']=='Dowsabel' for m in d['mentions']))
   self.assertFalse(any(m['text'] in ['Centaur','Phoenix','Tiger','Expedition','Delay'] for m in d['mentions']))
 def test_ordinary_identity_and_full_coverage(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),51);self.assertEqual(d['chapterCount'],11);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   cs={c['id']:c for c in d['characters']}
   self.assertIn('wife',cs['adriana']['snapshots'][0]['body']);self.assertIn('sister',cs['luciana']['snapshots'][0]['body']);self.assertEqual(cs['dromio-syracuse']['storyRole'],'central')
   for c in d['characters']:self.assertEqual(len(c['snapshots']),2 if c['id'] in ['abbess','egeon-wife'] else 1)
if __name__=='__main__':unittest.main()
