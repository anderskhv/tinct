import hashlib,json,unittest
from build_crito import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery,reminder
class CritoContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_all_spans_sources_and_speaker_labels(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
   for (ch,pi),text in ps.items():self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['startOffset']==0 and m['characterId']==text.split('.')[0].lower() for m in d['mentions']))
 def test_laws_are_personification_and_not_early_cast(self):
  for d in self.asset['editions'].values():
   self.assertNotIn('laws',{c['id'] for c in gallery(d,point(2,60,9999))})
   c=next(c for c in d['characters'] if c['id']=='laws');self.assertEqual(c['kind'],'personification');self.assertIn('imagined',c['snapshots'][0]['body'])
   self.assertTrue(all(m['chapterNumber']==3 for m in d['mentions'] if m['characterId']=='laws'))
 def test_cards_remain_short_and_stable(self):
  for d in self.asset['editions'].values():
   for c in d['characters']:
    self.assertEqual(len(c['snapshots']),1);self.assertLess(len(c['snapshots'][0]['body'].split()),35)
    self.assertEqual(reminder(d,c['id'],c['firstMention']),reminder(d,c['id'],point(3,8,99999)))
 def test_full_named_people_coverage(self):
  for d in self.asset['editions'].values():self.assertEqual({c['id'] for c in d['characters']},{'socrates','crito','simmias','cebes','homer','keeper','dream-woman','laws','children'})
if __name__=='__main__':unittest.main()
