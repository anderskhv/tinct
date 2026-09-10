import hashlib,json,unittest
from build_bacchae import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder
class BacchaeContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_hashes(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_god_known_from_prologue_and_short_cards(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='dionysus');card=reminder(d,'dionysus',c['firstMention'])
   self.assertIn('god of wine',card['body']);self.assertIn('human form',card['body'])
   self.assertEqual(card['role'],'central');self.assertTrue(all(len(c['snapshots'])==1 for c in d['characters']))
   a=next(c for c in d['characters'] if c['id']=='agave');self.assertIn('Pentheus’s mother',reminder(d,'agave',a['firstMention'])['body'])
 def test_two_messengers_and_voice(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text'] in ['MESSENGER','Messenger']:self.assertEqual(m['characterId'],'first-messenger' if m['chapterNumber']==7 else 'second-messenger')
    if m['text']=='THE VOICE':self.assertEqual(m['characterId'],'dionysus')
   self.assertTrue(any(m['characterId']=='second-messenger' and m['chapterNumber']==10 for m in d['mentions']))
 def test_scoped_references(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['text']=='stranger' and m['chapterNumber']==7 and m['paragraphIndex']==20 for m in d['mentions']))
   self.assertTrue(all(m['chapterNumber']==6 for m in d['mentions'] if m['characterId']=='dirce'))
   self.assertTrue(any(m['characterId']=='theban-women' and m['chapterNumber']==1 for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='chorus' and m['chapterNumber']==1 for m in d['mentions']))
   self.assertTrue(any(m['characterId']=='actaeon-father' and m['text'].endswith('father') for m in d['mentions']))
   self.assertFalse(any(m['text'] in ['Dian','Ismenus','Asopus'] for m in d['mentions']))
 def test_all_authored_entries_bound(self):
  for ed,d in self.asset['editions'].items():self.assertEqual(len(d['characters']),42);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
if __name__=='__main__':unittest.main()
