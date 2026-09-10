import hashlib,json,unittest
from build_as_you_like_it import compile_package,BASE,FOOTERS
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class AsYouLikeItTests(unittest.TestCase):
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
 def test_two_jaqueses_and_two_adams(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('jaques',2,60),('jaques-brother',17,51),('adam-bible',2,57),('adam',4,1)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertTrue(all(m['characterId']=='jaques-brother' for m in d['mentions'] if m['text'].lower()=='jaques de boys'))
 def test_three_olivers(self):
  for d in self.asset['editions'].values():
   self.assertEqual([m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(10,33,'Oliver')],['martext','song-oliver','song-oliver'])
   self.assertTrue(any(m['characterId']=='oliver' and m['chapterNumber']==4 for m in d['mentions']))
 def test_court_and_forest_lords(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text']=='FIRST LORD':self.assertEqual(m['characterId'],'court-first-lord' if m['chapterNumber']==3 else 'forest-first-lord')
   self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(17,54,'Duke','frederick') for m in d['mentions']))
 def test_disguises_and_mock_marriage(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,pi in [('rosalind',47),('celia',48)]:self.assertEqual((cs[id]['snapshots'][1]['availableAt']['chapterNumber'],cs[id]['snapshots'][1]['availableAt']['paragraphIndex']),(2,pi))
   self.assertEqual(cs['rosalind']['snapshots'][-1]['availableAt']['chapterNumber'],17)
   self.assertTrue(any(m['characterId']=='ganymede-myth' and m['text']=='own page' for m in d['mentions']))
   self.assertTrue(all(m['characterId']=='rosalind' for m in d['mentions'] if m['text']=='Ganymede'))
 def test_restoration_and_two_religious_men(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id in ['senior','frederick']:self.assertEqual((cs[id]['snapshots'][-1]['availableAt']['chapterNumber'],cs[id]['snapshots'][-1]['availableAt']['paragraphIndex']),(17,52))
   self.assertEqual(cs['rosalind-uncle']['firstMention']['chapterNumber'],9);self.assertEqual(cs['religious-man']['firstMention']['chapterNumber'],17)
 def test_footer_and_rose_verb_excluded(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['paragraphIndex'] in FOOTERS.get(m['chapterNumber'],[]) for m in d['mentions']))
   self.assertFalse(any((m['chapterNumber'],m['paragraphIndex'],m['text'])==(2,32,'Rose') for m in d['mentions']))
   self.assertTrue(all(m['chapterNumber']==14 for m in d['mentions'] if m['characterId']=='william'))
 def test_full_available_scope_and_implicit_poet(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),64);self.assertEqual(d['chapterCount'],17);self.assertEqual(d['paragraphCount'],901);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   self.assertTrue(any(m['characterId']=='marlowe' and m['text']=='Dead shepherd' for m in d['mentions']))
if __name__=='__main__':unittest.main()
