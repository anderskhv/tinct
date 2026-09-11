import hashlib,json,unittest
from build_measure_for_measure import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class MeasureForMeasureTests(unittest.TestCase):
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
 def test_abbreviated_cues_are_original_only(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  self.assertTrue(any(x['text']=='Mrs Ov' and x['characterId']=='mistress-overdone' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Fri. P' and x['characterId']=='friar-peter' for x in o['mentions']))
  self.assertFalse(any(x['resolution']=='reviewed-cue' for x in m['mentions']))
  # Both settings must reach the same speakers: the original's brace-joined cue at
  # 17:2 and the modern's "ANGELO and ESCALUS." are one shared two-speaker line.
  for d in (o,m):
   self.assertEqual({x['characterId'] for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(17,2)},{'angelo','escalus'})
   # Cues embedded mid-paragraph by the compositor still resolve to their speaker.
   self.assertEqual({x['characterId'] for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(8,13)},{'angelo','isabella'})
 def test_justice_the_magistrate_is_not_the_abstraction(self):
  for d in self.asset['editions'].values():
   for ch,pi in [(5,70),(10,86),(17,8)]:
    self.assertFalse(any(x['characterId']=='justice' for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(ch,pi)),(ch,pi))
   self.assertTrue(any(x['characterId']=='iniquity' for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(5,70)))
   got={(x['chapterNumber'],x['paragraphIndex']) for x in d['mentions'] if x['characterId']=='justice'}
   self.assertEqual(got,{(5,0),(5,118),(5,120),(5,122)})
 def test_namesakes_and_addressed_tapster(self):
  for ed,d in self.asset['editions'].items():
   # Mistress Overdone addresses Pompey, not the friar who lends the Duke his habit.
   ms=[x for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(2,61)]
   self.assertIn('pompey',{x['characterId'] for x in ms});self.assertNotIn('friar-thomas',{x['characterId'] for x in ms})
   self.assertEqual([x['text'] for x in ms if x['characterId']=='pompey'],['Thomas tapster' if ed=='original-en' else 'Thomas barman'])
   # Escalus's "Pompey the Great" is a pun on the bawd's name, not a Roman entering the scene.
   self.assertTrue(all(x['characterId']=='pompey' for x in d['mentions'] if x['text']=='Pompey'))
   self.assertTrue(any(x['characterId']=='caesar' for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(5,104)))
   # Crassus is one of the Duke's Vienna contacts; the card must not import the Roman.
   c={x['id']:x for x in d['characters']}
   self.assertIn('not the Roman',c['crassus']['snapshots'][0]['body'])
 def test_compositor_errors_bound_where_printed(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  self.assertTrue(any(x['text']=='Clandio' and x['characterId']=='claudio' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Angclo' and x['characterId']=='angelo' for x in o['mentions']))
  self.assertFalse(any(x['text'] in ('Clandio','Angclo') for x in m['mentions']))
  for d in (o,m):
   for ch,pi,id in [(12,29,'claudio'),(12,64,'angelo')]:
    self.assertIn(id,{x['characterId'] for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(ch,pi)})
 def test_edition_wording_differences(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  for d,word in [(o,'Cæsar'),(m,'Caesar')]:
   self.assertTrue(any(x['text']==word and x['characterId']=='caesar' for x in d['mentions']))
  for d,word in [(o,'Mother'),(m,'Mother Superior')]:
   got=[x['text'] for x in d['mentions'] if x['characterId']=='prioress' and (x['chapterNumber'],x['paragraphIndex'])==(4,32)]
   self.assertEqual(got,[word])
 def test_ordinary_identity_and_withheld_reveals(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   # Ordinary identity at first encounter.
   self.assertIn('sister',c['isabella']['snapshots'][0]['body']);self.assertIn('novice',c['isabella']['snapshots'][0]['body'])
   # The disguise, its assumed name, and the marriages stay behind their gates.
   first=c['duke']['snapshots'][0]['body']
   for word in ['friar','disguis','Lodowick']:self.assertNotIn(word,first)
   self.assertNotIn('Lodowick',c['duke']['snapshots'][1]['body'])
   self.assertNotIn('marri',c['angelo']['snapshots'][0]['body'])
   self.assertNotIn('Angelo',c['mariana']['snapshots'][0]['body'])
   for id,ch,pi in [('duke',3,7),('duke',17,42),('angelo',17,145),('mariana',9,69),('mariana',17,145),('juliet',2,79),('juliet',4,20),('pompey',12,4),('barnardine',12,62)]:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in c[id]['snapshots'][1:]),(id,ch,pi))
   # Juliet is contracted, not wedded; Claudio is never reported dead in a card.
   self.assertIn('lacking a formal wedding',c['juliet']['snapshots'][1]['body'])
   for s in c['claudio']['snapshots']:self.assertNotIn('dead',s['body'])
   # Mariana is not introduced at the Duke's "poor wronged lady" four paragraphs early.
   self.assertEqual((c['mariana']['firstMention']['chapterNumber'],c['mariana']['firstMention']['paragraphIndex']),(9,67))
   self.assertFalse(any(x['characterId']=='mariana' for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(9,65)))
 def test_full_coverage_and_gates(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(17,1006));self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
   # The original prints a line number inside "the constable's 150 wife": that phrase
   # is not contiguous, so it is bound in neither edition rather than silently repaired.
   self.assertFalse(any(x['characterId']=='elbow-wife' for x in d['mentions'] if (x['chapterNumber'],x['paragraphIndex'])==(5,64)))
if __name__=='__main__':unittest.main()
