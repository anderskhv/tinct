import hashlib,json,unittest
from build_oedipus_at_colonus import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class ColonusContractTests(unittest.TestCase):
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
 def test_eteocles_not_eteoclus(self):
  for ed,d in self.asset['editions'].items():
   ms={m['text']:m['characterId'] for m in d['mentions']}
   self.assertEqual(ms['Etocles' if ed=='original-en' else 'Eteocles'],'eteocles');self.assertEqual(ms['Eteoclus'],'eteoclus')
   self.assertEqual(ms['Amphiaraiis' if ed=='original-en' else 'Amphiaraus'],'amphiaraus')
 def test_kinship_spans_do_not_swallow_names(self):
  for d in self.asset['editions'].values():
   wife=[m for m in d['mentions'] if m['characterId']=='polyneices-wife'];self.assertEqual(len(wife),1)
   self.assertTrue(any(m['characterId']=='adrastus' for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='atalanta' for m in d['mentions']))
   for m in d['mentions']:
    if m['characterId']=='jocasta' and m['chapterNumber']==8:self.assertEqual(m['text'],'my mother')
 def test_gods_and_places_scoped(self):
  for d in self.asset['editions'].values():
   self.assertEqual([(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='colonus'],[(1,27)])
   self.assertFalse(any(m['text'] in ['Hades','Tartarus','Cephisus'] for m in d['mentions']))
   self.assertTrue(any(m['text']=='Aidoneus' and m['characterId']=='hades' for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='cerberus' for m in d['mentions']))
 def test_recognition_and_complete_named_coverage(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),54);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   cards={c['id']:reminder(d,c['id'],c['firstMention']) for c in d['characters']}
   self.assertEqual(cards['oedipus']['role'],'central');self.assertIn('daughter',cards['antigone']['body'])
   self.assertTrue(all(len(c['snapshots'])==1 for c in d['characters']))
if __name__=='__main__':unittest.main()
