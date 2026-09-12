"""Focused checks for the Histories. AUTHORING IN PROGRESS: Books 1-3
(sections 1-557) are authored; Books 4-9 are not."""
import unittest
from build_the_histories import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]

class TheHistories(unittest.TestCase):
    def test_the_two_men_called_atys(self):
        # Croesus's son, and the ancient king the Lydians are named after.
        for ed in ['original-en','modern-en']:
            self.assertEqual(set(where(ed,'atys-son-of-croesus')),{(34,0)},ed)
            self.assertEqual(sorted(set(where(ed,'atys-son-of-manes'))),[(7,0),(93,0)],ed)

    def test_the_two_men_called_lycurgus(self):
        # The Athenian faction leader, then the Spartan lawgiver.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c in (58,59) for c,_ in where(ed,'lycurgus-athenian')),ed)
            self.assertTrue(all(c in (64,65) for c,_ in where(ed,'lycurgus-spartan')),ed)

    def test_the_two_men_called_cambyses(self):
        # Cyrus's father, and Cyrus's son at the handover.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'cambyses-ii'),[(207,0)],ed)
            self.assertTrue(all(c!=207 for c,_ in where(ed,'cambyses-i')),ed)

    def test_alexander_son_of_priam_is_not_alexander_of_macedon(self):
        # Paris is bound in section 3 and through the Egyptian passage of Book
        # 2. The Macedonian belongs to Books 5 and 7-9 and is deliberately left
        # unbound until those books are authored.
        for ed in ['original-en','modern-en']:
            self.assertIn((3,0),where(ed,'alexander-paris'),ed)
            self.assertFalse([c for c,_ in where(ed,'alexander-paris') if c>397],ed)

    def test_leon_of_sparta_is_not_the_leon_who_was_sacrificed(self):
        for ed in ['original-en','modern-en']:
            self.assertNotIn((1202,0),where(ed,'leon'),ed)
            self.assertIn((64,0),where(ed,'leon'),ed)

    def test_ninus_and_bias_are_not_their_later_namesakes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'ninus'),[(7,0)],ed)
            self.assertNotIn((365,0),where(ed,'ninus'),ed)
            self.assertTrue(all(c in (27,169) for c,_ in where(ed,'bias')),ed)

    def test_the_older_translation_transliterates_differently(self):
        texts={m['text'] for m in mentions('original-en')}
        for t in ['Heracleidai','Kyaxares','Deïokes','Peisistratos','Kypselos',
                  'Thrasybulos','Alcmaion','Athene','Kimmerians','Phenicians','Adrastos',
                  'Ladike','Esop','Etearchos','Hecataios','Menelaos','Lynkeus','Linos',
                  'Dioscuroi','Samothrakians','Keltoi','Kilikians','Hephaistos','Dionysos',
                  'Oroites','Eginetans','Dareios']:
            self.assertIn(t,texts,t)

    def test_the_peoples_carry_across_all_nine_books(self):
        # Persians, Hellenes and the rest are one entity for the whole work.
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'persians')),500,ed)
            self.assertGreater(len(where(ed,'hellenes')),500,ed)
            self.assertTrue(any(c>1400 for c,_ in where(ed,'persians')),ed)

    def test_paris_is_bound_in_egypt_too(self):
        # Book 2 argues at length that Helen and Alexander were held in Egypt
        # for the whole war. He is bound through that passage and nowhere else.
        for ed in ['original-en','modern-en']:
            books={c for c,_ in where(ed,'alexander-paris')}
            self.assertTrue(books <= {3}|set(range(327,336)),ed)
            self.assertIn((328,0),where(ed,'alexander-paris'),ed)

    def test_king_moeris_is_not_the_lake_named_after_him(self):
        # The lake is a place and is not cast; the king is bound three times.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c in (221,228,316) for c,_ in where(ed,'moeris-king')),ed)
            self.assertTrue(where(ed,'moeris-king'),ed)

    def test_the_egyptian_kings_of_book_two(self):
        for ed in ['original-en','modern-en']:
            for cid in ['min','nitocris','sesostris','pheros','proteus-egypt','rhampsinitos',
                        'cheops','chephren','mykerinos','asychis','anysis','sabacos','sethos',
                        'psammetichos','necos','psammis','apries']:
                self.assertTrue(where(ed,cid),f'{cid} {ed}')

    def test_smerdis_is_never_the_name_of_the_impostor(self):
        # Herodotus is careful: every literal "Smerdis" in the text is Cyrus's
        # son. The usurper is only ever "the Magian" in narration, so the two
        # men are two entities and no mention of one is a mention of the other.
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                if m['characterId']=='smerdis-the-magian':
                    self.assertNotIn('Smerdis',m['text'],ed)
                if m['characterId']=='smerdis-son-of-cyrus':
                    self.assertIn('Smerdis',m['text'],ed)
            self.assertGreater(len(where(ed,'smerdis-son-of-cyrus')),30,ed)
            self.assertGreater(len(where(ed,'smerdis-the-magian')),25,ed)

    def test_the_magian_the_two_magians_and_the_caste_are_three_things(self):
        for ed in ['original-en','modern-en']:
            # The usurper: Book 3 and the four later backward glances.
            self.assertTrue(all(398<=c<=557 or c in (515,537,547,550)
                                for c,_ in where(ed,'smerdis-the-magian')),ed)
            # The caste: never inside the conspiracy sections 458-477 except in
            # section 476, where the Persians massacre it.
            castes={c for c,_ in where(ed,'magians')}
            self.assertFalse({c for c in castes if 458<=c<=475},ed)
            self.assertIn(476,castes,ed)
            self.assertTrue(where(ed,'magian-brothers'),ed)

    def test_section_476_switches_from_the_usurpers_to_the_caste(self):
        # The hardest paragraph in the book: the two Magians are beheaded and
        # then every Magian in Persia is hunted down, in one paragraph, and the
        # two translations distribute the plural differently.
        for ed in ['original-en','modern-en']:
            ms=[m for m in mentions(ed)
                if m['chapterNumber']==476 and m['characterId'].startswith(('magian','smerdis'))]
            ms.sort(key=lambda m:m['startOffset'])
            ids=[m['characterId'] for m in ms]
            self.assertEqual(ids[:2],['magian-brothers','magian-brothers'],ed)
            self.assertEqual(ids[-1],'magians',ed)
            self.assertNotIn('smerdis-the-magian',ids,ed)

    def test_the_two_men_called_archias(self):
        # Both in one paragraph; only the fourth occurrence is the grandson.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'archias-grandson'),[(452,0)],ed)
            self.assertTrue(all(c==452 for c,_ in where(ed,'archias-samos')),ed)
            self.assertGreater(len(where(ed,'archias-samos')),3,ed)

    def test_the_seven_who_killed_the_magian(self):
        for ed in ['original-en','modern-en']:
            for cid in ['otanes','intaphrenes','gobryas','megabyzos','aspathines',
                        'hydarnes','darius']:
                self.assertTrue(where(ed,cid),f'{cid} {ed}')

    def test_no_entity_is_missing_from_both_editions(self):
        o=set(REPORT['editions']['original-en']['omittedEntities'])
        m=set(REPORT['editions']['modern-en']['omittedEntities'])
        self.assertEqual(o&m,set())

    def test_edition_divergences_are_recorded_not_repaired(self):
        # The older translation writes "the men of Kyme" and "the men of Smyrna"
        # where the modern one names the peoples.
        self.assertEqual(sorted(REPORT['editions']['original-en']['omittedEntities']),
                         ['cymeans','smyrnaeans'])
        self.assertEqual(REPORT['editions']['modern-en']['omittedEntities'],[])

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
