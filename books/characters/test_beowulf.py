import hashlib,json,unittest
from build_beowulf import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder
class BeowulfContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_two_beowulfs_have_different_cards(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['text']=='Beowulf'];self.assertTrue(ms)
   for m in ms:self.assertEqual(m['characterId'],'scyld-son' if m['chapterNumber']<=2 else 'beowulf')
   cs={c['id']:c for c in d['characters']};self.assertEqual(cs['scyld-son']['storyRole'],'reference');self.assertEqual(cs['beowulf']['storyRole'],'central');self.assertEqual(cs['beowulf']['firstMention']['chapterNumber'],4)
   self.assertIn('different Beowulf',cs['scyld-son']['snapshots'][0]['body'])
 def test_hero_kingship_is_gated(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='beowulf');gate=c['snapshots'][1]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(31,8))
   self.assertNotIn('king of the Geats',reminder(d,c['id'],{**gate,'offset':gate['offset']-1})['body']);self.assertIn('king of the Geats',reminder(d,c['id'],gate)['body'])
   self.assertIn('nephew',reminder(d,c['id'],c['firstMention'])['body'])
 def test_dragons_and_mother_are_separate(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['characterId']=='sigmund-dragon':self.assertEqual(m['chapterNumber'],14)
    if m['characterId']=='dragon':self.assertGreaterEqual(m['chapterNumber'],31)
    if 'mother of Grendel' in m['text']:self.assertEqual(m['characterId'],'grendel-mother')
   cs={c['id']:c for c in d['characters']};self.assertEqual(cs['grendel-mother']['firstMention']['chapterNumber'],20)
 def test_ordinary_names_at_unnamed_first_encounters(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('hondscio',12,5),('aeschere',20,4),('wulfgar',6,2)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertIn('trusted adviser',cs['aeschere']['snapshots'][0]['body']);self.assertNotIn('slain',cs['hondscio']['snapshots'][0]['body'])
 def test_god_titles_exclude_human_rulers(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['characterId']=='god' and m['text']=='Lord' and (m['chapterNumber'],m['paragraphIndex']) in [(7,5),(24,4)] for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='god' and m['text']=='Wielder' and (m['chapterNumber'],m['paragraphIndex'])==(41,10) for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='danes' and (m['chapterNumber'],m['paragraphIndex'])==(41,8) for m in d['mentions']))
 def test_variants_and_uncertain_relations(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertIn('this translation',cs['elan']['snapshots'][0]['body']);self.assertNotIn('Beowulf’s wife',cs['mourning-woman']['snapshots'][0]['body'])
   self.assertNotIn('enemy',cs['eadgils']['snapshots'][0]['body']);self.assertNotIn('ally',cs['eadgils']['snapshots'][0]['body'])
   for id,names in [('heorogar',['Heorogar','Heregar']),('weohstan',['Weohstan','Wihstan'])]:self.assertTrue(set(names)<=set(m['text'] for m in d['mentions'] if m['characterId']==id))
 def test_complete_authored_coverage_without_running_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),121);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    if c['id']!='beowulf':self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
