import hashlib,json,unittest
from build_othello import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class OthelloContractTests(unittest.TestCase):
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
 def test_ordinary_first_identities(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,phrase,ch,pi in [('desdemona','Othello’s wife',1,14),('emilia','Iago’s wife',3,71),('gratiano','Brabantio’s brother',1,47)]:
    c=cs[id];self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(ch,pi));self.assertIn(phrase,reminder(d,id,c['firstMention'])['body'])
   self.assertEqual(cs['iago']['storyRole'],'central');self.assertEqual(cs['bianca']['snapshots'][0]['body'],'Cassio’s lover in Cyprus.')
 def test_rank_changes_source_gated(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,n,phrase,ch,pi in [('cassio',1,'dismissed',6,93),('cassio',2,'governing Cyprus',11,137),('iago',1,'promoted',9,176)]:
    gate=cs[id]['snapshots'][n]['availableAt'];before=dict(gate,offset=gate['offset']-1);self.assertEqual((gate['chapterNumber'],gate['paragraphIndex']),(ch,pi));self.assertNotIn(phrase,reminder(d,id,before)['body']);self.assertIn(phrase,reminder(d,id,gate)['body'])
 def test_reported_magic_and_disputed_allusion(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   self.assertIn('Othello’s account',cs['egyptian']['snapshots'][0]['body']);self.assertIn('said by Othello',cs['sibyl']['snapshots'][0]['body']);self.assertIn('disputed',cs['judean']['snapshots'][0]['body'])
   self.assertFalse(any(m['characterId']=='barbary' and m['chapterNumber']==1 for m in d['mentions']))
   self.assertTrue(any(m['text']=='Roman' and m['characterId']=='cassio' for m in d['mentions']))
 def test_speakers_reports_and_family_separate(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch in [('venice-messenger',3),('cyprus-messenger',4),('othello-mother',10),('desdemona-mother',13),('barbary',13)]:self.assertEqual(cs[id]['firstMention']['chapterNumber'],ch)
   for id in ['senator-first','senator-second','gentleman-first','gentleman-second','gentleman-third','musician','herald','clown']:self.assertIn(id,cs)
 def test_whole_play_and_no_plot_recap_snapshots(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),55);self.assertEqual(d['chapterCount'],15);self.assertEqual(d['paragraphCount'],1391);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),3 if c['id']=='cassio' else 2 if c['id']=='iago' else 1)
if __name__=='__main__':unittest.main()
