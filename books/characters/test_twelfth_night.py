import hashlib,json,unittest
from build_twelfth_night import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class TwelfthNightContractTests(unittest.TestCase):
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
 def test_twin_and_father_names(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['sebastian']['firstMention']['chapterNumber'],2);self.assertEqual(cs['father-sebastian']['firstMention']['chapterNumber'],2)
   self.assertEqual(cs['sebastian']['snapshots'][0]['body'],'Viola’s twin brother.')
   ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(18,99) and m['text']=='Sebastian'];self.assertEqual([m['characterId'] for m in ms],['father-sebastian','sebastian'])
   self.assertTrue(any(m['text']=='Roderigo' and m['characterId']=='sebastian' for m in d['mentions']))
 def test_mistaken_addressees_and_reports(self):
  for d in self.asset['editions'].values():
   for ch,pi,token,id in [(14,173,'Sebastian','viola'),(15,3,'Cesario','sebastian'),(15,27,'Cesario','sebastian'),(18,75,'Cesario','sebastian'),(18,76,'Cesario','viola'),(18,58,'Cesario','viola')]:
    self.assertTrue(any(m['text']==token and m['characterId']==id and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']))
 def test_marriage_and_betrothal(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,n,ch,pi,phrase in [('sebastian',1,18,66,'Olivia’s husband'),('olivia',1,18,66,'Sebastian’s wife'),('maria',1,18,147,'Sir Toby’s wife'),('toby',1,18,147,'married to Maria'),('viola',2,18,153,'intended bride')]:
    gate=cs[id]['snapshots'][n]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(ch,pi));self.assertNotIn(phrase,reminder(d,id,dict(gate,offset=gate['offset']-1))['body']);self.assertIn(phrase,reminder(d,id,gate)['body'])
   self.assertTrue(all('wife' not in s['body'] for s in cs['viola']['snapshots']))
 def test_disguises_and_imaginary_count(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['feste']['firstMention']['chapterNumber'],5)
   self.assertTrue(all(m['characterId']=='feste' for m in d['mentions'] if m['text']=='Sir Topas'))
   self.assertIn('steward',cs['malvolio']['snapshots'][0]['body']);self.assertEqual(len(cs['malvolio']['snapshots']),1)
   self.assertIn('Cesario',cs['viola']['snapshots'][1]['body']);self.assertNotIn('shipwrecked',cs['viola']['snapshots'][1]['body'])
 def test_references_and_distinct_roles(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id in ['captain','antonio','priest','feste','olivia-father','olivia-brother','father-sebastian','sowter','sophy','pigrogromitus','vapians','gorboduc-niece']:self.assertIn(id,cs)
   self.assertIn('invented',cs['quinapalus']['snapshots'][0]['body']);self.assertIn('stock hound-name',cs['sowter']['snapshots'][0]['body'])
   self.assertNotIn('queubus',cs);self.assertNotIn('lethe',cs)
 def test_full_scope_and_short_cards(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),65);self.assertEqual(d['chapterCount'],18);self.assertEqual(d['paragraphCount'],1120);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    for s in c['snapshots']:self.assertLessEqual(len(s['body'].split()),30)
if __name__=='__main__':unittest.main()
