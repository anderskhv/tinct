import hashlib,json,unittest
from build_antony_and_cleopatra import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class AntonyAndCleopatraTests(unittest.TestCase):
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
 def test_the_two_caesars(self):
  # Both settings must reach the same eleven paragraphs where "Caesar" is the dead
  # Julius rather than the living Octavius.
  want={(5,15),(5,26),(5,27),(5,29),(5,30),(7,86),(11,3),(11,24),(11,31),(19,19),(25,62),(14,40),(25,44)}
  for ed,d in self.asset['editions'].items():
   got={(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='julius-caesar'}
   self.assertEqual(got,want,ed)
   self.assertEqual(len([m for m in d['mentions'] if m['characterId']=='julius-caesar']),13,ed)
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # Cleopatra's reminiscence is of the dead Caesar, not the rival at the gates.
   self.assertNotIn('octavius',at(5,26));self.assertNotIn('octavius',at(5,27))
   # "Your Caesar's father" is Octavius's name and Julius's person in one phrase.
   self.assertIn('octavius',at(25,44));self.assertIn('julius-caesar',at(25,44))
 def test_the_three_pompeys(self):
  want={(2,106),(5,15),(19,19),(11,41)}
  for ed,d in self.asset['editions'].items():
   got={(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='pompey-great'}
   self.assertEqual(got,want,ed)
   # Everything else called Pompey is Sextus, and Gnaeus is his own man.
   self.assertEqual(len([m for m in d['mentions'] if m['characterId']=='sextus']),76,ed)
   self.assertTrue(any(m['text']=='Gneius Pompey' and m['characterId']=='gnaeus-pompey' for m in d['mentions']))
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   self.assertNotIn('sextus',at(19,19))
 def test_namesakes_in_the_rolls(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # Marcus Octavius is one of Antony's captains, not Octavius Caesar.
   self.assertIn('marcus-octavius',at(19,38));self.assertIn('marcus-justeius',at(19,38))
   self.assertTrue(any(m['text']=='Marcus Octavius' and m['characterId']=='marcus-octavius' for m in d['mentions']))
   # Marcus Antonius is Antony; Marcus Crassus is the general Ventidius avenges.
   self.assertTrue(any(m['text']=='Marcus Antonius' and m['characterId']=='antony' for m in d['mentions']))
   self.assertTrue(any(m['text']=='Marcus Crassus' and m['characterId']=='marcus-crassus' for m in d['mentions']))
   # Two Ptolemys: Cleopatra's dead brother-husband and the son given Syria.
   self.assertIn('ptolemy-king',at(4,1));self.assertIn('ptolemy-king',at(4,3))
   self.assertIn('ptolemy-son',at(18,3));self.assertNotIn('ptolemy-king',at(18,3))
   # The Alexander of the enthronement is Cleopatra's son, not the Macedonian.
   self.assertIn('alexander-helios',at(18,3))
   self.assertEqual({(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='alexander-helios'},{(18,3)})
 def test_guard_is_a_body_of_men_not_a_watch_post(self):
  for d in self.asset['editions'].values():
   where={(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='guards'}
   # "Court of guard" is a post and "good guard for itself" is abstract.
   self.assertNotIn((34,1),where);self.assertNotIn((34,20),where);self.assertNotIn((26,2),where)
   self.assertIn((39,43),where)
 def test_gates_and_edition_omissions(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  self.assertEqual(self.report['editions']['original-en']['omittedEntities'],[])
  self.assertEqual(self.report['editions']['modern-en']['omittedEntities'],['ladies'])
  # The original prints the ligature where the modern does not.
  self.assertTrue(any(x['text']=='Phœbus' and x['characterId']=='phoebus' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Phoebus' and x['characterId']=='phoebus' for x in m['mentions']))
  for d in (o,m):
   c={x['id']:x for x in d['characters']}
   # The Roman marriage is a later development, not part of anyone's first card.
   self.assertNotIn('Octavia',c['antony']['snapshots'][0]['body'])
   self.assertNotIn('Antony',c['octavia']['snapshots'][0]['body'].split('married to')[0])
   for id in ['antony','octavia']:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(8,3) for s in c[id]['snapshots'][1:]),id)
   self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(30,7) for s in c['enobarbus']['snapshots'][1:]))
   # No card reports either death.
   for id in ['antony','cleopatra','enobarbus']:
    for s in c[id]['snapshots']:self.assertNotIn('dies',s['body']);self.assertNotIn('death',s['body'])
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(42,1513))
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
