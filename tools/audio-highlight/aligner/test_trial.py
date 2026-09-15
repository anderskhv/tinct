import json,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import patch
import trial
class Model:
 def __init__(self,words):self.words=words;self.calls=[]
 def transcribe(self,path,**kwargs):
  self.calls.append(kwargs)
  words=[NS(word=w,start=i*.2,end=(i+1)*.2,probability=.8) for i,w in enumerate(self.words)]
  return iter([NS(text=' '.join(self.words),start=0,end=len(words)*.2,words=words)]),NS()
class Tests(unittest.TestCase):
 def test_unmatched_words_are_not_observed(self):
  r=trial.attempt(Model(['one','three']),'unused','one two three','off')
  self.assertEqual(r['stats']['matched_words'],2);self.assertEqual(r['provenance'][1]['source'],'interpolated');self.assertEqual(r['unresolved_gaps'][0][0],'delete');self.assertIn('observed_alignment_below_85_percent',r['rejection_reasons'])
 def test_gate_boundary(self):
  words=['word'+str(i) for i in range(20)]
  self.assertEqual(trial.attempt(Model(words[:17]),'unused',' '.join(words),'off')['rejection_reasons'],[])
  self.assertIn('observed_alignment_below_85_percent',trial.attempt(Model(words[:16]),'unused',' '.join(words),'off')['rejection_reasons'])
 def test_failed_attempt_retains_raw_and_candidate(self):
  with tempfile.TemporaryDirectory() as d:
   audio=Path(d)/'audio';audio.write_bytes(b'test');out=Path(d)/'diag.json'
   trial.paragraph(Model(['one']),audio,'one two three','off',out);r=json.loads(out.read_text())
   self.assertEqual(r['attempts'][0]['raw_segments'][0]['text'],'one');self.assertEqual(len(r['attempts'][0]['candidate_words']),3);self.assertTrue(r['selected_reasons']);self.assertEqual(r['audio_sha256'],trial.sha(audio))
 def test_auto_retains_all_retries(self):
  with tempfile.TemporaryDirectory() as d:
   audio=Path(d)/'audio';audio.write_bytes(b'test');out=Path(d)/'diag.json'
   trial.paragraph(Model(['Hamlet']),audio,'Hamlet met Horatio','auto',out);r=json.loads(out.read_text())
   self.assertEqual([a['mode'] for a in r['attempts']],['both','hotwords','off'])
 def test_raw_extra_speech_retained(self):
  r=trial.attempt(Model(['extra','one','two']),'unused','one two','off')
  self.assertEqual(len(r['heard_words']),3);self.assertEqual(r['unresolved_gaps'][0][0],'insert')
 def test_rejection_retained_after_transcriber_error(self):
  with tempfile.TemporaryDirectory() as d:
   audio=Path(d)/'audio';audio.write_bytes(b'test');out=Path(d)/'diag.json';model=Model([])
   with patch.object(model,'transcribe',side_effect=RuntimeError('decode failed')):
    with self.assertRaises(RuntimeError):trial.paragraph(model,audio,'one','off',out)
   self.assertEqual(json.loads(out.read_text())['error']['type'],'RuntimeError')
 def test_worker_never_calls_upload_and_keeps_rejected_chapter(self):
  with tempfile.TemporaryDirectory() as d:
   d=Path(d);(d/'p0.mp3').write_bytes(b'fake');source=[dict(key='test/original-en/ch1',group='test',title='Test',text_paragraph_count=1,paragraphs=[dict(index=0,file='p0.mp3',path='p0.mp3',sha256=trial.sha(d/'p0.mp3'),duration=2,text='one two three')])];(d/'input.json').write_text(json.dumps(source));args=NS(input=d/'input.json',output=d/'out',model_path=d/'model')
   with patch.dict('sys.modules',{'faster_whisper':NS(WhisperModel=lambda *a,**k:Model(['one']))}):trial.worker(args)
   for mode in ['off','auto']:
    chapter=json.loads((d/'out/test/original-en/ch1'/mode/'chapter.json').read_text());self.assertEqual(chapter['status'],'rejected');self.assertTrue((d/'out/test/original-en/ch1'/mode/'words.candidate.json').exists())
 def test_checkpoint_reuse_requires_exact_audio_and_text(self):
  with tempfile.TemporaryDirectory() as d:
   audio=Path(d)/'audio';audio.write_bytes(b'test');out=Path(d)/'diag.json';model=Model(['one'])
   trial.paragraph(model,audio,'one','off',out,configuration={'model':'a'})
   self.assertEqual(len(model.calls),1)
   trial.paragraph(model,audio,'one','off',out,configuration={'model':'a'});self.assertEqual(len(model.calls),1)
   audio.write_bytes(b'changed')
   trial.paragraph(model,audio,'one','off',out,configuration={'model':'a'});self.assertEqual(len(model.calls),2)
   trial.paragraph(model,audio,'two','off',out,configuration={'model':'a'});self.assertEqual(len(model.calls),3)
   trial.paragraph(model,audio,'two','off',out,configuration={'model':'b'});self.assertEqual(len(model.calls),4)
 def test_nonspoken_policy_preserves_indexes_and_rejects_prose(self):
  from spoken_policy import validate_map,is_scene_separator
  self.assertTrue(is_scene_separator('***'));self.assertTrue(is_scene_separator(' * * * '))
  for text in ['*','**','—','***hello','[Silence]','']:
   self.assertFalse(is_scene_separator(text))
  e=dict(text_paragraph_count=3,paragraphs=[dict(index=0),dict(index=2)],nonspoken=[dict(index=1,text='***')])
  self.assertTrue(validate_map(e));e['nonspoken'][0]['text']='hello';self.assertFalse(validate_map(e))
 def test_nonidentity_audio_filename_is_validated(self):
  with tempfile.TemporaryDirectory() as d:
   d=Path(d);(d/'p1.mp3').write_bytes(b'fake');source=[dict(key='test/original-en/ch1',group='test',title='Test',text_paragraph_count=1,paragraphs=[dict(index=0,file='p1.mp3',path='p1.mp3',sha256=trial.sha(d/'p1.mp3'),duration=2,text='one')])];(d/'input.json').write_text(json.dumps(source));args=NS(input=d/'input.json',output=d/'out',model_path=d/'model')
   with patch.dict('sys.modules',{'faster_whisper':NS(WhisperModel=lambda *a,**k:Model(['one']))}):trial.worker(args)
   candidate=json.loads((d/'out/test/original-en/ch1/auto/words.candidate.json').read_text());self.assertEqual(candidate['paragraphs'][0]['file'],'p1.mp3')
 def test_exact_helper_pin(self):
  # A tripwire, not a formality: the helper decides which timings are real and
  # which are interpolated, so every edit to it moves the quality gate. Bump
  # this hash only with a reviewed reason, recorded here.
  #
  # 0aa529e6 -> 38200cbb (2026-09-15): normalize_token stripped `[^\w]`, which
  # keeps `_` because `_` is a word character. Gutenberg marks stage directions
  # and italics with underscores, so `[_Exeunt._]` compared as `_exeunt_` and
  # never matched the `exeunt` Whisper heard in the same audio. 13 chapters were
  # rejected for mismatching their own correct recordings. See
  # test_pinned_words_sidecar_lib.py, which keeps a control case proving a real
  # mishearing ("alarums" read as "alarms") still fails.
  #
  # This used to pin against app/tts/words_sidecar_lib.py at commit f5b23de7.
  # That reference had gone stale: the file at that path is now an older
  # lineage without canonical_alignment_token, so the comparison no longer
  # meant what its name claimed. It pins the reviewed bytes directly instead.
  self.assertEqual(trial.sha(trial.lib.__file__),'38200cbb579ac24067a2efa873c47f433c9922f05df7dece6c3c02a61e023ba4')
if __name__=='__main__':unittest.main()
