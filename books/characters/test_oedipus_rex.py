import hashlib,json,re,unittest
from build_oedipus_rex import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder,gallery
class OedipusContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_speakers(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
   for (ch,pi),text in ps.items():
    if re.match(r'^[A-Z][A-Z ]+\.',text):self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['startOffset']==0 for m in d['mentions']))
 def test_family_revelation_gates_and_backward_navigation(self):
  for d in self.asset['editions'].values():
   for id in ['oedipus','jocasta','laius','polybus','merope']:
    c=next(c for c in d['characters'] if c['id']==id);s=c['snapshots'][-1];at=s['availableAt']
    self.assertNotEqual(reminder(d,id,{**at,'offset':at['offset']-1})['body'],s['body']);self.assertEqual(reminder(d,id,at)['body'],s['body']);self.assertEqual(reminder(d,id,c['firstMention'])['body'],c['snapshots'][0]['body'])
   self.assertNotIn('son',next(c for c in d['characters'] if c['id']=='oedipus')['snapshots'][0]['body'])
 def test_two_messengers_not_merged(self):
  for d in self.asset['editions'].values():
   for id,chs in [('messenger',{8,9}),('second-messenger',{11})]:self.assertTrue(all(m['chapterNumber'] in chs for m in d['mentions'] if m['characterId']==id))
 def test_silent_daughters_only_appear_when_introduced(self):
  for d in self.asset['editions'].values():
   self.assertFalse({'antigone','ismene'}&{c['id'] for c in gallery(d,point(10,3,99999))})
   for id in ['antigone','ismene']:
    c=next(c for c in d['characters'] if c['id']==id);self.assertEqual(c['firstMention']['chapterNumber'],11)
 def test_divine_epithets_and_no_omissions(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for word in ['Ismenus','Loxias','Phoebus']:self.assertTrue(all(m['characterId']=='apollo' for m in d['mentions'] if m['text']==word))
   self.assertTrue(any(m['characterId']=='hermes' for m in d['mentions']))
if __name__=='__main__':unittest.main()
