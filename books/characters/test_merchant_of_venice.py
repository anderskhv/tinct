import hashlib,json,unittest
from build_merchant_of_venice import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class MerchantContractTests(unittest.TestCase):
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
 def test_initial_recognition(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,phrase in [('antonio','merchant of the title'),('portia','heiress of Belmont'),('shylock','Jessica’s father'),('gobbo','Launcelet’s father'),('nerissa','waiting-woman')]:self.assertIn(phrase,cs[id]['snapshots'][0]['body'])
   for id in ['antonio','portia','shylock']:self.assertEqual(cs[id]['storyRole'],'central')
   self.assertEqual(cs['leah']['storyRole'],'reference');self.assertEqual(cs['morocco']['storyRole'],'supporting')
 def test_marriages_and_employment(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi,phrase in [('portia',16,1,'Bassanio’s wife'),('bassanio',16,1,'Portia’s husband'),('nerissa',16,12,'Gratiano’s wife'),('gratiano',16,12,'Nerissa’s husband'),('jessica',17,6,'Lorenzo’s wife'),('lorenzo',17,6,'Jessica’s husband'),('launcelet',5,50,'Bassanio’s servant')]:
    gate=cs[id]['snapshots'][1]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(ch,pi));self.assertNotIn(phrase,reminder(d,id,dict(gate,offset=gate['offset']-1))['body']);self.assertIn(phrase,reminder(d,id,gate)['body'])
 def test_audience_disguise_gates(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,n,ch,pi,phrase in [('portia',2,18,42,'courtroom disguise'),('nerissa',2,18,26,'courtroom disguise'),('balthazar-lawyer',1,18,42,'Portia'),('court-messenger',1,18,26,'Nerissa')]:
    gate=cs[id]['snapshots'][n]['availableAt'];self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(ch,pi));self.assertNotIn(phrase,reminder(d,id,dict(gate,offset=gate['offset']-1))['body']);self.assertIn(phrase,reminder(d,id,gate)['body'])
   self.assertFalse(any(m['characterId']=='portia' and m['text']=='Balthazar' for m in d['mentions']))
 def test_namesakes_and_clerks(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(1,34) and m['text']=='Portia'];self.assertEqual([m['characterId'] for m in ms],['portia','portia-roman'])
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['balthazar-servant']['firstMention']['chapterNumber'],16);self.assertEqual(cs['balthazar-lawyer']['firstMention']['chapterNumber'],18)
   for id in ['solanio','salarino','salerio','gobbo','launcelet','saxony','saxony-nephew']:self.assertIn(id,cs)
   self.assertTrue(any(m['text']=='Balthazar' and m['characterId']=='balthazar-lawyer' for m in d['mentions']))
   self.assertFalse(any(m['characterId']=='god' and m['text']=='Lord' and m['chapterNumber']!=5 for m in d['mentions']))
 def test_allusions_and_separate_moors(self):
  for ed,d in self.asset['editions'].items():
   cs={c['id']:c for c in d['characters']}
   self.assertEqual(cs['moor-woman']['firstMention']['chapterNumber'],17)
   self.assertEqual(cs['jesus']['firstMention']['chapterNumber'],3);self.assertEqual(cs['sibyl']['firstMention']['chapterNumber'],2)
   for id in ['aeson','hesione','rebecca','daniel','hagar','leah','chus','portia-roman']:self.assertIn(id,cs)
   self.assertFalse(any(m['characterId']=='morocco' and m['chapterNumber']==17 for m in d['mentions']))
 def test_complete_scope_and_short_cards(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),90);self.assertEqual(d['chapterCount'],20);self.assertEqual(d['paragraphCount'],779);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    for s in c['snapshots']:self.assertLessEqual(len(s['body'].split()),30)
if __name__=='__main__':unittest.main()
