"""Focused checks for the Histories. AUTHORING IN PROGRESS: Books 1-5
(sections 1-886) are authored; Books 6-9 are not."""
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
                  'Oroites','Eginetans','Dareios','Battos','Arkesilaos','Kyrenians','Theraians',
                  'Minyai','Lotophagoi','Machlyans','Atlantians','Dorieos','Onesilos','Artybios',
                  'Paionians','Chalkidians','Sikyonians','Hipparchos','Gephyraians']:
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

    def test_the_royal_house_of_cyrene_is_seven_entities(self):
        # The oracle promises four named Battus and four named Arcesilaus. The
        # three Battuses and three Arcesilauses Herodotus actually narrates are
        # separate men, and the dynasty itself is a seventh card.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c<=715 for c,_ in where(ed,'battus-i')),ed)
            self.assertEqual(sorted(set(where(ed,'battus-ii'))),[(715,0),(716,0)],ed)
            self.assertTrue(all(c in (717,718,761) for c,_ in where(ed,'battus-iii')),ed)
            self.assertEqual(where(ed,'arcesilaus-i'),[(715,0)],ed)
            self.assertTrue(all(c in (716,717) for c,_ in where(ed,'arcesilaus-ii')),ed)
            self.assertTrue(all(c>=718 for c,_ in where(ed,'arcesilaus-iii')),ed)
            # 715 names two different Battuses in one sentence.
            ids=[m['characterId'] for m in sorted(
                (m for m in mentions(ed) if m['chapterNumber']==715
                 and m['characterId'].startswith('battus')),
                key=lambda m:m['startOffset'])]
            self.assertEqual(ids,['battus-i','battus-ii'],ed)

    def test_the_oracle_names_the_dynasty_not_a_man(self):
        # "four named Battus and four named Arcesilaus" goes to the house.
        for ed in ['original-en','modern-en']:
            self.assertIn((719,0),where(ed,'battiadae'),ed)
            self.assertIn((758,0),where(ed,'battiadae'),ed)
            self.assertNotIn((719,0),where(ed,'battus-i'),ed)

    def test_the_two_kings_called_etearchus(self):
        # The Ammonian of Book 2, and the Cretan of Oaxus in Book 4.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c in (247,248) for c,_ in where(ed,'etearchus')),ed)
            self.assertEqual(set(where(ed,'etearchus-oaxos')),{(710,0)},ed)

    def test_the_macedonian_alexander_finally_gets_the_name(self):
        # Paris had it to himself for 775 sections. Now both are bound and
        # neither reaches into the other's territory.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c<400 for c,_ in where(ed,'alexander-paris')),ed)
            self.assertTrue(all(778<=c<=783 for c,_ in where(ed,'alexander-macedon')),ed)

    def test_not_every_aristagoras_is_the_milesian(self):
        # The tyrant of Cyzicus in Darius's fleet, and the Samian father of
        # Hegesistratos in Book 9, are other men.
        for ed in ['original-en','modern-en']:
            self.assertEqual(set(where(ed,'aristagoras-kyzikos')),{(694,0)},ed)
            self.assertEqual(set(where(ed,'aristagoras-cyme')),{(798,0)},ed)
            self.assertNotIn((694,0),where(ed,'aristagoras-miletus'),ed)
            self.assertNotIn((1493,0),where(ed,'aristagoras-miletus'),ed)
            # 798 names both in one sentence, the Cymean first.
            ids=[m['characterId'] for m in sorted(
                (m for m in mentions(ed) if m['chapterNumber']==798
                 and m['characterId'].startswith('aristagoras')),
                key=lambda m:m['startOffset'])]
            self.assertEqual(ids,['aristagoras-cyme','aristagoras-miletus'],ed)

    def test_the_two_men_called_cleisthenes(self):
        # The Athenian and his mother's father the tyrant of Sicyon, named in
        # the same sentence at 828 and again at 830.
        for ed in ['original-en','modern-en']:
            ids=[m['characterId'] for m in sorted(
                (m for m in mentions(ed) if m['chapterNumber']==828
                 and m['characterId'].startswith('cleisthenes')),
                key=lambda m:m['startOffset'])]
            self.assertEqual(ids[0],'cleisthenes-athens',ed)
            self.assertTrue(all(i=='cleisthenes-sicyon' for i in ids[1:]),ed)
            self.assertIn((829,0),where(ed,'cleisthenes-sicyon'),ed)
            self.assertIn((833,0),where(ed,'cleisthenes-athens'),ed)

    def test_the_three_men_called_otanes(self):
        # The conspirator of the seven; Sisamnes's son in Thrace; and the
        # commanders of 877 and 883 and Books 7-9, who stay unbound.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c<=929 for c,_ in where(ed,'otanes')),ed)
            self.assertEqual(sorted(set(where(ed,'otanes-sisamnes'))),[(786,0),(787,0),(789,0)],ed)
            for c in (877,883,1064,1085):
                self.assertNotIn((c,0),where(ed,'otanes'),ed)
                self.assertNotIn((c,0),where(ed,'otanes-sisamnes'),ed)

    def test_the_two_men_called_adrastus(self):
        # The Phrygian who killed Croesus's son, and the Argive hero of Sicyon.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c<100 for c,_ in where(ed,'adrastus')),ed)
            self.assertEqual(sorted(set(where(ed,'adrastus-argos'))),[(828,0),(829,0)],ed)

    def test_no_entity_is_missing_from_both_editions(self):
        o=set(REPORT['editions']['original-en']['omittedEntities'])
        m=set(REPORT['editions']['modern-en']['omittedEntities'])
        self.assertEqual(o&m,set())

    def test_edition_divergences_are_recorded_not_repaired(self):
        # The older translation writes "the men of Kyme" and "the men of Smyrna"
        # where the modern one names the peoples.
        self.assertEqual(sorted(REPORT['editions']['original-en']['omittedEntities']),
                         ['crotoniats','cymeans','smyrnaeans'])
        self.assertEqual(REPORT['editions']['modern-en']['omittedEntities'],[])

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
