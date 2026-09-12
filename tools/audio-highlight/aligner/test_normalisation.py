"""Revision-2 helper: expected-side markup normalisation and compound joining.

Each approved class has a positive and a negative case; the last test proves a
paragraph without markup aligns byte-for-byte identically under both pins.
"""
import hashlib,json,re,unittest
from pathlib import Path
from types import SimpleNamespace as NS
import pinned_words_sidecar_lib as v1
import pinned_words_sidecar_lib_v2 as v2
import trial

def heard(words,step=.2):return [v2.HeardWord(w,i*step,(i+1)*step) for i,w in enumerate(words)]
def keys(text):return v2.expected_comparison_keys(v2.chapter_words_from_text(v2.clean_text(text)))
class Model:
 def __init__(self,words):self.words=words
 def transcribe(self,path,**kwargs):
  words=[NS(word=w,start=i*.2,end=(i+1)*.2,probability=.8) for i,w in enumerate(self.words)]
  return iter([NS(text=' '.join(self.words),start=0,end=len(words)*.2,words=words)]),NS()

class Underscores(unittest.TestCase):
 def test_emphasis_stripped_from_expected_side(self):
  self.assertEqual(keys('_To Mrs. Saville, England._'),['to','mrs','saville','england'])
  d=v2.align_tokens_detailed('_To Mrs. Saville, England._'.split(),heard(['To','Mrs.','Saville,','England.']))
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(4,4));self.assertEqual([w['text'] for w in d.words],['_To','Mrs.','Saville,','England._'])
 def test_v1_kept_underscores_and_rejected(self):
  words,stats=v1.align_tokens_with_stats('_To Mrs. Saville, England._'.split(),heard(['To','Mrs.','Saville,','England.']))
  self.assertEqual(stats.matched_words,2)
 def test_underscore_only_token_is_unspoken_but_a_different_word_still_fails(self):
  self.assertEqual(keys('_ word'),[None,'word'])
  d=v2.align_tokens_detailed('_To_ leave'.split(),heard(['Two','leave']))
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(2,1))

class Brackets(unittest.TestCase):
 def test_numeric_and_labelled_footnote_markers_removed(self):
  self.assertEqual(keys('[28] Luciani [Greek: eunouchos].'),[None,'luciani',None,None])
  self.assertEqual(keys('[4] Cause and effect.'),[None,'cause','and','effect'])
  self.assertEqual(keys('word[3], next'),['word','next'])
  self.assertEqual(keys('a [Footnote: Like the frog: staccato.] b'),['a',None,None,None,None,None,'b'])
 def test_removed_marker_tokens_are_excluded_from_the_ratio_and_still_timed(self):
  d=v2.align_tokens_detailed('[4] Cause and effect.'.split(),heard(['For','cause','and','effect.']))
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(3,3));self.assertEqual(d.unspoken,[0]);self.assertEqual(len(d.words),4)
  self.assertLessEqual(d.words[0]['end'],d.words[1]['start'])
 def test_stage_directions_and_other_brackets_stay_in_the_comparison(self):
  self.assertEqual(keys('[Re-enter Boatswain]'),['reenter','boatswain'])
  self.assertEqual(keys('[Enter Roderigo and Iago.]'),['enter','roderigo','and','iago'])
  self.assertEqual(keys('[the halibut]'),['the','halibut'])
  d=v2.align_tokens_detailed('[Enter Roderigo and Iago.]'.split(),[])
  self.assertEqual(d.stats.expected_words,4)

class EllipsesAndDashes(unittest.TestCase):
 def test_spaced_ellipsis_pieces_are_separators(self):
  self.assertEqual(keys('seek for more. . . .'),['seek','for','more',None,None,None])
  self.assertEqual(keys('Jason. . . . Who slew them!'),['jason',None,None,None,'who','slew','them'])
  self.assertEqual(keys('There . . ., in Riga.'),['there',None,None,None,'in','riga'])
  d=v2.align_tokens_detailed('Jason. . . . Who slew them!'.split(),heard(['Jason,','Who','slew','them!']))
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(4,4));self.assertEqual(len(d.words),7)
 def test_lone_punctuation_keeps_revision_one_key(self):
  self.assertEqual(keys('wait — now'),['wait','','now']);self.assertEqual(keys('one . two'),['one','','two'])
 def test_standalone_double_hyphen_is_a_separator(self):
  self.assertEqual(keys('the king -- both'),['the','king',None,'both']);self.assertEqual(keys('rule ------ end'),['rule',None,'end'])
  self.assertEqual(keys('a - b'),['a','','b'])
 def test_double_hyphen_inside_a_token_joins_the_heard_words(self):
  text='The maiden princess lieth--and her sire, The king--both murdered.'
  d=v2.align_tokens_detailed(text.split(),heard(['The','maiden','princess','lieth','and','her','sire,','The','king','both','murdered.']))
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(9,9))
  self.assertEqual([m['text'] for m in d.merges],['lieth--and','king--both'])
  lieth=next(w for w in d.words if w['text']=='lieth--and');self.assertEqual((lieth['start'],lieth['end']),(0.6,1.0))
 def test_v1_counted_the_pieces_as_mismatches(self):
  _,stats=v1.align_tokens_with_stats('The king--both murdered.'.split(),heard(['The','king','both','murdered.']))
  self.assertEqual(stats.matched_words,2)

