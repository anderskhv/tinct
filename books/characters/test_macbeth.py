import hashlib,json,re,unittest
from build_macbeth import compile_package,BASE,speaker_owner
from build_pilot import ROOT,normalized,key,point
from lookup_reference import resolve,reminder,gallery

class MacbethContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def ms(self,ed,ch,pi):return [m for m in self.asset['editions'][ed]['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)]
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_spans_hashes_and_disjoint_owners(self):
  for ed,d in self.asset['editions'].items():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);source=json.loads(raw)
   ps={(c['number'],i):normalized(p) for c in source['chapters'] for i,p in enumerate(c['paragraphs'])};seen=set()
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k)
    text=ps[k[:2]];self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_old_and_new_cawdor_in_same_speech(self):
  for ed in self.asset['editions']:
   matches=[m for m in self.ms(ed,3,29) if 'Cawdor' in m['text']]
   self.assertEqual([m['characterId'] for m in matches],['macbeth','cawdor','macbeth'])
   self.assertTrue(all(m['characterId']=='cawdor' for m in self.ms(ed,4,1) if 'Cawdor' in m['text']))
   self.assertTrue(all(m['characterId']=='macbeth' for m in self.ms(ed,4,10) if 'Cawdor' in m['text']))
 def test_title_changes_are_gated(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='macbeth');first=reminder(d,'macbeth',c['firstMention']);self.assertNotIn('Cawdor',first['body']);self.assertNotIn('King of Scotland',first['body'])
   for s in c['snapshots'][1:]:
    at=s['availableAt'];self.assertNotEqual(reminder(d,'macbeth',{**at,'offset':at['offset']-1})['body'],s['body']);self.assertEqual(reminder(d,'macbeth',at)['body'],s['body'])
   self.assertEqual(reminder(d,'macbeth',c['firstMention']),first)
 def test_two_doctors_are_not_merged(self):
  for ed in self.asset['editions']:
   self.assertEqual([m['characterId'] for m in self.ms(ed,20,23) if 'Doctor' in m['text']],['english-doctor'])
   self.assertEqual([m['characterId'] for m in self.ms(ed,21,0) if 'Doctor' in m['text']],['scottish-doctor'])
 def test_first_murderer_in_macduff_scene_is_separate(self):
  for ed in self.asset['editions']:
   self.assertEqual(self.ms(ed,19,40)[0]['characterId'],'macduff-murderer')
   self.assertEqual(self.ms(ed,12,23)[0]['characterId'],'first-murderer')
 def test_father_son_and_husband_wife_labels(self):
  for ed in self.asset['editions']:
   self.assertEqual([m['characterId'] for m in self.ms(ed,27,2)],['young-siward'])
   self.assertEqual([m['characterId'] for m in self.ms(ed,5,1) if m['startOffset']==0],['lady-macbeth'])
   self.assertEqual([m['characterId'] for m in self.ms(ed,19,0) if 'Lady Macduff' in m['text']],['lady-macduff'])
 def test_apparitions_are_not_explained_by_later_outcomes(self):
  for ed,d in self.asset['editions'].items():
   for pi,id in [(27,'armed-head'),(34,'bloody-child'),(40,'crowned-child')]:
    self.assertEqual([m['characterId'] for m in self.ms(ed,18,pi) if m['text']=='Apparition'],[id])
    card=next(c for c in d['characters'] if c['id']==id);body=card['snapshots'][0]['body'];self.assertNotIn('Macduff',body);self.assertNotIn('Malcolm',body)
   early={c['id'] for c in gallery(d,point(1,11,9999))};self.assertNotIn('banquo-ghost',early)
 def test_every_individual_speaker_has_binding(self):
  for ed,d in self.asset['editions'].items():
   source=json.loads((ROOT/d['sourcePath']).read_text())
   for c in source['chapters']:
    for pi,p in enumerate(c['paragraphs']):
     m=re.match(r'^([A-Z][A-Z ]+)\.',p)
     if not m or m.group(1) in {'ALL','SOLDIERS'}:continue
     owner=speaker_owner(m.group(1),c['number'],pi);self.assertIsNotNone(owner,m.group(1));self.assertTrue(any(x['startOffset']==0 and x['characterId']==owner for x in self.ms(ed,c['number'],pi)))
 def test_modern_references_not_invented(self):
  ids={c['id'] for c in self.asset['editions']['modern-en']['characters']}
  for id in ['paddock','harpier','bellona','neptune','belzebub']:self.assertNotIn(id,ids)

if __name__=='__main__':unittest.main()
