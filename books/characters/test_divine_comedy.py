"""Focused checks for the Comedy. Inferno (chapters 1-34) is authored;
Purgatorio and Paradiso are still in progress."""
import unittest
from build_divine_comedy import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]
def ids(ed,ch,pi,text=None):
    return [m['characterId'] for m in mentions(ed)
            if m['chapterNumber']==ch and m['paragraphIndex']==pi and (text is None or m['text']==text)]

class DivineComedy(unittest.TestCase):
    def test_the_guide_is_one_man_under_two_spellings(self):
        # Longfellow writes Virgilius, the prose writes Virgil.
        self.assertTrue(any(m['text']=='Virgilius' for m in mentions('original-en')))
        self.assertTrue(any(m['text']=='Virgil' for m in mentions('modern-en')))
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'virgil')),25,ed)

    def test_dante_names_himself_exactly_once(self):
        # The single self-naming of the whole poem, in the earthly paradise.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'dante'),[(64,18)],ed)

    def test_five_men_named_guido_in_the_inferno(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((10,20),where(ed,'guido-cavalcanti'))
            self.assertIn((20,39),where(ed,'guido-bonatti'))
            self.assertIn((28,25),where(ed,'guido-cassero'))
            self.assertIn((30,25),where(ed,'guido-romena'))
        # Guido Guerra is one word in Longfellow and two in the prose.
        self.assertIn((16,12),where('original-en','guido-guerra'))
        self.assertIn((16,12),where('modern-en','guido-guerra'))

    def test_the_two_brutuses(self):
        # The republican in Limbo; Caesar's assassin in Lucifer's mouth.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'brutus-elder'),[(4,42)],ed)
            self.assertEqual(where(ed,'brutus-caesar'),[(34,21)],ed)

    def test_the_two_alexanders_and_the_two_buosos(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'alexander-tyrant'),[(12,35)],ed)
            self.assertEqual(where(ed,'alexander-great'),[(14,10)],ed)
            self.assertEqual(where(ed,'buoso-abati'),[(25,46)],ed)
            self.assertEqual(where(ed,'buoso-donati'),[(30,14)],ed)

    def test_adam_the_first_father_against_master_adam(self):
        # Canto 30 is the counterfeiter; everywhere else it is the first father.
        for ed in ['original-en','modern-en']:
            self.assertIn((3,38),where(ed,'adam'))
            self.assertTrue(all(c==30 for c,_ in where(ed,'master-adam')),ed)
            self.assertTrue(all(c!=30 for c,_ in where(ed,'adam')),ed)

    def test_the_archangel_against_michael_scot(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'michael'),[(7,3)],ed)
            self.assertEqual(where(ed,'michael-scot'),[(20,38)],ed)

    def test_figures_the_poem_does_not_name(self):
        # Bound by the circumstance that identifies them, with one alternative
        # for Longfellow's wording and one for the prose.
        for ed in ['original-en','modern-en']:
            self.assertTrue(where(ed,'old-man-of-crete'),ed)
            self.assertTrue(where(ed,'santa-zita-elder'),ed)
            self.assertTrue(where(ed,'ciampolo'),ed)
            self.assertTrue(where(ed,'guido-montefeltro'),ed)
            self.assertTrue(where(ed,'pier-della-vigna'),ed)
            self.assertTrue(where(ed,'aristotle'),ed)

    def test_joseph_is_not_swallowed_by_potiphars_wife(self):
        # The circumstance rule must stop short of the name beside it.
        for ed in ['original-en','modern-en']:
            self.assertIn((30,32),where(ed,'joseph'))
            self.assertIn((30,32),where(ed,'potiphars-wife'))

    def test_edition_divergences_are_recorded_not_repaired(self):
        # Longfellow paraphrases some names away and the prose paraphrases
        # others; every remaining gap is one of those, not a missed binding.
        self.assertEqual(sorted(REPORT['editions']['modern-en']['omittedEntities']),
                         ['camicion','mahomet'])
        self.assertEqual(sorted(REPORT['editions']['original-en']['omittedEntities']),
                         ['azzolino','caiaphas','deianira','elisha','eurypylus',
                          'phaethon','roland','sychaeus'])

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
