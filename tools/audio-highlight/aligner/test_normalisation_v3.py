"""Revision-3 helper: gluing one expected token to several recognised ones,
the mirror case, and contractions.

Each class has a positive and a negative case. The last group proves revision 3
is a superset of revision 2 — every join revision 2 made is still made — and
that the gate, the pins and the "nothing outside a recognised span" rule are
untouched.
"""
import hashlib,json,unittest
from pathlib import Path
from types import SimpleNamespace as NS
import pinned_words_sidecar_lib as v1
import pinned_words_sidecar_lib_v2 as v2
import pinned_words_sidecar_lib_v3 as v3
import trial

def heard(words,step=.2):return [v3.HeardWord(w,round(i*step,3),round((i+1)*step,3)) for i,w in enumerate(words)]
def ratio(text,spoken,lib=v3):
 d=lib.align_tokens_detailed(text.split(),heard(spoken));return d
class Model:
 def __init__(self,words):self.words=words
 def transcribe(self,path,**kwargs):
  words=[NS(word=w,start=i*.2,end=(i+1)*.2,probability=.8) for i,w in enumerate(self.words)]
  return iter([NS(text=' '.join(self.words),start=0,end=len(words)*.2,words=words)]),NS()

class GluedByDash(unittest.TestCase):
 def test_em_dash_glued_word_joins_the_heard_pieces(self):
  d=ratio("Ismene. They are—enough, now.",['Ismene,','They','Are','Enough,','Now.'])
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(4,4))
  self.assertEqual([m['text'] for m in d.merges],['are—enough,'])
  word=next(w for w in d.words if w['text']=='are—enough,')
  self.assertEqual((word['start'],word['end']),(0.4,0.8))
 def test_revision_two_left_the_em_dash_class_alone(self):
  self.assertEqual(ratio("They are—enough, now.",['They','Are','Enough,','Now.'],lib=v2).stats.matched_words,2)
  _w,stats=v1.align_tokens_with_stats("They are—enough, now.".split(),heard(['They','Are','Enough,','Now.']))
  self.assertEqual(stats.matched_words,2)
 def test_en_dash_and_glued_punctuation_run(self):
  self.assertEqual(ratio("he cries:—'Tis here",['he','cries','tis','here']).stats.matched_words,3)
  self.assertEqual(ratio("pages 10–12 follow",['pages','10','12','follow']).stats.matched_words,3)
 def test_a_different_word_is_not_glued(self):
  d=ratio("They are—enough, now.",['They','Are','Plenty,','Now.'])
  self.assertEqual(d.stats.matched_words,2);self.assertEqual(d.merges,[])

class Elisions(unittest.TestCase):
 def test_apostrophe_split_by_the_recogniser_is_rejoined(self):
  d=ratio("He'ld sow't with nettle-seed.",['He',"'ld","sow't",'with','nettle','-seed.'])
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(4,4))
  self.assertEqual(sorted(m['text'] for m in d.merges),["He'ld",'nettle-seed.'])
 def test_oclock_and_dismayd(self):
  self.assertEqual(ratio("at o'clock! nothing dismay'd",['at','o',"clock!",'nothing','dismay','d']).stats.matched_words,4)
 def test_an_elision_the_recogniser_heard_as_another_word_still_fails(self):
  d=ratio("'tis now their darkest hour.",['Tease','Now','Their','Darkest','Hour.'])
  self.assertEqual(d.stats.matched_words,4);self.assertEqual(d.merges,[])

class GroupedNumerals(unittest.TestCase):
 def test_comma_grouped_number_split_by_the_recogniser(self):
  d=ratio("Totals 2,186 550,943 378,347",['Totals','2',',186','550',',943','378',',347'])
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(4,4))
  self.assertEqual([m['text'] for m in d.merges],['2,186','550,943','378,347'])
  self.assertEqual(d.words[1],dict(text='2,186',start=0.2,end=0.6))
 def test_decimal_amount(self):
  self.assertEqual(ratio("cost 8.03 and 14.72 more",['cost','8','03','and','14','72','more']).stats.matched_words,5)
 def test_a_number_that_does_not_add_up_is_not_glued(self):
  d=ratio("Totals 2,186 next",['Totals','2',',180','6','next'])
  self.assertEqual(d.stats.matched_words,2);self.assertEqual(d.merges,[])

class ClosedCompounds(unittest.TestCase):
 def test_recogniser_opening_a_closed_compound(self):
  d=ratio("a heartbroken tone",['a','heart','broken','tone'])
  self.assertEqual(d.stats.matched_words,3);self.assertEqual([m['text'] for m in d.merges],['heartbroken'])
 def test_short_words_are_never_glued(self):
  # ``MIN_GLUE_KEY`` keeps two-letter coincidences out of the comparison.
  d=ratio("at on it",['a','t','on','it'])
  self.assertEqual(d.merges,[]);self.assertEqual(d.stats.matched_words,2)

class Contractions(unittest.TestCase):
 def test_expected_expanded_heard_contracted(self):
  d=ratio('"You are quite right," he replied.',['"You\'re','quite','right,"','he','replied.'])
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(6,6))
  self.assertEqual([g['text'] for g in d.groups],['"You are'])
  you,are=d.words[0],d.words[1]
  self.assertEqual(you['start'],0.0);self.assertEqual(are['end'],0.2)
  self.assertLessEqual(you['end'],are['start'])
 def test_expected_contracted_heard_expanded(self):
  d=ratio("You're quite right",['You','are','quite','right'])
  self.assertEqual(d.stats.matched_words,3);self.assertEqual([m['text'] for m in d.merges],["You're"])
 def test_revision_two_scored_both_directions_below_the_gate(self):
  self.assertEqual(ratio('"You are quite right," he replied.',['"You\'re','quite','right,"','he','replied.'],lib=v2).stats.match_ratio,4/6)
 def test_a_contraction_outside_the_table_is_not_invented(self):
  # ``gonna`` for ``going to`` is not in the table and is not guessed at.
  d=ratio("It is going to pass",['It','is','gonna','pass'])
  self.assertEqual(d.groups,[]);self.assertLess(d.stats.match_ratio,.85)

