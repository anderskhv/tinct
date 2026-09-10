import hashlib,json,unittest
from build_candide import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder,gallery
class CandideContractTests(unittest.TestCase):
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
 def test_old_woman_does_not_reveal_cunegondes_survival(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='old-woman')
   self.assertNotIn('Cunegonde',reminder(d,c['id'],c['firstMention'])['body'])
   for i,phrase in [(1,'Cunegonde'),(2,'Urban X')]:
    gate=c['snapshots'][i]['availableAt'];before={**gate,'offset':gate['offset']-1}
    self.assertNotIn(phrase,reminder(d,c['id'],before)['body']);self.assertIn(phrase,reminder(d,c['id'],gate)['body'])
 def test_young_baron_and_unknown_commandant(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='young-baron');card=reminder(d,c['id'],c['firstMention'])
   self.assertIn('brother',card['body']);self.assertNotIn('Jesuit',card['body']);self.assertIsNone(card['role'])
   self.assertFalse(any(m['text']=='Commandant' and m['chapterNumber']==14 and m['paragraphIndex']<28 for m in d['mentions']))
   gate=c['roleVisibleAt'];self.assertEqual(reminder(d,c['id'],gate)['role'],'major');self.assertIn('Jesuit',reminder(d,c['id'],gate)['body'])
   self.assertTrue(any(m['characterId']=='baron' and m['chapterNumber']==24 for m in d['mentions']))
 def test_false_cunegonde_not_resolved_as_real_woman(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['characterId']=='cunegonde' and m['chapterNumber']==22 and 74<=m['paragraphIndex']<=79 for m in d['mentions']))
   c=next(c for c in d['characters'] if c['id']=='impostor');self.assertEqual(c['firstMention']['paragraphIndex'],86)
   self.assertTrue(all(m['text'] in ['cheat','swindler'] for m in d['mentions'] if m['characterId']=='impostor'))
 def test_marriage_is_not_released_at_intention_only(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='cunegonde');gate=c['snapshots'][1]['availableAt']
   self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(30,1))
   self.assertNotIn('wife',reminder(d,c['id'],point(30,0,999999))['body']);self.assertIn('wife',reminder(d,c['id'],gate)['body'])
 def test_historical_actors_and_references(self):
  for d in self.asset['editions'].values():
   cards={c['id']:reminder(d,c['id'],c['firstMention']) for c in d['characters']}
   for id in ['achmet','ivan','charles-edward','augustus','stanislaus','theodore','byng','clairon']:self.assertEqual(cards[id]['role'],'supporting')
   self.assertEqual(cards['monime']['name'],'Adrienne Lecouvreur');self.assertEqual(cards['monime']['role'],'reference')
   self.assertIn('Macedonian',cards['perseus']['body']);self.assertIn('invented pope',cards['urban']['body'])
 def test_distinct_doctors_friars_and_farmers(self):
  for d in self.asset['editions'].values():
   for id,ch in [('army-surgeon',2),('french-surgeon',12),('paquette-surgeon',24),('pangloss-surgeon',28),('elder',18),('farmer',30)]:
    ms=[m for m in d['mentions'] if m['characterId']==id];self.assertTrue(ms);self.assertTrue(all(m['chapterNumber']==ch for m in ms))
   for id,ch in [('grey-confessor',4),('friar-thief',10)]:self.assertTrue(any(m['characterId']==id and m['chapterNumber']==ch for m in d['mentions']))
 def test_all_authored_entries_and_no_running_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),210);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    if c['id'] not in ['old-woman','young-baron','cunegonde','paquette','giroflee']:self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
