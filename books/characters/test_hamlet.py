import hashlib,json,unittest
from pathlib import Path
from build_hamlet import compile_package,BASE
from build_pilot import ROOT,key,point,normalized,u16
from lookup_reference import reminder,gallery,resolve

class HamletContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def matches(self,ed,ch,pi,text):
  return [m for m in self.asset['editions'][ed]['mentions'] if m['chapterNumber']==ch and m['paragraphIndex']==pi and m['text'].lower()==text.lower()]
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_every_mention_roundtrips_and_has_one_owner(self):
  for ed,d in self.asset['editions'].items():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256'])
   source=json.loads(raw);ps={(c['number'],i):normalized(p) for c in source['chapters'] for i,p in enumerate(c['paragraphs'])}
   seen=set()
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k)
    rawp=ps[k[:2]].encode('utf-16-le');self.assertEqual(rawp[2*k[2]:2*k[3]].decode('utf-16-le'),m['text'])
    c=resolve(d,*k,ps[k[:2]]);self.assertEqual(c['id'],m['characterId'])
 def test_hamlet_father_son_and_address_to_ghost(self):
  for ed in self.asset['editions']:
   self.assertTrue(all(m['characterId']=='king-hamlet' for m in self.matches(ed,1,52,'Hamlet')))
   self.assertTrue(all(m['characterId']=='king-hamlet' for m in self.matches(ed,2,3,'Hamlet')))
   self.assertTrue(all(m['characterId']=='king-hamlet' for m in self.matches(ed,19,63,'Hamlet')))
   self.assertEqual([m['characterId'] for m in self.matches(ed,1,68,'Hamlet')],['hamlet'])
   self.assertEqual([m['characterId'] for m in self.matches(ed,4,14,'Hamlet')],['hamlet','ghost'])
 def test_two_fortinbrases_within_one_speech(self):
  for ed in self.asset['editions']:
   ms=self.matches(ed,1,52,'Fortinbras');self.assertGreater(len(ms),1)
   self.assertEqual(ms[-1]['characterId'],'fortinbras');self.assertTrue(all(m['characterId']=='elder-fortinbras' for m in ms[:-1]))
   self.assertEqual(self.matches(ed,19,63,'Fortinbras')[0]['characterId'],'elder-fortinbras')
 def test_royal_roles_in_performance_and_main_action(self):
  for ed in self.asset['editions']:
   self.assertTrue(all(m['characterId']=='player-king' for m in self.matches(ed,9,53,'King')))
   self.assertTrue(all(m['characterId']=='player-queen' for m in self.matches(ed,9,53,'Queen')))
   self.assertEqual(self.matches(ed,9,99,'King')[0]['characterId'],'claudius')
 def test_ghost_identity_and_category_do_not_leak(self):
  for d in self.asset['editions'].values():
   ghost=next(c for c in d['characters'] if c['id']=='ghost');at=ghost['firstMention'];early=reminder(d,'ghost',at)
   self.assertNotIn('father',early['body']);self.assertIsNone(early['role'])
   reveal=ghost['snapshots'][-1]['availableAt'];before={**reveal,'offset':reveal['offset']-1}
   self.assertNotIn('father’s spirit',reminder(d,'ghost',before)['body'])
   self.assertIn('identifies itself',reminder(d,'ghost',reveal)['body'])
   self.assertEqual(reminder(d,'ghost',at),early)
 def test_generic_ghosts_do_not_resolve_to_the_apparition(self):
  for ed in self.asset['editions']:
   self.assertFalse(self.matches(ed,4,31,'ghost'))
   self.assertFalse(self.matches(ed,5,38,'ghost'))
 def test_edition_omissions_and_later_reference_entry(self):
  a=self.asset['editions']['original-en'];b=self.asset['editions']['modern-en']
  self.assertIn('neptune',{c['id'] for c in a['characters']});self.assertNotIn('neptune',{c['id'] for c in b['characters']})
  self.assertNotIn('saviour',{c['id'] for c in gallery(b,point(1,70,9999))})
  self.assertIn('saviour',{c['id'] for c in gallery(b,point(20,999,9999))})
 def test_all_release_boundaries_and_early_gallery(self):
  for d in self.asset['editions'].values():
   self.assertNotIn('osric',{c['id'] for c in gallery(d,point(1,70,9999))})
   for c in d['characters']:
    at=c['firstMention'];self.assertIsNone(reminder(d,c['id'],{**at,'offset':at['offset']-1}))
    for s in c['snapshots']:
     self.assertEqual(reminder(d,c['id'],s['availableAt'])['body'],s['body'])
 def test_no_empty_cards_or_duplicate_ids(self):
  for d in self.asset['editions'].values():
   self.assertEqual(len({c['id'] for c in d['characters']}),len(d['characters']))
   for c in d['characters']:
    self.assertIn(c['storyRole'],{'central','major','supporting','reference'})
    for s in c['snapshots']:self.assertTrue(s['body'].strip())

if __name__=='__main__':unittest.main()
