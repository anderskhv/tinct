"""Focused checks for the Republic. Both full English editions, 10 books."""
import unittest
from build_the_republic import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]

class TheRepublic(unittest.TestCase):
    def test_the_eleven_men_in_cephalus_house(self):
        # Five argue, six are named and say nothing or almost nothing.
        for ed in ['original-en','modern-en']:
            for cid in ['socrates','glaucon','adeimantus','polemarchus','thrasymachus',
                        'cephalus','cleitophon','charmantides','euthydemus','lysias','niceratus']:
                self.assertTrue(where(ed,cid),f'{cid} {ed}')
            # All eleven are introduced in Book 1.
            for cid in ['charmantides','euthydemus','lysias','niceratus']:
                self.assertTrue(all(c==1 for c,_ in where(ed,cid)),cid)

    def test_cephalus_leaves_and_does_not_come_back(self):
        # He hands the argument to his son and goes to the sacrifice.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c==1 for c,_ in where(ed,'cephalus')),ed)

    def test_glaucon_the_brother_against_glaucus_the_sea_god(self):
        # One letter apart, and the sea-god appears exactly once.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'glaucus-sea-god'),[(10,278)],ed)
            self.assertGreater(len(where(ed,'glaucon')),55,ed)

    def test_jowett_spells_hera_here(self):
        # "Here" cannot be an alias, so the goddess is bound by position at the
        # three paragraphs where the word is her name.
        self.assertEqual(sorted(set(where('original-en','hera'))),[(2,245),(2,309),(3,92)])
        self.assertTrue(any(m['text']=='Here' for m in mentions('original-en')))
        self.assertTrue(any(m['text']=='Hera' for m in mentions('modern-en')))

    def test_the_forms_are_bound_in_both_editions(self):
        # The modern edition writes Form; Jowett writes idea, which is far too
        # common a word to bind on sight, so the verse translation is bound only
        # at the passages that define them.
        for ed in ['original-en','modern-en']:
            self.assertTrue(where(ed,'the-forms'),ed)
            self.assertIn((6,332),where(ed,'the-forms'),ed)
            self.assertIn((10,14),where(ed,'the-forms'),ed)

    def test_the_three_fates_of_the_myth_of_er(self):
        for ed in ['original-en','modern-en']:
            for cid in ['lachesis','clotho','atropos','necessity','the-fates','the-interpreter','er']:
                self.assertTrue(where(ed,cid),f'{cid} {ed}')
                self.assertTrue(all(c==10 for c,_ in where(ed,cid)),cid)

    def test_diomedes_the_hero_and_the_necessity_of_diomede(self):
        # One man, two spellings, two different uses.
        for ed in ['original-en','modern-en']:
            self.assertIn((6,143),where(ed,'diomedes'),ed)

    def test_homer_is_quoted_more_than_anyone(self):
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'homer')),40,ed)

    def test_no_entity_is_missing_from_both_editions(self):
        o=set(REPORT['editions']['original-en']['omittedEntities'])
        m=set(REPORT['editions']['modern-en']['omittedEntities'])
        self.assertEqual(o&m,set())

    def test_edition_divergences_are_recorded_not_repaired(self):
        # The modern edition personifies the four powers of Book 8 with
        # capitals; Jowett leaves them lower case. Recorded, not forced.
        self.assertEqual(sorted(REPORT['editions']['original-en']['omittedEntities']),
                         ['anarchy','insolence','shamelessness','waste'])
        self.assertEqual(REPORT['editions']['modern-en']['omittedEntities'],[])

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
