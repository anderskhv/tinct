import hashlib,json,unittest
from build_king_lear import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class KingLearTests(unittest.TestCase):
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
 def test_title_changes_do_not_merge_father_son(self):
  for d in self.asset['editions'].values():
   for ch,pi,id in [(14,7,'edmund'),(16,5,'edmund'),(16,8,'gloucester'),(18,2,'gloucester'),(18,8,'edmund'),(18,30,'edmund'),(21,9,'gloucester'),(26,31,'edmund'),(26,64,'edmund')]:
    ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(ch,pi,'Gloucester')];self.assertTrue(ms,(ch,pi));self.assertEqual({m['characterId'] for m in ms},{id})
 def test_ordinary_family_and_disguises(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertIn('younger son',cs['edmund']['snapshots'][0]['body']);self.assertNotIn('earldom',cs['edmund']['snapshots'][0]['body'])
   self.assertNotIn('disguise',cs['kent']['snapshots'][0]['body']);self.assertNotIn('Tom',cs['edgar']['snapshots'][0]['body'])
   for id,ch,pi in [('kent',4,0),('edgar',8,1),('edmund',14,7)]:self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in cs[id]['snapshots'][1:]))
   self.assertTrue(any(m['text']=='Caius' and m['characterId']=='kent' for m in d['mentions']))
 def test_stock_tom_not_edgar(self):
  for d in self.asset['editions'].values():
   self.assertEqual({m['characterId'] for m in d['mentions'] if m['chapterNumber']==2 and m['paragraphIndex']==38},{'tom-bedlam'})
   self.assertTrue(all(m['characterId']=='edgar' for m in d['mentions'] if m['text']=='Tom'))
 def test_places_and_prospective_duchess(self):
  for d in self.asset['editions'].values():
   for ch,pi in [(1,29),(1,78),(1,82),(4,42),(19,4),(23,30)]:
    self.assertFalse(any(m['text'] in ['France','Burgundy'] and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']))
   self.assertTrue(any(m['text']=='France' and (m['chapterNumber'],m['paragraphIndex'])==(2,3) for m in d['mentions']))
 def test_officers_and_messengers(self):
  for d in self.asset['editions'].values():
   for ch,pi,id in [(20,2,'french-officer'),(24,2,'british-officer'),(26,124,'british-officer'),(26,8,'captain'),(18,23,'cornwall-messenger'),(20,7,'army-messenger'),(26,87,'final-gentleman')]:
    self.assertTrue(any(m['characterId']==id and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']))
 def test_song_variants_and_imagined_dogs(self):
  for ed,d in self.asset['editions'].items():
   cs={c['id']:c for c in d['characters']};self.assertEqual(cs['dolphin']['storyRole'],'reference')
   self.assertTrue(any(m['characterId']=='dolphin' and m['text']==('Dolphin' if ed=='original-en' else 'Dauphin') for m in d['mentions']))
   for id in ['trey','blanch','sweetheart']:self.assertEqual(cs[id]['kind'],'animal');self.assertIn('imagines',cs[id]['snapshots'][0]['body'])
   self.assertEqual(len([m for m in d['mentions'] if m['characterId']=='pillicock']),1)
 def test_full_coverage_and_gates(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(26,1371));self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
