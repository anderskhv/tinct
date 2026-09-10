import hashlib,json,re,unittest
from build_antigone import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class AntigoneContractTests(unittest.TestCase):
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
    if re.match(r'^[A-Z][A-Z ]+\.',text) or text.startswith('EURYDICE '):self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['startOffset']==0 for m in d['mentions']))
 def test_two_messengers_not_merged(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if 'SECOND MESSENGER' in m['text']:self.assertEqual(m['characterId'],'second-messenger')
 def test_references_and_aliases_present(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   self.assertTrue({'niobe','lycurgus','cleopatra','semele','hecate','erechtheus'}<={c['id'] for c in d['characters']})
 def test_stable_recognition_and_late_cast_hidden(self):
  for d in self.asset['editions'].values():
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
   self.assertNotIn('eurydice',{c['id'] for c in gallery(d,point(1,29,99999))})
   c=next(c for c in d['characters'] if c['id']=='haemon');self.assertIn('betrothed',c['snapshots'][0]['body']);self.assertNotIn('dies',c['snapshots'][0]['body'])
if __name__=='__main__':unittest.main()
