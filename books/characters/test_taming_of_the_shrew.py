import hashlib,json,unittest
from build_taming_of_the_shrew import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class ShrewTests(unittest.TestCase):
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
 def test_two_lucentios_in_one_speech(self):
  for d in self.asset['editions'].values():
   for ch,pi,want in [(1,62,['tranio','lucentio']),(1,71,['lucentio','tranio']),(4,12,['lucentio','tranio']),(11,52,['tranio','lucentio'])]:
    self.assertEqual([m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(ch,pi,'Lucentio')],want)
 def test_pedant_is_not_the_tutor_insult(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};self.assertEqual((cs['pedant']['firstMention']['chapterNumber'],cs['pedant']['firstMention']['paragraphIndex']),(7,31))
   self.assertTrue(all(m['characterId']=='lucentio' for m in d['mentions'] if m['chapterNumber']==4 and m['text']=='pedant'))
 def test_fake_and_real_vincentio(self):
  for d in self.asset['editions'].values():
   self.assertEqual([m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(7,35,'Vincentio')],['pedant','vincentio'])
   self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['characterId'])==(11,51,'pedant') for m in d['mentions']))
   self.assertFalse(any((m['chapterNumber'],m['paragraphIndex'])==(3,168) and m['characterId']=='pedant' for m in d['mentions']))
 def test_two_first_servants_and_two_priests(self):
  for d in self.asset['editions'].values():
   self.assertEqual([m['characterId'] for m in d['mentions'] if m['text']=='FIRST SERVANT'],['frame-servant','petruchio-servant'])
   for m in d['mentions']:
    if m['text']=='priest':self.assertEqual(m['characterId'],'wedding-priest' if m['chapterNumber']==5 else 'luke-priest')
 def test_troilus_dog_and_pegasus_inn(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};self.assertEqual(cs['troilus']['kind'],'animal');self.assertIn('cousin',cs['ferdinand']['snapshots'][0]['body']);self.assertFalse(any(m['text']=='Pegasus' for m in d['mentions']))
 def test_marriage_and_disguise_gates(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('katherina',5,61),('petruchio',5,61),('bianca',11,75),('lucentio',11,75),('widow',12,1)]:
    at=cs[id]['snapshots'][-1]['availableAt'];self.assertEqual((at['chapterNumber'],at['paragraphIndex']),(ch,pi))
   self.assertNotIn('impersonate',cs['pedant']['snapshots'][0]['body']);self.assertEqual(cs['pedant']['snapshots'][-1]['availableAt']['paragraphIndex'],55)
   self.assertEqual(cs['katherina']['storyRole'],'central');self.assertEqual(cs['petruchio']['storyRole'],'central');self.assertEqual(cs['aristotle']['storyRole'],'reference')
 def test_reference_spellings_and_full_scope(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),72);self.assertEqual(d['chapterCount'],12);self.assertEqual(d['paragraphCount'],1021);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   self.assertTrue({'priam','griselda','europa','helen','aeacus'}<={c['id'] for c in d['characters']})
if __name__=='__main__':unittest.main()
