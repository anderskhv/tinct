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
import pinned_words_sidecar_lib_v4 as v4
import pinned_words_sidecar_lib_v5 as v5
import pinned_words_sidecar_lib_v6 as v6
import pinned_words_sidecar_lib_v7 as v7
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

class LetteredFootnoteMarkers(unittest.TestCase):
 def test_whole_paragraph_letter_and_bracket_are_unspoken(self):
  d=ratio('k [ See the history.]',['See','the','history.'],lib=v4)
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(3,3))
  self.assertEqual(d.unspoken,[0,1])
 def test_missing_spoken_words_still_fail_or_reduce_the_ratio(self):
  d=ratio('k [ See the old detailed history.]',['See','history.'],lib=v4)
  self.assertLess(d.stats.match_ratio,.85)
 def test_inline_and_uppercase_brackets_are_not_reclassified(self):
  self.assertEqual(ratio('a [word] remains',['a','word','remains'],lib=v4).unspoken,[])
  self.assertEqual(ratio('I [ See the history.]',['See','the','history.'],lib=v4).unspoken,[])

class CloudOrchestratorPin(unittest.TestCase):
 def test_v7_is_plumbed_from_workflow_through_pod(self):
  root=Path(__file__).parents[3]
  workflow=(root/'.github'/'workflows'/'audio-align-canary.yml').read_text()
  orchestrator=(root/'tools'/'audio-highlight'/'gpu'/'orchestrate.py').read_text()
  pod=(root/'tools'/'audio-highlight'/'gpu'/'pod_job.py').read_text()
  trial_source=(root/'tools'/'audio-highlight'/'aligner'/'trial.py').read_text()
  pins=(root/'tools'/'audio-highlight'/'aligner'/'PINS.md').read_text()
  self.assertIn('--helper v7',workflow)
  self.assertNotIn('--helper v6',workflow)
  self.assertNotIn('--helper v5',workflow)
  self.assertIn('default="v7", choices=["v1", "v2", "v3", "v4", "v5", "v6", "v7"]',orchestrator)
  self.assertIn('TINCT_HELPER',orchestrator)
  self.assertIn('pinned_words_sidecar_lib_v7.py',pod)
  self.assertIn('pinned_words_sidecar_lib_v6.py',pod)
  self.assertIn('os.environ.get("TINCT_HELPER", "v7")',pod)
  self.assertIn("'v7':'pinned_words_sidecar_lib_v7'",trial_source)
  self.assertIn("'v6':'pinned_words_sidecar_lib_v6'",trial_source)
  self.assertIn("'v5':'pinned_words_sidecar_lib_v5'",trial_source)
  self.assertIn(hashlib.sha256(Path(v7.__file__).read_bytes()).hexdigest(),pins)
  self.assertIn(hashlib.sha256(Path(v6.__file__).read_bytes()).hexdigest(),pins)
  self.assertIn(hashlib.sha256(Path(v5.__file__).read_bytes()).hexdigest(),pins)
  self.assertIn(hashlib.sha256(Path(v4.__file__).read_bytes()).hexdigest(),pins)
  import sys
  sys.path.insert(0,str(root/'tools'/'audio-highlight'/'gpu'))
  import orchestrate
  result=orchestrate.validate_remote_helper_payload('unused','v7',root.as_uri())
  self.assertEqual(result['helper'],'v7')
  self.assertIn('pinned_words_sidecar_lib_v7.py',result['files'])
  self.assertIn('pinned_words_sidecar_lib_v6.py',result['files'])
  self.assertIn('pinned_words_sidecar_lib_v5.py',result['files'])
 def test_exact_payload_fails_when_requested_helper_is_omitted(self):
  import shutil,tempfile,sys
  root=Path(__file__).parents[3]
  sys.path.insert(0,str(root/'tools'/'audio-highlight'/'gpu'))
  import orchestrate
  with tempfile.TemporaryDirectory() as directory:
   replica=Path(directory)
   shutil.copytree(root/'tools',replica/'tools')
   pod=replica/'tools'/'audio-highlight'/'gpu'/'pod_job.py'
   pod.write_text(pod.read_text().replace(', "pinned_words_sidecar_lib_v7.py"',''))
   with self.assertRaisesRegex(RuntimeError,'exact pod helper payload failed import'):
    orchestrate.validate_remote_helper_payload('unused','v7',replica.as_uri())

