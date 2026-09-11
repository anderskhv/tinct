import hashlib,json,unittest
from build_apology import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class ApologyContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_hashes(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_brother_alias_restricted_to_chaerephon(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['characterId']=='chaerephon-brother'];self.assertEqual(len(ms),1);self.assertEqual((ms[0]['chapterNumber'],ms[0]['paragraphIndex']),(1,9))
 def test_relatives_are_separate(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['chapterNumber']==1 and m['paragraphIndex'] in {72,73}]
   for id in ['crito','critobulus','lysanias','aeschines','antiphon','epigenes','nicostratus','theodotus','paralus','demodocus','theages','adeimantus','ariston','plato','aeantodorus','apollodorus']:self.assertIn(id,{m['characterId'] for m in ms})
 def test_modern_omissions_not_invented(self):self.assertEqual(self.report['editions']['modern-en']['omittedEntities'],['euripides','prytanes','eleven','theosdotides','telamon','agamemnon'])
 def test_late_references_hidden_early_and_no_outcome_recap(self):
  for d in self.asset['editions'].values():
   self.assertNotIn('minos',{c['id'] for c in gallery(d,point(1,76,99999))})
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
   c=next(c for c in d['characters'] if c['id']=='socrates');self.assertNotIn('execution',c['snapshots'][0]['body'])
if __name__=='__main__':unittest.main()
