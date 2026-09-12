"""Focused checks for the Histories. AUTHORING IN PROGRESS: Books 1-8
(sections 1-1403) are authored; Book 9 is not."""
import unittest
from build_the_histories import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]
def ids(ed,ch,pi=0):
    return [m['characterId'] for m in mentions(ed)
            if m['chapterNumber']==ch and m['paragraphIndex']==pi]
def snapshots(cid,ed='modern-en'):
    return [c for c in ASSET['editions'][ed]['characters'] if c['id']==cid][0]['snapshots']

class TheHistories(unittest.TestCase):
    def test_the_two_men_called_atys(self):
        # Croesus's son, and the ancient king the Lydians are named after.
        for ed in ['original-en','modern-en']:
            self.assertEqual(set(where(ed,'atys-son-of-croesus')),{(34,0)},ed)
            self.assertEqual(sorted(set(where(ed,'atys-son-of-manes'))),
                             [(7,0),(93,0),(1097,0)],ed)
            self.assertEqual(where(ed,'atys-father-of-pythius'),[(1053,0)],ed)

    def test_the_two_men_called_lycurgus(self):
        # The Athenian faction leader, then the Spartan lawgiver.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c in (58,59) for c,_ in where(ed,'lycurgus-athenian')),ed)
            self.assertTrue(all(c in (64,65) for c,_ in where(ed,'lycurgus-spartan')),ed)

    def test_the_two_men_called_cambyses(self):
        # Cyrus's father, and Cyrus's son at the handover.
        for ed in ['original-en','modern-en']:
            # Book 7 names him again for Egypt and for the Ethiopian campaign.
            self.assertEqual(sorted({c for c,_ in where(ed,'cambyses-ii')}),
                             [207,1027,1034,1044],ed)
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
            self.assertTrue(all(c>=778 for c,_ in where(ed,'alexander-macedon')),ed)
            self.assertIn((1195,0),where(ed,'alexander-macedon'),ed)

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

    # ---------------------------------------------------------- BOOK 6 (ERATO)
    def test_the_two_men_called_miltiades(self):
        # The founder of the Chersonese colony and his great-nephew the general
        # of Marathon. Section 920 names both in one sentence, in that order.
        for ed in ['original-en','modern-en']:
            self.assertEqual([i for i in ids(ed,920) if i.startswith('miltiades')],
                             ['miltiades','miltiades-cypselus'],ed)
            for ch in (921,922,923):
                self.assertNotIn('miltiades',ids(ed,ch),ed)
                self.assertIn('miltiades-cypselus',ids(ed,ch),ed)
            for ch in (995,1018,1020,1022,1026):
                self.assertIn('miltiades',ids(ed,ch),ed)
                self.assertNotIn('miltiades-cypselus',ids(ed,ch),ed)
            # He is the Miltiades of the Ister bridge in Book 4 as well.
            self.assertIn((693,0),where(ed,'miltiades'),ed)

    def test_the_two_men_called_cimon(self):
        # The father murdered near the City Hall, and the son who paid the fine.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted(set(where(ed,'cimon-son-of-miltiades'))),
                             [(1022,0),(1129,0)],ed)
            self.assertTrue(all(c!=1022 for c,_ in where(ed,'cimon')),ed)
            self.assertIn((989,0),where(ed,'cimon'),ed)
            # And two men called Stesagoras: the grandfather and the brother.
            self.assertEqual(sorted(set(where(ed,'stesagoras-elder'))),
                             [(920,0),(989,0)],ed)
            self.assertEqual(sorted(set(where(ed,'stesagoras'))),
                             [(924,0),(925,0),(989,0)],ed)

    def test_the_four_men_called_hippocrates(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((58,0),where(ed,'hippocrates'),ed)            # Peisistratus's father
            self.assertEqual(sorted(set(where(ed,'hippocrates-gela'))),
                             [(909,0),(1176,0),(1177,0)],ed)            # the tyrant of Gela
            self.assertEqual(where(ed,'hippocrates-sybaris'),[(1013,0)],ed)
            self.assertEqual(sorted(set(where(ed,'hippocrates-alcmaeonid'))),
                             [(1017,0)],ed)

    def test_three_generations_of_alcmaeonidae_in_two_sentences(self):
        # Section 1011 names Alcmaeon's son and Alcmaeon's father with the same
        # word; 1017 adds a third Megacles and a second Agariste, and the prose
        # repeats both names once more than the verse does.
        for ed in ['original-en','modern-en']:
            self.assertEqual([i for i in ids(ed,1011) if i.startswith('megacles')],
                             ['megacles','megacles-elder'],ed)
            self.assertIn('megacles-younger',ids(ed,1017),ed)
            self.assertIn('agariste-younger',ids(ed,1017),ed)
            self.assertIn('agariste',ids(ed,1017),ed)
            self.assertEqual(sorted(set(where(ed,'agariste'))),
                             [(1012,0),(1016,0),(1017,0)],ed)
        self.assertEqual(ids('original-en',1017).count('agariste-younger'),1)
        self.assertEqual(ids('modern-en',1017).count('agariste-younger'),2)

    def test_the_samian_house_answers_to_one_name(self):
        # Only the last Aeaces of section 899 is Polycrates's father; the tyrant
        # of Samos is the one at the Ister bridge and at Lade.
        for ed in ['original-en','modern-en']:
            self.assertEqual([i for i in ids(ed,899) if 'a' in i and i.endswith(('samos','aiakes'))],
                             ['aeaces-samos','aeaces-samos','aeaces-samos','aiakes'],ed)
            self.assertEqual(sorted(set(where(ed,'aiakes'))),
                             [(397,0),(436,0),(536,0),(899,0)],ed)
            self.assertIn((694,0),where(ed,'aeaces-samos'),ed)

    def test_names_shared_with_earlier_books_are_split_by_position(self):
        for ed in ['original-en','modern-en']:
            # The Athenian Cypselus, not the tyrant of Corinth.
            self.assertEqual(sorted(set(where(ed,'cypselus-athens'))),
                             [(920,0),(921,0),(922,0)],ed)
            self.assertTrue(all(c<900 or c==1014 for c,_ in where(ed,'cypselus')),ed)
            # The Persian Harpagus of Mysia, not the Mede who exposed Cyrus.
            self.assertEqual(sorted(set(where(ed,'harpagus-persian'))),
                             [(914,0),(916,0)],ed)
            self.assertTrue(all(c<900 for c,_ in where(ed,'harpagos')),ed)
            # Oebares the governor's father, Procles the Spartan twin, Chilon
            # the father of Percalos, Callias the Athenian, Tisander the father
            # of Hippocleides.
            self.assertEqual(where(ed,'oebares-dascyleium'),[(919,0)],ed)
            self.assertEqual(sorted(set(where(ed,'procles-sparta'))),
                             [(703,0),(938,0),(1390,0)],ed)
            self.assertEqual(where(ed,'chilon-demarmenos'),[(951,0)],ed)
            self.assertEqual(sorted(set(where(ed,'callias-athens'))),
                             [(1007,0),(1008,0)],ed)
            self.assertEqual(sorted(set(where(ed,'tisander-athens'))),
                             [(1013,0),(1014,0),(1015,0)],ed)
            self.assertEqual(where(ed,'tisander'),[(827,0)],ed)

    def test_the_two_commanders_called_artaphrenes(self):
        # Father and son in one phrase, the son first.
        for ed in ['original-en','modern-en']:
            self.assertEqual([i for i in ids(ed,980) if i.startswith('artaphrenes')],
                             ['artaphrenes-son','artaphrenes'],ed)
            self.assertEqual(sorted(set(where(ed,'artaphrenes-son'))),
                             [(980,0),(1005,0),(1034,0),(1036,0),(1097,0)],ed)

    def test_the_hero_argos_is_not_the_city(self):
        # The grove and the sanctuary belong to the hero; conquering Argos does
        # not. Cities are not cast, so those occurrences stay unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted(set(where(ed,'argos-hero'))),
                             [(961,0),(964,0),(966,0),(968,0)],ed)
            self.assertEqual(ids(ed,966).count('argos-hero'),1,ed)
            self.assertEqual(ids(ed,968).count('argos-hero'),1,ed)
            self.assertNotIn('argos-hero',ids(ed,962),ed)
            self.assertNotIn('argos-hero',ids(ed,969),ed)
            # The island of Thasos is a place; Thasus the Phoenician is a man.
            self.assertEqual(sorted(set(where(ed,'thasus'))),[(933,0)],ed)
            self.assertEqual(ids(ed,933).count('thasus'),2,ed)
            self.assertNotIn('thasus',ids(ed,914),ed)

    def test_glaucus_is_bound_through_the_oracle_paragraphs(self):
        # The story is four paragraphs including the oracle; the Glaucus of
        # Book 1 is the Chian who made the iron stand and is not cast.
        for ed in ['original-en','modern-en']:
            self.assertTrue(where(ed,'glaucus'),ed)
            self.assertTrue(all(c==972 and i in (1,2,3) for c,i in where(ed,'glaucus')),ed)
            self.assertEqual(where(ed,'oath'),[(972,2)],ed)

    def test_hydarnes_at_paros_is_deliberately_unbound(self):
        # Herodotus does not say whether this is the conspirator of Book 3 or
        # his son, so no card is offered.
        for ed in ['original-en','modern-en']:
            self.assertNotIn('hydarnes',ids(ed,1019),ed)
            self.assertIn((467,0),where(ed,'hydarnes'),ed)

    def test_the_spartan_royal_descent(self):
        # One line of entities from Hyllus down to the twins, bound wherever the
        # genealogy is recited. The Aristodemus of Thermopylae is another man.
        for ed in ['original-en','modern-en']:
            for cid in ['aristodemus','aristomachus','cleodaeus','hyllus']:
                self.assertIn((938,0),where(ed,cid),ed)
                self.assertIn((1390,0),where(ed,cid),ed)
            self.assertNotIn('aristodemus',ids(ed,1250),ed)
            self.assertEqual(sorted(set(where(ed,'eurysthenes'))),
                             [(703,0),(800,0),(937,0),(938,0),(1226,0)],ed)
            self.assertEqual(where(ed,'agis'),[(951,0)],ed)
            self.assertEqual(where(ed,'archidamus'),[(957,0),(957,0)],ed)

    def test_the_namesakes_of_the_suitor_list(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'euphorion-athens'),[(1000,0)],ed)
            self.assertEqual(where(ed,'euphorion-arcadia'),[(1013,0)],ed)
            self.assertEqual(where(ed,'diactorides-sparta'),[(957,0)],ed)
            self.assertEqual(where(ed,'diactorides-crannon'),[(1013,0)],ed)
            self.assertEqual(where(ed,'lycurgus-arcadia'),[(1013,0)],ed)
            self.assertEqual(sorted(set(where(ed,'polycritus'))),[(936,0),(959,0)],ed)
            self.assertEqual(sorted(set(where(ed,'thersander'))),[(703,0),(938,0)],ed)
            self.assertEqual(where(ed,'leoprepes'),[(971,0)],ed)
            self.assertEqual(where(ed,'lysagoras'),[(1019,0)],ed)
            self.assertEqual(where(ed,'lysagoras-miletus'),[(791,0)],ed)
            self.assertEqual(where(ed,'cleander'),[(969,0)],ed)
            self.assertEqual(sorted(set(where(ed,'anaxilaus'))),
                             [(909,0),(1187,0),(1192,0)],ed)
            self.assertEqual(sorted(set(where(ed,'scythes-zancle'))),[(909,0),(910,0)],ed)
            self.assertTrue(all(c==567 for c,_ in where(ed,'skythes')),ed)

    def test_the_sicyonian_contest_is_the_grandfather(self):
        # Every Cleisthenes of the suitor contest is the tyrant of Sicyon; the
        # Athenian appears only as the son born of the marriage.
        for ed in ['original-en','modern-en']:
            for ch in (1012,1014,1015,1016):
                self.assertNotIn('cleisthenes-athens',ids(ed,ch),ed)
                self.assertIn('cleisthenes-sicyon',ids(ed,ch),ed)
            self.assertEqual([i for i in ids(ed,1017) if i.startswith('cleisthenes')],
                             ['cleisthenes-athens','cleisthenes-sicyon','cleisthenes-sicyon'],ed)

    def test_book_six_outcomes_are_gated_after_the_earlier_identity(self):
        # Cleomenes, Histiaeus, Hippias and Ariston are cast from earlier books;
        # what Book 6 does to them is released as a later snapshot, not folded
        # back into the card a first-time reader sees.
        for ed in ['original-en','modern-en']:
            for cid,ch in [('cleomenes',961),('histiaeus',916),('hippias',993),
                           ('ariston-spartan',949),('alcmaeonidae',1010)]:
                ss=snapshots(cid,ed)
                self.assertEqual(len(ss),2,(cid,ed))
                self.assertEqual(ss[1]['availableAt']['chapterNumber'],ch,(cid,ed))
                first=[c for c in ASSET['editions'][ed]['characters'] if c['id']==cid][0]['firstMention']
                self.assertLess(first['chapterNumber'],ch,(cid,ed))

    # ------------------------------------------------------- BOOK 7 (POLYMNIA)
    def test_the_namesakes_of_the_army_catalogue(self):
        # The muster at Doriscus reuses names without distinguishing them.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted(set(where(ed,'arsames'))),[(208,0),(1037,0),(1245,0)],ed)
            self.assertEqual(sorted(set(where(ed,'arsames-son-of-darius'))),
                             [(1092,0),(1093,0)],ed)
            self.assertEqual(sorted(set(where(ed,'artachaees'))),
                             [(1048,0),(1139,0),(1140,0)],ed)
            self.assertEqual(where(ed,'artachaees-father-of-otaspes'),[(1087,0)],ed)
            self.assertEqual(where(ed,'hystaspes-son-of-darius'),[(1088,0)],ed)
            self.assertTrue(all(c!=1088 for c,_ in where(ed,'hystaspes')),ed)
            self.assertEqual(where(ed,'sisamnes-son-of-hydarnes'),[(1090,0)],ed)
            self.assertEqual(set(where(ed,'sisamnes')),{(786,0)},ed)
            self.assertEqual(where(ed,'ariomardus-caspians'),[(1090,0)],ed)
            self.assertEqual(where(ed,'ariomardus-son-of-darius'),[(1100,0)],ed)
            self.assertEqual(where(ed,'gobryas-son-of-darius'),[(1095,0)],ed)
            self.assertTrue(all(c!=1095 for c,_ in where(ed,'gobryas')),ed)
            self.assertEqual(where(ed,'prexaspes-son-of-aspathines'),[(1119,0)],ed)
            self.assertTrue(all(c!=1119 for c,_ in where(ed,'prexaspes')),ed)
            self.assertEqual(sorted(set(where(ed,'megabyzus-son-of-zopyrus'))),
                             [(1104,0),(1143,0)],ed)
            self.assertEqual(where(ed,'megabazus-son-of-megabates'),[(1119,0)],ed)

    def test_the_two_men_called_hydarnes_in_one_phrase(self):
        # "Hydarnes son of Hydarnes": the son commands the Immortals, and the
        # father is the conspirator of Book 3. Everything in this campaign is
        # the son; the patronymic at 1090 is left unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual([i for i in ids(ed,1105) if i.startswith('hydarnes')],
                             ['hydarnes-son','hydarnes'],ed)
            self.assertEqual(where(ed,'hydarnes'),[(467,0),(1105,0)],ed)
            for ch in (1157,1233,1237,1239):
                self.assertIn('hydarnes-son',ids(ed,ch),ed)
            self.assertNotIn('hydarnes',ids(ed,1090),ed)
            self.assertNotIn('hydarnes-son',ids(ed,1090),ed)

    def test_the_ancestor_achaemenes_is_not_xerxes_brother(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted(set(where(ed,'achaemenes-ancestor'))),
                             [(472,0),(1037,0)],ed)
            self.assertEqual(sorted(set(where(ed,'achaimenes'))),
                             [(409,0),(1033,0),(1119,0),(1257,0),(1258,0)],ed)

    def test_the_carian_captains_are_not_their_namesakes(self):
        # Section 1120 has a Histiaeus, a Tymnes, a Pigres, a Candaules and a
        # Siromus, and not one of them is the man of that name cast before.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'histiaeus-termera'),[(1120,0)],ed)
            self.assertTrue(all(c!=1120 for c,_ in where(ed,'histiaeus')),ed)
            self.assertEqual(sorted(set(where(ed,'tymnes-termera'))),[(798,0),(1120,0)],ed)
            self.assertEqual(where(ed,'tymnes'),[(632,0)],ed)
            self.assertEqual(where(ed,'pigres-caria'),[(1120,0)],ed)
            self.assertEqual(where(ed,'pigres'),[(773,0)],ed)
            self.assertEqual(where(ed,'candaules-caria'),[(1120,0)],ed)
            self.assertTrue(all(c<20 for c,_ in where(ed,'candaules')),ed)
            self.assertEqual(where(ed,'siromus-tyre'),[(1120,0)],ed)
            self.assertEqual(where(ed,'siromus'),[(865,0)],ed)
            self.assertEqual(where(ed,'lygdamis-halicarnassus'),[(1121,0)],ed)
            self.assertEqual(sorted(set(where(ed,'lygdamis'))),[(60,0),(63,0)],ed)

    def test_the_two_men_called_cadmus_and_the_two_called_cleander(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted(set(where(ed,'cadmus-cos'))),[(1185,0),(1186,0)],ed)
            self.assertTrue(all(c<1100 for c,_ in where(ed,'cadmus')),ed)
            self.assertEqual(where(ed,'scythes-cos'),[(1185,0)],ed)
            # "helping Hippocrates's sons Euclides and Cleander" — the uncle
            # first, then the nephew, in one sentence.
            self.assertEqual([i for i in ids(ed,1177) if i.startswith('cleander')],
                             ['cleander-gela','cleander-son-of-hippocrates'],ed)
            self.assertEqual(where(ed,'cleander'),[(969,0)],ed)

    def test_the_survivor_of_thermopylae_is_not_the_heraclid(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'aristodemus-thermopylae')}),
                             [1250,1251,1252,1474],ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'aristodemus')}),
                             [703,938,1226,1390],ed)
            # The Agiad king-list of 1226 is one line of reference cards.
            for cid in ['eurycratides','anaxander','eurycrates','polydorus-sparta',
                        'alcamenes','teleclos','archelaos','hegesilaus','doryssos',
                        'leobotes','echestratos','agis-agiad']:
                self.assertIn((1226,0),where(ed,cid),(cid,ed))

    def test_names_left_unbound_in_book_seven(self):
        # Two men called Otanes in the catalogue whom the text does not place,
        # the later Callias, the river Lycus, the Ariaramnes of Book 8 and the
        # Kephisos of Phocis all carry no card.
        for ed in ['original-en','modern-en']:
            self.assertNotIn('otanes',ids(ed,1064),ed)
            self.assertNotIn('otanes',ids(ed,1086),ed)
            self.assertEqual(where(ed,'otanes-father-of-amestris'),[(1085,0)],ed)
            self.assertEqual(where(ed,'otanes-brother-of-darius'),[(1104,0)],ed)
            self.assertNotIn('callias',ids(ed,1173),ed)
            self.assertNotIn('callias-athens',ids(ed,1173),ed)
            self.assertEqual(sorted(set(where(ed,'lycos'))),[(172,0),(1114,0)],ed)
            self.assertEqual(where(ed,'ariaramnes'),[(1037,0)],ed)
            self.assertEqual(where(ed,'cephisus'),[(1200,0)],ed)
            self.assertEqual(where(ed,'marsyas'),[(1052,0)],ed)

    def test_the_forty_nations_of_the_lists_share_one_card(self):
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'catalogue-nations')),35,ed)
            cat={c for c,_ in where(ed,'catalogue-nations')}
            self.assertTrue({1090,1100,1101}<=cat,ed)
            # The peoples with cards of their own keep them.
            self.assertIn((1088,0),where(ed,'sacae'),ed)
            self.assertIn((1107,0),where(ed,'sagartians'),ed)
            self.assertEqual(sorted(set(where(ed,'immortals'))),
                             [(1105,0),(1233,0),(1372,0)],ed)

    def test_the_royal_judges_are_not_the_royal_scythians(self):
        # The bare alias "Royal" had been binding the king's judges and his
        # secretaries to the Scythian tribe.
        for ed in ['original-en','modern-en']:
            self.assertNotIn('royal-scythians',ids(ed,1216),ed)
            self.assertNotIn('royal-scythians',ids(ed,411),ed)
            self.assertIn('royal-judges',ids(ed,1216),ed)
            self.assertIn('royal-judges',ids(ed,428),ed)
            self.assertIn('royal-secretaries',ids(ed,525),ed)
            self.assertTrue(all(c in (576,578,612,613,615,627)
                                for c,_ in where(ed,'royal-scythians')),ed)

    def test_the_two_editions_name_different_figures_in_one_oracle(self):
        # The Spartans' oracle: Macaulay's "children of Perses" against the
        # modern "sons of Perseus". Each edition binds what it prints.
        self.assertIn((1241,1),where('original-en','perses'))
        self.assertNotIn((1241,1),where('modern-en','perses'))
        self.assertIn((1241,1),where('modern-en','perseus'))

    def test_the_winds_are_a_power_and_not_a_direction(self):
        for ed in ['original-en','modern-en']:
            self.assertTrue(where(ed,'the-winds'),ed)
            self.assertTrue(all(c in (1200,1201) for c,_ in where(ed,'the-winds')),ed)
            self.assertNotIn('the-winds',ids(ed,1061),ed)

    # --------------------------------------------------------- BOOK 8 (URANIA)
    def test_the_greek_command_at_artemisium_and_salamis(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((1262,0),where(ed,'eurybiades'),ed)
            self.assertIn((1383,0),where(ed,'eurybiades'),ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'adeimantus-corinth')}),
                             [1265,1319,1321,1353],ed)
            self.assertEqual(where(ed,'adeimantus'),[(1159,0)],ed)
            self.assertIn((1339,0),where(ed,'aristides'),ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'sikinnos')}),[1335,1369],ed)

    def test_the_second_phylacos_polycritus_histiaeus_and_ariaramnes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(set(where(ed,'phylacos-delphi')),{(1299,0)},ed)
            self.assertEqual(set(where(ed,'phylacos-samos')),{(1345,0)},ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'polycritos-aegina')}),[1351,1352],ed)
            self.assertEqual(sorted(set(where(ed,'polycritus'))),[(936,0),(959,0)],ed)
            self.assertEqual(where(ed,'histiaeus-samos'),[(1345,0)],ed)
            self.assertTrue(all(c!=1345 for c,_ in where(ed,'histiaeus')),ed)
            self.assertEqual(where(ed,'ariaramnes-salamis'),[(1349,0)],ed)
            self.assertEqual(where(ed,'ariaramnes'),[(1037,0)],ed)

    def test_the_two_men_called_artayntes_and_ithamitres(self):
        # Book 7: Artayntes son of Ithamitres. Book 8: Artayntes son of
        # Artachaees, whose brother's son Ithamitres shares the command.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'artayntes'),[(1090,0)],ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'artayntes-samos')}),[1389],ed)
            self.assertEqual(where(ed,'ithamitres'),[(1090,0)],ed)
            self.assertEqual(where(ed,'ithamitres-samos'),[(1389,0)],ed)

    def test_the_eurypontid_king_list_is_not_the_agiad_one(self):
        # Section 1390 recites the other royal house, and four of its names
        # belong to men already cast from the Agiad list or from elsewhere.
        for ed in ['original-en','modern-en']:
            self.assertEqual([i for i in ids(ed,1390) if i.startswith('leotychides')],
                             ['leotychides','leotychides-elder','leotychides'],ed)
            for cid in ['hegesilaus-eurypontid','hippocratides','anaxilaus-sparta',
                        'archidamus-sparta','anaxandridas-eurypontid','theopompos',
                        'nicander','charilaos-sparta','eunomos','polydectes',
                        'prytanis','euryphon']:
                self.assertEqual(set(where(ed,cid)),{(1390,0)},(cid,ed))
            self.assertEqual(where(ed,'hegesilaus'),[(1226,0)],ed)
            self.assertNotIn((1390,0),where(ed,'anaxandrides'),ed)
            self.assertNotIn((1390,0),where(ed,'charilaos'),ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'anaxilaus')}),
                             [909,1187,1192],ed)

    def test_the_macedonian_descent(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'perdiccas')}),
                             [783,1396,1398],ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'temenus')}),[1396,1397],ed)
            self.assertEqual(set(where(ed,'aeropos-brother')),{(1396,0)},ed)
            self.assertEqual(set(where(ed,'aeropos-father-of-alketes')),{(1398,0)},ed)
            self.assertEqual(set(where(ed,'philip-macedon')),{(1398,0)},ed)
            # Three men called Amyntas in one sentence's worth of genealogy:
            # the king twice, then his grandson in Asia.
            self.assertEqual([i for i in ids(ed,1395) if i.startswith('amyntas')],
                             ['amyntas','amyntas','amyntas-asia'],ed)
            self.assertEqual(where(ed,'silenus'),[(1397,0)],ed)

    def test_the_personified_powers_of_book_eight(self):
        for ed in ['original-en','modern-en']:
            # The oracle is its own paragraph.
            for cid in ['justice','insolence','riot','victory']:
                self.assertEqual(where(ed,cid),[(1337,1)],(cid,ed))
            for cid in ['persuasion','compulsion','poverty','helplessness']:
                self.assertEqual(where(ed,cid),[(1370,0)],(cid,ed))
            self.assertEqual(set(where(ed,'iacchus')),{(1325,0)},ed)

    def test_book_eight_outcomes_are_gated(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([s['availableAt']['chapterNumber'] for s in snapshots('xerxes',ed)],
                             [182,1031,1356],ed)
            self.assertEqual([s['availableAt']['chapterNumber'] for s in snapshots('artemisia',ed)][1:],
                             [1347],ed)
            self.assertEqual([s['availableAt']['chapterNumber'] for s in snapshots('mardonius',ed)][1:],
                             [1359],ed)
            self.assertEqual([s['availableAt']['chapterNumber'] for s in snapshots('themistocles',ed)][1:],
                             [1371],ed)

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
