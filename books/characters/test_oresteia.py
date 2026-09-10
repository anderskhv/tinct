import hashlib,json,unittest
from build_oresteia import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder
class OresteiaContractTests(unittest.TestCase):
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
 def test_three_choruses(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text'] in ['CHORUS','Chorus']:
     ch=m['chapterNumber'];self.assertEqual(m['characterId'],'argive-chorus' if ch<=10 else 'libation-chorus' if ch<=18 else 'furies')
   self.assertEqual(len({m['characterId'] for m in d['mentions'] if m['characterId'].startswith('elder-')}),11)
 def test_future_weight_hidden_but_identity_available(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id in ['orestes','apollo','athena','furies']:
    c=cs[id];self.assertIsNone(reminder(d,id,c['firstMention'])['role'])
    gate=c['roleVisibleAt'];self.assertIsNone(reminder(d,id,{**gate,'offset':gate['offset']-1})['role'])
    self.assertEqual(reminder(d,id,gate)['role'],c['storyRole'])
   self.assertIn('son of Agamemnon',reminder(d,'orestes',cs['orestes']['firstMention'])['body'])
 def test_two_scyllas_and_atrides(self):
  for ed,d in self.asset['editions'].items():
   for m in d['mentions']:
    if m['text']=='Scylla':self.assertEqual(m['characterId'],'scylla-monster' if m['chapterNumber']==9 else 'scylla-daughter')
    if m['text']=='Atrides':self.assertEqual(m['characterId'],'agamemnon' if m['chapterNumber']==3 else 'menelaus')
 def test_speakers_and_distinct_servants(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text'] in ['CLYTEMNESTSA','GHOST','GHOST OF CLYTEMNESTRA']:self.assertEqual(m['characterId'],'clytemnestra')
    if m['text']=='OSESTES':self.assertEqual(m['characterId'],'orestes')
    if m['text']=='SLAVE':self.assertEqual(m['characterId'],'doorkeeper' if m['paragraphIndex']==2 else 'aegisthus-servant')
   self.assertTrue(any(m['characterId']=='first-fury' for m in d['mentions']))
 def test_named_references_and_kinship_both_selectable(self):
  for d in self.asset['editions'].values():
   for id in ['heracles','alcmena','admetus','pheres','inachus','ate','zephyr']:
    self.assertTrue(any(m['characterId']==id for m in d['mentions']),id)
   self.assertFalse(any(m['text'] in ['Triton','Scamander','Hades','Pleiades'] for m in d['mentions']))
 def test_complete_cards_are_recognition_not_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),103);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   self.assertTrue(all(len(c['snapshots'])==1 for c in d['characters']))
if __name__=='__main__':unittest.main()
