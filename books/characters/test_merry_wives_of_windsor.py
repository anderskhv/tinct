import hashlib,json,unittest
from build_merry_wives_of_windsor import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class MerryWivesTests(unittest.TestCase):
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
 def test_four_pages_and_two_fords(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # Sir Hugh names the daughter and then the father in one line.
   self.assertIn('anne',at(1,18));self.assertIn('thomas-page',at(1,18))
   # The wives, addressed by their own surnames.
   self.assertIn('mistress-ford',at(5,15));self.assertIn('mistress-ford',at(14,3))
   self.assertIn('mistress-page',at(13,48))
   # The householders' given names.
   self.assertTrue(any(m['text']=='George' and m['characterId']=='george-page' for m in d['mentions']))
   self.assertTrue(any(m['text']=='Frank' and m['characterId']=='frank-ford' for m in d['mentions']))
   # Two women called Alice: the longer span wins for the neighbour.
   self.assertTrue(any(m['text']=='Alice Shortcake' and m['characterId']=='alice-shortcake' for m in d['mentions']))
   self.assertTrue(any(m['text']=='Alice' and m['characterId']=='mistress-ford' for m in d['mentions']))
 def test_the_surname_that_belongs_to_neither_household(self):
  # "The name of Page and Ford differs" at 5:17 is Mistress Page comparing the two
  # letters' addresses. Whether that means the wives or the husbands is not settled
  # by the text, so neither surname is bound there.
  for d in self.asset['editions'].values():
   ids={m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(5,17)}
   self.assertEqual(ids,{'mistress-page'})
 def test_assumed_names(self):
  for d in self.asset['editions'].values():
   # Ford visits Falstaff as Brook; every Brook is Ford.
   brooks=[m for m in d['mentions'] if m['text']=='Brook']
   self.assertTrue(brooks);self.assertEqual({m['characterId'] for m in brooks},{'ford'})
   c={x['id']:x for x in d['characters']}
   # Mother Prat and the witch of Brentford are what the gown is called, not people
   # of the play, and the fat woman whose gown it is has her own entry.
   self.assertEqual(c['mother-prat']['kind'],'unresolved-name')
   self.assertEqual(c['brainford-witch']['kind'],'unresolved-name')
   self.assertTrue(any(m['characterId']=='fat-woman' for m in d['mentions']))
 def test_original_cues_and_split_names(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  # The abbreviated italic cues exist only in the original.
  self.assertTrue(any(x['text']=='Mrs Ford' and x['characterId']=='mistress-ford' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Slen' and x['characterId']=='slender' for x in o['mentions']))
  self.assertFalse(any(x['resolution']=='reviewed-cue' for x in m['mentions']))
  # Printed line numbers split "Anne Page" and "Mistress Page" in the original only;
  # the modern prints them whole. Both editions still reach the right person.
  self.assertTrue(any(x['text']=='Page' and x['characterId']=='anne' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Anne Page' and x['characterId']=='anne' for x in m['mentions']))
  self.assertFalse(any(x['text']=='Page' and x['characterId']=='anne' for x in m['mentions']))
  # The original prints the ligature in Actaeon.
  self.assertTrue(any(x['text']=='Actæon' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Actaeon' for x in m['mentions']))
 def test_gates(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   self.assertNotIn('Brook',c['ford']['snapshots'][0]['body'])
   self.assertNotIn('gown',c['falstaff']['snapshots'][0]['body'])
   self.assertNotIn('married',c['anne']['snapshots'][0]['body'])
   for id,ch,pi in [('ford',6,60),('falstaff',19,7),('anne',23,80),('fenton',23,80)]:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in c[id]['snapshots'][1:]),(id,ch,pi))
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(23,1155));self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
