import unittest
from observed_prefix_repair import restore_observed_prefix
class PrefixTest(unittest.TestCase):
 def fixture(self):
  return ([dict(text="GONERIL.",start=1.35,end=1.35),dict(text="By",start=1.35,end=1.5)],["GONERIL.","By"],["By"],[dict(raw="Goneril.",start=.05,end=.8),dict(raw="By",start=1.35,end=1.5)])
 def test_observed_spoken_label_gets_its_actual_timing(self):
  args=self.fixture();out,n=restore_observed_prefix(*args)
  self.assertEqual(n,1);self.assertEqual(out[0]["start"],.05);self.assertEqual(out[0]["end"],.8)
  self.assertEqual(args[0][0]["start"],1.35);self.assertEqual(out[1],args[0][1])
 def test_unheard_label_is_not_invented(self):
  args=list(self.fixture());args[3]=args[3][1:]
  self.assertEqual(restore_observed_prefix(*args)[1],0)
 def test_wrong_label_is_not_substituted(self):
  args=list(self.fixture());args[3][0]["raw"]="Oswald"
  self.assertEqual(restore_observed_prefix(*args)[1],0)
 def test_label_cannot_overlap_body(self):
  args=list(self.fixture());args[3][0]["end"]=2
  self.assertEqual(restore_observed_prefix(*args)[1],0)
 def test_existing_real_timing_is_preserved(self):
  args=list(self.fixture());args[0][0]["start"]=.1
  self.assertEqual(restore_observed_prefix(*args)[1],0)
 def test_trailing_silent_markup_does_not_hide_spoken_prefix(self):
  args=list(self.fixture());args[0].append(dict(text="_Exit_",start=1.5,end=1.5));args[1].append("_Exit_")
  out,n=restore_observed_prefix(*args)
  self.assertEqual(n,1);self.assertEqual(out[-1],args[0][-1])
if __name__=="__main__":unittest.main()