class HyphenCompounds(unittest.TestCase):
 def test_split_compound_matches_as_one_token_with_spanning_timing(self):
  d=v2.align_tokens_detailed('Let us now take wage-labour.'.split(),heard(['Let','us','now','take','wage','-labour.']))
  self.assertEqual((d.stats.expected_words,d.stats.heard_words,d.stats.matched_words),(5,5,5));self.assertEqual(d.stats.match_ratio,1.0)
  self.assertEqual(d.words[4],dict(text='wage-labour.',start=0.8,end=1.2));self.assertEqual(d.merges[0]['heard_indexes'],[4,5])
 def test_one_token_paragraph(self):
  d=v2.align_tokens_detailed(['Fellow-rulers.'],heard(['Fellow','-rulers.']))
  self.assertEqual(d.stats.match_ratio,1.0);self.assertEqual(d.words,[dict(text='Fellow-rulers.',start=0.0,end=0.4)])
 def test_repeated_and_three_piece_compounds(self):
  d=v2.align_tokens_detailed('"Good-night, good-night!" Tut-tut-tut.'.split(),heard(['Good','night,','good','night!','Tut','tut','tut.']))
  self.assertEqual(d.stats.matched_words,3);self.assertEqual(len(d.merges),3)
 def test_unsplit_compound_still_matches_directly(self):
  d=v2.align_tokens_detailed('a heart-broken tone'.split(),heard(['a','heartbroken','tone']))
  self.assertEqual(d.stats.matched_words,3);self.assertEqual(d.merges,[])
 def test_different_spelling_is_not_joined(self):
  d=v2.align_tokens_detailed('Let us now take wage-labour.'.split(),heard(['Let','us','now','take','wage','labor.']))
  self.assertEqual(d.stats.matched_words,4);self.assertEqual(d.merges,[]);self.assertEqual(d.stats.match_ratio,0.8)
 def test_pieces_outside_an_unresolved_block_are_not_joined(self):
  d=v2.align_tokens_detailed('as well being a well-being'.split(),heard(['as','well','being','a','well','being']))
  self.assertEqual(d.stats.matched_words,5);self.assertEqual([m['text'] for m in d.merges],['well-being'])
  self.assertEqual([w['text'] for w in d.words][:3],['as','well','being'])
 def test_no_timestamp_is_synthesised(self):
  d=v2.align_tokens_detailed('one two-three four'.split(),heard(['one','four']))
  self.assertEqual(d.stats.matched_words,2);self.assertEqual(d.merges,[]);self.assertEqual(d.words[1]['end'],d.words[2]['start'])
  self.assertEqual(d.stats.match_ratio,2/3)

class GateUnchanged(unittest.TestCase):
 def test_gate_still_85_and_applied_to_spoken_tokens(self):
  self.assertEqual(trial.GATE,.85)
  words=['w'+str(i) for i in range(20)]
  self.assertEqual(trial.attempt(Model(words[:17]),'unused',' '.join(words),'off')['rejection_reasons'],[])
  self.assertIn('observed_alignment_below_85_percent',trial.attempt(Model(words[:16]),'unused',' '.join(words),'off')['rejection_reasons'])
  r=trial.attempt(Model(words[:16]),'unused','[1] '+' '.join(words),'off');self.assertEqual(r['stats']['expected_words'],20);self.assertIn('observed_alignment_below_85_percent',r['rejection_reasons'])
 def test_trial_provenance_marks_unspoken_and_joined(self):
  r=trial.attempt(Model(['Let','us','take','wage','-labour.']),'unused','[2] Let us take wage-labour.','off')
  self.assertEqual([p['source'] for p in r['provenance']],['unspoken','observed','observed','observed','observed'])
  self.assertEqual(r['rejection_reasons'],[]);self.assertEqual(len(r['candidate_words']),5);self.assertEqual(r['merges'][0]['text'],'wage-labour.')

class Pins(unittest.TestCase):
 def test_pins_file_records_both_helper_hashes(self):
  pins=(Path(__file__).parent/'PINS.md').read_text()
  for module in (v1,v2):
   digest=hashlib.sha256(Path(module.__file__).read_bytes()).hexdigest();self.assertIn(digest,pins,module.__name__)
 def test_v2_is_selectable_and_reproduces_itself(self):
  # The default moved to v3 in run 3 (test_normalisation_v3.Pins); v2 must still
  # be selectable and must still be the module these cases measure.
  self.assertIs(trial.select_helper('v2'),v2);self.assertIs(trial.select_helper('v1'),v1);trial.select_helper('v2')
 def test_paragraph_without_markup_is_identical_under_both_pins(self):
  text='I write a few lines in haste to say that I am safe—and well advanced on my voyage. This letter will reach England by a merchantman; more fortunate than I, who may not see my native land, perhaps, for many years.'
  expected=v2.chapter_words_from_text(v2.clean_text(text))
  spoken=['I','write','a','few','lines','in','haste','to','say','that','I','am','safe','and','well','advanced','on','my','voyage.','This','letter','will','reach','England','by','a','merchant','man;','more','fortunate','than','I','who','may','not','see','my','native','land','perhaps','for','many','years.']
  a=v1.align_tokens_with_stats(expected,heard(spoken));b=v2.align_tokens_with_stats(expected,heard(spoken))
  self.assertEqual(json.dumps(a[0]),json.dumps(b[0]));self.assertEqual(a[1].__dict__,b[1].__dict__);self.assertLess(a[1].match_ratio,1.0)
  for pin in ('v1','v2'):
   trial.select_helper(pin);r=trial.attempt(Model(spoken),'unused',text,'off');self.assertEqual(json.dumps(r['candidate_words']),json.dumps(a[0]));self.assertEqual(r['stats'],a[1].__dict__)
  trial.select_helper(trial.DEFAULT_HELPER)
if __name__=='__main__':unittest.main()
