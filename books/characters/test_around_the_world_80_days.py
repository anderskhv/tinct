import hashlib,json,unittest
from build_around_the_world_80_days import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class AroundWorldContractTests(unittest.TestCase):
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
 def test_first_identities_are_useful(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi,phrase in [('passepartout',1,13,'French valet'),('fix',5,11,'detective'),('aouda',12,20,'Parsi widow'),('bunsby',20,16,'skipper'),('mudge',30,53,'sail-powered'),('speedy',32,7,'Henrietta')]:
    c=cs[id];self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(ch,pi));self.assertIn(phrase,c['snapshots'][0]['body'])
   self.assertEqual(cs['fogg']['storyRole'],'central');self.assertEqual(cs['passepartout']['storyRole'],'central');self.assertEqual(cs['fix']['storyRole'],'major');self.assertEqual(cs['cromarty']['storyRole'],'supporting');self.assertEqual(cs['stephenson']['storyRole'],'reference')
 def test_marriage_and_robber_gates(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi,phrase in [('fogg',37,31,'husband'),('aouda',37,31,'Fogg’s wife'),('bank-robber',36,0,'James Strand')]:
    gate=cs[id]['snapshots'][1]['availableAt'];before=dict(gate,offset=gate['offset']-1);self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(ch,pi));self.assertNotIn(phrase,reminder(d,id,before)['body']);self.assertIn(phrase,reminder(d,id,gate)['body'])
   self.assertEqual(cs['strand']['firstMention']['chapterNumber'],36)
   self.assertNotIn('criminal',cs['fogg']['snapshots'][0]['body']);self.assertNotIn('robber',cs['fogg']['snapshots'][0]['body'])
 def test_namesakes_and_suspicions_separate(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['james-forster']['firstMention']['chapterNumber'],1);self.assertEqual(cs['engineer-forster']['firstMention']['chapterNumber'],28)
   self.assertEqual(cs['jeejeeh']['firstMention']['chapterNumber'],14);self.assertEqual(cs['jeejeebhoy']['firstMention']['chapterNumber'],16)
   self.assertFalse(any(m['characterId']=='bank-robber' and m['chapterNumber'] not in [3,34] for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='engineer-forster' and m['chapterNumber']==29 and m['paragraphIndex']==3 for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='sioux-attackers' and m['chapterNumber']==29 and m['paragraphIndex']==3 for m in d['mentions']))
 def test_reference_boundaries(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertIn('Hitch’s account',cs['mormon-son']['snapshots'][0]['body'])
   self.assertEqual(cs['stephenson']['snapshots'][0]['name'],'Robert Stephenson')
   for id in ['god','uranus','neptune','bradshaw','general-grant','cornwallis']:self.assertNotIn(id,cs)
   self.assertEqual(cs['bombay-priests']['firstMention']['chapterNumber'],10);self.assertEqual(cs['pillaji-priests']['firstMention']['chapterNumber'],12)
 def test_whole_book_and_short_recognition_cards(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),111);self.assertEqual(d['chapterCount'],37);self.assertEqual(d['paragraphCount'],1613);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    self.assertEqual(len(c['snapshots']),2 if c['id'] in ['fogg','aouda','bank-robber'] else 1)
    for s in c['snapshots']:self.assertLessEqual(len(s['body'].split()),30)
if __name__=='__main__':unittest.main()
