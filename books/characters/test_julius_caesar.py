import hashlib,json,unittest
from build_julius_caesar import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class JuliusCaesarContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_spans_hashes_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);t=ps[k[:2]]
    self.assertEqual(t.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,t)['id'],m['characterId'])
 def test_namesakes(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('cinna-poet',10,0),('cinna-conspirator',3,29),('publius-senator',5,32),('publius-nephew',11,5),('publius-cimber',8,29),('cato-elder',4,91),('cato-young',16,43),('flavius-officer',16,51)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertFalse(any(m['characterId']=='cinna-conspirator' and m['chapterNumber']==10 for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='flavius-tribune' and m['chapterNumber']>=16 for m in d['mentions']))
   catos=[m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(17,6) and m['text'].endswith('Cato')];self.assertEqual(catos,['cato-young','cato-elder'])
 def test_caesar_octavius_and_assumed_brutus(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(14,25) and m['text']=='Caesar'];self.assertEqual([m['characterId'] for m in ms],['caesar','octavius'])
   self.assertTrue(any(m['characterId']=='octavius' and m['text']=='Caesar' and m['paragraphIndex']==26 and m['chapterNumber']==14 for m in d['mentions']))
   for pi in [10,12,15]:self.assertTrue(all(m['characterId']=='lucilius' for m in d['mentions'] if m['chapterNumber']==17 and m['paragraphIndex']==pi and m['text']=='Brutus'))
 def test_no_early_ghost_or_future_outcomes(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};g=cs['ghost']['firstMention'];self.assertEqual((g['chapterNumber'],g['paragraphIndex']),(13,150))
   self.assertIsNone(reminder(d,'ghost',dict(g,offset=g['offset']-1)))
   self.assertNotIn('ghost',cs['caesar']['snapshots'][0]['body']);self.assertNotIn('assassinat',cs['caesar']['snapshots'][0]['body'])
   self.assertIn('Portia’s husband',cs['brutus']['snapshots'][0]['body']);self.assertIn('Brutus’s wife',cs['portia']['snapshots'][0]['body'])
 def test_servants_and_armies(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('caesar-servant',5,2),('antony-servant',8,65),('octavius-servant',8,100),('soldier-camp-1',12,18),('soldier-antony-1',17,7),('camp-poet',13,49)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertTrue(any(m['characterId']=='brutus-ancestor' and m['chapterNumber']==2 for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='lucius' and m['text']=='Lucius' and m['chapterNumber']==13 and m['paragraphIndex']==1 for m in d['mentions']))
 def test_full_scope_and_concise_cards(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),73);self.assertEqual(d['chapterCount'],18);self.assertEqual(d['paragraphCount'],997);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1);self.assertLessEqual(len(c['snapshots'][0]['body'].split()),30)
if __name__=='__main__':unittest.main()
