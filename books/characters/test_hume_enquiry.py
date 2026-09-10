import hashlib,json,unittest
from build_hume_enquiry import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class HumeEnquiryTests(unittest.TestCase):
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
 def test_two_alexanders(self):
  for d in self.asset['editions'].values():
   for ch,pi,id in [(11,7,'alexander-great'),(15,8,'alexander-prophet'),(15,9,'alexander-prophet'),(15,11,'alexander-great')]:
    ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(ch,pi,'Alexander')];self.assertTrue(ms);self.assertTrue(all(m['characterId']==id for m in ms))
 def test_catos_and_italicized_citation(self):
  for d in self.asset['editions'].values():
   for ch,pi,name,id in [(7,8,'Catonem','cato-elder'),(14,8,'Cato','cato-younger'),(14,9,'Catonis','cato-younger'),(7,9,'Cicero','cicero')]:
    self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(ch,pi,name,id) for m in d['mentions']))
 def test_conversation_not_all_first_person_or_actual_epicurus_speech(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['characterId'] in ('friend','hume-dialogue'):self.assertEqual(m['chapterNumber'],16)
    if m['characterId']=='hume-dialogue':self.assertFalse(11<=m['paragraphIndex']<=25)
   chars={c['id']:c for c in d['characters']};self.assertEqual(chars['friend']['storyRole'],'supporting');self.assertEqual(chars['epicurus']['storyRole'],'reference')
 def test_paris_person_not_city_and_distinct_cure_subjects(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['text']=='Paris' for m in d['mentions']))
   for id in ('blind-man','lame-man','doorkeeper','le-franc','thibaut','chatillon-servant','marguerite'):
    self.assertTrue(any(c['id']==id for c in d['characters']))
 def test_no_invented_outcomes_or_missing_reference_entries(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),89);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
   q=next(c for c in d['characters'] if c['id']=='elizabeth');self.assertIn('imaginary',q['snapshots'][0]['body'])
if __name__=='__main__':unittest.main()
