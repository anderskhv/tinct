"""Focused checks for the History of the Peloponnesian War. AUTHORING IN
PROGRESS: Book 1 (chapters 1-5) is authored; chapters 6-26 are not."""
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
            self.assertEqual(where(ed,'thucydides'),[(1,0)],ed)

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
            self.assertEqual(sorted({p for _,p in where(ed,'aristeus-adimantus')}),
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
            self.assertTrue(all(c in (4,5) for c,_ in where(ed,'pausanias-sparta')),ed)
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
                              ('pericles',[4,5])]:
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