class SourceTokenTextInvariant(unittest.TestCase):
 def test_emits_exact_source_tokens_after_acoustic_normalisation(self):
  trial.select_helper('v4')
  source='CHAPTER XVIII: “Future” Part III'
  acoustic=trial.lib.chapter_words_from_text(trial.lib.clean_text(source))
  result=trial.attempt(Model(acoustic),'unused',source,'off')
  self.assertEqual(result['acoustic_expected_tokens'],acoustic)
  self.assertEqual(result['expected_tokens'],source.split())
  self.assertEqual([word['text'] for word in result['candidate_words']],source.split())
  self.assertEqual(result['rejection_reasons'],[])
 def test_restore_fails_closed_when_cleaning_changes_token_count(self):
  with self.assertRaisesRegex(ValueError,'source/acoustic token mapping changed'):
   trial.restore_source_tokens([{'text':'one','start':0,'end':1}],['one','two'],['one'])
 def test_restore_rejects_same_count_but_mispaired_tokens(self):
  aligned=[{'text':'one','start':0,'end':1},{'text':'two','start':1,'end':2}]
  with self.assertRaisesRegex(ValueError,'mapping changed at index 0'):
   trial.restore_source_tokens(aligned,['one','two'],['two','one'])
 def test_removed_verse_marker_is_preserved_as_zero_span_source_token(self):
  trial.select_helper('v4')
  result=trial.attempt(Model(['Greet','Mary']),'unused','⁶ Greet Mary','off')
  self.assertEqual(result['acoustic_expected_tokens'],['Greet','Mary'])
  self.assertEqual(result['expected_tokens'],['⁶','Greet','Mary'])
  self.assertEqual([word['text'] for word in result['candidate_words']],['⁶','Greet','Mary'])
  self.assertEqual(result['candidate_words'][0]['start'],result['candidate_words'][0]['end'])
  self.assertLessEqual(result['candidate_words'][0]['end'],result['candidate_words'][1]['start'])
  self.assertEqual(result['rejection_reasons'],[])

