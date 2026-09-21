import unittest
import roman_reference_alignment as mod
import pinned_words_sidecar_lib_v7 as base
def heard(words):return [base.HeardWord(w,i,i+.5) for i,w in enumerate(words)]
class CitationTests(unittest.TestCase):
    def test_actual_citation(self):
        tokens=["(1)","Matthew","xxvi.","41."]
        r,c=mod.align(tokens,heard(["1","Matthew","26.","41."]))
        self.assertEqual(c,{2:"26"});self.assertEqual(r.stats.match_ratio,1)
        self.assertEqual(r.words[2],{"text":"xxvi.","start":2,"end":2.5})
    def test_wrong_number_stays_rejected(self):
        r,c=mod.align(["Matthew","xxvi.","41."],heard(["Matthew","27","41"]))
        self.assertFalse(c);self.assertLess(r.stats.match_ratio,.85)
    def test_no_general_roman_or_pronoun_rewrite(self):
        for tokens in [["Henry","VIII.","4"],["John","I","am"],["Matthew","IIII.","4"],["Matthew","CC.","4"],["I","am","here"]]:
            self.assertFalse(mod.references(tokens))
    def test_already_matching_roman_is_unchanged(self):
        tokens=["Matthew","xxvi.","41."]
        r,c=mod.align(tokens,heard(tokens));b=base.align_tokens_detailed(tokens,heard(tokens))
        self.assertFalse(c);self.assertEqual(r.words,b.words);self.assertEqual(r.stats,b.stats)
if __name__=="__main__":unittest.main()
