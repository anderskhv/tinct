"""Focused checks for Montaigne's Essays.
Chapters 1-69 of 107 are authored."""
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
def cards(ed):
    return [(c['id'],c['snapshots'][0]['body']) for c in ASSET['editions'][ed]['characters']]
def _paras():
    import json,pathlib
    from build_pilot import normalized
    out={}
    for ed in ['original-en','modern-en']:
        p=pathlib.Path('/home/user/tinct/app/public/data/editions/essays-montaigne-%s.json'%ed)
        d=json.loads(p.read_text(encoding='utf-8'))
        out[ed]={(c['number'],i):normalized(x)
                 for c in d['chapters'] for i,x in enumerate(c['paragraphs'])}
    return out
PARAS=_paras()

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
            # 69:235 stays a deliberate gap; 69:613, "the voice is the flower of
            # beauty", is the founder of the Stoa and is keyed to him.
            self.assertEqual([c for c in ids(ed,69,235) if c.startswith('zeno')],[],ed)
            self.assertEqual(['zeno-of-citium'],
                             [c for c in ids(ed,69,613) if c.startswith('zeno')],ed)

    def test_the_two_plinys(self):
        # Pliny the Elder of the Natural History at 9:6; the younger Pliny of
        # the letters appears at 38:45 and 39:0 and is not yet authored.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'pliny-elder'),
                             [(9,6),(20,4),(22,2),(26,18),(44,1),(48,6),
                              (60,0),(60,43),(60,44),(60,60),
                              (69,47),(69,153),(69,326),(69,388),(69,532),
                              (69,638)],ed)
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
            self.assertEqual(where(ed,'darius-iii'),[(6,8),(23,7),(44,0)],ed)
            self.assertEqual(where(ed,'darius-i'),[(9,2),(12,2),(22,21),(69,483)],ed)

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
        # Correction to the chapters 1-30 pass, which listed 44:1 among the
        # Gorgon-slayer's paragraphs from a distance. 44:1 is "King Perseus of
        # Macedon, being prisoner at Rome, was killed by being kept from sleep"
        # -- the same king, and it is now bound. 69:268 and 107:53 have still not
        # been read and carry no card either way.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'perseus-macedon'),[(5,0),(44,1)],ed)
            self.assertIn('Perseus of Macedon',said(ed,'perseus-macedon'),ed)
            for k in [(69,268),(107,53)]:
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
        # times in a hundred and seven chapters. The first occurrence of the name
        # in either edition is not his own: 28:2 is an editor's note about the
        # sonnets of La Boétie that the editions no longer print.
        for ed in ['original-en','modern-en']:
            w=where(ed,'montaigne')
            self.assertEqual(w[0],(28,2),ed)
            self.assertLess(len(w),40,ed)

    def test_only_the_first_sixty_nine_chapters_are_authored(self):
        self.assertIn('chapters 1-69 of 107',REPORT['scope'])
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
            self.assertEqual(where(ed,'charles-v'),
                             [(7,0),(11,14),(12,3),(16,8),(41,7),(47,18),(55,14),
                              (65,17),(65,18),(67,31)],ed)
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
            self.assertEqual(where(ed,'zeno-of-citium'),
                             [(22,49),(24,55),(25,143),(30,28),(52,2),
                              (69,238),(69,246),(69,268),(69,370),(69,401),
                              (69,414),(69,465),(69,613)],ed)

    def test_the_three_men_called_scipio(self):
        # Pompey's father-in-law (18:12), the high priest in Cotta's list
        # (22:49), and Africanus crossing to Syphax in two ships (23:10).
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'metellus-scipio'),[(18,12)],ed)
            self.assertEqual(where(ed,'publius-scipio-pontifex'),[(22,49)],ed)
            self.assertEqual(where(ed,'scipio-africanus'),
                             [(23,10),(25,51),(46,18),(47,19),(57,7),(62,18)],ed)

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
            # The Apology names him twice more, and there the bare form is keyed
            # to him: 69:268 among the opinions of God, 69:558 beside Protagoras
            # on the justice of laws. Outside those two paragraphs nothing binds
            # the bare "Aristo" to him.
            self.assertEqual(where(ed,'aristo-of-chios'),[(24,54),(69,268),(69,558)],ed)
            self.assertIn('Aristo of Chios',said(ed,'aristo-of-chios'),ed)
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
            self.assertEqual(where(ed,'livia'),[(23,1),(30,39)],ed)
            self.assertEqual(where(ed,'signora-livia'),[(25,26)],ed)

    def test_the_two_men_called_aristo(self):
        # The Stoic of Chios, bound by his full name, and the tragedian of
        # 25:152, bound by the bare form in that one paragraph. The Latin dative
        # Aristoni at 25:151 stays unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristo-of-chios'),[(24,54),(69,268),(69,558)],ed)
            self.assertEqual(where(ed,'aristo-tragedian'),[(25,152)],ed)
            self.assertEqual(spans(ed,25,151),[],ed)

    def test_the_two_men_called_diogenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'diogenes-the-atheist'),[(11,31)],ed)
            self.assertEqual(where(ed,'diogenes-the-cynic'),
                             [(25,103),(27,28),(50,7),(60,6),
                              (69,15),(69,74),(69,565),(69,579)],ed)

    def test_the_two_spartans_called_cleomenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'cleomenes-i'),[(6,2),(69,506)],ed)
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

    # ------------------------------------------- added with chapters 26-30
    def test_philip_augustus_keeps_the_second_half_of_his_name(self):
        # The emperor Augustus is alias-bound, so "King Philip Augustus" at 26:18
        # had the emperor's card on the second half of his name until the full
        # name was made an alias of its own.
        for ed in ['original-en','modern-en']:
            self.assertIn(('philip-augustus','Philip Augustus'),spans(ed,26,18),ed)
            self.assertNotIn('augustus',[c for c,_ in spans(ed,26,18)],ed)

    def test_the_two_women_called_stratonice(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'stratonice'),[(20,4)],ed)
            self.assertEqual(where(ed,'stratonice-deiotarus'),[(30,39)],ed)

    def test_the_antony_of_26_18_is_not_mark_antony(self):
        # He lost a battle in Germany under Domitian. Mark Antony belongs to
        # chapters not yet authored and carries no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'antony-germany'),[(26,18)],ed)

    def test_the_six_men_called_philip(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'philip-ii-spain'),[(3,13)],ed)
            self.assertEqual(where(ed,'don-philip'),[(7,0)],ed)
            self.assertEqual(where(ed,'philip-physician'),[(23,7)],ed)
            # The full name is unambiguous, so it is an alias and binds at 41:10
            # as well, in a chapter not yet authored.
            self.assertEqual(where(ed,'philip-augustus'),[(26,18),(41,10)],ed)
            self.assertEqual(where(ed,'philip-v-macedon'),[(30,0),(60,55)],ed)

    def test_ariosto_is_one_poet_under_two_spellings(self):
        # The older edition prints him Aristo at 27:13 and Ariosto at 6:7; the
        # modern prints Ariosto in both places. One card.
        for ed in ['original-en','modern-en']:
            self.assertIn((6,7),where(ed,'ariosto'),ed)
            self.assertIn((27,13),where(ed,'ariosto'),ed)
        self.assertIn('Aristo',said('original-en','ariosto'))
        self.assertNotIn('Aristo',said('modern-en','ariosto'))

    def test_jove_and_jupiter_are_one_god(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((19,73),where(ed,'jove'),ed)
            self.assertIn((29,11),where(ed,'jove'),ed)

    def test_coste_the_annotator_of_chapter_28_is_not_cast(self):
        # 28:1 is an annotator's summary of the sonnets, signed Coste, and 28:2
        # an editor's note. Montaigne and La Boétie are named in the second and
        # carry their cards there; Coste is apparatus and carries none.
        for ed in ['original-en','modern-en']:
            for cid,text in spans(ed,28,1)+spans(ed,28,2):
                self.assertNotIn(text,{'Coste'},(ed,cid,text))
            self.assertIn(('montaigne','Montaigne'),spans(ed,28,2),ed)

    def test_the_chapters_26_to_30_transliterations(self):
        for cid,older,newer in [('postumius','Posthumius','Postumius'),
                                ('aelius-verus','AElius Verus','Aelius Verus'),
                                ('claudian','Claudian','Claudian')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    # ------------------------------------------------- chapters 31-40 bindings
    def test_every_table_key_actually_matches_something(self):
        # A key that matches nothing is a silent mis-index: the name it was
        # meant to pin stays unbound, and no other check notices. Four of them
        # were found this way -- Cato at the Latin paragraphs of chapter 36
        # where only the English versions carry the uninflected name, and
        # Alexander, Caesar and Cyrus one paragraph off.
        import re,build_essays_montaigne as B
        dead=[]
        for pat,(table,_) in B.SPLIT.items():
            r=re.compile(r'(?<![A-Za-z])(?:'+pat+r')(?![A-Za-z])')
            for key in table:
                if not any(r.search(PARAS[ed].get(key,'')) for ed in PARAS):
                    dead.append((pat,key))
        self.assertEqual(dead,[])

    def test_the_two_constantines_of_one_sentence(self):
        # 33:7 names the founder of the empire of Constantinople and the man who
        # lost it, both "Constantine", both sons of a Helen. Bound by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertEqual([c for c in ids(ed,33,7) if c.startswith('constantine')],
                             ['constantine-founder','constantine-last'],ed)

    def test_king_robert_is_not_robert_bruce(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((33,7),where(ed,'king-robert'),ed)
            self.assertNotIn((33,7),where(ed,'robert-bruce'),ed)
            self.assertEqual(['King Robert'],said(ed,'king-robert'),ed)

    def test_cato_of_utica_carries_the_five_verse_translations(self):
        # The five poets quote him in Latin at 36:17-29 and the bracketed
        # English versions follow. Only the nominative "Cato" of Martial's line
        # matches in the Latin; the accusatives and genitives are left unbound
        # like every other inflection, and the English versions all bind.
        for ed in ['original-en','modern-en']:
            got=[p for c,p in where(ed,'cato-the-younger') if c==36]
            self.assertEqual(got,[12,13,17,18,21,24,27,30],ed)
            for pi in [20,23,26,29]:
                self.assertNotIn('cato-the-younger',ids(ed,36,pi),(ed,pi))

    def test_the_censor_holds_both_of_his_paragraphs(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(40,52),(40,55),(52,1),(59,25),(59,27),(62,18),(65,28)],
                             where(ed,'cato-the-censor'),ed)

    def test_the_l_paulus_who_buried_both_sons_is_paulus_aemilius(self):
        # The Paulli of Augustus's list at 23:1 -- "Paulus" in the older edition
        # -- had been taking this man's shorter name away from him.
        for ed in ['original-en','modern-en']:
            self.assertIn((40,52),where(ed,'paulus-aemilius'),ed)
            self.assertNotIn((40,52),where(ed,'paulli'),ed)
            self.assertIn((23,1),where(ed,'paulli'),ed)
        self.assertIn('Paulus',said('original-en','paulli'))
        self.assertIn('Paulli',said('modern-en','paulli'))

    def test_the_modern_edition_alone_says_pompey_in_the_posidonius_story(self):
        self.assertIn('Pompeius',said('original-en','pompey'))
        self.assertIn((40,13),where('original-en','pompey'))
        self.assertIn((40,13),where('modern-en','pompey'))

    def test_the_modern_edition_names_pliny_once_more_in_the_solitude_chapter(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((38,45),where(ed,'pliny-the-younger'),ed)
            self.assertIn((38,60),where(ed,'pliny-the-younger'),ed)
        self.assertIn((38,50),where('modern-en','pliny-the-younger'))
        self.assertNotIn((38,50),where('original-en','pliny-the-younger'))

    def test_the_two_kings_called_louis_are_not_one_man(self):
        # Louis XI is pinned to the taking of Arras by his numeral. St Louis is
        # single-referent, so he binds book-wide: Joinville's companion at 67:31
        # and 86:12, the crusader of 60:57, the king who would not have the
        # Tartar come to Lyons at 69:12 are all Louis IX. The modern edition
        # drops the period and once writes the name out in full.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(40,5)],where(ed,'louis-xi'),ed)
            self.assertEqual([(40,51),(60,57),(67,31),(69,12),(86,12)],
                             where(ed,'st-louis'),ed)
        self.assertIn('St. Louis',said('original-en','st-louis'))
        self.assertIn('St Louis',said('modern-en','st-louis'))
        self.assertIn('Saint Louis',said('modern-en','st-louis'))

    def test_philip_of_macedon_holds_both_of_his_paragraphs(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(39,1),(39,7),(59,21),(60,3)],where(ed,'philip-ii-macedon'),ed)
            self.assertIn((39,1),where(ed,'cyrus-the-great'),ed)

    def test_democritus_binds_throughout_like_the_other_authorities(self):
        # Single-referent across the whole work, so his card is written to be
        # true anywhere and he appears in chapters not yet authored.
        for ed in ['original-en','modern-en']:
            w=where(ed,'democritus')
            self.assertIn((38,44),w,ed)
            self.assertTrue([c for c,_ in w if c>40],ed)

    def test_the_two_men_found_by_the_unbound_sweep(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(38,3)],where(ed,'albuquerque'),ed)
            self.assertEqual([(38,26)],where(ed,'paulinus-of-nola'),ed)

    def test_no_card_is_a_bare_cross_reference(self):
        # "His son." and "The other of that pair." are not cards: a reader who
        # taps the name gets a pronoun with no antecedent. Every card has to
        # name what it refers to, so every card carries a proper noun of its
        # own or says plainly what kind of person this is.
        import re
        NAME=re.compile(r'[A-Z\u00c0-\u00de][A-Za-z\u00c0-\u00ff\u2019\'-]{2,}')
        ROLE=re.compile(r'\b(?:Latin|Greek|Roman|Athenian|Spartan|Persian|Italian'
                        r'|philosopher|poet|satirist|epigrammatist|historian|orator'
                        r'|god|goddess|king|queen|emperor|bishop|physician|tragedian'
                        r'|compiler|elegist|sage|consul|patrician|Titan|house)\b')
        thin=[]
        for ed in ['original-en','modern-en']:
            for cid,body in cards(ed):
                # A card that names nobody and says nothing about what kind of
                # person this is can only be read by the paragraph it came from,
                # which is not how a reader meets it.
                if not NAME.search(body) and not ROLE.search(body):
                    thin.append((ed,cid,body))
        self.assertEqual(thin,[])

    def test_the_editorial_apparatus_quoting_florio_is_not_cast(self):
        # 36:0 and 38:51 are the editor's notes setting Cotton beside Florio's
        # 1613 version. Recorded as a source defect; Florio carries no card.
        for ed in ['original-en','modern-en']:
            for pi in [0]:
                self.assertEqual([],[c for c,t in spans(ed,36,pi) if t=='Florio'],ed)
            self.assertEqual([],[c for c,t in spans(ed,38,51) if t=='Florio'],ed)

    def test_the_chapters_31_to_40_namesakes(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((33,2),where(ed,'alexander-vi'),ed)
            self.assertNotIn((33,2),where(ed,'alexander'),ed)
            self.assertIn((40,55),where(ed,'alexander'),ed)
            self.assertIn((39,0),where(ed,'scipio-aemilianus'),ed)
            self.assertIn((31,4),where(ed,'pope-leo-arian'),ed)
            self.assertIn((31,4),where(ed,'don-john-of-austria'),ed)

    def test_the_chapters_31_to_40_transliterations(self):
        for cid,older,newer in [('hieronimus','Hieronimus','Hieronymus'),
                                ('rene-of-lorraine','Rene, Duke of Lorraine','Ren\u00e9, Duke of Lorraine'),
                                ('duc-de-valentinois','Duc de Valentinois','Duke of Valentinois')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    # ------------------------------------------------- chapters 41-50 bindings
    def test_a_name_can_be_the_subject_of_the_sentence_and_not_its_referent(self):
        # The chapter on names counts "three of the name of Socrates" among the
        # proofs that a name is three or four dashes with a pen. The Athenian is
        # not in that sentence; his alias would otherwise take it, so it is the
        # one place in the package where an alias binding is suppressed. Two
        # paragraphs later Montaigne does mean the man, and there it binds.
        for ed in ['original-en','modern-en']:
            self.assertNotIn('socrates',ids(ed,46,12),ed)
            self.assertIn('socrates',ids(ed,46,3),ed)

    def test_the_groom_who_calls_himself_pompey_is_not_pompey(self):
        # 46:12 names Pompey twice: the groom who might call himself Pompey the
        # Great, and "the other Pompey, who had his head cut off in Egypt".
        # Only the second is the man, so the paragraph is keyed by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertEqual(1,ids(ed,46,12).count('pompey'),ed)
            for cid,text in spans(ed,46,12):
                if cid=='pompey':
                    self.assertEqual('Pompey',text,ed)

    def test_the_names_used_as_names_carry_no_cards(self):
        # John, William and Benedict at 46:1 are names taken in no good sense;
        # Charles, Louis and Francis at 46:5 are baptismal names the reformation
        # quarrelled with; Oppius and Caesar at 49:27 are a word-order example.
        for ed in ['original-en','modern-en']:
            # 46:1 ends on Plato's own crude derivations, so the man is there
            # and binds; John, William and Benedict do not.
            self.assertEqual(['plato'],ids(ed,46,1),ed)
            self.assertEqual([],ids(ed,46,5),ed)
            self.assertNotIn('julius-caesar',ids(ed,49,27),ed)

    def test_the_three_spellings_of_one_constable(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(46,9)],where(ed,'du-guesclin'),ed)
            self.assertEqual(['Guesquin','Glesquin','Gueaquin'],said(ed,'du-guesclin'),ed)

    def test_the_men_who_carry_more_than_one_name_on_one_card(self):
        # The chapter on names is built out of them: Bayard is Peter Terrail,
        # Suetonius is Tranquillus, Denisot is the Count d'Alsinois by anagram,
        # and Antonio Iscalin is also Captain Paulin and the Baron de la Garde.
        for ed in ['original-en','modern-en']:
            self.assertEqual(2,ids(ed,46,12).count('bayard'),ed)
            self.assertIn('Peter Terrail',said(ed,'bayard'),ed)
            self.assertIn('Tranquillus',said(ed,'suetonius'),ed)
            self.assertEqual(2,ids(ed,46,12).count('nicholas-denisot'),ed)
            self.assertEqual(3,ids(ed,46,12).count('antonio-iscalin'),ed)

    def test_the_two_kings_called_henry_the_second(self):
        # One of France and one of England, seven paragraphs apart, plus the
        # English one's son. 46:2 names the son first and is keyed by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(43,0),(46,3),(48,56)],where(ed,'henry-ii-france'),ed)
            self.assertEqual([(46,2)],where(ed,'henry-ii-england'),ed)
            self.assertEqual([(46,2)],where(ed,'henry-duke-of-normandy'),ed)
            self.assertEqual(['henry-duke-of-normandy','henry-ii-england'],
                             [c for c in ids(ed,46,2) if c.startswith('henry')],ed)

    def test_the_two_kings_called_alfonso_are_not_joined(self):
        # One preferred the condition of asses; the other founded the Order of
        # the Band. Nothing in either passage joins them, so they get a card each.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(42,57)],where(ed,'alfonso-of-the-asses'),ed)
            self.assertEqual([(48,43)],where(ed,'alfonso-of-the-band'),ed)

    def test_the_two_metelluses_and_the_two_mariuses(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(44,0)],where(ed,'metellus-tribune'),ed)
            self.assertEqual([(48,47)],where(ed,'metellus-crete'),ed)
            self.assertEqual([(44,1),(58,0)],where(ed,'marius-younger'),ed)
            self.assertEqual([(47,8),(66,13)],where(ed,'marius-elder'),ed)

    def test_the_two_men_called_cyrus(self):
        # The founder of the empire, and the younger brother of that unnatural
        # battle whose Greeks Clearchus led. The chapters 1-30 pass said the
        # younger Cyrus was not yet read; 47:17 is where he arrives.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(47,17),(59,28)],where(ed,'cyrus-the-younger'),ed)
            self.assertNotIn('cyrus-the-great',ids(ed,47,17),ed)
            self.assertIn((48,44),where(ed,'cyrus-the-great'),ed)

    def test_the_two_men_called_pompeius_are_neither_of_them_pompey(self):
        # Sextus Pompeius at 44:1 and Trogus Pompeius at 48:7. The bare surname
        # is table-bound, and both of these are covered by their longer names.
        for ed in ['original-en','modern-en']:
            # Both are bound by their full names, which are single-referent, so
            # Sextus also binds at 60:59 in a chapter not yet read.
            self.assertIn((44,1),where(ed,'sextus-pompeius'),ed)
            self.assertIn((48,7),where(ed,'trogus-pompeius'),ed)
            self.assertNotIn('pompey',ids(ed,44,1),ed)
            self.assertNotIn('pompey',ids(ed,48,7),ed)

    def test_the_three_men_called_fabius_or_maximus(self):
        # The house in Augustus's list, the Q. Maximus who buried a consul son,
        # and the Rullianus who unbridled his cavalry against the Samnites.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(48,51)],where(ed,'fabius-maximus-rullianus'),ed)
            self.assertNotIn('fabii',ids(ed,48,51),ed)
            self.assertNotIn('fabius-maximus',ids(ed,48,51),ed)

    def test_the_two_men_called_fabricius(self):
        # The Roman of 49:0, and the bibliographer of the epitaph on Lucan at
        # 25:137, who is apparatus and carries no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(49,0)],where(ed,'fabricius-luscinus'),ed)
            self.assertEqual([],[c for c,t in spans(ed,25,137) if t=='Fabricius'],ed)

    def test_the_named_animals(self):
        # Alexander's horse, and the horse that carried Charles VIII at Fornova.
        # Savoy is the duchy at 25:52 and the horse only at 48:4.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(48,5)],where(ed,'bucephalus'),ed)
            self.assertEqual([(48,4)],where(ed,'savoy-the-horse'),ed)
            self.assertNotIn('savoy-the-horse',ids(ed,25,52),ed)
        kinds={c['id']:c['kind'] for c in ASSET['editions']['original-en']['characters']}
        self.assertEqual('animal',kinds['bucephalus'])
        self.assertEqual('animal',kinds['savoy-the-horse'])

    def test_the_duc_de_guise_is_not_the_town_of_guise(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(45,0),(45,1)],where(ed,'duc-de-guise'),ed)
            self.assertNotIn('duc-de-guise',ids(ed,15,5),ed)
            for k in [(74,157),(104,60)]:
                self.assertNotIn('duc-de-guise',ids(ed,*k),(ed,k))

    def test_the_editors_note_on_dreux_is_not_montaigne(self):
        # 45:0 is a dated editorial headnote with a reference to Sismondi, printed
        # as the chapter's first reading paragraph in both editions. The three
        # commanders it names keep their cards; Sismondi is apparatus.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c,t in spans(ed,45,0) if t=='Sismondi'],ed)
            self.assertIn('prince-de-conde',ids(ed,45,0),ed)
            self.assertIn('montmorency',ids(ed,45,0),ed)

    def test_the_editors_note_on_fornova_is_not_montaigne(self):
        # 48:4 is a bracketed editorial note quoting Commines. The historian and
        # the horse both carry cards; the note itself is a recorded source defect.
        for ed in ['original-en','modern-en']:
            self.assertEqual(2,ids(ed,48,4).count('commines'),ed)
            self.assertIn('savoy-the-horse',ids(ed,48,4),ed)

    def test_the_deliberate_gaps_of_chapters_41_to_50(self):
        # Four names the text does not resolve, left alone rather than guessed:
        # the Scipio whose acts were in part due to Laelius (41:10), the Antigonus
        # Hermodorus called the son of the sun (42:33), the Brutus in the list of
        # captains who liked rich armour (47:14), and the Prince of Wales at
        # Crecy, who is named by title only.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,41,10) if 'scipio' in c],ed)
            self.assertEqual([],[c for c in ids(ed,42,33) if 'antigonus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,47,14) if 'brutus' in c],ed)
            self.assertNotIn('edward-black-prince',ids(ed,41,7),ed)

    def test_the_older_edition_misprints_philopoemen(self):
        self.assertIn('Philopcemen',said('original-en','philopoemen'))
        self.assertNotIn('Philopcemen',said('modern-en','philopoemen'))
        # He is single-referent and bound by alias, so he also appears in the
        # chapters that have not been read.
        for ed in ['original-en','modern-en']:
            for k in [(22,54),(45,1),(47,14)]:
                self.assertIn(k,where(ed,'philopoemen'),(ed,k))

    def test_the_chapters_41_to_50_transliterations(self):
        for cid,older,newer in [('antonio-de-leyva','Antonio de Leva','Antonio de Leva'),
                                ('sylla','Sylla','Sulla'),
                                ('william-of-salisbury','William, Earl of Salisbury',
                                 'Earl of Salisbury, William')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_three_marks_of_the_chapter_on_names(self):
        # Geta's alphabet of meats, the hundred and ten Williams, and Lucian's
        # letters at law are the three things the chapter is built out of.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(46,3)],where(ed,'geta'),ed)
            self.assertEqual([(46,9)],where(ed,'lucian'),ed)

    # ------------------------------------------------- chapters 51-60 bindings
    def test_the_aetolian_general_is_not_the_philosopher_of_abdera(self):
        # 60:45 is "Democritus, general of the AEtolians", dead on his own sword
        # rather than be retaken. The philosopher's alias is single-referent
        # everywhere else in the work and would otherwise have taken this too.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(60,45)],where(ed,'democritus-aetolian'),ed)
            self.assertNotIn('democritus',ids(ed,60,45),ed)
            self.assertIn((50,4),where(ed,'democritus'),ed)

    def test_the_bishop_aurelius_is_not_marcus_aurelius(self):
        # The bishop's bare alias was taking the last seven letters of "he whom
        # they called Marcus Aurelius" at 59:32 -- the Spanish book Montaigne's
        # father had always in his mouth, which is Guevara's and is called by the
        # emperor's name. Neither the bishop nor the emperor is the referent, so
        # nothing binds there now.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(26,18)],where(ed,'aurelius-bishop'),ed)
            self.assertEqual([],ids(ed,59,32),ed)

    def test_the_two_men_called_cornelius_gallus(self):
        # The proctor of 19:24 and the elegist of the citation at 59:24. The
        # older edition abbreviates the poet "Cornet." and the modern prints him
        # in full, colliding exactly with the proctor's alias.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(59,24)],where(ed,'cornelius-gallus-poet'),ed)
            self.assertEqual(['Gallus'],said(ed,'cornelius-gallus-poet'),ed)
            self.assertNotIn('cornelius-gallus',ids(ed,59,24),ed)
            self.assertIn((19,24),where(ed,'cornelius-gallus'),ed)

    def test_the_older_edition_misprints_pliny_and_tiberius(self):
        self.assertIn('Piny',said('original-en','pliny-elder'))
        self.assertNotIn('Piny',said('modern-en','pliny-elder'))
        self.assertIn('Tiberias',said('original-en','tiberius-emperor'))
        self.assertIn('Tiberius',said('modern-en','tiberius-emperor'))
        for ed in ['original-en','modern-en']:
            self.assertIn((60,43),where(ed,'pliny-elder'),ed)
            self.assertEqual([(59,13),(60,56),(65,39)],where(ed,'tiberius-emperor'),ed)

    def test_the_god_of_wine_under_four_names(self):
        # Bacchus, Dionysos and Lyacus in the older edition; Bacchus, Dionysus and
        # Lyaeus in the modern. The Latin ablative Lyaeo is left unbound.
        for ed in ['original-en','modern-en']:
            for k in [(42,18),(59,11),(59,12),(59,34)]:
                self.assertIn('bacchus',ids(ed,*k),(ed,k))
            self.assertNotIn('bacchus',ids(ed,59,10),ed)
        self.assertIn('Dionysos',said('original-en','bacchus'))
        self.assertIn('Dionysus',said('modern-en','bacchus'))
        self.assertIn('Lyacus',said('original-en','bacchus'))
        self.assertIn('Lyaeus',said('modern-en','bacchus'))

    def test_the_apostle_paul_and_the_town_of_st_paul(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(60,57),(69,20),(69,219),(69,261),(69,281),(69,335)],
                             where(ed,'st-paul'),ed)
            self.assertNotIn('st-paul',ids(ed,17,2),ed)

    def test_the_two_fulviuses_of_one_paragraph(self):
        # Augustus's favourite, whose wife ran herself through first, and the
        # consul of the butchery at Capua, named twice after him.
        for ed in ['original-en','modern-en']:
            self.assertEqual(['fulvius-favourite','fulvius-consul','fulvius-consul'],
                             [c for c in ids(ed,60,52) if c.startswith('fulvius')],ed)
            self.assertNotIn('fulvius-flaccus',ids(ed,60,52),ed)
            self.assertNotIn('cnaeus-fulvius',ids(ed,60,52),ed)

    def test_vibius_virrius_is_not_gallus_vibius(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(60,52)],where(ed,'vibius-virrius'),ed)
            self.assertNotIn('vibius-virrius',ids(ed,20,2),ed)
            self.assertIn('gallus-vibius',ids(ed,20,2),ed)

    def test_the_third_pausanias_and_the_third_antiochus(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(59,21)],where(ed,'pausanias-assassin'),ed)
            self.assertEqual([(59,51)],where(ed,'antiochus-iv'),ed)
            self.assertNotIn('pausanias-sparta',ids(ed,59,21),ed)
            self.assertNotIn('antiochus',ids(ed,59,51),ed)

    def test_the_fourth_brutus_and_the_second_cassius(self):
        # The consul who killed his own children at 59:47, and the conspirator who
        # drank nothing but water. Severus Cassius of 10:4 is another man.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(59,47)],where(ed,'brutus-consul'),ed)
            self.assertEqual([(59,16),(59,17),(60,38),(65,39)],
                             where(ed,'cassius-conspirator'),ed)
            self.assertNotIn('severus-cassius',ids(ed,59,16),ed)
            self.assertIn((60,38),where(ed,'marcus-brutus'),ed)

    def test_the_two_kings_called_philip_of_macedon(self):
        # Philip II at 59:21 and 60:3, where Antipater in the same paragraph
        # fixes the reign; Philip V at the siege of Abydos.
        for ed in ['original-en','modern-en']:
            for k in [(59,21),(60,3)]:
                self.assertIn('philip-ii-macedon',ids(ed,*k),(ed,k))
            self.assertIn('philip-v-macedon',ids(ed,60,55),ed)
            self.assertIn('antipater',ids(ed,60,3),ed)

    def test_the_younger_cyrus_and_his_brother(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(47,17),(59,28)],where(ed,'cyrus-the-younger'),ed)
            self.assertEqual([(59,28)],where(ed,'artaxerxes'),ed)
            self.assertIn((60,50),where(ed,'cyrus-the-great'),ed)

    def test_the_third_spartan_called_cleomenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(60,35)],where(ed,'cleomenes-therykion'),ed)
            self.assertEqual([(60,35)],where(ed,'therykion'),ed)
            self.assertNotIn('cleomenes-i',ids(ed,60,35),ed)
            self.assertNotIn('cleomenes-sparta',ids(ed,60,35),ed)

    def test_the_second_spartan_called_agis(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(60,3)],where(ed,'agis-on-freedom'),ed)
            self.assertEqual([(47,16)],where(ed,'agis'),ed)

    def test_the_player_publius_is_publius_syrus(self):
        # 58:0 names him "the player Publius"; the citation is Pub. Mim. in the
        # older edition and Publius Mimus in the modern.
        for ed in ['original-en','modern-en']:
            self.assertIn((58,0),where(ed,'publius-syrus'),ed)
        self.assertIn((58,2),where('modern-en','publius-syrus'))

    def test_the_deliberate_gaps_of_chapters_51_to_60(self):
        # Five names the text does not resolve: the Aristo who defined rhetoric
        # (the book has three), the Crassus and the Metellus in the list of men
        # who rose by eloquence, and the Antigonus of three separate anecdotes.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,51,0) if 'aristo' in c],ed)
            self.assertEqual([],[c for c in ids(ed,51,1) if 'crassus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,51,1) if 'metellus' in c],ed)
            for k in [(58,16),(60,3),(60,45)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'antigonus' in c],(ed,k))

    def test_the_editorial_notes_of_chapters_54_to_60_are_not_montaigne(self):
        # Coste annotates 54:1, Ampere 54:6, an editor sets Cotton beside Florio
        # at 57:11, and 60:0 and 60:44 are notes about Pliny's naming and about
        # the 1588 quarto. The annotators carry no cards; Alexander, Quintilian
        # and Pliny, named inside them, keep theirs.
        for ed in ['original-en','modern-en']:
            for pi,name in [(1,'Coste'),(6,'Ampere')]:
                self.assertEqual([],[c for c,t in spans(ed,54,pi) if t==name],(ed,pi))
            for name in ['Cotton','Florio']:
                self.assertEqual([],[c for c,t in spans(ed,57,11) if t==name],(ed,name))
            self.assertIn('alexander',ids(ed,54,1),ed)
            self.assertIn('pliny-elder',ids(ed,60,0),ed)
            self.assertIn('pliny-elder',ids(ed,60,44),ed)
        # Coste abbreviates Quintilian "Quintil." in the older edition, which no
        # alias matches; the modern edition prints the name and binds him.
        self.assertNotIn('quintilian',ids('original-en',54,1))
        self.assertIn('quintilian',ids('modern-en',54,1))

    def test_the_chapters_51_to_60_transliterations(self):
        for cid,older,newer in [('aretin','Aretin','Aretino'),
                                ('decius','Pub. Decius','Publius Decius'),
                                ('paulus-aemilius','Paulus AEmilius','Paulus Aemilius'),
                                ('scipio-aemilianus','Scipio AEmilianus','Scipio Aemilianus')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    # ------------------------------------------------- chapters 61-68 bindings
    def test_the_two_ciceros_of_one_paragraph(self):
        # 67:21 names the orator once and then "the younger Cicero, who resembled
        # his father in nothing but in name", and means the son for the rest of
        # the paragraph. The father's alias would have taken all four, so it is
        # suppressed there and the paragraph keyed by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertEqual(['cicero','cicero-the-younger','cicero-the-younger',
                              'cicero-the-younger'],
                             [c for c in ids(ed,67,21) if c.startswith('cicero')],ed)
            self.assertEqual([(67,21)],where(ed,'cicero-the-younger'),ed)
            self.assertEqual([(67,21)],where(ed,'cestius'),ed)

    def test_the_two_men_called_labienus(self):
        # The orator whose books were burned, named three times, and his father
        # the chief of Caesar's captains, named once in the middle.
        for ed in ['original-en','modern-en']:
            self.assertEqual(['labienus-orator','labienus-father','labienus-orator',
                              'labienus-orator'],
                             [c for c in ids(ed,65,39) if c.startswith('labienus')],ed)

    def test_the_two_men_called_archias(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(['archias-thebes','archias-athenian'],
                             [c for c in ids(ed,61,3) if c.startswith('archias')],ed)

    def test_the_two_men_called_apollodorus(self):
        # The dreamer whose heart spoke to him, and the man who said Chrysippus's
        # writings would be blank paper. Neither is alias-bound now.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(62,12)],where(ed,'apollodorus-dreamer'),ed)
            self.assertEqual([(25,3)],where(ed,'apollodorus'),ed)
            self.assertNotIn('apollodorus',ids(ed,69,388),ed)

    def test_the_three_people_called_destissac(self):
        # The dedication names the widow; one sentence of the next paragraph names
        # her husband and her son under the same designation.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(65,0)],where(ed,'madame-destissac'),ed)
            self.assertEqual(['monsieur-destissac-husband','monsieur-destissac-son'],
                             [c for c in ids(ed,65,2) if c.startswith('monsieur-dest')],ed)
        self.assertIn('Madame D’Estissac',said('original-en','madame-destissac'))
        self.assertIn("Madame d'Estissac",said('modern-en','madame-destissac'))

    def test_the_older_edition_inverts_cassius_severus(self):
        # Severus Cassius at 10:4 and Cassius Severus at 65:39 are one man, and the
        # Cassius of "commended Brutus and Cassius" in the same paragraph is not he.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(10,4),(65,39)],where(ed,'severus-cassius'),ed)
            self.assertIn((65,39),where(ed,'cassius-conspirator'),ed)
            self.assertEqual(1,ids(ed,65,39).count('cassius-conspirator'),ed)

    def test_diogenes_laertius_is_neither_of_the_other_diogeneses(self):
        for ed in ['original-en','modern-en']:
            # Single-referent and alias-bound, so he also appears in the chapters
            # that have not been read.
            self.assertIn((68,61),where(ed,'diogenes-laertius'),ed)
            self.assertNotIn('diogenes-the-cynic',ids(ed,68,61),ed)
            self.assertNotIn('diogenes-the-atheist',ids(ed,68,61),ed)

    def test_the_third_metellus_and_the_second_artaxerxes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(68,7)],where(ed,'metellus-numidicus'),ed)
            self.assertEqual([(68,7)],where(ed,'saturninus'),ed)
            self.assertEqual([(68,42)],where(ed,'artaxerxes-lawgiver'),ed)
            self.assertEqual([(59,28)],where(ed,'artaxerxes'),ed)

    def test_the_younger_scipio_reforms_his_armies(self):
        for ed in ['original-en','modern-en']:
            for k in [(66,7),(66,14)]:
                self.assertIn('scipio-aemilianus',ids(ed,*k),(ed,k))

    def test_euphorbus_binds_in_the_latin_nominative(self):
        # "Panthoides Euphorbus eram" is Latin, but the name stands in the
        # nominative and is spelled as the English gloss spells it, so it binds --
        # the same rule that binds Cato in Martial's line at 36:17.
        for ed in ['original-en','modern-en']:
            for k in [(68,60),(68,61)]:
                self.assertIn('euphorbus',ids(ed,*k),(ed,k))
            self.assertIn('pantheus',ids(ed,68,61),ed)
            self.assertNotIn('pantheus',ids(ed,68,60),ed)

    def test_the_deliberate_gaps_of_chapters_61_to_68(self):
        # Dionysius "the tyrant" at 68:28, which fits either Syracusan; the two
        # Plinys at 63:38 and 67:20, neither qualified; and a third unqualified
        # Scipio at 63:43, beside Epaminondas.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,68,28) if 'dionysius' in c],ed)
            for k in [(63,38),(67,20)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'pliny' in c],(ed,k))
            self.assertEqual([],[c for c in ids(ed,63,43) if 'scipio' in c],ed)

    def test_the_chapters_61_to_68_transliterations(self):
        for cid,older,newer in [('boutieres','Monsieur de Boutieres','Monsieur de Boutières'),
                                ('muley-hassam','Muley Hassam','Muley Hassan'),
                                ('pantheus','Pantheus','Panthus')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    # ---------------------------------------- chapter 69, the Apology for Sebond
    def test_the_apology_is_the_largest_chapter_in_the_book(self):
        # 660 paragraphs, as much text as chapters 41-68 together, and a
        # doxography besides: it is where the namesake problem is worst.
        for ed in ['original-en','modern-en']:
            by_para,by_mention={},{}
            for m in mentions(ed):
                ch=m['chapterNumber']
                by_mention[ch]=by_mention.get(ch,0)+1
                by_para.setdefault(ch,set()).add(m['paragraphIndex'])
            self.assertEqual(69,max(by_mention,key=lambda c:by_mention[c]),ed)
            self.assertEqual(69,max(by_para,key=lambda c:len(by_para[c])),ed)
            self.assertGreater(len(by_para[69]),180,ed)

    def test_the_eleatic_zeno_is_not_the_founder_of_the_stoa(self):
        # 69:327 is "one same is not, and there is nothing", beside Parmenides's
        # "there is but one thing". The Stoic fills the rest of the chapter.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,327)],where(ed,'zeno-of-elea'),ed)
            for k in [(69,238),(69,246),(69,268),(69,613)]:
                self.assertIn('zeno-of-citium',ids(ed,*k),(ed,k))
            self.assertNotIn('zeno-of-citium',ids(ed,69,327),ed)

    def test_persaeus_is_neither_king_of_macedon_nor_gorgon_slayer(self):
        # The earlier passes of this package pointed at 44:1 for the Gorgon-slayer
        # and were wrong twice over: 44:1 is the king, and 69:268 is Zeno's
        # disciple, who is a third man under the same seven letters.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,268)],where(ed,'persaeus'),ed)
            self.assertEqual([(5,0),(44,1)],where(ed,'perseus-macedon'),ed)

    def test_the_two_crassuses_of_the_apology(self):
        # The orator whose lamprey came when he called it at 69:87; the triumvir
        # whom Surena beat at 69:126. Neither is the P. Crassus of chapter 16.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,87)],where(ed,'crassus-orator'),ed)
            self.assertEqual([(69,126)],where(ed,'crassus-triumvir'),ed)
            self.assertEqual([(16,9),(16,10)],where(ed,'publius-crassus'),ed)

    def test_the_four_men_called_aristo(self):
        # The Stoic of Chios, Plato's father, the tragedian, and -- in the older
        # edition only -- Ariosto. The modern edition writes the Stoic Ariston at
        # 69:558, which is the spelling it gives Plato's father nowhere.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(24,54),(69,268),(69,558)],where(ed,'aristo-of-chios'),ed)
            self.assertEqual([(69,345)],where(ed,'ariston-plato-father'),ed)
            self.assertEqual([(25,152)],where(ed,'aristo-tragedian'),ed)
        self.assertIn('Aristo',said('original-en','ariosto'))
        self.assertNotIn('Aristo',said('modern-en','ariosto'))

    def test_thrasylaus_brother_is_not_socrates_friend(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(3,15)],where(ed,'crito'),ed)
            self.assertEqual([(69,208)],where(ed,'crito-brother'),ed)

    def test_timon_of_phlius_is_not_timon_the_man_hater(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(50,7)],where(ed,'timon'),ed)
            self.assertEqual([(69,378)],where(ed,'timon-of-phlius'),ed)

    def test_diodorus_siculus_is_not_the_dialectician(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(2,21)],where(ed,'diodorus-dialectician'),ed)
            self.assertEqual([(69,532)],where(ed,'diodorus-siculus'),ed)

    def test_the_named_dog_is_cast_and_the_unnamed_one_is_not(self):
        # King Lysimachus's dog Hyrcanus has a name; "the dog of one Pyrrhus" in
        # the same paragraph has neither a name of its own nor an identifiable
        # master, so nothing is bound for it.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,96)],where(ed,'hyrcanus'),ed)
            self.assertIn('lysimachus',ids(ed,69,96),ed)
            self.assertEqual([],[c for c in ids(ed,69,96) if 'pyrrhus' in c],ed)

    def test_tethys_is_not_thetis(self):
        # Homer's Ocean and Tethys, father and mother of the gods, at 69:656. The
        # older edition prints the Titaness as Thetis, which is the sea-goddess's
        # name; the modern edition corrects it. Two cards, not one.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,656)],where(ed,'tethys'),ed)
            self.assertEqual([(69,300),(103,143)],where(ed,'thetis'),ed)
        self.assertIn('Thetes',said('original-en','thetis'))
        self.assertIn('Thetis',said('original-en','tethys'))
        self.assertIn('Tethys',said('modern-en','tethys'))

    def test_pherecydes_is_syrius_in_the_older_edition(self):
        # A source defect: the older edition's sentence breaks across the
        # paragraph boundary at 468/469, and "Syrius" -- his epithet, of Syros --
        # is left standing alone at the head of 469. The modern edition writes
        # "of Syros" and keeps the man in 468.
        self.assertIn('Syrius',said('original-en','pherecydes'))
        self.assertIn((69,469),where('original-en','pherecydes'))
        self.assertNotIn((69,469),where('modern-en','pherecydes'))

    def test_the_husband_saturninus_is_not_the_tribune(self):
        # 69:345 is the husband whose wife Plotina told how the affair should be
        # managed. 68:7 is the seditious tribune. The older edition misprints the
        # husband Satuminus.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(68,7)],where(ed,'saturninus'),ed)
            self.assertEqual([(69,345)],where(ed,'saturninus-husband'),ed)
        self.assertIn('Satuminus',said('original-en','saturninus-husband'))
        self.assertIn('Saturninus',said('modern-en','saturninus-husband'))

    def test_the_older_edition_misprints_the_apologys_names(self):
        # Chapter 69 is where the older edition's typesetting is worst. Each of
        # these is one man under two spellings, the second of them a misprint and
        # not an older transliteration.
        for cid,older,newer in [('arcesilaus','Arcesilas','Arcesilaus'),
                                ('carneades','Cameades','Carneades'),
                                ('dicaearchus','Dicæarchus','Dicaearchus'),
                                ('epicharmus','Epichar-mus','Epicharmus'),
                                ('lycurgus','Lucurgus','Lycurgus'),
                                ('protagoras','Proctagoras','Protagoras'),
                                ('pythagoras','Pytagoras','Pythagoras'),
                                ('sertorius','Sertorious','Sertorius'),
                                ('theodorus','Theodoras','Theodorus'),
                                ('varro','Yarro','Varro')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_keyed_misprints_of_the_apology(self):
        # The same defect in names that are keyed rather than aliased, because
        # the name belongs to more than one man in the work.
        for cid,ch,pi,older in [('julius-caesar',69,287,'Cæsar'),
                                ('xenophanes-colophon',69,268,'Zenophanes'),
                                ('timaeus',69,243,'Timæus')]:
            self.assertIn((ch,pi),where('original-en',cid),cid)
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn((ch,pi),where('modern-en',cid),cid)

    def test_the_dialogue_called_timaeus_is_not_the_man(self):
        # 69:267 is Plato's book, italicised in both editions; 69:243 is the
        # speaker. Titles are not cast.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((69,267),where(ed,'timaeus'),ed)
            self.assertIn((69,243),where(ed,'timaeus'),ed)

    def test_the_order_and_the_cross_are_not_the_saints(self):
        # "the order of St Michael" at 69:545 and 64:1, and "that of St Andrew" at
        # 69:533 -- a cross, not an apostle. Institutions and objects named after
        # saints are not cast, on the same rule that leaves the town of St Paul
        # and the Life of Caesar uncast.
        for ed in ['original-en','modern-en']:
            for k in [(69,545),(64,1),(69,533)]:
                self.assertEqual([],[c for c in ids(ed,*k)
                                     if c in ('st-michael','st-andrew')],(ed,k))

    def test_the_apology_writes_the_saints_names_out(self):
        # The modern edition spells Saint where the older abbreviates St., and
        # both editions are inconsistent about the full stop. One card each.
        for cid,k in [('st-augustine',(69,25)),('st-augustine',(69,225)),
                      ('st-augustine',(69,388)),('st-paul',(69,20)),
                      ('st-louis',(69,12)),('thomas-aquinas',(69,5)),
                      ('st-bernard',(69,404))]:
            for ed in ['original-en','modern-en']:
                self.assertIn(k,where(ed,cid),(ed,cid,k))
        self.assertIn('St. Austin',said('original-en','st-augustine'))
        self.assertIn('Saint Augustine',said('modern-en','st-augustine'))
        self.assertIn('Saint Paul',said('modern-en','st-paul'))

    def test_the_dean_of_st_hilary_is_a_church_and_not_the_bishop(self):
        # 65:22, found late by a census of the saint names. The modern edition
        # writes "a dean of Saint-Hilaire in Poitiers", which is how the place
        # shows itself; the older edition's "St. Hilary of Poitiers" was taking
        # the bishop's alias.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((65,22),where(ed,'st-hilary'),ed)
            self.assertIn((26,18),where(ed,'st-hilary'),ed)

    def test_commines_is_philippe_in_the_modern_edition(self):
        self.assertIn('Philip de Commines',said('original-en','commines'))
        self.assertIn('Philippe de Commines',said('modern-en','commines'))
        for ed in ['original-en','modern-en']:
            for k in [(67,30),(67,31)]:
                self.assertIn(k,where(ed,'commines'),(ed,k))

    def test_the_older_edition_names_no_god_in_the_verse_at_508(self):
        # Not a defect but a different translation: the modern edition renders the
        # Latin as "Father Jupiter... with his fertilising lamp", the older as
        # "Men's minds are influenc'd by th' external air". Nothing to bind.
        self.assertIn((69,508),where('modern-en','jove'))
        self.assertNotIn((69,508),where('original-en','jove'))

    def test_the_deliberate_gaps_of_chapter_69(self):
        # Zeno at 69:235, in a list of "inquirers" that does not settle Elea from
        # Citium; Dionysius called only "the tyrant" at 69:565; "the dog of one
        # Pyrrhus" at 69:96, a private man; and a third, unqualified Apollodorus
        # at 69:388.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,69,235) if c.startswith('zeno')],ed)
            self.assertEqual([],[c for c in ids(ed,69,565) if 'dionysius' in c],ed)
            self.assertEqual([],[c for c in ids(ed,69,96) if 'pyrrhus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,69,388) if 'apollodorus' in c],ed)


if __name__=='__main__':unittest.main()
