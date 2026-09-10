import hashlib,json,unittest
from build_werther import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class WertherTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_source_identity(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_ordinary_identity_from_first_encounter(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('charlotte',7,4),('albert',12,7),('wilhelm',2,0),('henry',80,1),('philip',9,1),('hans',9,1)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertIn('main character',cs['werther']['snapshots'][0]['body']);self.assertIn('engaged to Albert',cs['charlotte']['snapshots'][0]['body'])
 def test_marriage_and_shortened_reminder(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertNotIn('younger siblings',cs['charlotte']['snapshots'][1]['body'])
   for id,phrase in [('charlotte','married to Albert'),('albert','husband')]:
    g=cs[id]['snapshots'][-1]['availableAt'];self.assertEqual((g['chapterNumber'],g['paragraphIndex']),(47,1));self.assertNotIn(phrase,reminder(d,id,dict(g,offset=g['offset']-1))['body']);self.assertIn(phrase,reminder(d,id,g)['body'])
 def test_henry_background_is_gated(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='henry');g=c['snapshots'][1]['availableAt'];self.assertEqual((g['chapterNumber'],g['paragraphIndex']),(81,0));self.assertNotIn('secretary',reminder(d,'henry',dict(g,offset=g['offset']-1))['body']);self.assertIn('secretary',reminder(d,'henry',g)['body'])
 def test_namesakes_and_contextual_officials(self):
  for ed,d in self.asset['editions'].items():
   cases=[(2,0,'Leonora','leonora'),(12,12,'Leonora','fictitious-leonora'),(69,0,'N—','ill-n'),(84,103,'count','count-m')]
   for ch,pi,t,id in cases:self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(ch,pi,t,id) for m in d['mentions']))
   for m in d['mentions']:
    if m['chapterNumber']==65:self.assertNotEqual(m['characterId'],'judge')
    if m['chapterNumber']==49:self.assertNotEqual(m['characterId'],'ambassador')
   self.assertTrue(any(m['text']==('John' if ed=='original-en' else 'Hans') and m['characterId']=='hans' for m in d['mentions']))
 def test_distinct_servants_and_embedded_poem_families(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id in ('peasant','replacement','henry','pistol-servant','servant','charlotte-servant','colma-brother','erath-brother','arindal','torman','morglan'):self.assertIn(id,cs)
   self.assertEqual(cs['minona']['storyRole'],'reference');self.assertIn('Morar’s sister',cs['minona']['snapshots'][0]['body'])
 def test_complete_source_and_short_copy(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),139);self.assertEqual(d['chapterCount'],84);self.assertEqual(d['paragraphCount'],354);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    for s in c['snapshots']:self.assertLessEqual(len(s['body'].split()),30)
if __name__=='__main__':unittest.main()
