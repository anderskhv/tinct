import hashlib,json,re,unittest
from build_heart_of_darkness import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class HeartDarknessContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_speakers(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_two_accountants_are_distinct(self):
  for d in self.asset['editions'].values():
   self.assertTrue(any(m['characterId']=='frame-accountant' and m['chapterNumber']==1 and m['paragraphIndex']==3 for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='frame-accountant' and m['paragraphIndex']>=41 for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='chief-accountant' and m['paragraphIndex']==41 for m in d['mentions']))
 def test_speculative_titles_dont_change_identity(self):
  for d in self.asset['editions'].values():
   for pi,id in [(58,'kurtz'),(60,'brickmaker')]:
    ms=[m for m in d['mentions'] if m['chapterNumber']==1 and m['paragraphIndex']==pi]
    self.assertFalse(any(m['characterId']=='manager' for m in ms))
    self.assertTrue(any(m['characterId']==id and 'manager' in m['text'].lower() for m in ms))
 def test_book_author_not_russian_or_language(self):
  for d in self.asset['editions'].values():
   self.assertTrue(any(m['characterId']=='towson' and m['chapterNumber']==2 and m['paragraphIndex']==8 for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='russian' and m['chapterNumber']==2 and m['paragraphIndex'] in {8,35,36} for m in d['mentions']))
   self.assertNotIn('russian',{c['id'] for c in gallery(d,point(2,8,99999))})
 def test_stable_identities_without_future_outcomes(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[]);self.assertEqual(len(d['characters']),59)
   chars={c['id']:c for c in d['characters']}
   self.assertEqual(chars['marlow']['storyRole'],'central');self.assertEqual(chars['kurtz']['storyRole'],'major')
   self.assertNotIn('dead',chars['kurtz']['snapshots'][0]['body'])
   self.assertIn('fiancée',chars['intended']['snapshots'][0]['body'])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
