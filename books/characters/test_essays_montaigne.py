"""Focused checks for Montaigne's Essays.
Chapters 1-25 of 107 are authored."""
import unittest
from build_essays_montaigne import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return sorted({(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid})
def order(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]
def said(ed,cid):return [m['text'] for m in mentions(ed) if m['characterId']==cid]
def ids(ed,ch,pi):
    return [m['characterId'] for m in mentions(ed)
            if m['chapterNumber']==ch and m['paragraphIndex']==pi]
def spans(ed,ch,pi):
    return [(m['characterId'],m['text']) for m in mentions(ed)
            if m['chapterNumber']==ch and m['paragraphIndex']==pi]

class EssaysMontaigne(unittest.TestCase):
    # -------------------------------------------------------- the two editions
    def test_the_modern_edition_modernises_the_transliterations(self):
        # This is the package's characteristic difficulty: one man under two
        # spellings, because the modern edition updates the names.
        for cid,older,newer in [('wycliffe','Wicliffe','Wycliffe'),
                                ('john-zisca','John Zisca','John Zizka'),
                                ('theodoro-trivulzio','Theodoro Trivulzio','Theodoro Trivulzio'),
                                ('alessandro-trivulcio','Alessandro Trivulcio','Alessandro Trivulzio'),
                                ('fabrizio-colonna','Fabricio Colonna','Fabrizio Colonna'),
                                ('juliano-romero','Juliano Romero','Giuliano Romero'),
                                ('ottaviano-fregoso','Ottaviano Fregosa','Ottaviano Fregoso'),
                                ('lucius-aemilius-regillus','Lucius AEmilius Regillus','Lucius Aemilius Regillus'),
                                ('marcus-aemilius-lepidus','Marcus. Emilius Lepidus','Marcus Aemilius Lepidus')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_sylla_and_sulla_are_one_card(self):
        self.assertIn((1,5),where('original-en','sylla'))
        self.assertIn((1,5),where('modern-en','sylla'))

    def test_henry_de_vaux_is_henri_in_the_modern_edition(self):
        self.assertIn('Henry',said('original-en','henry-de-vaux'))
        self.assertIn('Henri de Vaux',said('modern-en','henry-de-vaux'))

    def test_the_modern_edition_alone_calls_the_prince_the_black_prince(self):
        # A translator's gloss, not a name in Cotton.
        self.assertIn('Black Prince',said('modern-en','edward-black-prince'))
        self.assertNotIn('Black Prince',said('original-en','edward-black-prince'))

    # ------------------------------------------------------------- namesakes
    def test_the_two_men_called_edward(self):
        # Edward III's son at 1:1; Edward I at 3:11. Three more Edwards wait in
        # chapters not yet authored and carry no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'edward-black-prince'),[(1,1)],ed)
            self.assertEqual(where(ed,'edward-i'),[(3,11)],ed)
            self.assertNotIn('edward-black-prince',ids(ed,41,7),ed)
            self.assertNotIn('edward-i',ids(ed,41,7),ed)

    def test_zeno_of_messina_is_not_the_stoic(self):
        # The citizen who took his city's fault on himself, at 1:5. Every other
        # Zeno in the Essays is the founder of the Stoa and carries no card yet.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'zeno-mamertine'),[(1,5)],ed)
            for k in [(69,235),(69,613)]:
                self.assertEqual([c for c in ids(ed,*k) if c.startswith('zeno')],[],(ed,k))

    def test_the_two_plinys(self):
        # Pliny the Elder of the Natural History at 9:6; the younger Pliny of
        # the letters appears at 38:45 and 39:0 and is not yet authored.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pliny-elder'),[(9,6),(20,4),(22,2)],ed)
            for k in [(38,45),(39,0)]:
                self.assertNotIn('pliny-elder',ids(ed,*k),(ed,k))

    def test_the_two_men_called_diodorus(self):
        # The dialectician who died of shame at 2:21; Diodorus Siculus the
        # historian at 69:532 and 74:18.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'diodorus-dialectician'),[(2,21)],ed)
            for k in [(69,532),(74,18)]:
                self.assertNotIn('diodorus-dialectician',ids(ed,*k),(ed,k))

    def test_the_two_kings_called_darius(self):
        # Darius III, whom Alexander would not attack by night, at 6:8; Darius I
        # and his prompter about the Athenians at 9:2.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'darius-iii'),[(6,8),(23,7)],ed)
            self.assertEqual(where(ed,'darius-i'),[(9,2),(12,2),(22,21)],ed)

    def test_the_three_men_called_du_bellay(self):
        # Martin the memoirist at 5:9; Cardinal Jean at 10:3; the poet Joachim
        # in chapters 24, 25 and 74, who carries no card yet.
        for ed in ['original-en','modern-en']:
            self.assertIn((5,9),where(ed,'martin-du-bellay'),ed)
            self.assertIn((14,1),where(ed,'martin-du-bellay'),ed)
            self.assertEqual(where(ed,'jean-du-bellay'),[(10,3)],ed)
            for k in [(74,157)]:
                self.assertEqual([c for c in ids(ed,*k) if 'bellay' in c],[],(ed,k))

    def test_the_two_men_called_trivulzio(self):
        # Theodoro, who would not ask the Veronese for a safe-conduct, and
        # Alessandro, killed at the Reggio parley. Bound by their given names,
        # because the surname alone never appears.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'theodoro-trivulzio'),[(3,10)],ed)
            self.assertEqual(where(ed,'alessandro-trivulcio'),[(5,9)],ed)

    def test_perseus_is_the_king_of_macedon_and_not_the_gorgon_slayer(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'perseus-macedon'),[(5,0)],ed)
            for k in [(44,1),(69,268),(107,53)]:
                self.assertNotIn('perseus-macedon',ids(ed,*k),(ed,k))

    def test_guelph_the_duke_is_not_guelph_the_faction(self):
        # At 106:51 Montaigne is a Guelph to the Ghibelline and a Ghibelline to
        # the Guelph; that is a party, not the Duke of Bavaria.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'guelph'),[(1,3)],ed)
            self.assertNotIn('guelph',ids(ed,106,51),ed)

    def test_the_two_counts_of_nassau_and_the_two_dukes_of_alva(self):
        # The Count who besieged Mousson and the Count who entered Guise get a
        # card each, and the second card says the Essays do not identify them.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'nassau'),[(5,9)],ed)
            self.assertEqual(where(ed,'nassau-guise'),[(15,5)],ed)
            self.assertEqual(where(ed,'duke-of-alva'),[(7,0)],ed)
            self.assertNotIn('duke-of-alva',ids(ed,74,157),ed)

    def test_lepidus_is_bound_by_his_full_name_only(self):
        # 19:24's AEmilius Lepidus died of a stumble at his own threshold and
        # 23:1's Lepidus followed Salvidienus; neither is the man of 3:15. The
        # bare surname had been binding 19:24 until the sweep caught it.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'marcus-aemilius-lepidus'),[(3,15)],ed)
            for k in [(19,24),(23,1),(94,19),(99,157)]:
                self.assertNotIn('marcus-aemilius-lepidus',ids(ed,*k),(ed,k))

    def test_messire_francesco_is_the_ambassador_and_not_his_master(self):
        for ed in ['original-en','modern-en']:
            self.assertIn(('francesco-taverna','Messire Francesco'),spans(ed,9,8),ed)

    def test_conrad_ferdinand_and_robert_are_keyed_to_their_own_paragraphs(self):
        # Conrad of Monteferrat at 86:19, King Ferdinand of the Indies at 107:9
        # and the King Robert of 33:7 are other men.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'conrad-iii'),[(1,3)],ed)
            self.assertEqual(where(ed,'ferdinand'),[(2,9)],ed)
            self.assertEqual(where(ed,'robert-bruce'),[(3,11)],ed)
            self.assertNotIn('conrad-iii',ids(ed,86,19),ed)
            self.assertNotIn('ferdinand',ids(ed,107,9),ed)
            self.assertNotIn('robert-bruce',ids(ed,33,7),ed)

    # --------------------------------------------------------- person or not
    def test_the_works_named_in_the_citations_are_not_cast(self):
        # Every citation in the Essays names a book as well as an author. The
        # author is cast; the book is not.
        titles={'AEneid','Aeneid','Met','Tusc','Epist','Hippolytus','Sonetto',
                'Epig','Poetica','Nat','Hist','Choro','Chorus','Troades'}
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertNotIn(m['text'],titles,(ed,m['characterId'],m['text']))

    def test_schools_and_peoples_are_not_cast(self):
        # The editorial check that a school is not a person, applied to a writer
        # who names them constantly.
        names={'Stoics','Pythagoreans','Epicureans','Romans','Lacedaemonians',
               'Athenians','Greeks','Macedonians','Mamertines','Spaniards',
               'Florentines','Italians','Corinthians','Boeotians','Indians',
               'Scots','Veronese','Limousins','Innamoratos','Innamorati'}
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertNotIn(m['text'],names,(ed,m['characterId'],m['text']))

    def test_augustus_is_bound_as_one_span_with_caesar(self):
        for ed in ['original-en','modern-en']:
            self.assertIn(('augustus','Augustus Caesar'),spans(ed,4,10),ed)

    def test_both_editions_abbreviate_horace_to_hor_in_some_citations(self):
        # "Hor., De Arte Poetica" in one place and "Horace, Ars Poetica" in
        # another, in both editions. The abbreviation carries the same card.
        for ed in ['original-en','modern-en']:
            self.assertIn('Hor',said(ed,'horace'),ed)
            self.assertIn('Horace',said(ed,'horace'),ed)

    # ----------------------------------------------------------------- scope
    def test_montaigne_names_himself_late(self):
        # He is the central figure of his own book and names himself twenty-odd
        # times in a hundred and seven chapters, first at 28:2.
        for ed in ['original-en','modern-en']:
            w=where(ed,'montaigne')
            self.assertEqual(w[0],(28,2),ed)
            self.assertLess(len(w),40,ed)

    def test_only_the_first_twenty_five_chapters_are_authored(self):
        self.assertIn('chapters 1-25 of 107',REPORT['scope'])
        self.assertEqual(REPORT['editions']['original-en']['chapters'],107)
        self.assertEqual(REPORT['editions']['original-en']['paragraphs'],4897)
        self.assertEqual(REPORT['editions']['modern-en']['paragraphs'],4897)

    def test_every_table_refuses_to_default(self):
        # A name a later chapter will give to somebody else carries no card at
        # all outside the paragraphs keyed here.
        import build_essays_montaigne as B
        for pat,(table,default) in B.SPLIT.items():
            self.assertIsNone(default,pat)
            self.assertTrue(table,pat)

    def test_no_entity_is_missing_from_either_edition(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(REPORT['editions'][ed]['omittedEntities'],[],ed)

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

    # ------------------------------------------- added with chapters 11-20
    def test_the_three_men_called_aemilius(self):
        # Marcus Aemilius Lepidus, who forbade his heirs to pay for his hearse
        # (3:15); the Aemilius Lepidus who died of a stumble at his own
        # threshold (19:24); and Paulus Aemilius, who conquered Macedon (19:37).
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'marcus-aemilius-lepidus'),[(3,15)],ed)
            self.assertEqual(where(ed,'aemilius-lepidus-threshold'),[(19,24)],ed)
            self.assertIn((19,37),where(ed,'paulus-aemilius'),ed)
            self.assertNotIn('aemilius-lepidus-threshold',ids(ed,3,15),ed)
            self.assertNotIn('marcus-aemilius-lepidus',ids(ed,19,24),ed)

    def test_the_two_dukes_of_milan_called_sforza(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'francesco-sforza'),[(9,8)],ed)
            self.assertEqual(where(ed,'ludovico-sforza'),[(18,3)],ed)

    def test_charles_v_and_charles_iv(self):
        # Charles V in four paragraphs; the Charles of 20:22 is the Emperor and
        # King of Bohemia, who was shown the hairy girl from near Pisa.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'charles-v'),[(7,0),(11,14),(12,3),(16,8)],ed)
            self.assertEqual(where(ed,'charles-iv'),[(20,22)],ed)

    def test_julius_caesar_and_augustus_caesar_are_kept_apart(self):
        # The Caesar table is keyed only to Julius's three paragraphs; the
        # "Augustus Caesar" of 4:10 is bound by his own longer alias.
        for ed in ['original-en','modern-en']:
            for k in [(16,3),(19,67),(19,71),(22,54),(23,13),(23,18)]:
                self.assertIn(k,where(ed,'julius-caesar'),(ed,k))
            # The full name "Julius Caesar" is unambiguous, so it is an alias and
            # binds in chapters not yet authored as well.
            self.assertIn((25,138),where(ed,'julius-caesar'),ed)
            self.assertNotIn('julius-caesar',ids(ed,4,10),ed)
            self.assertIn(('augustus','Augustus Caesar'),spans(ed,4,10),ed)

    def test_diogenes_the_atheist_is_not_the_cynic(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'diogenes-the-atheist'),[(11,31)],ed)
            for k in [(27,28),(50,7),(60,6),(68,61)]:
                self.assertNotIn('diogenes-the-atheist',ids(ed,*k),(ed,k))

    def test_the_emperor_leo_is_not_pope_leo_x(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'leo-the-emperor'),[(11,32)],ed)
            self.assertNotIn('leo-the-emperor',ids(ed,2,21),ed)
            self.assertNotIn('leo-x',ids(ed,11,32),ed)

    def test_crassus_is_bound_in_both_of_his_paragraphs(self):
        # The chapter names him at 16:9 and comes back to him at the end of
        # 16:10; the second paragraph was unkeyed until the table audit.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'publius-crassus'),[(16,9),(16,10)],ed)

    def test_the_gonzaga_father_and_son_get_a_card_each(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'ludovico-gonzaga'),[(19,24)],ed)
            self.assertEqual(where(ed,'guido-di-gonzaga'),[(19,24)],ed)
            self.assertIn(('guido-di-gonzaga','Guido di Gonzaga'),spans(ed,19,24),ed)

    def test_saint_paul_at_17_2_is_a_town(self):
        # "when St. Paul was taken from us by the Comte de Bures" is the town of
        # Saint-Paul, not the apostle. Nothing binds it.
        for ed in ['original-en','modern-en']:
            for cid,text in spans(ed,17,2):
                self.assertNotIn('Paul',text,(ed,cid,text))

    def test_john_or_peter_are_generic_names(self):
        # At 20:23 Montaigne says it does not matter whether a thing happened at
        # Rome or Paris, to John or Peter. Neither is a person in the book.
        for ed in ['original-en','modern-en']:
            for cid,text in spans(ed,20,23):
                self.assertNotIn(text,{'John','Peter'},(ed,cid,text))

    def test_the_latin_of_the_quotations_is_left_unbound(self):
        # Names inside the Latin verse are not bound; the English gloss that
        # follows the quotation carries the card. Tantalo at 19:9 against
        # Tantalus at 19:10, and Jovis at 19:72 against Jove at 19:73.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'tantalus'),[(19,10)],ed)
            self.assertIn((19,73),where(ed,'jove'),ed)
            self.assertNotIn((19,72),where(ed,'jove'),ed)
            self.assertNotIn((19,9),where(ed,'tantalus'),ed)

    def test_the_editorial_note_at_18_0_binds_nothing(self):
        # Both editions print an editor's note as a reading paragraph: "Charron
        # has borrowed with unusual liberality from this and the succeeding
        # chapter. See Nodier, Questions, p. 206." Charron and Nodier are real
        # people, but they are not Montaigne's text, and neither is cast.
        for ed in ['original-en','modern-en']:
            self.assertEqual(spans(ed,18,0),[],ed)

    def test_more_of_the_transliterations_the_modern_edition_updates(self):
        for cid,older,newer in [('periander','Pertander','Periander'),
                                ('dicaearchus','Dicarchus','Dicaearchus'),
                                ('propertius','Propertious','Propertius'),
                                ('aeschylus','AEschylus','Aeschylus'),
                                ('aeneas','AEneas','Aeneas'),
                                ('cnaeus-fulvius','Aeneius Fulvius','Cnaeus Fulvius'),
                                ('frauget','Frauget','Franget'),
                                ('chatillon','Chatillon','Châtillon'),
                                ('montmorency','Montmorenci','Montmorency'),
                                ('jacques-pelletier','Jaques Pelletier','Jacques Pelletier'),
                                ('guast','Guast','Guasto'),
                                ('paulus-aemilius','Paulus Emilius','Paulus Aemilius'),
                                ('aemilius-lepidus-threshold','AEmilius Lepidus','Aemilius Lepidus'),
                                ('quintus-curtius','Quint. Curt','Quintus Curtius'),
                                ('publius-crassus','P. Crassus','Publius Crassus')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_apostrophe_in_lorenzo_de_medici_differs_between_editions(self):
        self.assertIn('Lorenzo de\u2019 Medici',said('original-en','lorenzo-de-medici-urbino'))
        self.assertIn("Lorenzo de' Medici",said('modern-en','lorenzo-de-medici-urbino'))

    # ------------------------------------------- added with chapters 21-24
    def test_the_two_men_called_zeno(self):
        # The citizen of Messina at 1:5; the founder of the Stoa at 22:49 and
        # 24:55, in both places named among the philosophers.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'zeno-mamertine'),[(1,5)],ed)
            self.assertEqual(where(ed,'zeno-of-citium'),[(22,49),(24,55),(25,143)],ed)

    def test_the_three_men_called_scipio(self):
        # Pompey's father-in-law (18:12), the high priest in Cotta's list
        # (22:49), and Africanus crossing to Syphax in two ships (23:10).
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'metellus-scipio'),[(18,12)],ed)
            self.assertEqual(where(ed,'publius-scipio-pontifex'),[(22,49)],ed)
            self.assertEqual(where(ed,'scipio-africanus'),[(23,10),(25,51)],ed)

    def test_the_fourth_man_called_lepidus(self):
        # Livia's list of conspirators punished to no purpose supplies a fourth:
        # bound by the bare surname, which the other three never carry alone.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'lepidus-conspirator'),[(23,1)],ed)
            self.assertNotIn('lepidus-conspirator',ids(ed,3,15),ed)
            self.assertNotIn('lepidus-conspirator',ids(ed,19,24),ed)

    def test_caesar_at_23_1_is_augustus_speaking_of_himself(self):
        # "What, hast thou neither means nor power in any other thing, but only
        # to undertake Caesar?" — Augustus to Cinna.
        for ed in ['original-en','modern-en']:
            self.assertIn((23,1),where(ed,'augustus'),ed)
            self.assertNotIn('julius-caesar',ids(ed,23,1),ed)

    def test_the_three_men_called_du_bellay_all_have_cards_now(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((5,9),where(ed,'martin-du-bellay'),ed)
            self.assertEqual(where(ed,'jean-du-bellay'),[(10,3)],ed)
            self.assertEqual(where(ed,'joachim-du-bellay'),[(24,0),(24,2),(25,123)],ed)

    def test_philip_the_physician(self):
        # A fourth Philip: Alexander's physician, accused by Parmenio of taking
        # Darius's money.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'philip-physician'),[(23,7)],ed)
            self.assertIn((23,7),where(ed,'alexander'),ed)
            self.assertIn((23,7),where(ed,'darius-iii'),ed)

    def test_aristo_is_bound_only_by_his_full_name(self):
        # Three men share the bare form: the Stoic of 24:54, a tragedian at
        # 25:152, and — in the older edition only — Ariosto at 27:13. Nothing
        # binds the bare "Aristo".
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristo-of-chios'),[(24,54)],ed)
            self.assertEqual(said(ed,'aristo-of-chios'),['Aristo of Chios'],ed)
            for k in [(25,152),(27,13),(51,0),(69,345),(77,0)]:
                self.assertNotIn('aristo-of-chios',ids(ed,*k),(ed,k))

    def test_the_dionysius_of_24_32_is_left_unbound(self):
        # "Dionysius laughed at the grammarians." The chapter gives no qualifier,
        # and the Essays have more than one Dionysius, so this one carries no
        # card rather than the likelier one.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((24,32),where(ed,'dionysius-elder'),ed)
            self.assertEqual([c for c in ids(ed,24,32) if c.startswith('dionysius')],[],ed)

    def test_the_latin_accusatives_of_22_48_bind_nothing(self):
        # The quotation gives Coruncanium, Scipionem, Scaevolam, Zenonem,
        # Cleanthem, Chrysippum; the English gloss at 22:49 gives the
        # nominatives, and that is where the cards are.
        for ed in ['original-en','modern-en']:
            self.assertEqual(spans(ed,22,48),[],ed)
            got={c for c,_ in spans(ed,22,49)}
            for cid in ['coruncanius','publius-scipio-pontifex','scaevola',
                        'zeno-of-citium','cleanthes','chrysippus']:
                self.assertIn(cid,got,(ed,cid))

    def test_the_four_roman_houses_change_number_between_editions(self):
        # Augustus names them in the singular in Cotton and in the plural in the
        # modern edition: Paulus and Fabius against Paulli and Fabii.
        self.assertIn('Paulus',said('original-en','paulli'))
        self.assertIn('Paulli',said('modern-en','paulli'))
        self.assertIn('Fabius',said('original-en','fabii'))
        self.assertIn('Fabii',said('modern-en','fabii'))
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'cossii'),[(23,1)],ed)
            self.assertEqual(where(ed,'servilii'),[(23,1)],ed)

    def test_still_more_transliterations(self):
        for cid,older,newer in [('jacques-amyot','Jacques Amiot','Jacques Amyot'),
                                ('oedipus','OEdipus','Oedipus'),
                                ('aulus-gellius','Gellium','Gellius'),
                                ('terence','Ter','Terence')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_brittany_family_is_bound_by_full_names(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'francis-brittany'),[(24,49)],ed)
            self.assertEqual(where(ed,'john-v-brittany'),[(24,49)],ed)
            self.assertEqual(where(ed,'isabella-of-scotland'),[(24,49)],ed)
            self.assertEqual(where(ed,'charles-viii'),[(24,63),(48,3)],ed)

    def test_the_editorial_apparatus_binds_nothing(self):
        # Cotton is named in an editor's note at 24:58 and Rousseau in a
        # citation gloss at 24:51. Neither is Montaigne's text, and neither is
        # cast — the same rule as the Charron note at 18:0.
        for ed in ['original-en','modern-en']:
            for k in [(24,51),(24,58),(24,59)]:
                for cid,text in spans(ed,*k):
                    self.assertNotIn(text,{'Cotton','Rousseau','Charron','Nodier'},(ed,k,cid,text))

    # ---------------------------------------------- added with chapter 25
    def test_the_two_men_called_pompey(self):
        # Pompey the Great, and one of the two noted dancers of Montaigne's day.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pompey-the-dancer'),[(25,25)],ed)
            self.assertNotIn((25,25),where(ed,'pompey'),ed)
            self.assertIn((25,25),where(ed,'paluel'),ed)

    def test_the_two_women_called_livia(self):
        # Augustus's wife at 23:1; Signora Livia, whose petticoats a young
        # traveller should not come home able to describe, at 25:26.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'livia'),[(23,1)],ed)
            self.assertEqual(where(ed,'signora-livia'),[(25,26)],ed)

    def test_the_two_men_called_aristo(self):
        # The Stoic of Chios, bound by his full name, and the tragedian of
        # 25:152, bound by the bare form in that one paragraph. The Latin dative
        # Aristoni at 25:151 stays unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristo-of-chios'),[(24,54)],ed)
            self.assertEqual(where(ed,'aristo-tragedian'),[(25,152)],ed)
            self.assertEqual(spans(ed,25,151),[],ed)

    def test_the_two_men_called_diogenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'diogenes-the-atheist'),[(11,31)],ed)
            self.assertEqual(where(ed,'diogenes-the-cynic'),[(25,103)],ed)

    def test_the_two_spartans_called_cleomenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'cleomenes-i'),[(6,2)],ed)
            self.assertEqual(where(ed,'cleomenes-sparta'),[(25,117)],ed)

    def test_leo_the_zodiac_sign_is_not_a_pope(self):
        # "the sign of angry Leo" at 25:65. Both men called Leo are bound by
        # multi-word aliases, so the sign carries no card.
        for ed in ['original-en','modern-en']:
            for cid,text in spans(ed,25,65):
                self.assertNotIn('Leo',text,(ed,cid,text))

    def test_montaigne_names_his_own_teachers(self):
        # The four domestic tutors and the principal of the College of Guienne.
        for ed in ['original-en','modern-en']:
            for cid in ['nicolas-grouchy','guillaume-guerente','george-buchanan',
                        'marc-antoine-muret','andreas-goveanus']:
                self.assertTrue(where(ed,cid),(ed,cid))

    def test_the_chapter_25_transliterations(self):
        for cid,older,newer in [('danaides','Danaides','Danaids'),
                                ('la-boetie','La Boetie','La Boétie'),
                                ('demophoon-steward','Demophoon','Demophoön'),
                                ('menoeceus','Meniceus','Menoeceus'),
                                ('guillaume-guerente','Guillaume Guerente','Guillaume Guérente'),
                                ('marc-antoine-muret','Marc Antoine Muret','Marc-Antoine Muret')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_dedication_is_printed_in_capitals(self):
        for ed in ['original-en','modern-en']:
            self.assertIn(('diane-de-foix','DIANE DE FOIX'),spans(ed,25,0),ed)

if __name__=='__main__':unittest.main()
