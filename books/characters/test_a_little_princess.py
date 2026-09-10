import hashlib,json,unittest
from build_a_little_princess import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder
class LittlePrincessContractTests(unittest.TestCase):
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
 def test_neighbor_identity_uses_reader_knowledge(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='carrisford');first=reminder(d,c['id'],c['firstMention'])
   self.assertIn('English gentleman',first['body']);self.assertNotIn('Crewe',first['body']);self.assertNotIn('guardian',first['body'])
   gate=c['snapshots'][1]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(12,26))
   self.assertNotIn('business partner',reminder(d,c['id'],{**gate,'offset':gate['offset']-1})['body'])
   self.assertIn('business partner',reminder(d,c['id'],gate)['body']);self.assertNotIn('guardian',reminder(d,c['id'],point(17,94,99999))['body'])
   self.assertIn('guardian',reminder(d,c['id'],c['snapshots'][2]['availableAt'])['body'])
 def test_paris_lead_does_not_leak_search_or_identity(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='emily-carew');first=reminder(d,c['id'],c['firstMention'])
   self.assertNotIn('Sara',first['body']);self.assertNotIn('Emily',first['name'])
   gate=c['snapshots'][1]['availableAt'];self.assertEqual(reminder(d,c['id'],gate)['name'],'Emily Carew')
   ms=[m for m in d['mentions'] if m['chapterNumber']==17 and m['paragraphIndex']==33]
   self.assertTrue(any(m['characterId']=='emily-carew' and m['text']=='Emily Carew' for m in ms));self.assertFalse(any(m['characterId']=='emily-doll' for m in ms))
 def test_large_family_aliases_and_parents(self):
  for d in self.asset['editions'].values():
   for id,aliases in [('janet',['Janet','Veronica Eustacia']),('nora',['Nora','Rosalind Gladys']),('donald',['Donald','Guy Clarence'])]:
    self.assertTrue(set(aliases)<=set(m['text'] for m in d['mentions'] if m['characterId']==id))
   for id,alias in [('carmichael','Mr. Montmorency'),('mrs-carmichael','Mrs. Montmorency')]:self.assertTrue(any(m['characterId']==id and m['text']==alias for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='mrs-carmichael' and m['text']=='Mrs. Carmichael' for m in d['mentions']))
 def test_sahib_is_not_always_carrisford(self):
  for d in self.asset['editions'].values():
   for pi in [4,7,12]:
    ms=[m for m in d['mentions'] if m['chapterNumber']==14 and m['paragraphIndex']==pi and m['text']=='Sahib']
    self.assertTrue(ms);self.assertTrue(all(m['characterId']=='secretary' for m in ms))
   ms=[m for m in d['mentions'] if m['chapterNumber']==14 and m['paragraphIndex']==22 and m['text']=='Sahib']
   self.assertEqual([m['characterId'] for m in ms],['secretary','carrisford','carrisford'])
 def test_bakery_changes_are_source_gated(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='anne');first=reminder(d,c['id'],c['firstMention'])
   self.assertNotIn('helping',first['body']);self.assertEqual(first['name'],'The hungry girl')
   gate=c['snapshots'][1]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(19,40));self.assertEqual(reminder(d,c['id'],gate)['name'],'Anne')
   baker=next(c for c in d['characters'] if c['id']=='baker');self.assertIn('runs the bakery',reminder(d,'baker',baker['firstMention'])['body'])
 def test_named_animals_dolls_and_no_false_monkeys(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['emily-doll']['kind'],'object');self.assertEqual(cs['last-doll']['kind'],'object');self.assertEqual(cs['boris']['kind'],'animal')
   self.assertIn('boarhound',cs['boris']['snapshots'][0]['body']);self.assertFalse(any(m['characterId']=='monkey' and m['chapterNumber']<11 for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='mrs-melchisedec' and m['text']=='Mrs. Melchisedec' for m in d['mentions']))
 def test_coverage_and_stable_reminders(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),86);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    if c['id'] not in ['ermengarde','becky','lottie','carrisford','anne','emily-carew']:self.assertEqual(len(c['snapshots']),1)
   sara=next(c for c in d['characters'] if c['id']=='sara');self.assertEqual(sara['storyRole'],'central');self.assertEqual(sara['snapshots'][0]['body'],'The story’s main character, Captain Crewe’s daughter.')
if __name__=='__main__':unittest.main()
