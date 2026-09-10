import hashlib,json,unittest
from build_jungle_book import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class JungleBookContractTests(unittest.TestCase):
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
 def test_story_protagonists_and_first_identity(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id in ['mowgli','kotick','rikki','little-toomai']:self.assertEqual(cs[id]['storyRole'],'central')
   self.assertEqual((cs['mowgli']['firstMention']['chapterNumber'],cs['mowgli']['firstMention']['paragraphIndex']),(1,27))
   self.assertIn('human raised by wolves',cs['mowgli']['snapshots'][0]['body']);self.assertIn('Teddy’s family',cs['rikki']['snapshots'][0]['body'])
   self.assertEqual(cs['amir']['storyRole'],'supporting');self.assertEqual(cs['viceroy']['storyRole'],'supporting');self.assertEqual(cs['empress']['storyRole'],'reference')
 def test_no_unproven_identification(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertIn('resemblance',cs['nathoo']['snapshots'][0]['body'])
   self.assertFalse(any(m['characterId']=='mowgli' and m['text']=='Nathoo' for m in d['mentions']))
   self.assertFalse(any('Purun Dass' in s['body'] for s in cs['shere-khan']['snapshots']))
   self.assertIn('Buldeo’s story',cs['purun-dass']['snapshots'][0]['body'])
 def test_four_toomais_and_earned_title(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id in ['little-toomai','big-toomai','black-toomai','old-toomai']:self.assertIn(id,cs)
   ms=[m for m in d['mentions'] if m['text']=='Toomai of the Elephants'];self.assertTrue(any(m['characterId']=='old-toomai' and m['paragraphIndex']==7 for m in ms));self.assertTrue(any(m['characterId']=='little-toomai' and m['paragraphIndex']==81 for m in ms))
   c=cs['little-toomai'];gate=c['snapshots'][1]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(6,81));self.assertNotIn('honored',reminder(d,c['id'],dict(gate,offset=gate['offset']-1))['body']);self.assertIn('honored',reminder(d,c['id'],gate)['body'])
 def test_akela_and_sea_lion_boundaries(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};c=cs['akela'];gate=c['snapshots'][1]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(1,112));self.assertNotIn('former',reminder(d,'akela',dict(gate,offset=gate['offset']-1))['body']);self.assertIn('former',reminder(d,'akela',gate)['body'])
   self.assertEqual((cs['sea-lion']['firstMention']['chapterNumber'],cs['sea-lion']['firstMention']['paragraphIndex']),(4,45))
 def test_different_families_and_animals(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('rikki-father',5,4),('rikki-mother',5,4),('teddy',5,4),('alice',5,5),('teddy-father',5,6),('darzee-wife',5,20)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   for id in ['kala-nag','hathi','two-tails','pudmini','billy','young-mule','troop-horse','camp-camel','gun-bullocks']:self.assertIn(id,cs)
 def test_all_seven_and_concise(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),104);self.assertEqual(d['chapterCount'],7);self.assertEqual(d['paragraphCount'],944);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    self.assertEqual(len(c['snapshots']),2 if c['id'] in ['akela','little-toomai'] else 1)
    for s in c['snapshots']:self.assertLessEqual(len(s['body'].split()),30)
if __name__=='__main__':unittest.main()
