import hashlib,json,unittest
from build_the_prince import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class PrinceTests(unittest.TestCase):
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
 def test_three_alexanders(self):
  for d in self.asset['editions'].values():
   for ch,id in [(8,'alexander6'),(5,'alexander-great'),(20,'alexander-severus')]:
    ms=[m for m in d['mentions'] if m['chapterNumber']==ch and m['text']=='Alexander'];self.assertTrue(ms);self.assertEqual({m['characterId'] for m in ms},{id})
 def test_two_philips_and_dariuses(self):
  for d in self.asset['editions'].values():
   for ch,id in [(4,'philip5'),(13,'philip2'),(25,'philip5'),(5,'darius3'),(8,'darius1')]:self.assertTrue(any(m['chapterNumber']==ch and m['characterId']==id for m in d['mentions']))
 def test_french_regnal_names(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['chapterNumber']==14]
   self.assertFalse(any(m['characterId'] in ['charles8','louis12'] for m in ms));self.assertTrue({'charles7','louis11'}<={m['characterId'] for m in ms})
 def test_cardinal_not_family_and_caesar_title(self):
  for d in self.asset['editions'].values():
   self.assertTrue(any(m['chapterNumber']==8 and m['paragraphIndex']==17 and m['characterId']=='colonna-cardinal' for m in d['mentions']))
   self.assertFalse(any(m['chapterNumber']==20 and m['paragraphIndex']==17 and m['characterId']=='caesar' for m in d['mentions']))
 def test_annibales_and_sforzas(self):
  for d in self.asset['editions'].values():
   ms=d['mentions'];self.assertTrue({'annibale1','annibale2','sante','giovanni2'}<={m['characterId'] for m in ms if (m['chapterNumber'],m['paragraphIndex'])==(20,6)})
   self.assertEqual([m['characterId'] for m in ms if (m['chapterNumber'],m['paragraphIndex'])==(13,7) and m['text']=='Sforza'],['muzio','francesco'])
   self.assertTrue(any(m['characterId']=='sforza-family' for m in ms))
 def test_inherited_note_errors_not_repeated(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertNotIn('widow',cs['joanna']['snapshots'][0]['body']);self.assertIn('Giulio',cs['clement']['snapshots'][0]['body'])
   self.assertEqual(cs['ferrara']['kind'],'group');self.assertIn('different dukes',cs['ferrara']['snapshots'][0]['body'])
 def test_deliberately_unnamed_prince_stays_unbound(self):
  for d in self.asset['editions'].values():self.assertFalse(any((m['chapterNumber'],m['paragraphIndex'])==(19,12) for m in d['mentions']))
 def test_full_reference_scope(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),145);self.assertEqual(d['chapterCount'],27);self.assertEqual(d['paragraphCount'],254);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   self.assertTrue(all(c['storyRole']=='reference' and len(c['snapshots'])==1 for c in d['characters']))
if __name__=='__main__':unittest.main()
