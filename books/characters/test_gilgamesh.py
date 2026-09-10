import hashlib,json,unittest
from build_gilgamesh import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder
class GilgameshContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_source_hashes(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_friendship_begins_at_source_boundary(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='enkidu');gate=c['snapshots'][1]['availableAt']
   self.assertNotIn('friend',reminder(d,'enkidu',c['firstMention'])['body'])
   self.assertNotIn('friend',reminder(d,'enkidu',{**gate,'offset':gate['offset']-1})['body'])
   self.assertIn('closest friend',reminder(d,'enkidu',gate)['body'])
 def test_ordinary_identity_and_categories(self):
  for d in self.asset['editions'].values():
   cards={c['id']:reminder(d,c['id'],c['firstMention']) for c in d['characters']}
   self.assertIn('mother',cards['ninsun']['body']);self.assertIn('ferryman',cards['urshanabi']['body'])
   self.assertEqual(cards['gilgamesh']['role'],'central');self.assertEqual(cards['enkidu']['role'],'central');self.assertEqual(cards['ishtar']['role'],'major')
   self.assertEqual(cards['etana']['role'],'reference')
   self.assertTrue(all(len(c['snapshots'])==1 for c in d['characters'] if c['id']!='enkidu'))
 def test_divine_aliases_and_distinct_dumuzis(self):
  for ed,d in self.asset['editions'].items():
   bytext={m['text']:m['characterId'] for m in d['mentions']}
   self.assertEqual(bytext['Dumuzi-abzu'],'dumuzi-abzu');self.assertEqual(bytext['Dumuzi'],'dumuzi')
   for name in ['Ea','Enki','Nudimmud']:self.assertEqual(bytext[name],'ea')
   self.assertEqual(bytext['Namra-sit'],'sin');self.assertEqual(bytext['Irkalla'],'ereshkigal')
   self.assertEqual(bytext['Irnina'],'irnina');self.assertEqual(bytext['Imini' if ed=='original-en' else 'Irnini'],'irnini')
   if ed=='original-en':self.assertEqual(bytext['Bel'],'enlil');self.assertEqual(bytext['Atra-hasis'],'utnapishtim')
 def test_context_bound_unnamed_characters(self):
  for d in self.asset['editions'].values():
   for id,ch,ps in [('trapper-father',1,{8,9,10}),('wedding-guest',2,{5,6,7,8}),('scorpion-wife',9,{5,6}),('utnapishtim-wife',11,{21,23,29}),('snake',11,{34}),('carpenter',12,{0})]:
    ms=[m for m in d['mentions'] if m['characterId']==id];self.assertTrue(ms)
    self.assertTrue(all(m['chapterNumber']==ch and m['paragraphIndex'] in ps for m in ms))
   self.assertFalse(any(m['text'] in ['Niir','Mashu','Hades','mother Ninazu'] for m in d['mentions']))
 def test_edition_specific_omission(self):
  self.assertEqual(self.report['editions']['original-en']['omittedEntities'],[])
  self.assertEqual(self.report['editions']['modern-en']['omittedEntities'],['asakku'])
if __name__=='__main__':unittest.main()
