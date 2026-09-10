import hashlib,json,unittest
from build_romeo_and_juliet import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class RomeoJulietContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_spans_hashes_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);t=ps[k[:2]]
    self.assertEqual(t.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,t)['id'],m['characterId'])
 def test_family_names_actual_addressees(self):
  for d in self.asset['editions'].values():
   for ch,pi,t,id in [(8,23,'Montague','romeo'),(25,18,'Montague','romeo'),(13,26,'Capulet','tybalt'),(3,22,'uncle Capulet','uncle-capulet')]:
    self.assertTrue(any(m['text']==t and m['characterId']==id and (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) for m in d['mentions']),(ch,pi,t,id))
   self.assertTrue(any(m['text']=='King of Cats' and m['characterId']=='tybalt' for m in d['mentions']))
   self.assertFalse(any(m['text']=='Prince' and m['characterId']=='prince' and (m['chapterNumber'],m['paragraphIndex'])==(10,11) for m in d['mentions']))
 def test_two_susans_and_guest_list_relatives(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};self.assertEqual(cs['susan-child']['firstMention']['chapterNumber'],4);self.assertEqual(cs['susan-grindstone']['firstMention']['chapterNumber'],6)
   self.assertNotEqual(cs['valentine']['id'],cs['valentio']['id']);self.assertIn('Mercutio',cs['valentine']['snapshots'][0]['body']);self.assertIn('Tybalt',cs['valentio']['snapshots'][0]['body'])
   self.assertEqual(cs['uncle-capulet']['firstMention']['chapterNumber'],3);self.assertEqual(cs['cousin-capulet']['firstMention']['chapterNumber'],6)
 def test_marriage_is_only_later_identity(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,phrase in [('romeo','Juliet’s husband'),('juliet','Romeo’s wife')]:
    gate=cs[id]['snapshots'][1]['availableAt'];before=dict(gate,offset=gate['offset']-1)
    self.assertNotIn(phrase,reminder(d,id,before)['body']);self.assertIn(phrase,reminder(d,id,gate)['body']);self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(14,22))
   self.assertIn('daughter',cs['juliet']['snapshots'][0]['body']);self.assertIn('nurse',cs['nurse']['snapshots'][0]['body'])
 def test_servants_and_musicians(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch in [('invitation-servant',3),('dinner-servant',4),('feast-first',6),('wedding-second',19),('kitchen-second',21),('musician-first',22)]:self.assertEqual(cs[id]['firstMention']['chapterNumber'],ch)
   self.assertTrue(any(m['text']=='Simon Catling' and m['characterId']=='musician-first' for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='watch-first' and (m['chapterNumber'],m['paragraphIndex'])==(25,74) for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='watch-third' and (m['chapterNumber'],m['paragraphIndex'])==(25,74) for m in d['mentions']))
 def test_places_and_homonyms_not_characters(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['characterId']=='peter' and (m['chapterNumber'],m['paragraphIndex'])==(17,44) for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='john' and m['chapterNumber']==2 for m in d['mentions']))
   cs={c['id']:c for c in d['characters']};self.assertIn('Trojan',cs['helen']['snapshots'][0]['body']);self.assertIn('guest',cs['helena']['snapshots'][0]['body'])
 def test_edition_specific_allusions_and_scope(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(d['chapterCount'],25);self.assertEqual(d['paragraphCount'],1062);self.assertEqual(len(d['characters']),99 if ed=='original-en' else 96)
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],['gods'] if ed=='original-en' else ['aurora','jove','sun-god','jesus'])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),2 if c['id'] in ['romeo','juliet'] else 1)
if __name__=='__main__':unittest.main()