class CanaryRejectNormalisation(unittest.TestCase):
 """Real reject paragraphs from canary 35204983320. v5 must drop unspoken
 cues before scoring; the 0.85 gate does not move."""
 def test_shakespeare_stage_direction_wrapper_clears(self):
  # taming-of-the-shrew/original-en ch10 p29 (auto): 0.75 under v4 because
  # ``[_Exeunt`` is a printed wrapper ASR does not say.
  source='[_Exeunt all but Hortensio._]'
  heard=['Exeunt','all','but','Hortensio._']
  self.assertLess(ratio(source,heard,lib=v4).stats.match_ratio,.85)
  d=ratio(source,heard,lib=v5)
  self.assertEqual(d.stats.expected_words,4)
  self.assertEqual(d.stats.matched_words,4)
  self.assertGreaterEqual(d.stats.match_ratio,.85)
  trial.select_helper('v5')
  result=trial.attempt(Model(heard),'unused',source,'off')
  self.assertEqual(result['rejection_reasons'],[])
  self.assertEqual([word['text'] for word in result['candidate_words']],source.split())
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_shakespeare_allcaps_enter_names_are_dropped_before_score(self):
  # as-you-like-it/original-en ch6 p1 (off): 0.60 under v4 because AMIENS /
  # JAQUES / OTHERS are printed ALL-CAPS cues, not the heard spellings.
  source='Enter AMIENS, JAQUES, and OTHERS'
  heard=['Enter','Amian,','Jaxx,','and','others.']
  self.assertLess(ratio(source,heard,lib=v4).stats.match_ratio,.85)
  d=ratio(source,heard,lib=v5)
  spoken=v5.expected_comparison_keys(source.split())
  self.assertEqual([key for key in spoken if key is not None],['enter','and'])
  self.assertGreaterEqual(d.stats.match_ratio,.85)
 def test_speaker_label_is_unspoken_and_dialogue_clears(self):
  # as-you-like-it/original-en ch6 p19: AMIENS. is a speaker cue; ASR hears
  # the line and splits I'll.
  source="AMIENS. And I'll sing it."
  heard=['AMIEN,','AND','I',"'LL",'SING','IT.']
  self.assertLess(ratio(source,heard,lib=v4).stats.match_ratio,.85)
  trial.select_helper('v5')
  result=trial.attempt(Model(heard),'unused',source,'off')
  self.assertEqual(result['acoustic_expected_tokens'],['And',"I'll",'sing','it.'])
  self.assertEqual(result['expected_tokens'],source.split())
  self.assertEqual(result['candidate_words'][0]['text'],'AMIENS.')
  self.assertEqual(result['candidate_words'][0]['start'],result['candidate_words'][0]['end'])
  self.assertEqual(result['rejection_reasons'],[])
  self.assertGreaterEqual(result['match_ratio'],.85)
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_bible_verse_and_web_bracket_are_dropped_or_unwrapped(self):
  # bible/web-en ch413 p6 / ch976 p5 class: superscript verse numerals and
  # WEB [of] are edition markup. Names may still miss; the markup must not
  # sit in the scoring denominator.
  source='³¹ [of] the sons of Harim: Eliezer, Isshijah, Malchijah.'
  heard=['Of','the','sons','of','Harim,','Eliezer,','Isshijah,','Malchijah.']
  keys=v5.expected_comparison_keys(v5.chapter_words_from_text(source))
  self.assertIsNone(keys[0])
  self.assertEqual(keys[1],'of')
  trial.select_helper('v4')
  older=trial.attempt(Model(heard),'unused',source,'off')
  trial.select_helper('v5')
  result=trial.attempt(Model(heard),'unused',source,'off')
  self.assertEqual(result['acoustic_expected_tokens'],['of','the','sons','of','Harim:','Eliezer,','Isshijah,','Malchijah.'])
  self.assertEqual(result['expected_tokens'][0],'³¹')
  self.assertEqual(result['candidate_words'][0]['text'],'³¹')
  self.assertEqual(result['candidate_words'][0]['start'],result['candidate_words'][0]['end'])
  self.assertNotIn('[of]',result['acoustic_expected_tokens'])
  self.assertGreaterEqual(result['match_ratio'],.85)
  self.assertEqual(result['rejection_reasons'],[])
  self.assertEqual(older['acoustic_expected_tokens'][0],'[of]')
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_bible_name_list_near_miss_drops_verse_tokens(self):
  # Luke 3 p5 (bible/web-en/976) scored 0.840 under v4 after verse numerals
  # were already stripped. Prove the remaining verse/WEB tokens are not
  # scored; do not invent name matches.
  source='²⁶ the son of Maath, the son of Mattathias, ²⁷ the son of Semein.'
  heard=['The','son','of','Moth.','The','son','of','Matathias.','The','son','of','Semen.']
  trial.select_helper('v5')
  result=trial.attempt(Model(heard),'unused',source,'off')
  self.assertEqual(result['expected_tokens'][0],'²⁶')
  self.assertNotIn('²⁶',result['acoustic_expected_tokens'])
  self.assertNotIn('²⁷',result['acoustic_expected_tokens'])
  self.assertLess(result['stats']['expected_words'],len(result['expected_tokens']))
  # Name ASR still misses; the gate stays 0.85 and is allowed to reject.
  self.assertEqual(trial.GATE,.85)
  self.assertLess(result['match_ratio'],.85)
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_archaic_elision_and_hyphen_still_compare(self):
  d=ratio("Hear'st thou? Th'art prepared.",['Hearest','thou?','Thou','art','prepared.'],lib=v5)
  self.assertEqual((d.stats.expected_words,d.stats.matched_words),(4,4))
  self.assertEqual(ratio('one hundred and twenty-two.',['one','hundred','and','twenty','-two.'],lib=v5).stats.match_ratio,1.0)

