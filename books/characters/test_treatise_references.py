import hashlib,json,unittest
import build_manual,build_art_of_war
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class TreatiseReferenceTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.packages=[(m,m.compile_package()) for m in [build_manual,build_art_of_war]]
 def test_saved_packages_current(self):
  for m,(asset,_,__) in self.packages:self.assertEqual(asset,json.loads((m.BASE/'characters.v1.json').read_text()))
 def test_all_spans_hashes_and_lookup(self):
  for _,(asset,__,___) in self.packages:
   for d in asset['editions'].values():
    raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
    ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
    for m in d['mentions']:
     k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
     self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_reference_categories_without_invented_protagonists(self):
  for _,(asset,__,___) in self.packages:
   for d in asset['editions'].values():
    for c in d['characters']:self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
 def test_edition_omissions(self):
  self.assertEqual(self.packages[0][1][1]['editions']['modern-en']['omittedEntities'],['euphrates','caesar'])
  self.assertEqual(self.packages[1][1][1]['editions']['modern-en']['omittedEntities'],['chu','kuei'])
 def test_transliterations_and_title(self):
  a=self.packages[0][1][0];o=a['editions']['original-en'];m=a['editions']['modern-en']
  self.assertIn('Cæsar',[x['text'] for x in o['mentions'] if x['characterId']=='caesar'])
  self.assertIn('Heracleitus',[x['text'] for x in o['mentions'] if x['characterId']=='heraclitus'])
  self.assertIn('Heraclitus',[x['text'] for x in m['mentions'] if x['characterId']=='heraclitus'])
  self.assertEqual(next(c for c in o['characters'] if c['id']=='caesar')['kind'],'title-reference')
 def test_late_references_hidden_in_opening(self):
  for _,(asset,__,___) in self.packages:
   for d in asset['editions'].values():
    ids={c['id'] for c in gallery(d,point(1,0,99999))};self.assertFalse({'chrysippus','yi-zhi','lu-ya'}&ids)
if __name__=='__main__':unittest.main()
