"""Focused checks for the Iliad's Roman/Greek pairs and its very dense namesakes."""
import unittest
from build_iliad import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]
def ids(ed,ch,pi,text=None):
    return [m['characterId'] for m in mentions(ed)
            if m['chapterNumber']==ch and m['paragraphIndex']==pi and (text is None or m['text']==text)]

class Iliad(unittest.TestCase):
    def test_roman_and_greek_names_reach_one_entity(self):
        for cid in ['zeus','hera','athena','poseidon','ares','aphrodite','hephaestus','hermes','artemis','odysseus','heracles','cronus']:
            for ed in ['original-en','modern-en']:
                self.assertTrue(where(ed,cid),(cid,ed))
        self.assertEqual(ids('original-en',1,0,'Jove')[:1],['zeus'])
        self.assertEqual(ids('modern-en',1,0,'Zeus')[:1],['zeus'])

    def test_the_two_ajaxes(self):
        # 175 mentions of the name, split by reading every one of them.
        for ed in ['original-en','modern-en']:
            self.assertEqual(len(where(ed,'ajax')),157,ed)
            self.assertEqual(len(where(ed,'ajax-oileus')),18,ed)
            self.assertEqual(len(where(ed,'ajaxes')),32,ed)
        # The duel with Hector in book 7 is Telamon's son throughout.
        self.assertNotIn('ajax-oileus',[c for c,_ in where('original-en','ajax-oileus') if c==7])
        # The foot race in book 23 is the Locrian, the wrestling is Telamon's son.
        self.assertIn((23,55),where('original-en','ajax-oileus'))
        self.assertIn((23,51),where('original-en','ajax'))
        self.assertNotIn((23,55),where('original-en','ajax'))

    def test_both_editions_agree_on_every_ajax_slot(self):
        a=[(m['chapterNumber'],m['paragraphIndex'],m['characterId']) for m in mentions('original-en')
           if m['characterId'] in ('ajax','ajax-oileus','ajaxes')]
        b=[(m['chapterNumber'],m['paragraphIndex'],m['characterId']) for m in mentions('modern-en')
           if m['characterId'] in ('ajax','ajax-oileus','ajaxes')]
        self.assertEqual(a,b)

    def test_five_men_named_chromius(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'chromius-pylian'),[(4,23)])
            self.assertEqual(where(ed,'chromius-priam'),[(5,16)])
            self.assertEqual(where(ed,'chromius-lycian'),[(5,52)])
            self.assertEqual(where(ed,'chromius-teucer'),[(8,24)])
            self.assertEqual(len(where(ed,'chromius-aeneas')),3)

    def test_four_men_named_alastor_and_four_named_thoon(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'alastor-pylian'),[(4,23)])
            self.assertEqual(where(ed,'alastor-tros'),[(20,34)])
            self.assertEqual(where(ed,'thoon-phaenops'),[(5,15)])
            self.assertEqual(where(ed,'thoon-asius'),[(12,5)])

    def test_xanthus_is_four_different_things(self):
        # A Trojan, Hector's horse, one of Achilles' immortal pair, and the river god.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'xanthus-phaenops'),[(5,15)])
            self.assertEqual(where(ed,'xanthus-hector'),[(8,17)])
            self.assertEqual(len(where(ed,'xanthus-horse')),4)
            self.assertIn((21,18),where(ed,'scamander'))
        # The Lycian river of the same name is geography and is not cast.
        self.assertNotIn((2,83),where('original-en','scamander'))
        self.assertNotIn((6,14),where('original-en','scamander'))

    def test_the_three_men_named_pisander(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pisander-myrmidon'),[(16,9)])
            self.assertEqual(where(ed,'pisander-antimachus'),[(11,8),(11,10)])
            self.assertTrue(all(c==13 for c,_ in where(ed,'pisander-trojan')))

    def test_paris_and_alexandrus_are_one_man(self):
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'paris')),40)
        self.assertTrue(any(m['text']=='Alexandrus' for m in mentions('original-en')))
        self.assertTrue(any(m['text']=='Paris' for m in mentions('original-en')))

    def test_scamandrius_is_the_hunter_and_astyanax_the_child(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'scamandrius-hunter'),[(5,5)])
            self.assertIn((6,29),where(ed,'astyanax'))

    def test_places_and_rivers_as_geography_are_not_cast(self):
        cast=set(c['id'] for c in ASSET['editions']['original-en']['characters'])
        for place in ['troy','ilius','olympus','argos','ida','lycia','phthia','crete','thebes','lemnos','simois']:
            self.assertNotIn(place,cast)

    def test_no_entity_is_missing_from_either_edition(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(REPORT['editions'][ed]['omittedEntities'],[],ed)

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