class UnspokenHeadings(unittest.TestCase):
 """Canary #15 / 35321419398: manifesto modern-en/4 p21 scored 0.80 under v5
 because a chapter/section heading sat in the denominator. v6 drops heading-only
 paragraphs the way v5 drops cues. The 0.85 gate does not move."""
 MANIFESTO_P21='_C. German, or “True,” Socialism_'
 def test_manifesto_p21_heading_noise_clears_under_v6(self):
  # 5 expected tokens; a 4/5 near-miss is the 0.80 reject canary #15 recorded.
  heard=['C.','German,','or','True,']
  self.assertEqual(ratio(self.MANIFESTO_P21,heard,lib=v5).stats.match_ratio,.80)
  self.assertLess(ratio(self.MANIFESTO_P21,heard,lib=v5).stats.match_ratio,.85)
  d=ratio(self.MANIFESTO_P21,heard,lib=v6)
  self.assertEqual(v6.clean_text(self.MANIFESTO_P21),'')
  self.assertEqual(v6.expected_comparison_keys(self.MANIFESTO_P21.split()),[None]*5)
  self.assertEqual(d.stats.expected_words,0)
  self.assertEqual(d.stats.match_ratio,1.0)
  trial.select_helper('v6')
  result=trial.attempt(Model(heard),'unused',self.MANIFESTO_P21,'off')
  self.assertEqual(result['acoustic_expected_tokens'],[])
  self.assertEqual(result['expected_tokens'],self.MANIFESTO_P21.split())
  self.assertEqual([word['text'] for word in result['candidate_words']],self.MANIFESTO_P21.split())
  self.assertEqual(result['candidate_words'][0]['start'],result['candidate_words'][0]['end'])
  self.assertEqual(result['rejection_reasons'],[])
  self.assertGreaterEqual(result['match_ratio'],.85)
  self.assertEqual(trial.GATE,.85)
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_other_manifesto_heading_shapes_are_unspoken(self):
  for source in (
   '1. REACTIONARY SOCIALISM',
   '_A. Feudal Socialism_',
   '_B. Petty-Bourgeois Socialism_',
   '2. CONSERVATIVE, OR BOURGEOIS, SOCIALISM',
   '3. CRITICAL-UTOPIAN SOCIALISM AND COMMUNISM',
   'CHAPTER XVIII: “Future” Part III',
  ):
   self.assertTrue(v6.is_unspoken_heading(source),source)
   self.assertEqual(v6.clean_text(source),'')
   self.assertTrue(all(key is None for key in v6.expected_comparison_keys(source.split())),source)
 def test_ordinary_prose_is_not_stripped(self):
  cases=(
   'I. Communism is already acknowledged by all the European powers to be itself a power.',
   'Two things follow from this fact.',
   'WORKING MEN OF ALL COUNTRIES, UNITE!',
   '"FITZWILLIAM DARCY."',
   'NAPOLEON',
   'Let us now take wage-labour.',
   '2. A heavy progressive or graduated income tax.',
   'The bourgeoisie has played a most revolutionary part in history.',
  )
  for source in cases:
   self.assertFalse(v6.is_unspoken_heading(source),source)
   self.assertTrue(v6.clean_text(source),source)
   self.assertTrue(any(key is not None for key in v6.expected_comparison_keys(source.split())),source)
 def test_heading_prefix_on_prose_is_left_in_the_denominator(self):
  source='_C. German, or “True,” Socialism_ The aristocracy waved the alms-bag.'
  self.assertFalse(v6.is_unspoken_heading(source))
  heard=['The','aristocracy','waved','the','alms-bag.']
  d=ratio(source,heard,lib=v6)
  self.assertGreater(d.stats.expected_words,0)
  self.assertLess(d.stats.match_ratio,.85)
 def test_v5_cue_cases_still_clear_on_v6(self):
  d=ratio('[_Exeunt all but Hortensio._]',['Exeunt','all','but','Hortensio._'],lib=v6)
  self.assertGreaterEqual(d.stats.match_ratio,.85)
  spoken=v6.expected_comparison_keys('Enter AMIENS, JAQUES, and OTHERS'.split())
  self.assertEqual([key for key in spoken if key is not None],['enter','and'])

