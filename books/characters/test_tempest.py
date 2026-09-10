import hashlib,json,re,unittest
from build_tempest import compile_package,BASE,SPEAKERS
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder,gallery
class TempestContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def ms(self,ed,ch,pi):return [m for m in self.asset['editions'][ed]['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)]
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_source_hashes(self):
  for ed,d in self.asset['editions'].items():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);source=json.loads(raw);seen=set()
   ps={(c['number'],i):normalized(p) for c in source['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_concealed_background_and_later_engagement_are_gated(self):
  for d in self.asset['editions'].values():
   for id,forbidden in [('prospero','Duke'),('antonio','brother'),('miranda','marry'),('ferdinand','marry')]:
    c=next(c for c in d['characters'] if c['id']==id);first=reminder(d,id,c['firstMention']);self.assertNotIn(forbidden,first['body'])
    for s in c['snapshots'][1:]:
     at=s['availableAt'];self.assertNotEqual(reminder(d,id,{**at,'offset':at['offset']-1})['body'],s['body']);self.assertEqual(reminder(d,id,at)['body'],s['body'])
    self.assertEqual(reminder(d,id,c['firstMention']),first)
 def test_dukes_not_merged(self):
  for ed in self.asset['editions']:
   self.assertEqual([m['characterId'] for m in self.ms(ed,2,138) if 'Duke' in m['text']],['antonio'])
   self.assertEqual([m['characterId'] for m in self.ms(ed,2,139) if 'Duke' in m['text']],['prospero'])
   self.assertIn('antonio-son',[m['characterId'] for m in self.ms(ed,2,138)])
 def test_ship_master_not_prosperos_title_or_song_character(self):
  for ed in self.asset['editions']:
   self.assertIn('master',[m['characterId'] for m in self.ms(ed,9,16)])
   self.assertNotIn('master',[m['characterId'] for m in self.ms(ed,2,50)])
   self.assertFalse({'master','boatswain'}&{m['characterId'] for m in self.ms(ed,4,11)})
 def test_nobody_and_hound_names_not_common_words(self):
  for ed in self.asset['editions']:
   self.assertNotIn('nobody',[m['characterId'] for m in self.ms(ed,1,15)])
   self.assertIn('nobody',[m['characterId'] for m in self.ms(ed,6,60)])
   for id,pi in [('mountain',90),('silver',91),('fury',92),('tyrant',92)]:
    self.assertTrue(all(m['chapterNumber']==8 and m['paragraphIndex']==pi for m in self.asset['editions'][ed]['mentions'] if m['characterId']==id))
 def test_masque_roles_not_revealed_early(self):
  for d in self.asset['editions'].values():
   early={c['id'] for c in gallery(d,point(2,174,9999))};self.assertFalse({'iris','ceres','juno','hounds'}&early)
   for id in ['iris','ceres','juno']:
    c=next(c for c in d['characters'] if c['id']==id);self.assertEqual(c['kind'],'dramatic-role');self.assertIn('masque',c['snapshots'][0]['body'])
 def test_all_printed_speaker_labels_have_exact_binding(self):
  for ed,d in self.asset['editions'].items():
   for c in json.loads((ROOT/d['sourcePath']).read_text())['chapters']:
    for pi,p in enumerate(c['paragraphs']):
     m=re.match(r'^([A-Z][A-Z ]+)\.',p)
     if m:self.assertTrue(any(x['startOffset']==0 and x['characterId']==SPEAKERS[m.group(1)] for x in self.ms(ed,c['number'],pi)))
 def test_edition_omissions_explicit(self):self.assertEqual(self.report['editions']['modern-en']['omittedEntities'],['hymen','phoebus'])
if __name__=='__main__':unittest.main()
