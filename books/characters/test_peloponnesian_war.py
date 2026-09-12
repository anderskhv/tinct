"""Focused checks for the History of the Peloponnesian War. AUTHORING IN
PROGRESS: Books 1-6 (chapters 1-20) are authored; chapters 21-26 are not."""
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
            self.assertIn((1,0),where(ed,'thucydides'),ed)

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
            self.assertTrue(all(c in (4,5,6,8,10,15,16) for c,_ in where(ed,'pausanias-sparta')),ed)
            self.assertNotIn('pausanias-sparta',ids(ed,2,31),ed)
            self.assertNotIn('pausanias-macedon',ids(ed,4,4),ed)

    def test_the_namesakes_of_later_books_are_left_unbound(self):
        # The King's son Cyrus who paid for the Peloponnesian navy, Hippias the
        # Arcadian commander, Pisistratus the tyrant's grandson and Darius son
        # of Artaxerxes all belong to books that are not yet authored, so their
        # names carry no card rather than the Book 1 man's. The Darius
        # Aristagoras fled from, at the founding of Amphipolis, is Hystaspes's
        # son and is bound.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c<=5 for c,_ in where(ed,'cyrus')),ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'hippias')}),[1,19],ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'darius')}),[1,14,19],ed)
            self.assertTrue(all(c in (1,11,19) for c,_ in where(ed,'pisistratus')),ed)
            self.assertNotIn('cyrus',ids(ed,7,20),ed)
            self.assertNotIn('hippias',ids(ed,9,33),ed)
            self.assertIn('pisistratus',ids(ed,19,22),ed)
            self.assertIn('pisistratus-archon',ids(ed,19,22),ed)
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
            self.assertEqual(where(ed,'chrysis-argos')[0],(6,1),ed)
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
            self.assertEqual(where(ed,'nicias-father-of-hagnon'),[(7,13),(14,28)],ed)
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
                              ('perdiccas',[2,8,14,16]),('phormio',[2,8]),
                              ('pleistoanax',[4,6,15]),('hagnon',[4,7,14]),
                              ('aristeus-adimantus',[2,7]),
                              ('plataeans',[6]),('athenians',[1,7,19])]:
                got=[s['availableAt']['chapterNumber'] for s in snapshots(cid,ed)]
                self.assertEqual(got,gates,(ed,cid))

    # ------------------------------------------------ Book 3 (chapters 9-11)
    def test_the_two_men_called_asopius_are_father_and_son(self):
        # Phormio's father, and the son the Acarnanians insisted on.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'asopius'),[(2,33)],ed)
            self.assertEqual(sorted(set(where(ed,'asopius-son-of-phormio'))),[(9,6)],ed)

    def test_the_three_men_called_pausanias(self):
        # The Macedonian, the regent, and the boy king Pleistoanax's son.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pausanias-macedon'),[(2,31)],ed)
            self.assertEqual(where(ed,'pausanias-king'),[(9,25)],ed)
            self.assertIn((10,18),where(ed,'pausanias-sparta'),ed)
            self.assertNotIn('pausanias-sparta',ids(ed,9,25),ed)

    def test_the_four_men_called_nicias_and_callias(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'nicias-niceratus')}),
                             [10,11,12,13,14,15,16,18,19,20],ed)
            self.assertEqual(where(ed,'callias-father-of-hipponicus'),[(11,4)],ed)
            self.assertNotIn('nicias-gortys',ids(ed,10,0),ed)
            self.assertNotIn('callias-calliades',ids(ed,11,4),ed)

    def test_the_river_eurymedon_is_water_and_the_general_is_a_man(self):
        # Book 1's Eurymedon is a river in Pamphylia and carries no card.
        for ed in ['original-en','modern-en']:
            self.assertNotIn('eurymedon',ids(ed,4,7),ed)
            self.assertTrue(all(c in (10,11,12,13,18) for c,_ in where(ed,'eurymedon')),ed)

    def test_the_locrians_of_italy_are_not_the_locrians_of_greece(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'locrians-italy')}),[10,11,12,15],ed)
            self.assertIn((1,5),where(ed,'locrians'),ed)
            self.assertNotIn('locrians',ids(ed,10,36),ed)

    def test_the_soothsayer_and_the_general_called_tolmides(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'tolmides-soothsayer'),[(9,19)],ed)
            self.assertEqual(sorted({p for _,p in where(ed,'tolmides')}),[13,17],ed)

    def test_the_two_men_called_hippias_and_the_two_called_cleomenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'hippias')}),[1,19],ed)
            self.assertTrue(all(c==9 for c,_ in where(ed,'hippias-arcadia')),ed)
            self.assertEqual(where(ed,'cleomenes'),[(5,7)],ed)
            self.assertEqual(where(ed,'cleomenes-commander'),[(9,25)],ed)

    def test_xenoclides_is_one_man_under_two_spellings(self):
        # Xenoclides at 2:21 and Xenocleides at 11:32, both son of Euthycles.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'xenoclides')}),[2,11],ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'euthycles')}),[2,11],ed)

    def test_the_historian_signs_each_year_and_loses_a_city(self):
        # "of which Thucydides was the historian" closes years four to nine; and
        # at Amphipolis he appears in his own narrative as a commander, named
        # with his father and with the office that gave him his standing there.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'thucydides'),
                             [(1,0),(7,25),(8,33),(9,24),(11,1),(11,34),
                              (13,9),(14,30),(14,31),(14,32),(14,33),(14,70),
                              (16,1),(18,6),(20,34)],ed)
            self.assertEqual(where(ed,'olorus'),[(14,30)],ed)

    # ----------------------------------------------- Book 4 (chapters 12-14)
    def test_the_three_men_called_aristeus(self):
        # Two Corinthians in Books 1 and 2, and the Lacedaemonian sent out with
        # Ischagoras to see how Brasidas was getting on.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristeus-lacedaemon'),[(14,67)],ed)
            self.assertNotIn('aristeus-adimantus',ids(ed,14,67),ed)
            self.assertNotIn('aristeus-pellichas',ids(ed,14,67),ed)

    def test_the_two_men_called_theagenes(self):
        # The tyrant of Megara whose daughter Cylon married, and the Athenian
        # chosen with Cleon to go and look at Pylos.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'theagenes-athens'),[(12,34),(15,26),(15,35)],ed)
            self.assertTrue(all(c==5 for c,_ in where(ed,'theagenes')),ed)

    def test_the_two_men_called_aristides(self):
        # Lysimachus's son on the embassy about the wall, and Archippus's son
        # who arrested Artaphernes. The Aristides of the tribute assessment in
        # Book 5 is not yet authored and carries no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristides'),[(4,1),(15,20)],ed)
            self.assertEqual(where(ed,'aristides-archippus'),[(13,8),(14,0)],ed)
            self.assertIn('aristides',ids(ed,15,20),ed)

    def test_the_two_men_called_tolmaeus(self):
        # Tolmides's father and Autocles's father. The history never says
        # whether they are the same man, so the cards do not say it either.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({p for _,p in where(ed,'tolmaeus')}),[13,17],ed)
            self.assertEqual(where(ed,'tolmaeus-father-of-autocles'),
                             [(13,11),(14,54)],ed)
            self.assertEqual(where(ed,'autocles'),[(13,11),(14,54)],ed)

    def test_the_two_men_called_lycophron(self):
        # The Lacedaemonian commissioner sent to Cnemus, and the Corinthian
        # general killed at Solygia.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'lycophron'),[(8,14)],ed)
            self.assertEqual(sorted({c for c,_ in where(ed,'lycophron-corinth')}),[13],ed)

    def test_hippocrates_is_ariphrons_son_and_nobody_else(self):
        # The tyrant of Gela in Book 6 and the Lacedaemonian of Book 8 belong to
        # chapters that are not yet authored, and carry no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'hippocrates-ariphron')}),
                             [13,14],ed)
            for at in [(18,4),(24,38),(26,19),(26,28)]:
                self.assertNotIn('hippocrates-ariphron',ids(ed,*at),(ed,at))
            self.assertEqual(where(ed,'ariphron'),[(13,24)],ed)

    def test_the_fathers_who_share_a_name_with_a_later_commander(self):
        # Hermocrates's father, the Athenian general at Amphipolis and
        # Pasitelidas's father are each bound only where they stand; the Hermon
        # at Munychia, the Syracusan Eucles and the Thespian Hegesander are
        # other men in chapters not yet authored.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'hermon'),[(13,16),(19,0),(20,10)],ed)
            self.assertEqual(where(ed,'eucles'),[(14,30)],ed)
            self.assertEqual(where(ed,'hegesander'),[(14,67)],ed)
            self.assertNotIn('hermon',ids(ed,26,12),ed)
            self.assertNotIn('eucles',ids(ed,20,44),ed)
            self.assertNotIn('hegesander',ids(ed,21,20),ed)

    def test_the_two_men_called_archias(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'archias-camarina'),[(12,32)],ed)
            self.assertEqual(where(ed,'archias-corinth'),[(18,2)],ed)

    def test_the_two_men_called_aristonymus_three_paragraphs_apart(self):
        # Euphamidas's father signs the armistice at 14:54; the Athenian
        # commissioner who refused to include Scione appears at 14:57.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristonymus'),[(6,33),(14,54)],ed)
            self.assertEqual(sorted({p for _,p in where(ed,'aristonymus-athens')}),[57],ed)
            self.assertNotIn('aristonymus',ids(ed,14,57),ed)

    def test_diitrephes_is_bound_only_as_nicostratus_father(self):
        # Diotrephes at the taking of Cythera is the same father under another
        # spelling; the Diitrephes who takes the Thracians home in Books 7 and 8
        # is never identified with him and carries no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'diitrephes'),[(10,25),(13,11),(14,54),(14,64)],ed)
            self.assertIn('Diotrephes',[m['text'] for m in mentions(ed)
                                        if m['characterId']=='diitrephes'],ed)
            for at in [(21,30),(25,24)]:
                self.assertNotIn('diitrephes',ids(ed,*at),(ed,at))

    def test_seuthes_father_is_one_man_under_two_spellings(self):
        # Spardacus at the Odrysian succession in Book 2, Sparadocus at Sitalces's
        # death in Book 4.
        for ed in ['original-en','modern-en']:
            texts={m['text'] for m in mentions(ed) if m['characterId']=='spardacus'}
            self.assertEqual(texts,{'Spardacus','Sparadocus'},ed)

    def test_the_chalcidians_of_thrace_are_not_the_chalcidian_race_in_sicily(self):
        # Hermocrates argues at Gela that Chalcidian blood will not protect
        # anyone; those Chalcidians are Ionians of Sicily, not Brasidas's allies
        # on the Thracian seaboard. Neither form takes a default, so the
        # Chalcidians of Books 6 and 7 stay unbound until they are authored.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'chalcidians-sicily')}),
                             [10,12,13,18,19,20],ed)
            self.assertTrue(all(c<=18 for c,_ in where(ed,'chalcidians')),ed)
            self.assertIn('chalcidians',ids(ed,18,9),ed)
            self.assertNotIn('chalcidians',ids(ed,18,2),ed)
            self.assertIn('chalcidians',ids(ed,14,4),ed)

    def test_the_singular_locrian_is_split_like_the_plural(self):
        for ed in ['original-en','modern-en']:
            texts={m['text'] for m in mentions(ed) if m['characterId']=='locrians-italy'}
            self.assertIn('Locrian',texts,ed)
            self.assertIn((11,2),where(ed,'locrians'),ed)
            self.assertIn((12,0),where(ed,'locrians-italy'),ed)

    def test_the_boeotian_orchomenians_are_not_the_arcadian_ones(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'orchomenians-boeotia'),[(14,17)],ed)
            self.assertNotIn('orchomenians-boeotia',ids(ed,16,6),ed)

    def test_every_signatory_of_the_armistice_is_cast(self):
        # Eleven names and their fathers in one paragraph, plus the three
        # Athenian generals.
        for ed in ['original-en','modern-en']:
            at=set(ids(ed,14,54))
            for cid in ['taurus','echetimides','athenaeus','pericleidas',
                        'philocharidas','eryxidaidas','aeneas','ocytus',
                        'damotimus','naucrates','onasimus','megacles','nicasus',
                        'cecalus','menecrates','amphidorus','amphias','eupaidas',
                        'nicostratus','diitrephes','nicias-niceratus','autocles',
                        'tolmaeus-father-of-autocles','euphamidas','aristonymus']:
                self.assertIn(cid,at,(ed,cid))

    def test_the_spartan_chain_of_command_on_sphacteria(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((12,7),where(ed,'epitadas'),ed)
            self.assertEqual(where(ed,'molobrus'),[(12,7)],ed)
            self.assertEqual(where(ed,'hippagretas'),[(12,46)],ed)
            self.assertEqual(sorted({p for _,p in where(ed,'styphon')}),[46],ed)
            self.assertEqual(where(ed,'pharax'),[(12,46)],ed)

    def test_the_modern_edition_alone_calls_the_territory_messinian(self):
        # The older translation says "the territory of Messina" at 12:31, so the
        # people carry a card there in one edition only. Recorded, not repaired.
        self.assertIn('Messinian',[m['text'] for m in mentions('modern-en')
                                   if m['characterId']=='messinese'])
        self.assertNotIn('Messinian',[m['text'] for m in mentions('original-en')])
        self.assertNotIn((12,31),where('original-en','messinese'))

    def test_the_older_translation_alone_names_the_messinese_at_mylae(self):
        # 11:1 and 11:3 name them in the older translation; the modern edition
        # says "Messina" and "the people of Messina" instead.
        o={c for c,_ in where('original-en','messinese')}
        m={c for c,_ in where('modern-en','messinese')}
        self.assertIn(11,o)
        self.assertNotIn(11,m)

    def test_book_four_outcomes_are_gated(self):
        for ed in ['original-en','modern-en']:
            for cid,gates in [('brasidas',[6,12,14,15]),('cleon',[9,12,15]),
                              ('demosthenes',[11,12]),('nicias-niceratus',[10,14,16,20]),
                              ('thucydides',[1,14,16]),('helots',[4,14,16]),
                              ('lacedaemonians',[1,13,16]),('megarians',[2,13]),
                              ('boeotians',[1,14]),('corcyraeans',[1,13]),
                              ('messenians',[4,8,12,16]),('aeginetans',[2,6,13]),
                              ('sitalces',[6,14]),('seuthes',[8,14])]:
                got=[s['availableAt']['chapterNumber'] for s in snapshots(cid,ed)]
                self.assertEqual(got,gates,(ed,cid))

    # ----------------------------------------------- Book 5 (chapters 15-17)
    def test_the_two_men_called_aristocles(self):
        # Pleistoanax's brother, accused with him over the Delphic oracle; and
        # the polemarch who would not move his company at Mantinea.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristocles-brother-of-pleistoanax'),[(15,14)],ed)
            self.assertEqual(where(ed,'aristocles-polemarch'),[(16,56),(16,57)],ed)
            self.assertEqual(where(ed,'hipponoidas'),[(16,56),(16,57)],ed)

    def test_the_two_men_called_xenares(self):
        # The ephor who kept the Boeotian alliance, and Cnidis's son killed at
        # Heraclea. The history does not identify them, so neither card does.
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({p for _,p in where(ed,'xenares')}),[11,12,13,22],ed)
            self.assertEqual(where(ed,'xenares-cnidis'),[(16,37)],ed)
            self.assertEqual(where(ed,'cnidis'),[(16,37)],ed)

    def test_the_signatory_named_for_a_town(self):
        # Acanthus is a Lacedaemonian signatory here and an Andrian colony
        # everywhere else in the work; the town carries no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'acanthus-signatory'),[(15,26),(15,35)],ed)
            for at in [(14,8),(14,12),(15,20)]:
                self.assertNotIn('acanthus-signatory',ids(ed,*at),(ed,at))

    def test_the_signatories_without_patronymics_are_not_identified(self):
        # Seventeen Athenians and seventeen Lacedaemonians swear to the peace and
        # again to the alliance, and the lists give no patronymics. Where the
        # name also belongs to a commander in a book not yet authored, or to an
        # earlier man who is dead, the signatory gets his own card and the other
        # occurrences stay unbound.
        for ed in ['original-en','modern-en']:
            for cid in ['euthydemus-signatory','thrasycles-signatory',
                        'aristocrates-signatory','procles-signatory',
                        'pythodorus-signatory','tellis-signatory',
                        'timocrates-athens','leon-athens','isthmonicus','lampon',
                        'myrtilus','iolcius']:
                self.assertEqual(where(ed,cid),[(15,26),(15,35)],(ed,cid))
            self.assertNotIn('euthydemus-signatory',ids(ed,21,17),ed)
            self.assertNotIn('thrasycles-signatory',ids(ed,24,15),ed)
            self.assertNotIn('aristocrates-signatory',ids(ed,26,9),ed)
            self.assertNotIn('procles',ids(ed,15,26),ed)
            self.assertNotIn('tellis',ids(ed,15,26),ed)

    def test_the_two_lists_spell_two_signatories_differently(self):
        # Damagetis/Damagetus and Isthmonicus/Isthmionicus, one card each.
        for ed in ['original-en','modern-en']:
            self.assertEqual({m['text'] for m in mentions(ed)
                              if m['characterId']=='damagetus'},
                             {'Damagetis','Damagetus'},ed)
            self.assertEqual({m['text'] for m in mentions(ed)
                              if m['characterId']=='isthmonicus'},
                             {'Isthmonicus','Isthmionicus'},ed)

    def test_alcibiades_arrives_and_his_father_is_not_cleopomps(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(sorted({c for c,_ in where(ed,'alcibiades')})[0],16,ed)
            self.assertEqual(where(ed,'clinias-father-of-alcibiades'),
                             [(16,19),(16,38),(18,7),(18,14)],ed)
            self.assertEqual(where(ed,'clinias'),[(6,28),(7,13)],ed)

    def test_the_three_men_called_leon(self):
        # One of the founders of Heraclea, an Athenian signatory, and one of the
        # three Lacedaemonians sent to head off the Argive alliance. The Leons of
        # Books 6 and 8 belong to chapters not yet authored.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'leon-heraclea'),[(11,5)],ed)
            self.assertEqual(where(ed,'leon-athens'),[(15,26),(15,35)],ed)
            self.assertEqual(where(ed,'leon-sparta'),[(16,21)],ed)
            for at in [(20,38),(24,26),(25,10)]:
                self.assertEqual([m for m in ids(ed,*at) if m.startswith('leon')],
                                 [],(ed,at))

    def test_the_two_men_called_pharnaces_and_the_two_called_lycomedes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pharnaces'),[(5,10)],ed)
            self.assertEqual(where(ed,'pharnaces-satrap'),[(15,0)],ed)
            self.assertEqual(where(ed,'lycomedes'),[(2,28)],ed)
            self.assertEqual(where(ed,'lycomedes-father-of-cleomedes'),[(17,0)],ed)

    def test_ramphias_carries_one_card_across_ten_years(self):
        # The ultimatum envoy of Book 1 and the commander of Book 5 are given no
        # patronymic either time, and are read as one man; Clearchus's father in
        # Book 8 is left unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'ramphias'),
                             [(5,22),(15,10),(15,11),(15,12)],ed)
            for at in [(24,8),(24,47),(26,0)]:
                self.assertNotIn('ramphias',ids(ed,*at),(ed,at))

    def test_the_arcadian_orchomenians_and_the_boeotian_ones(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'orchomenians-boeotia'),[(14,17)],ed)
            self.assertEqual(sorted({p for _,p in where(ed,'orchomenians-arcadia')}),
                             [47,64],ed)

    def test_the_freed_helots_have_their_own_cards(self):
        # The Brasideans and the Neodamodes stand side by side in the
        # Lacedaemonian line at Mantinea and are not the Helots' card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'brasideans'),[(16,56),(16,57)],ed)
            self.assertIn((16,52),where(ed,'neodamodes'),ed)
            self.assertIn((16,52),where(ed,'sciritae'),ed)
            self.assertTrue(all(c in (16,21,23,24) for c,_ in where(ed,'neodamodes')),ed)

    def test_the_historian_says_how_he_came_to_know(self):
        # The second preface: twenty years of exile after Amphipolis, and the
        # argument that the ten years' peace was no peace.
        for ed in ['original-en','modern-en']:
            self.assertIn((16,1),where(ed,'thucydides'),ed)

    def test_book_five_outcomes_are_gated(self):
        for ed in ['original-en','modern-en']:
            for cid,gates in [('brasidas',[6,12,14,15]),('cleon',[9,12,15]),
                              ('nicias-niceratus',[10,14,16,20]),
                              ('pleistoanax',[4,6,15]),('agis',[11,16]),
                              ('thucydides',[1,14,16]),('argives',[1,16]),
                              ('melians',[11,17]),('scionaeans',[14,16]),
                              ('helots',[4,14,16]),('corinthians',[1,16]),
                              ('eleans',[2,16]),('mantineans',[11,16]),
                              ('clearidas',[14,15]),('perdiccas',[2,8,14,16])]:
                got=[s['availableAt']['chapterNumber'] for s in snapshots(cid,ed)]
                self.assertEqual(got,gates,(ed,cid))

    # ----------------------------------------------- Book 6 (chapters 18-20)
    def test_the_founders_of_sicily_are_not_the_men_of_the_same_names(self):
        # The archaeology of Sicily brings four names back that already belong
        # to somebody: the Thucles who founded Naxos against Eurymedon's father,
        # the Archias who founded Syracuse against the Camarinaean traitor, the
        # Evarchus the Catanians chose against the tyrant of Astacus, and the
        # Hippocrates who was tyrant of Gela against Ariphron's son.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'thucles-founder'),[(18,2),(18,2)],ed)
            self.assertEqual(where(ed,'archias-corinth'),[(18,2)],ed)
            self.assertEqual(where(ed,'evarchus-catana'),[(18,2)],ed)
            self.assertEqual(where(ed,'hippocrates-gela'),[(18,4)],ed)
            self.assertNotIn('thucles',ids(ed,18,2),ed)
            self.assertNotIn('evarchus',ids(ed,18,2),ed)
            self.assertNotIn('hippocrates-ariphron',ids(ed,18,4),ed)

    def test_two_pisistratuses_in_one_paragraph(self):
        # 19:22 names the tyrant twice and his grandson the archon once, so that
        # paragraph is keyed by occurrence rather than by paragraph.
        for ed in ['original-en','modern-en']:
            at=[m['characterId'] for m in mentions(ed)
                if (m['chapterNumber'],m['paragraphIndex'])==(19,22)
                and m['characterId'].startswith('pisistratus')]
            self.assertEqual(at,['pisistratus','pisistratus','pisistratus-archon'],ed)
            self.assertEqual(where(ed,'pisistratus-archon'),[(19,22),(19,23)],ed)

    def test_thucydides_corrects_the_athenians_about_their_own_tyrants(self):
        # Hippias, not Hipparchus, was the eldest and the tyrant; the proof is
        # Myrrhine's five children on the pillar, and her father Callias — a
        # fifth man of that name.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'myrrhine'),[(19,24)],ed)
            self.assertEqual(where(ed,'callias-father-of-myrrhine'),[(19,24)],ed)
            self.assertEqual(where(ed,'hyperechides'),[(19,24)],ed)
            self.assertIn('hippias',ids(ed,19,24),ed)
            self.assertNotIn('hippias-arcadia',ids(ed,19,24),ed)

    def test_the_two_men_called_heraclides_father_and_the_two_called_lysimachus(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'lysimachus'),[(4,1)],ed)
            self.assertEqual(where(ed,'lysimachus-father-of-heraclides'),[(20,11)],ed)
            self.assertEqual(where(ed,'heraclides'),[(20,11),(20,44)],ed)

    def test_the_two_men_called_eucles(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'eucles'),[(14,30)],ed)
            self.assertEqual(where(ed,'eucles-syracuse'),[(20,44)],ed)

    def test_the_ionian_and_sicilian_seas_are_water(self):
        # Same rule as the Hellenic sea of Book 1. "Ionian" is bound to the
        # people by default with a lookahead for sea and gulf; "Sicilian" has
        # nothing to look ahead for, so its three water positions are suppressed
        # by name.
        for ed in ['original-en','modern-en']:
            for at in [(1,13),(8,26),(18,12),(18,30),(19,2),(19,12),(20,45)]:
                texts=[m['text'] for m in mentions(ed)
                       if (m['chapterNumber'],m['paragraphIndex'])==at
                       and m['characterId']=='ionians']
                self.assertNotIn('Ionian',texts,(ed,at))
            self.assertIn((1,5),where(ed,'ionians'),ed)
            self.assertIn((20,13),where(ed,'ionians'),ed)
            for at in [(12,30),(13,11),(18,12)]:
                self.assertNotIn('sicilians',ids(ed,*at),(ed,at))
            self.assertIn((18,18),where(ed,'sicilians'),ed)

    def test_the_river_sicanus_and_the_general_and_the_place_called_leon(self):
        # Two more pieces of geography that read like people.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'sicanus'),[(20,11)],ed)
            self.assertNotIn('sicanus',ids(ed,18,1),ed)
            self.assertIn('sicanians',ids(ed,18,1),ed)
            self.assertEqual([m for m in ids(ed,20,38) if m.startswith('leon')],[],ed)

    def test_the_two_men_called_athenagoras(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'athenagoras'),[(19,3),(19,9)],ed)
            self.assertNotIn('athenagoras',ids(ed,24,5),ed)

    def test_the_hermae_are_cast_although_they_are_objects(self):
        # The one exception to the rule that only people and peoples are cast.
        # Thucydides never explains what they are, never names Hermes, and the
        # whole of Book 6 turns on them.
        for ed in ['original-en','modern-en']:
            chs={c for c,_ in where(ed,'hermae')}
            self.assertEqual(chs,{18,19},ed)

    def test_the_spelling_phytodorus_is_not_identified_with_pythodorus(self):
        # Both editions print Phytodorus at 20:46, with no patronymic; the two
        # Pythodoruses of the earlier books are left out of it.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'phytodorus'),[(20,46)],ed)
            self.assertNotIn('pythodorus',ids(ed,20,46),ed)
            self.assertNotIn('pythodorus-isolochus',ids(ed,20,46),ed)

    def test_book_six_outcomes_are_gated(self):
        for ed in ['original-en','modern-en']:
            for cid,gates in [('nicias-niceratus',[10,14,16,20]),
                              ('alcibiades',[16,20]),('lamachus',[14,20]),
                              ('hermocrates',[13,20]),('syracusans',[10,20]),
                              ('hippias',[1,19]),('harmodius',[1,19]),
                              ('aristogiton',[1,19]),('athenians',[1,7,19]),
                              ('sicels',[11,20]),('camarinaeans',[13,20]),
                              ('rhegians',[10,19])]:
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