class MirrorCase(unittest.TestCase):
 def test_one_heard_token_spelling_several_expected_tokens(self):
  d=ratio("as every one does in society,",['as','everyone','does','in','society,'])
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(6,6))
  self.assertEqual([g['expected_indexes'] for g in d.groups],[[1,2]])
 def test_the_shared_span_stays_inside_the_recognised_span(self):
  d=ratio("some time later",['sometime','later'])
  some,time=d.words[0],d.words[1]
  self.assertGreaterEqual(some['start'],0.0);self.assertLessEqual(time['end'],0.2)
  self.assertLessEqual(some['end'],time['start'])
 def test_a_run_that_does_not_spell_the_heard_token_is_left_alone(self):
  d=ratio("every man does",['everyone','does'])
  self.assertEqual(d.groups,[]);self.assertEqual(d.stats.matched_words,1)

class SupersetOfRevisionTwo(unittest.TestCase):
 def test_every_revision_two_class_still_behaves(self):
  self.assertEqual(v3.expected_comparison_keys(v3.chapter_words_from_text(v3.clean_text('[28] Luciani [Greek: eunouchos].'))),[None,'luciani',None,None])
  self.assertEqual(ratio('Let us now take wage-labour.',['Let','us','now','take','wage','-labour.']).stats.match_ratio,1.0)
  self.assertEqual(ratio('_To Mrs. Saville, England._',['To','Mrs.','Saville,','England.']).stats.matched_words,4)
  self.assertEqual(ratio('The king--both murdered.',['The','king','both','murdered.']).stats.matched_words,3)
  self.assertEqual(ratio('seek for more. . . .',['seek','for','more']).stats.matched_words,3)
 def test_cardinal_pieces_of_a_short_compound_still_join(self):
  # ``5-7.`` glues to ``57``, below MIN_GLUE_KEY; revision 2's piece rule
  # (where the cardinal table makes ``5`` and ``five`` one piece) covers it.
  d=ratio('Cp. 5-7. next',['C.','P.','5','-7.','next'])
  self.assertEqual([m['text'] for m in d.merges],['5-7.'])
 def test_pieces_outside_an_unresolved_block_are_not_joined(self):
  d=ratio('as well being a well-being',['as','well','being','a','well','being'])
  self.assertEqual(d.stats.matched_words,5);self.assertEqual([m['text'] for m in d.merges],['well-being'])

class GateAndTimestamps(unittest.TestCase):
 def test_gate_still_85(self):
  self.assertEqual(trial.GATE,.85)
  words=['w'+str(i) for i in range(20)]
  self.assertEqual(trial.attempt(Model(words[:17]),'unused',' '.join(words),'off')['rejection_reasons'],[])
  self.assertIn('observed_alignment_below_85_percent',trial.attempt(Model(words[:16]),'unused',' '.join(words),'off')['rejection_reasons'])
 def test_no_timestamp_outside_a_recognised_span(self):
  d=ratio('one two-three four',['one','four'])
  self.assertEqual(d.stats.matched_words,2);self.assertEqual(d.merges,[])
  self.assertEqual(d.words[1]['end'],d.words[2]['start'])
 def test_trial_records_groups_and_merges(self):
  trial.select_helper('v3')
  r=trial.attempt(Model(['"You\'re','quite','right,"']),'unused','"You are quite right,"','off')
  self.assertEqual(r['rejection_reasons'],[]);self.assertEqual(len(r['candidate_words']),4)
  self.assertEqual([g['text'] for g in r['groups']],['"You are'])
  self.assertEqual([p['source'] for p in r['provenance']],['observed']*4)
  trial.select_helper(trial.DEFAULT_HELPER)

class Pins(unittest.TestCase):
 def test_pins_file_records_all_three_helper_hashes(self):
  pins=(Path(__file__).parent/'PINS.md').read_text()
  for module in (v1,v2,v3):
   self.assertIn(hashlib.sha256(Path(module.__file__).read_bytes()).hexdigest(),pins,module.__name__)
 def test_default_pin_is_v3_and_the_older_pins_are_selectable(self):
  self.assertEqual(trial.DEFAULT_HELPER,'v3')
  self.assertIs(trial.select_helper('v1'),v1);self.assertIs(trial.select_helper('v2'),v2);self.assertIs(trial.select_helper('v3'),v3)
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_older_pins_still_reproduce_their_own_comparison(self):
  expected='They are—enough, now.'.split();spoken=['They','Are','Enough,','Now.']
  a=v1.align_tokens_with_stats(expected,heard(spoken));b=v2.align_tokens_with_stats(expected,heard(spoken))
  self.assertEqual(json.dumps(a[0]),json.dumps(b[0]));self.assertEqual(a[1].__dict__,b[1].__dict__)
  self.assertEqual(a[1].matched_words,2)
  for pin,lib in (('v1',v1),('v2',v2)):
   trial.select_helper(pin);r=trial.attempt(Model(spoken),'unused','They are—enough, now.','off')
   self.assertEqual(json.dumps(r['candidate_words']),json.dumps(a[0]));self.assertEqual(r['stats'],a[1].__dict__)
  trial.select_helper(trial.DEFAULT_HELPER)
if __name__=='__main__':unittest.main()
