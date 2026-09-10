import hashlib,json,unittest
from build_frederick_douglass import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class DouglassTests(unittest.TestCase):
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
 def test_hopkins_and_isaac_namesakes(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text']=='Isaac':self.assertEqual(m['characterId'],'isaac-grandfather' if m['chapterNumber']==1 else 'isaac-crew')
    if 'Hopkins' in m['text']:self.assertEqual(m['characterId'],'rigby' if m['chapterNumber']==10 else 'hopkins-overseer')
 def test_thomas_child_and_adults(self):
  for d in self.asset['editions'].values():
   ms=d['mentions']
   self.assertTrue(any(m['characterId']=='little-thomas' and m['chapterNumber']==7 for m in ms))
   self.assertTrue(any(m['characterId']=='thomas' and m['chapterNumber']==11 for m in ms))
   self.assertTrue(any(m['characterId']=='thomas-hamilton' and m['chapterNumber']==6 for m in ms))
   self.assertTrue(any(m['characterId']=='lowe' and m['chapterNumber']==10 for m in ms))
 def test_ships_are_not_people(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    self.assertNotEqual(m['text'],'Sally Lloyd');self.assertNotIn('Richmond',m['text'])
    if m['characterId']=='amanda':self.assertEqual((m['chapterNumber'],m['paragraphIndex']),(8,5))
    if m['characterId']=='smith':self.assertEqual(m['chapterNumber'],10)
 def test_johnson_and_bailey_are_scoped(self):
  for d in self.asset['editions'].values():
   ms=d['mentions']
   self.assertTrue(any(m['characterId']=='bailey-yard' and m['chapterNumber']==7 for m in ms))
   self.assertEqual([m['characterId'] for m in ms if m['chapterNumber']==11 and m['paragraphIndex']==11],['douglass','douglass','douglass'])
   self.assertTrue(any(m['text']=='Mr. Johnson' and m['characterId']=='nathan' for m in ms))
   self.assertTrue(any(m['characterId']=='henry-bailey' for m in ms))
 def test_parody_not_narrative(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['characterId'].startswith('parody-')];self.assertEqual(len({m['characterId'] for m in ms}),10)
   self.assertTrue(all((m['chapterNumber'],m['paragraphIndex'])==(12,7) for m in ms))
 def test_recognition_and_delayed_changes(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['douglass']['storyRole'],'central');self.assertEqual(cs['sandy']['storyRole'],'major');self.assertEqual(cs['patrick']['storyRole'],'reference')
   self.assertNotIn('free',cs['douglass']['snapshots'][0]['body'])
   self.assertEqual(cs['harriet']['snapshots'][-1]['body'],'Douglass’s mother.')
   self.assertEqual(cs['thomas']['snapshots'][-1]['availableAt']['chapterNumber'],8)
   self.assertEqual(cs['anna']['snapshots'][0]['body'],'Douglass’s intended wife, a free woman from Maryland.')
   self.assertIn('certainty',cs['father']['snapshots'][0]['body'])
 def test_full_scope(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),134);self.assertEqual(d['chapterCount'],12);self.assertEqual(d['paragraphCount'],162);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
if __name__=='__main__':unittest.main()
