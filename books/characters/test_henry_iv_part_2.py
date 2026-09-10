import hashlib,json,unittest
from build_henry_iv_part_2 import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class HenryIVPart2Tests(unittest.TestCase):
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
 def test_two_bardolphs(self):
  for d in self.asset['editions'].values():
   lord={m['chapterNumber'] for m in d['mentions'] if m['characterId']=='lord-bardolph'}
   corp={m['chapterNumber'] for m in d['mentions'] if m['characterId']=='bardolph'}
   # The rebel lord appears only in scenes 1 and 3; the corporal never does.
   self.assertEqual(lord,{1,3});self.assertFalse(corp & {1,3})
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   self.assertIn('lord-bardolph',at(3,7));self.assertNotIn('bardolph',at(3,7))
   self.assertIn('bardolph',at(2,5));self.assertNotIn('lord-bardolph',at(2,5))
 def test_two_harrys_and_a_coin(self):
  for d in self.asset['editions'].values():
   who=lambda ch,pi:[m['characterId'] for m in sorted(d['mentions'],key=lambda x:x['startOffset']) if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) and m['text'] in ('Harry','HARRY')]
   self.assertEqual(who(1,20),['hotspur']);self.assertEqual(who(6,4),['hotspur','hotspur'])
   self.assertEqual(who(1,13),['prince-henry','prince-henry'])
   # The King calls himself Harry once, in the Jerusalem line.
   self.assertEqual(who(14,55),['henry-iv'])
   # "Not Amurath an Amurath succeeds, but Harry Harry": new king, then old.
   self.assertEqual(who(16,25),['prince-henry','henry-iv','henry-iv','prince-henry'])
   # "Four Harry ten shillings" is a coin, and no card is offered on it.
   self.assertEqual(who(9,106),[])
 def test_every_john(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   self.assertIn('umfrevile',at(1,20));self.assertNotIn('falstaff',at(1,20))
   self.assertIn('john-doit',at(9,9));self.assertIn('gaunt',at(9,131))
   # The John of Silence's Robin Hood ballad is Little John.
   self.assertIn('little-john',at(17,67));self.assertNotIn('falstaff',at(17,67))
   self.assertIn('robin-hood',at(17,67));self.assertIn('will-scarlet',at(17,67))
   # Prince John and the knight who yields at Gaultree are neither of them Falstaff.
   self.assertTrue(any(m['text'].startswith('Prince John') and m['characterId']=='lancaster' for m in d['mentions']))
   self.assertTrue(any(m['text']=='Sir John Colevile' and m['characterId']=='colevile' for m in d['mentions']))
 def test_one_king_cue_two_kings(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  # The original prints one KING cue for both reigns; the modern splits it.
  self.assertTrue(any(x['text']=='KING' and x['characterId']=='henry-iv' for x in o['mentions']))
  self.assertTrue(any(x['text']=='KING' and x['characterId']=='prince-henry' for x in o['mentions']))
  self.assertFalse(any(x['text']=='KING' for x in m['mentions']))
  self.assertTrue(any(x['text']=='HENRY IV' and x['characterId']=='henry-iv' for x in m['mentions']))
  self.assertTrue(any(x['text']=='HENRY V' and x['characterId']=='prince-henry' for x in m['mentions']))
  # Both editions must reach the same two men the same number of times.
  for id in ['henry-iv','prince-henry','falstaff','bardolph','lord-bardolph','hotspur']:
   self.assertEqual(len([x for x in o['mentions'] if x['characterId']==id]),
                    len([x for x in m['mentions'] if x['characterId']==id]),id)
 def test_gates_and_edition_spellings(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  for d in (o,m):
   c={x['id']:x for x in d['characters']}
   # The Prince's first card does not make him king, and Falstaff's is not the rejection.
   self.assertNotIn('king in his father',c['prince-henry']['snapshots'][0]['body'])
   self.assertNotIn('banish',c['falstaff']['snapshots'][0]['body'])
   for id,ch,pi in [('prince-henry',14,55),('falstaff',19,52),('lancaster',11,37),('northumberland',6,8)]:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in c[id]['snapshots'][1:]),(id,ch,pi))
   # Lord Bardolph's card says outright that he is not the corporal.
   self.assertIn('not the corporal',c['lord-bardolph']['snapshots'][0]['body'])
  self.assertTrue(any(x['text']=='John a Gaunt' and x['characterId']=='gaunt' for x in o['mentions']))
  self.assertTrue(any(x['text']=='John of Gaunt' and x['characterId']=='gaunt' for x in m['mentions']))
  self.assertTrue(any(x['text']=='Rumour' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Rumor' for x in m['mentions']))
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(19,1081));self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
