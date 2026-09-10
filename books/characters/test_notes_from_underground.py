import hashlib,json,unittest
from build_notes_from_underground import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class UndergroundContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);t=ps[k[:2]]
    self.assertEqual(t.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,t)['id'],m['characterId'])
 def test_narrator_author_and_epigraph_not_confused(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['underground-man']['storyRole'],'central');self.assertEqual(cs['dostoevsky']['storyRole'],'reference')
   self.assertTrue(any(m['characterId']=='underground-man' and m['text'] in ['author of the diary','author of this diary'] for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='underground-man' and (m['chapterNumber'],m['paragraphIndex'])==(12,0) for m in d['mentions']))
   self.assertIn('translator',cs['soskice']['snapshots'][0]['body']);self.assertIn('poet',cs['nekrasov']['snapshots'][0]['body'])
 def test_officers_and_servants_remain_distinct(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch in [('office-officer',1),('tavern-officer',12),('country-servant',1),('apollon',14)]:self.assertEqual(cs[id]['firstMention']['chapterNumber'],ch)
   self.assertFalse(any(m['characterId']=='tavern-officer' and m['chapterNumber']!=12 for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='madam' and m['chapterNumber']==17 for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='other-madam' and m['chapterNumber']==17 for m in d['mentions']))
 def test_liza_plain_identity_without_narrator_judgments(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='liza');self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(16,24))
   r=reminder(d,'liza',c['firstMention']);self.assertIn('Riga',r['body']);self.assertIn('brothel',r['body']);self.assertNotIn('fallen',r['body']);self.assertEqual(len(c['snapshots']),1)
 def test_named_allusions_and_two_napoleons(self):
  for d in self.asset['editions'].values():
   for text,id in [('Napoleon','napoleon-i'),('the present one','napoleon-iii'),('Gay','ge'),('Silvio','silvio'),('Juliet Soskice','soskice')]:self.assertTrue(any(m['text']==text and m['characterId']==id for m in d['mentions']))
   self.assertFalse(any(m['text'] in ['Lafitte','Borghese','Yusupov','Masquerade'] for m in d['mentions']))
 def test_all_chapters_and_short_recognition(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),79);self.assertEqual(d['chapterCount'],21);self.assertEqual(d['paragraphCount'],495);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