class HumeRestorePrefix(unittest.TestCase):
 """Canary 35323671028: Hume modern-en/7 p14 is numbered first-person prose.
 v6 heading-strip on the prefix ``45. I`` emptied the acoustic map at source='I'.
 v7 restore skips heading detection on prefixes. Scoring and the 0.85 gate do
 not move. Frozen v6 still raises so the pin is not silently rewritten."""
 HUME_P14='45. I shall add, by way of further confirmation of the foregoing theory, that since this operation of the mind, by which we infer like effects from like causes, is so essential to the subsistence of all human creatures, it is not probable that it could be trusted to the fallacious deductions of our reason.'
 def test_v6_heading_shape_matches_the_two_token_prefix_only(self):
  self.assertFalse(v6.is_unspoken_heading(self.HUME_P14))
  self.assertFalse(v6.is_unspoken_heading('45.'))
  self.assertTrue(v6.is_unspoken_heading('45. I'))
  self.assertFalse(v6.is_unspoken_heading('45. I shall'))
  self.assertEqual(v6.clean_text('45. I'),'')
  self.assertEqual(v7.clean_text('45. I'),'')
  self.assertEqual(v7.clean_text('45. I',strip_headings=False),'45. I')
 def test_frozen_v6_restore_still_raises_on_numbered_first_person(self):
  trial.select_helper('v6')
  with self.assertRaisesRegex(ValueError,r"source/acoustic token mapping changed at index 1: source='I'"):
   trial.attempt(Model(self.HUME_P14.split()),'unused',self.HUME_P14,'off')
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_v7_restores_hume_p14_and_keeps_the_gate(self):
  trial.select_helper('v7')
  result=trial.attempt(Model(self.HUME_P14.split()),'unused',self.HUME_P14,'off')
  self.assertEqual(result['expected_tokens'][:3],['45.','I','shall'])
  self.assertEqual(result['acoustic_expected_tokens'][:3],['45.','I','shall'])
  self.assertEqual([word['text'] for word in result['candidate_words']][:3],['45.','I','shall'])
  self.assertEqual(result['rejection_reasons'],[])
  self.assertGreaterEqual(result['match_ratio'],.85)
  self.assertEqual(trial.GATE,.85)
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_v7_restore_keeps_v6_prose_fixtures_that_crashed(self):
  cases=(
   '2. A heavy progressive or graduated income tax.',
   'WORKING MEN OF ALL COUNTRIES, UNITE!',
   'I. Communism is already acknowledged by all the European powers to be itself a power.',
  )
  trial.select_helper('v7')
  for source in cases:
   result=trial.attempt(Model(source.split()),'unused',source,'off')
   self.assertEqual([word['text'] for word in result['candidate_words']],source.split(),source)
   self.assertEqual(result['rejection_reasons'],[],source)
   self.assertGreaterEqual(result['match_ratio'],.85,source)
  trial.select_helper(trial.DEFAULT_HELPER)
 def test_v7_heading_only_paragraph_still_zero_spans(self):
  source='_C. German, or “True,” Socialism_'
  trial.select_helper('v7')
  result=trial.attempt(Model(['C.','German,','or','True,']),'unused',source,'off')
  self.assertEqual(result['acoustic_expected_tokens'],[])
  self.assertEqual([word['text'] for word in result['candidate_words']],source.split())
  self.assertEqual(result['candidate_words'][0]['start'],result['candidate_words'][0]['end'])
  self.assertEqual(result['rejection_reasons'],[])
  self.assertEqual(trial.GATE,.85)
  trial.select_helper(trial.DEFAULT_HELPER)

class Pins(unittest.TestCase):
 def test_pins_file_records_all_three_helper_hashes(self):
  pins=(Path(__file__).parent/'PINS.md').read_text()
  for module in (v1,v2,v3,v4,v5,v6,v7):
   self.assertIn(hashlib.sha256(Path(module.__file__).read_bytes()).hexdigest(),pins,module.__name__)
 def test_default_pin_is_v7_and_the_older_pins_are_selectable(self):
  self.assertEqual(trial.DEFAULT_HELPER,'v7')
  self.assertIs(trial.select_helper('v1'),v1);self.assertIs(trial.select_helper('v2'),v2);self.assertIs(trial.select_helper('v3'),v3);self.assertIs(trial.select_helper('v4'),v4);self.assertIs(trial.select_helper('v5'),v5);self.assertIs(trial.select_helper('v6'),v6);self.assertIs(trial.select_helper('v7'),v7)
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
