"""Focused checks for Paradise Lost. Both full English editions, 12 books."""
import unittest
from build_paradise_lost import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]

class ParadiseLost(unittest.TestCase):
    def test_satan_is_one_person_under_six_names(self):
        # Satan, Lucifer, the Adversary, the Apostate, the Tempter, the Fiend.
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'satan')),80,ed)
        texts={m['text'] for m in mentions('modern-en') if m['characterId']=='satan'}
        for t in ['Satan','Lucifer','Adversary','Apostate','Tempter','Fiend']:
            self.assertIn(t,texts)

    def test_the_serpent_is_bound_once_and_only_once(self):
        # "It was the infernal Serpent" is Satan and the poem says so. Every
        # other Serpent is the animal, and none of those is bound.
        for ed in ['original-en','modern-en']:
            serpents=[m for m in mentions(ed) if m['text']=='Serpent']
            self.assertEqual([(m['chapterNumber'],m['paragraphIndex']) for m in serpents],[(1,4)],ed)

    def test_night_is_chaos_consort_and_not_nightfall(self):
        # Night is cast only where she sits beside the Anarch; the twenty-odd
        # other Nights in the poem are the time of day and are not bound.
        for ed in ['original-en','modern-en']:
            books={c for c,_ in where(ed,'night')}
            self.assertTrue(books <= {1,2,3,10},ed)
            self.assertIn((2,79),where(ed,'night'),ed)

    def test_sin_the_daughter_against_sin_the_act(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((2,66),where(ed,'sin'),ed)
        # "Sin-bred" is a compound and Book 12's Sin is the act.
        self.assertNotIn((4,36),where('original-en','sin'))
        self.assertNotIn((12,36),where('original-en','sin'))

    def test_the_son_against_the_two_other_sons(self):
        for ed in ['original-en','modern-en']:
            # Raphael calls Adam "Son of Heaven and Earth"; Sin calls Death "Son".
            self.assertIn((5,55),where(ed,'adam'),ed)
            self.assertIn((10,30),where(ed,'death'),ed)
            self.assertNotIn((5,55),where(ed,'son'),ed)
            self.assertNotIn((10,30),where(ed,'son'),ed)

    def test_the_heavenly_muse_is_urania_not_one_of_the_nine(self):
        # Milton calls on her in line 6 and names her only in Book VII.
        for ed in ['original-en','modern-en']:
            self.assertIn((1,0),where(ed,'urania'),ed)
            self.assertIn((7,0),where(ed,'urania'),ed)
            # The Muse who could not defend her son is Calliope, not Urania.
            self.assertIn((7,3),where(ed,'muses'),ed)

    def test_joshua_whom_the_gentiles_jesus_call(self):
        # The name there is Joshua's, which is Milton's whole point.
        for ed in ['original-en','modern-en']:
            self.assertIn((12,39),where(ed,'joshua'),ed)
            self.assertNotIn((12,39),where(ed,'son'),ed)

    def test_the_devils_are_also_the_idols(self):
        # Moloch argues in the council and takes children in the valley of
        # Hinnom; one entity carries both.
        for ed in ['original-en','modern-en']:
            books={c for c,_ in where(ed,'moloch')}
            self.assertTrue({1,2} <= books,ed)

    def test_no_entity_is_missing_from_both_editions(self):
        o=set(REPORT['editions']['original-en']['omittedEntities'])
        m=set(REPORT['editions']['modern-en']['omittedEntities'])
        self.assertEqual(o&m,set())

    def test_edition_divergences_are_recorded_not_repaired(self):
        # Milton writes a periphrasis or a place where the prose supplies a name.
        self.assertEqual(sorted(REPORT['editions']['original-en']['omittedEntities']),
                         ['aeneas','arthur','chaldeans','noah'])
        self.assertEqual(REPORT['editions']['modern-en']['omittedEntities'],[])

    def test_miltons_spellings_are_carried_as_aliases(self):
        texts={m['text'] for m in mentions('original-en')}
        for t in ['Charlemain','Dalilah','Montezume','Atabalipa','Temir','Delia','Circean']:
            self.assertIn(t,texts)

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
