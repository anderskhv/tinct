import hashlib,json,unittest
from build_much_ado_about_nothing import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class MuchAdoTests(unittest.TestCase):
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
 def test_masked_assumed_names(self):
  for d in self.asset['editions'].values():
   for ch,pi,name,id in [(1,120,'Claudio','pedro'),(4,72,'Benedick','claudio'),(4,80,'Benedick','claudio')]:self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(ch,pi,name,id) for m in d['mentions']))
 def test_window_aliases_and_accusations(self):
  for d in self.asset['editions'].values():
   for pi,ch,want in [(14,5,['hero','margaret','hero','hero']),(63,9,['hero','margaret'])]:
    self.assertEqual([m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'],m['text'])==(ch,pi,'Hero')],want)
   self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(5,14,'Claudio','borachio') for m in d['mentions']))
 def test_three_francis_seacoal_roles(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch in [('george',9),('francis-seacoal',11),('friar',12)]:self.assertEqual(cs[id]['firstMention']['chapterNumber'],ch)
   self.assertTrue(all(m['characterId']=='george' for m in d['mentions'] if m['text']=='SECOND WATCH'))
   self.assertTrue(all(m['characterId']=='first-watch' for m in d['mentions'] if m['text']=='FIRST WATCH'))
 def test_two_adams_and_europa_not_continent(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text']=='Adam':self.assertEqual(m['characterId'],'adam-bell' if m['chapterNumber']==1 else 'adam')
   self.assertEqual(len([m for m in d['mentions'] if m['characterId']=='europa']),1)
 def test_three_messengers_and_imaginary_thief(self):
  for d in self.asset['editions'].values():
   for m in d['mentions']:
    if m['text'].lower()=='messenger':self.assertEqual(m['characterId'],{1:'army-messenger',11:'wedding-messenger',17:'capture-messenger'}[m['chapterNumber']])
   cs={c['id']:c for c in d['characters']};self.assertIn('imaginary',cs['deformed']['snapshots'][0]['body'])
 def test_no_false_death_or_completed_marriages(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};self.assertIn('secretly alive',cs['hero']['snapshots'][2]['body']);self.assertNotIn('dead',cs['hero']['snapshots'][0]['body'])
   for id in ['hero','claudio','beatrice','benedick']:self.assertIn('intended',cs[id]['snapshots'][-1]['body'])
   self.assertEqual(cs['beatrice']['snapshots'][-1]['availableAt']['paragraphIndex'],63)
 def test_full_scope_and_categories(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),60);self.assertEqual(d['chapterCount'],17);self.assertEqual(d['paragraphCount'],1118);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   self.assertEqual({c['id'] for c in d['characters'] if c['storyRole']=='central'},{'hero','claudio','beatrice','benedick'})
if __name__=='__main__':unittest.main()
