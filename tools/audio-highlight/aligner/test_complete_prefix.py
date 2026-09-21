import unittest
import trial
class Mapping(unittest.TestCase):
 def check(self,text):
  source=trial.lib.chapter_words_from_text(text);expected=trial.acoustic_tokens(text)
  timed=[dict(text=t,start=i+.1,end=i+.8) for i,t in enumerate(expected)]
  out=trial.restore_source_tokens(timed,source,expected)
  self.assertEqual([w["text"] for w in out],source)
  self.assertEqual(len(out),len(source))
  self.assertEqual(sum(w["end"]>w["start"] for w in out),len(expected))
 def test_multiword_label(self):self.check("PRINCE OF MOROCCO. Mislike me not for my complexion.")
 def test_two_word_label(self):self.check("LE BEAU. Good sir, I do in friendship counsel you.")
 def test_single_label(self):self.check("GONERIL. I would breed from hence occasions.")
 def test_numbered_prose(self):self.check("45. I shall add that this is ordinary prose.")
 def test_verse(self):self.check("¹ In the beginning was the Word.")
 def test_stage(self):self.check("Enter PRINCE OF MOROCCO and his train.")
 def test_wrong_expected_rejected(self):
  with self.assertRaises(ValueError):
   trial.restore_source_tokens([dict(text="wrong",start=0,end=1)],["PRINCE","OF","MOROCCO.","Mislike"],["wrong"])
if __name__=="__main__":unittest.main()
