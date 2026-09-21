import unittest
from observed_heading_repair import recover
class Heading(unittest.TestCase):
 def heard(self):return [{"raw":t,"start":i,"end":i+.8} for i,t in enumerate(["Moscow,","October","30th,","1812"])]
 def test_spoken_date(self):
  r=recover("MOSCOW, OCTOBER 30, 1812",self.heard());self.assertIsNotNone(r);self.assertEqual(r["words"][2]["text"],"30,")
 def test_missing_word_not_accepted(self):self.assertIsNone(recover("MOSCOW, OCTOBER 30, 1812",self.heard()[:3]))
 def test_wrong_day_not_accepted(self):self.assertIsNone(recover("MOSCOW, OCTOBER 31, 1812",self.heard()))
 def test_no_speech_not_accepted(self):self.assertIsNone(recover("MOSCOW, OCTOBER 30, 1812",[]))
 def test_exact_title(self):self.assertIsNotNone(recover("CHAPTER ONE",[{"raw":"Chapter","start":0,"end":.5},{"raw":"one","start":.5,"end":1}]))
if __name__=="__main__":unittest.main()
