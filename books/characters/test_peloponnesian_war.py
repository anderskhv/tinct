"""Focused checks for the History of the Peloponnesian War. AUTHORING IN
PROGRESS: Books 1-2 (chapters 1-8) are authored; chapters 9-26 are not."""
import unittest
from build_peloponnesian_war import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]
def ids(ed,ch,pi):
    return [m['characterId'] for m in mentions(ed)
            if m['chapterNumber']==ch and m['paragraphIndex']==pi]
def snapshots(cid,ed='modern-en'):
    return [c for c in ASSET['editions'][ed]['characters'] if c['id']==cid][0]['snapshots']

class PeloponnesianWar(unittest.TestCase):
    def test_the_author_names_himself_in_the_first_sentence(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'thucydides'),[(1,0),(7,25),(8,33)],ed)

    def test_the_thucydides_at_samos_is_a_separate_card(self):
        # Thucydides names a commander at the siege of Samos without a
        # patronymic and never says whether he means himself.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'thucydides-samos'),[(4,20)],ed)
            self.assertNotIn('thucydides',ids(ed,4,20),ed)

    def test_the_two_men_called_aristeus(self):
        # Pellichas's son commands the fleet beaten off Epidamnus; Adimantus's
        # son commands at Potidaea, twenty-six paragraphs later in the same
        # chapter.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristeus-pellichas'),[(2,4)],ed)
            self.assertEqual(sorted({p for c,p in where(ed,'aristeus-adimantus') if c==2}),
                             [30,31,32,33],ed)

    def test_the_two_men_called_callias(self):
        # Callicrates's father is a Corinthian named in the same breath as
        # Aristeus the admiral; Calliades's son is the Athenian general killed
        # at Potidaea.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'callias-father-of-callicrates'),[(2,4)],ed)
            self.assertEqual(sorted({p for _,p in where(ed,'callias-calliades')}),[31,32],ed)
            self.assertIn('callicrates',ids(ed,2,4),ed)

    def test_the_macedonian_pausanias_is_not_the_spartan_regent(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pausanias-macedon'),[(2,31)],ed)
            self.assertTrue(all(c in (4,5,6,8) for c,_ in where(ed,'pausanias-sparta')),ed)
            self.assertNotIn('pausanias-sparta',ids(ed,2,31),ed)
            self.assertNotIn('pausanias-macedon',ids(ed,4,4),ed)

    def test_the_namesakes_of_later_books_are_left_unbound(self):
        # The King's son Cyrus who paid for the Peloponnesian navy, Hippias the
        # Arcadian commander, Pisistratus the tyrant's grandson and Darius son
        # of Artaxerxes all belong to books that are not yet authored, so their
        # names carry no card rather than the Book 1 man's.
        for ed in ['original-en','modern-en']:
            for cid in ['cyrus','hippias','pisistratus','darius']:
                self.assertTrue(all(c<=5 for c,_ in where(ed,cid)),(ed,cid))
            self.assertNotIn('cyrus',ids(ed,7,20),ed)
            self.assertNotIn('hippias',ids(ed,9,33),ed)
            self.assertNotIn('pisistratus',ids(ed,11,18),ed)
            self.assertNotIn('darius',ids(ed,24,4),ed)

    def test_the_hellenic_sea_is_water_and_carries_no_card(self):
        # "Hellenic" is the people everywhere else, and is bound by default.
        for ed in ['original-en','modern-en']:
            texts=[m['text'] for m in mentions(ed) if m['characterId']=='hellenes']
            self.assertIn('Hellenic',texts,ed)
            at13=[m['text'] for m in mentions(ed)
                  if (m['chapterNumber'],m['paragraphIndex'])==(1,3)]
            self.assertNotIn('Hellenic',at13,ed)

    def test_a_war_named_after_a_people_is_that_people(self):
        # The Median War, the Persian War and the Peloponnesian War are all
        # bound, on the same rule the Histories package uses for the Median War.
        for ed in ['original-en','modern-en']:
            self.assertIn('medes',ids(ed,1,22),ed)
            self.assertIn('peloponnesians',ids(ed,1,22),ed)

    def test_the_nations_are_bound_through_the_whole_work(self):
        # A people is the same people in every book, so the nation cards bind
        # everywhere while the person cards stop at chapter 5.
        for ed in ['original-en','modern-en']:
            chapters={c for c,_ in where(ed,'athenians')}
            self.assertGreaterEqual(len(chapters),26,ed)
            self.assertTrue(all(c<=5 for c,_ in where(ed,'cylon')),ed)

    def test_the_three_corinthian_and_three_corcyraean_admirals(self):
        for ed in ['original-en','modern-en']:
            for cid in ['aristeus-pellichas','callicrates','timanor']:
                self.assertEqual(where(ed,cid),[(2,4)],(ed,cid))
            for cid in ['meikiades','aisimides','eurybatus']:
                self.assertEqual(where(ed,cid),[(2,21)],(ed,cid))

    def test_book_one_outcomes_are_gated(self):
        for ed in ['original-en','modern-en']:
            for cid,gates in [('themistocles',[1,5]),('pausanias-sparta',[4,5]),
                              ('pericles',[4,5,7])]:
                got=[s['availableAt']['chapterNumber'] for s in snapshots(cid,ed)]
                self.assertEqual(got,gates,(ed,cid))

    # ------------------------------------------------- Book 2 (chapters 6-8)
    def test_the_war_is_dated_by_three_officials_and_one_of_them_is_a_woman(self):
        # No common calendar: the priestess of Hera at Argos, the ephor at
        # Sparta and the archon at Athens.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'chrysis-argos'),[(6,1)],ed)
            self.assertEqual(where(ed,'aenesias'),[(6,1)],ed)
            self.assertEqual(where(ed,'pythodorus'),[(6,1)],ed)

    def test_the_two_people_called_chrysis(self):
        # The priestess at 6:1 and a Corinthian commander's father at 6:33.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'chrysis-father-of-eumachus'),[(6,33)],ed)
            self.assertNotIn('chrysis-argos',ids(ed,6,33),ed)

    def test_the_two_men_called_timocrates(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'timocrates-corinth'),[(6,33)],ed)
            self.assertEqual(sorted({p for _,p in where(ed,'timocrates-sparta')}),[14,21],ed)

    def test_the_two_men_called_callimachus(self):
        # Learchus's father and Phanomachus's father, three paragraphs apart.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'callimachus-father-of-learchus'),[(7,22)],ed)
            self.assertEqual(where(ed,'callimachus-father-of-phanomachus'),[(7,25)],ed)

    def test_the_two_men_called_nicias_and_the_third_who_is_unbound(self):
        # Hagnon's father and the Cretan of Gortys. The Nicias of the later
        # books is not yet authored and carries no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'nicias-father-of-hagnon'),[(7,13)],ed)
            self.assertEqual(where(ed,'nicias-gortys'),[(8,14)],ed)
            self.assertTrue(all(c<=8 for c,_ in where(ed,'nicias-gortys')),ed)
            self.assertNotIn('nicias-gortys',ids(ed,12,0),ed)

    def test_teres_is_not_tereus(self):
        # Thucydides says so himself: different part of Thrace, different name.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c in (6,7,8) for c,_ in where(ed,'teres')),ed)
            self.assertEqual(sorted({p for _,p in where(ed,'tereus')}),[31],ed)
            self.assertIn('teres',ids(ed,6,31),ed)
            self.assertIn('tereus',ids(ed,6,31),ed)

    def test_the_misprints_of_the_older_translation_are_bound_not_repaired(self):
        # Bradidas for Brasidas, Amphiraus for Amphiaraus, Antichus for
        # Antiochus — all three in the older translation only.
        o=[m['text'] for m in mentions('original-en')]
        m=[x['text'] for x in mentions('modern-en')]
        for wrong in ['Bradidas','Amphiraus','Antichus']:
            self.assertIn(wrong,o,wrong)
            self.assertNotIn(wrong,m,wrong)

    def test_the_carried_forward_cards_are_not_duplicated(self):
        # Pericles, Archidamus, Perdiccas, Phormio, Pleistoanax, Hagnon and
        # Aristeus all cross from Book 1 into Book 2 on one card each.
        for ed in ['original-en','modern-en']:
            for cid in ['pericles','archidamus','perdiccas','phormio','pleistoanax']:
                chs={c for c,_ in where(ed,cid)}
                self.assertTrue(chs & {1,2,3,4,5} and chs & {6,7,8},(ed,cid))
            self.assertIn((7,22),where(ed,'aristeus-adimantus'),ed)
            self.assertIn((7,13),where(ed,'hagnon'),ed)

    def test_book_two_outcomes_are_gated(self):
        for ed in ['original-en','modern-en']:
            for cid,gates in [('pericles',[4,5,7]),('archidamus',[3,8]),
                              ('perdiccas',[2,8]),('phormio',[2,8]),
                              ('pleistoanax',[4,6]),('hagnon',[4,7]),
                              ('aristeus-adimantus',[2,7]),
                              ('plataeans',[6]),('athenians',[1,7])]:
                got=[s['availableAt']['chapterNumber'] for s in snapshots(cid,ed)]
                self.assertEqual(got,gates,(ed,cid))

    def test_no_entity_is_missing_from_either_edition(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(REPORT['editions'][ed]['omittedEntities'],[],ed)

    def test_the_editions_share_their_transliterations(self):
        # Unusually for this library, Crawley's names are spelled the same in
        # both editions; the mention counts differ only where the modern
        # edition resolves a pronoun or paraphrases.
        o=REPORT['editions']['original-en']['mentions']
        m=REPORT['editions']['modern-en']['mentions']
        self.assertLess(abs(o-m)/max(o,m),0.02)

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
