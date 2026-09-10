import hashlib,json,unittest
from build_ivan_ilyich import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class IvanContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_owners(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_three_peters_are_distinct(self):
  for d in self.asset['editions'].values():
   for ch,pi,text,id in [(1,0,'Peter Ivanovich','peter-ivanovich'),(3,4,'Peter Ivanovich','minister-peter'),(8,0,'Peter','peter-footman')]:
    self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['text']==text and m['characterId']==id for m in d['mentions']))
 def test_petrishchev_father_and_son(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(3,20)]
   self.assertIn('petrishchev',{m['characterId'] for m in ms});self.assertIn('petrishchev-father',{m['characterId'] for m in ms})
   self.assertTrue(all(m['text']=='Dmitri' and m['chapterNumber']==7 for m in d['mentions'] if m['characterId']=='dmitri'))
 def test_vanya_is_ivan_and_vasya_is_son(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text']=='Vanya':self.assertEqual(m['characterId'],'ivan')
    if m['text'] in {'Vasya','Vladimir Ivanovich'}:self.assertEqual(m['characterId'],'vasya')
 def test_all_entries_stable_and_omissions_empty(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
   self.assertNotIn('capoul',{c['id'] for c in gallery(d,point(1,40,99999))})
if __name__=='__main__':unittest.main()
