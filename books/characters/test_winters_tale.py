import hashlib,json,unittest
from build_winters_tale import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class WintersTaleTests(unittest.TestCase):
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
 def test_scene_local_servants_and_lords(self):
  for d in self.asset['editions'].values():
   got={}
   for m in d['mentions']:
    if m['characterId'].endswith('servant') or m['characterId']=='leontes-servant':got.setdefault(m['characterId'],set()).add(m['chapterNumber'])
   self.assertEqual(got['leontes-servant'],{5});self.assertEqual(got['trial-servant'],{7})
   self.assertEqual(got['shepherd-servant'],{12});self.assertEqual(got['late-servant'],{13})
   # The First Lord attends Leontes before the gap; the bare LORD cue is after it.
   self.assertEqual({m['chapterNumber'] for m in d['mentions'] if m['characterId']=='first-lord'},{3,5,7})
   self.assertEqual({m['chapterNumber'] for m in d['mentions'] if m['characterId']=='lord'},{13})
 def test_assumed_and_mocking_names(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # Doricles is Florizel, not a shepherd of that name.
   self.assertTrue(all(m['characterId']=='florizel' for m in d['mentions'] if m['text']=='Doricles'))
   self.assertEqual(len([m for m in d['mentions'] if m['text']=='Doricles']),4)
   # Leontes' two by-names for Paulina are hen and goose names, not new women.
   self.assertIn('paulina',at(5,29));self.assertIn('paulina',at(5,52))
   self.assertTrue(any(m['text']=='Dame Partlet' and m['characterId']=='paulina' for m in d['mentions']))
   self.assertTrue(any(m['text']=='Lady Margery' and m['characterId']=='paulina' for m in d['mentions']))
   # The gentleman greeted as Rogero is the one who speaks next as SECOND GENTLEMAN.
   self.assertEqual(at(14,6),{'second-gentleman'})
 def test_reveals_are_gated(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   # Hermione is reported dead at 7:50 and is alive; no card ever says either
   # before the statue comes down at 15:33.
   first=c['hermione']['snapshots'][0]['body']
   for word in ['dead','died','statue','alive']:self.assertNotIn(word,first)
   self.assertEqual(len(c['hermione']['snapshots']),2)
   p=c['hermione']['snapshots'][1]['availableAt'];self.assertEqual((p['chapterNumber'],p['paragraphIndex']),(15,33))
   # The reader watches the baby named and left, so Perdita's parentage is plain
   # from her first mention even though the characters learn it only at 14:7.
   self.assertIn('daughter',c['perdita']['snapshots'][0]['body'])
   self.assertEqual((c['perdita']['firstMention']['chapterNumber'],c['perdita']['firstMention']['paragraphIndex']),(8,8))
   for id,ch,pi in [('camillo',2,123),('camillo',12,10),('polixenes',12,10),('florizel',12,30),('florizel',12,212),
                    ('perdita',9,1),('perdita',14,7),('shepherd',14,30),('clown',14,30)]:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in c[id]['snapshots'][1:]),(id,ch,pi))
   # No card announces the disguises before they are put on.
   self.assertNotIn('disguise',c['polixenes']['snapshots'][0]['body'])
   self.assertNotIn('Doricles',c['florizel']['snapshots'][0]['body'])
 def test_judas_named_only_in_the_modern_setting(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  self.assertEqual(self.report['editions']['original-en']['omittedEntities'],['judas'])
  self.assertEqual(self.report['editions']['modern-en']['omittedEntities'],[])
  self.assertTrue(any(x['text']=='Judas' and x['characterId']=='judas' for x in m['mentions']))
  self.assertFalse(any(x['characterId']=='judas' for x in o['mentions']))
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(15,911))
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
