import hashlib,json,unittest
from build_social_contract import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class SocialContractTests(unittest.TestCase):
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
 def test_three_catos(self):
  for d in self.asset['editions'].values():
   ms=[m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(4,14,'Cato')];self.assertEqual(ms,['cato-son','cato-elder','cato-elder'])
   self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(47,40,'Cato','cato-younger') for m in d['mentions']))
 def test_borgia_is_not_julius_caesar(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if 'Borgia' in m['text']];self.assertTrue(ms);self.assertTrue(all(m['characterId']=='borgia' for m in ms))
   self.assertTrue(any(m['characterId']=='caesar' and m['chapterNumber']==31 for m in d['mentions']))
 def test_dionysius_family(self):
  for d in self.asset['editions'].values():
   ms=[m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(27,10,'father')];self.assertEqual(ms,['dionysius-elder','dionysius-grandfather'])
 def test_implicit_and_italicized_references(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('muhammad',16,10),('ishmael',16,10),('calvin',16,13),('livy',16,14),('miltiades',31,15)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertTrue(any(m['characterId']=='alembert' and m['chapterNumber']==46 for m in d['mentions']))
 def test_different_gods_are_not_merged(self):
  for d in self.asset['editions'].values():
   ids={m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(47,2)};self.assertTrue({'moloch','saturn','chronos','baal','zeus','jupiter'}<=ids)
 def test_full_scope_reference_cards(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),96);self.assertEqual(d['chapterCount'],48);self.assertEqual(d['paragraphCount'],491);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
