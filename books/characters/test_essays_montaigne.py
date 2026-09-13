"""Focused checks for Montaigne's Essays.
Chapters 1-103 of 107 are authored."""
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
                              (69,638),(70,20),(70,28),(71,0),(82,6),
                              (94,26),(94,40),(94,42),(94,67),(99,247),(103,280)],ed)
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
            self.assertEqual(where(ed,'darius-iii'),[(6,8),(23,7),(44,0),(93,16)],ed)
            self.assertEqual(where(ed,'darius-i'),[(9,2),(12,2),(22,21),(69,483)],ed)

    def test_the_three_men_called_du_bellay(self):
        # Martin the memoirist at 5:9; Cardinal Jean at 10:3; the poet Joachim
        # in chapters 24, 25 and 74, who carries no card yet.
        for ed in ['original-en','modern-en']:
            self.assertIn((5,9),where(ed,'martin-du-bellay'),ed)
            self.assertIn((14,1),where(ed,'martin-du-bellay'),ed)
            self.assertEqual(where(ed,'jean-du-bellay'),[(10,3)],ed)
            # 74:157 is the poet, keyed to him once chapter 74 was read.
            self.assertEqual(['joachim-du-bellay'],
                             [c for c in ids(ed,74,157) if 'bellay' in c],ed)

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
            # 74:157 is "the last Duke of Alva", keyed with chapter 74.
            self.assertEqual(where(ed,'duke-of-alva'),[(7,0),(74,157)],ed)

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
        # Hippolytus is both: the title of Seneca's play at 2:17, and the man
        # AEsculapius raised at 94:33. The man is keyed to his own paragraph and
        # nothing binds the title, so that one pair is exempted by paragraph.
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                if (m['characterId'],m['chapterNumber'],m['paragraphIndex'])==(
                        'hippolytus',94,33):
                    continue
                self.assertNotIn(m['text'],titles,(ed,m['characterId'],m['text']))
            self.assertEqual([],[c for c in ids(ed,2,17) if 'hippoly' in c],ed)

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

    def test_only_the_first_hundred_and_three_chapters_are_authored(self):
        self.assertIn('chapters 1-103 of 107',REPORT['scope'])
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
                              (65,17),(65,18),(67,31),(91,0)],ed)
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
                              (69,414),(69,465),(69,613),(74,115),(98,25),
                              (99,133),(99,238),(99,240),(99,247),(99,248),
                              (103,181)],ed)

    def test_the_three_men_called_scipio(self):
        # Pompey's father-in-law (18:12), the high priest in Cotta's list
        # (22:49), and Africanus crossing to Syphax in two ships (23:10).
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'metellus-scipio'),[(18,12),(91,12),(91,25),(91,33)],ed)
            self.assertEqual(where(ed,'publius-scipio-pontifex'),[(22,49)],ed)
            self.assertEqual(where(ed,'scipio-africanus'),
                             [(23,10),(25,51),(46,18),(47,19),(57,7),(62,18),(76,4),
                              (85,0),(103,143)],ed)

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
            self.assertEqual(where(ed,'joachim-du-bellay'),[(24,0),(24,2),(25,123),(74,157)],ed)

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
            # on the justice of laws. Chapter 99 adds two: the maxim about the
            # winds that lay men open at 99:56, which both editions spell
            # "Ariston", and his book Of Amorous Exercises at 99:133, where he
            # stands among Zeno, Cleanthes, Chrysippus and Sphaereus. Outside
            # those four paragraphs nothing binds the bare "Aristo" to him.
            self.assertEqual(where(ed,'aristo-of-chios'),
                             [(24,54),(69,268),(69,558),(99,56),(99,133),(103,239)],ed)
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
            self.assertEqual(where(ed,'livia'),[(23,1),(30,39),(99,142)],ed)
            self.assertEqual(where(ed,'signora-livia'),[(25,26)],ed)

    def test_the_two_men_called_aristo(self):
        # The Stoic of Chios, bound by his full name, and the tragedian of
        # 25:152, bound by the bare form in that one paragraph. The Latin dative
        # Aristoni at 25:151 stays unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'aristo-of-chios'),
                             [(24,54),(69,268),(69,558),(99,56),(99,133),(103,239)],ed)
            self.assertEqual(where(ed,'aristo-tragedian'),[(25,152)],ed)
            self.assertEqual(spans(ed,25,151),[],ed)

    def test_the_two_men_called_diogenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'diogenes-the-atheist'),[(11,31)],ed)
            self.assertEqual(where(ed,'diogenes-the-cynic'),
                             [(25,103),(27,28),(50,7),(60,6),
                              (69,15),(69,74),(69,565),(69,579),(88,21),(90,15),
                              (94,3),(94,28),(95,32),(103,37),(103,242)],ed)

    def test_the_two_spartans_called_cleomenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual(where(ed,'cleomenes-i'),[(6,2),(69,506),(93,16)],ed)
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
            self.assertEqual(where(ed,'philip-v-macedon'),[(30,0),(60,55),(84,26),(84,28)],ed)

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
            self.assertEqual([(40,52),(40,55),(52,1),(59,25),(59,27),(62,18),(65,28),(85,0),(94,26),(97,0),(102,5)],
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
            self.assertEqual([(39,1),(39,7),(59,21),(60,3),(99,199),(100,31),(103,74)],
                             where(ed,'philip-ii-macedon'),ed)
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
            self.assertEqual([(47,8),(66,13),(74,36),(102,83)],where(ed,'marius-elder'),ed)

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
            self.assertEqual([(49,0),(95,38)],where(ed,'fabricius-luscinus'),ed)
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
            self.assertEqual([(45,0),(45,1),(74,157)],where(ed,'duc-de-guise'),ed)
            self.assertNotIn('duc-de-guise',ids(ed,15,5),ed)
            self.assertNotIn('duc-de-guise',ids(ed,104,60),ed)

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
            self.assertEqual([(59,24),(99,232),(100,14)],where(ed,'cornelius-gallus-poet'),ed)
            self.assertEqual({'Gallus'},set(said(ed,'cornelius-gallus-poet')),ed)
            self.assertNotIn('cornelius-gallus',ids(ed,59,24),ed)
            self.assertIn((19,24),where(ed,'cornelius-gallus'),ed)

    def test_the_older_edition_misprints_pliny_and_tiberius(self):
        self.assertIn('Piny',said('original-en','pliny-elder'))
        self.assertNotIn('Piny',said('modern-en','pliny-elder'))
        self.assertIn('Tiberias',said('original-en','tiberius-emperor'))
        self.assertIn('Tiberius',said('modern-en','tiberius-emperor'))
        for ed in ['original-en','modern-en']:
            self.assertIn((60,43),where(ed,'pliny-elder'),ed)
            # 95:5 is the modern edition alone, which names him where Cotton
            # writes "he".
            self.assertEqual([(59,13),(60,56),(65,39),(70,28),(74,94),(79,1),
                              (94,66),(95,4),(97,38),(101,11),(102,84)],
                             [k for k in where(ed,'tiberius-emperor') if k!=(95,5)],ed)

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
            self.assertEqual([(59,51),(81,3)],where(ed,'antiochus-iv'),ed)
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
            self.assertEqual([(69,126),(73,18),(90,3)],where(ed,'crassus-triumvir'),ed)
            self.assertEqual([(16,9),(16,10)],where(ed,'publius-crassus'),ed)

    def test_the_four_men_called_aristo(self):
        # The Stoic of Chios, Plato's father, the tragedian, and -- in the older
        # edition only -- Ariosto. The modern edition writes the Stoic Ariston at
        # 69:558, which is the spelling it gives Plato's father nowhere.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(24,54),(69,268),(69,558),(99,56),(99,133),(103,239)],
                             where(ed,'aristo-of-chios'),ed)
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
            self.assertEqual([(69,378),(73,90)],where(ed,'timon-of-phlius'),ed)

    def test_diodorus_siculus_is_not_the_dialectician(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(2,21)],where(ed,'diodorus-dialectician'),ed)
            self.assertEqual([(69,532),(74,18)],where(ed,'diodorus-siculus'),ed)

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


    # ------------------------------------------------- chapters 70 to 73
    def test_the_two_men_called_marcellinus(self):
        # The historian Ammianus, whose full name binds at 15:4 and who is bare at
        # 66:15, and Tullius Marcellinus of chapter 70, who starved himself out of
        # this life. Three more bare occurrences wait in chapters 76 and 89.
        for ed in ['original-en','modern-en']:
            # 76:5 and 76:8 are the historian, keyed once chapter 76 was read.
            self.assertEqual([(15,4),(66,15),(76,5),(76,8),(89,4)],
                             where(ed,'ammianus-marcellinus'),ed)
            self.assertEqual([(70,35),(70,38)],where(ed,'tullius-marcellinus'),ed)
            # 89:4, on theft among the Egyptians, is the historian too.
            self.assertEqual(['ammianus-marcellinus'],
                             [c for c in ids(ed,89,4) if 'marcellinus' in c],ed)

    def test_the_general_demosthenes_is_not_the_orator(self):
        # "That great leader, Demosthenes, after his rout in Sicily" is the Athenian
        # general of the Syracusan expedition. The orator's alias was taking it.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(70,28)],where(ed,'demosthenes-general'),ed)
            self.assertNotIn((70,28),where(ed,'demosthenes'),ed)
            self.assertIn((39,1),where(ed,'demosthenes'),ed)

    def test_the_botched_suicides_of_one_paragraph(self):
        # 70:28 names eight people in a row, six of them nowhere else in the book.
        for ed in ['original-en','modern-en']:
            for cid in ['lucius-domitius','plautius-silvanus','urgulania','albucilla',
                        'fimbria','ostorius','demosthenes-general']:
                self.assertEqual([(70,28)],where(ed,cid),(ed,cid))
            for cid in ['julius-caesar','tiberius-emperor','pliny-elder']:
                self.assertIn((70,28),where(ed,cid),(ed,cid))

    def test_pomponius_atticus_is_the_man_and_not_the_book(self):
        # 70:33 is "That Pomponius Atticus, to whom Cicero writes so often". The bare
        # surname at 42:73 is the title of Cornelius Nepos's Life and at 67:20 the
        # title of Cicero's letters; titles are not cast.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(70,33)],where(ed,'pomponius-atticus'),ed)
            for k in [(42,73),(67,20)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'atticus' in c],(ed,k))
            self.assertIn('agrippa',ids(ed,70,33),ed)

    def test_the_gloss_carries_the_card_not_the_quoted_verse(self):
        # Ovid's Latin at 72:4 prints Danaen and Danae and binds neither; the English
        # version at 72:5 carries the card. Martial's Galla and Ariosto's Orlando are
        # the same, which extends the rule from Latin to the Italian.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(72,5)],where(ed,'danae'),ed)
            self.assertEqual([(72,10)],where(ed,'galla'),ed)
            self.assertEqual([(73,37)],where(ed,'orlando'),ed)
            for k in [(72,4),(72,9),(73,36)]:
                self.assertEqual([],[c for c in ids(ed,*k)
                                     if c in ('danae','galla','orlando')],(ed,k))

    def test_the_two_figures_called_flora(self):
        # The Flora painted on Speusippus's school walls with the Graces, and the
        # courtesan who made Pompey wear the prints of her teeth. The goddess's alias
        # was taking both of the courtesan's paragraphs.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(25,90)],where(ed,'flora'),ed)
            self.assertEqual([(72,14),(97,38)],where(ed,'flora-courtesan'),ed)
            self.assertIn('pompey',ids(ed,72,14),ed)

    def test_the_poet_rutilius_is_keyed_and_not_aliased(self):
        # The author of the Itinerarium at 72:43. 74:7 is the Rutilius of Tacitus's
        # Agricola and 84:21 the consul Publius Rutilius; both chapters are unread.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(72,43)],where(ed,'rutilius-poet'),ed)
            # 74:7 is Rutilius Rufus, cast with chapter 74; 84:21 is the consul
            # Publius Rutilius, in a chapter not yet read.
            self.assertEqual(['rutilius-rufus'],
                             [c for c in ids(ed,74,7) if 'rutilius' in c],ed)
            self.assertEqual(['publius-rutilius-consul'],
                             [c for c in ids(ed,84,21) if 'rutilius' in c],ed)

    def test_the_orlando_of_the_citations_is_the_poem(self):
        for ed in ['original-en','modern-en']:
            self.assertNotIn((67,15),where(ed,'orlando'),ed)
        self.assertNotIn((66,10),where('modern-en','orlando'))

    # --------------------------- chapter 69's gods, found by a later census
    def test_the_gods_the_apology_names(self):
        # A whole class the chapter-69 pass went past: the named gods of the
        # theology paragraphs. Found by the census of unbound capitalised names
        # after the chapter had been declared authored.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,210),(69,300),(69,358),(69,498),(99,169),(99,223)],
                             where(ed,'vulcan'),ed)
            self.assertEqual([(69,268),(69,352),(69,358),(99,133),(99,177)],
                             where(ed,'juno'),ed)
            self.assertEqual([(69,268),(73,90)],where(ed,'vesta'),ed)
            self.assertEqual([(69,358),(99,198)],where(ed,'faunus'),ed)
            self.assertIn((69,358),where(ed,'diana'),ed)
        self.assertIn('Cynthia',said('original-en','diana'))

    def test_juno_is_keyed_off_the_latin(self):
        # 69:351 is Virgil's Latin and 69:352 the English version of the same lines.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((69,351),where(ed,'juno'),ed)
            self.assertIn((69,352),where(ed,'juno'),ed)

    def test_pallas_the_dead_man_is_not_the_goddess(self):
        # 69:302 is Evander's son, to whose ghost Aeneas leads living victims.
        # 69:358 and 69:391 are Minerva under her Greek name — and the older edition
        # misprints her Balias in the second.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,302)],where(ed,'pallas-evander'),ed)
            for k in [(69,358),(69,391)]:
                self.assertIn('minerva',ids(ed,*k),(ed,k))
        self.assertIn('Balias',said('original-en','minerva'))
        self.assertIn('Pallas',said('modern-en','minerva'))

    def test_the_legislators_and_their_gods(self):
        # 73:90 sets eight legislators beside the god each gave his laws out under.
        for ed in ['original-en','modern-en']:
            for cid in ['numa','egeria','zoroaster','oromazis','trismegistus','mercury',
                        'zamolxis','vesta','charondas','saturn','minos','jove','lycurgus',
                        'apollo','draco','solon','minerva','moses','sire-de-joinville',
                        'sertorius','timon-of-phlius']:
                self.assertIn((73,90),where(ed,cid),(ed,cid))

    def test_numa_and_zoroaster_reach_back_into_the_apology(self):
        # Both were named in chapter 69 and neither was cast until chapter 73.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,262),(73,90),(88,0),(89,10)],where(ed,'numa'),ed)
            self.assertEqual([(69,532),(73,90)],where(ed,'zoroaster'),ed)

    def test_epicurus_will_and_his_last_letter(self):
        # 73:11 is the salutation, 73:12 the letter, 73:13 the will.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(73,11),(73,13)],where(ed,'hermachus'),ed)
            self.assertEqual([(73,13)],where(ed,'amynomachus'),ed)
            self.assertEqual([(73,13)],where(ed,'timocrates'),ed)
            self.assertIn((73,11),where(ed,'epicurus'),ed)
            self.assertIn((73,13),where(ed,'metrodorus'),ed)
        self.assertIn('HEYMACHUS',said('original-en','hermachus'))
        self.assertIn('HERMACHUS',said('modern-en','hermachus'))
        self.assertIn('EPICUYUS',said('original-en','epicurus'))
        self.assertIn('EPICURUS',said('modern-en','epicurus'))

    def test_the_three_men_of_the_forged_will_and_the_restored_treasure(self):
        for ed in ['original-en','modern-en']:
            for cid in ['sextus-peduceus','plotius','sextilius-rufus',
                        'crassus-triumvir','hortensius','carneades']:
                self.assertIn((73,18),where(ed,cid),(ed,cid))

    def test_the_two_men_ambitious_of_a_great_name(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(73,70)],where(ed,'herostratus'),ed)
            self.assertEqual([(73,70)],where(ed,'manlius-capitolinus'),ed)
            self.assertIn((73,70),where(ed,'trogus-pompeius'),ed)
            self.assertIn((73,70),where(ed,'livy'),ed)

    def test_the_older_edition_spells_livy_three_ways(self):
        self.assertIn('Titus Livius',said('original-en','livy'))
        self.assertIn('Titius Livius',said('original-en','livy'))
        for ed in ['original-en','modern-en']:
            for k in [(62,18),(66,0),(73,70)]:
                self.assertIn(k,where(ed,'livy'),(ed,k))

    def test_the_chapters_70_to_73_transliterations(self):
        for cid,older,newer in [('poppaea','Poppea','Poppaea'),
                                ('oromazis','Oromazis','Oromasdes'),
                                ('zamolxis','Xamolxis','Zamolxis')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_deliberate_gaps_of_chapters_70_to_73(self):
        # Diogenes at 73:3, paired with Chrysippus as the earliest advocates of the
        # contempt of glory, which fits the Stoic of Babylon as well as the Cynic;
        # "that great Cato" at 72:17, unqualified; a third Demetrius at 73:51; and
        # the cruel Roman Emperor of 70:21, named only by title.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,73,3) if 'diogenes' in c],ed)
            self.assertIn('chrysippus',ids(ed,73,3),ed)
            self.assertEqual([],[c for c in ids(ed,72,17) if 'cato' in c],ed)
            self.assertEqual([],[c for c in ids(ed,73,51) if 'demetrius' in c],ed)
            self.assertEqual([],ids(ed,70,21),ed)

    def test_our_lady_of_loreto_is_not_cast(self):
        # 72:17 sets St James against Our Lady of Loreto. The saint has a name and a
        # card; the Virgin is named by title only, as at 46:4, and has neither.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(72,17)],where(ed,'st-james'),ed)
            self.assertEqual([],[c for c in ids(ed,72,17)
                                 if 'mary' in c or 'virgin' in c or 'loreto' in c],ed)

    def test_the_chapters_70_to_73_edition_divergences(self):
        # Not defects: the two translations differ. The modern edition drops "says
        # Seneca" from 70:35 and writes "Plato's ring" at 73:64 where the older has
        # "the Platonic ring", an adjective and not a name.
        self.assertIn((70,35),where('original-en','seneca'))
        self.assertNotIn((70,35),where('modern-en','seneca'))
        self.assertIn((73,64),where('modern-en','plato'))
        self.assertNotIn((73,64),where('original-en','plato'))


    # ------------------------------------------------- chapters 74 to 80
    def test_the_two_scauruses_and_the_third_rutilius(self):
        # Tacitus's pair of self-biographers at 74:7. The Scaurus of 60:52, whose
        # wife Sextilia died with him, is another man and the Essays do not join
        # them; the Rutilius of the Itinerarium at 72:43 is a third.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(74,7)],where(ed,'aemilius-scaurus'),ed)
            self.assertEqual([(60,52)],where(ed,'scaurus'),ed)
            self.assertEqual([(74,7)],where(ed,'rutilius-rufus'),ed)
            self.assertEqual([(72,43)],where(ed,'rutilius-poet'),ed)

    def test_the_two_messallas(self):
        # The speaker in Tacitus's dialogue at 74:30, and the man who was two
        # years without any trace of memory at 74:99.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(74,30)],where(ed,'messalla'),ed)
            self.assertEqual([(74,99)],where(ed,'messala-corvinus'),ed)
            self.assertIn((74,99),where(ed,'trapezuntius'),ed)

    def test_cornelius_tacitus_and_the_emperor_tacitus(self):
        # One sentence, two men, the historian first. His alias was taking both.
        for ed in ['original-en','modern-en']:
            self.assertEqual(['tacitus','emperor-tacitus'],
                             [c for c in ids(ed,76,1) if 'tacitus' in c],ed)
            self.assertEqual([(76,1)],where(ed,'emperor-tacitus'),ed)

    def test_the_second_bajazet_and_the_second_amurath(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(78,1)],where(ed,'bajazet-ii'),ed)
            self.assertEqual([(78,1)],where(ed,'amurath-iii'),ed)
            self.assertNotIn((78,1),where(ed,'bajazet'),ed)
            self.assertNotIn((78,1),where(ed,'amurath'),ed)
        self.assertIn('Amurath III',said('original-en','amurath-iii'))
        self.assertIn('Murad III',said('modern-en','amurath-iii'))

    def test_the_king_of_france_called_charles_v_is_not_the_emperor(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(78,1)],where(ed,'charles-v-france'),ed)
            self.assertNotIn((78,1),where(ed,'charles-v'),ed)

    def test_marcus_fabius_is_not_the_house_of_the_fabii(self):
        # 78:5 is the legionary's oath: "I will return, Marcus Fabius, a
        # conqueror, from the fight". The house's alias was taking his surname.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(78,5)],where(ed,'marcus-fabius'),ed)
            self.assertNotIn((78,5),where(ed,'fabii'),ed)
            for cid in ['jove','mars']:
                self.assertIn((78,5),where(ed,cid),(ed,cid))

    def test_the_courier_gracchus_is_neither_of_the_other_two(self):
        # 79:1 was split between the consul Sempronius of 17:5 and the tribune
        # Tiberius Gracchus. It is a third man, and the Essays join him to none.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(79,1)],where(ed,'sempronius-gracchus-courier'),ed)
            self.assertNotIn((79,1),where(ed,'sempronius'),ed)
            self.assertNotIn((79,1),where(ed,'tiberius-gracchus'),ed)
            self.assertEqual([(69,300)],where(ed,'tiberius-sempronius'),ed)

    def test_tiberius_nero_is_not_nero(self):
        # The emperor Nero's alias was taking the second half of "Tiberius Nero,
        # going to see his brother Drusus" at 79:1 — the same failure as Augustus
        # inside Philip Augustus at 26:18.
        for ed in ['original-en','modern-en']:
            self.assertIn('Tiberius Nero',said(ed,'tiberius-emperor'),ed)
            self.assertNotIn((79,1),where(ed,'nero'),ed)
            self.assertEqual([(79,1)],where(ed,'drusus'),ed)

    def test_the_fifth_brutus_is_besieged_in_modena(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(79,6)],where(ed,'decimus-brutus'),ed)
            self.assertEqual([(79,5)],where(ed,'caecina'),ed)

    def test_the_divine_collectives_are_cast(self):
        # The Graces were cast in chapter 25 and the Muses and the Sirens were
        # not, for eight passes. A collective of named gods is cast in this
        # package, and all three are now on the same footing.
        for ed in ['original-en','modern-en']:
            self.assertIn((74,23),where(ed,'the-graces'),ed)
            self.assertEqual([(24,57),(25,10),(25,90),(36,14),(65,39),(65,40),
                              (73,80),(93,1),(93,12),(95,54),(97,45),(99,64),
                              (103,143),(104,19)],
                             where(ed,'the-muses'),ed)
            self.assertEqual([(73,3)],where(ed,'the-sirens'),ed)
        self.assertIn('Syrens',said('original-en','the-sirens'))
        self.assertIn('Sirens',said('modern-en','the-sirens'))

    def test_xenocrates_closes_two_more_apology_gaps(self):
        # Named at 69:268 and 69:401 and cast nowhere until chapter 74. The older
        # edition prints him Zenocrates there, on the same Z-for-X misprint as
        # Zenophanes for Xenophanes.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,268),(69,401),(74,151),(85,4),(90,2)],
                             where(ed,'xenocrates'),ed)
        self.assertIn('Zenocrates',said('original-en','xenocrates'))
        self.assertIn('Xenocrates',said('modern-en','xenocrates'))

    def test_the_quoted_verse_of_chapters_74_to_80(self):
        # Turnus, Atlas, Matthias and the Rhamnusian virgin are keyed to the
        # version that follows the quotation. Polemon and Sagoin have one bearer
        # each in the whole work, so they stay aliases and the verse paragraph is
        # suppressed instead.
        for ed in ['original-en','modern-en']:
            for cid,good,bad in [('turnus',(74,38),(74,37)),('atlas',(74,110),(74,109)),
                                 ('matthias',(74,120),(74,119)),('nemesis',(80,7),(80,6)),
                                 ('sagoin',(75,15),(75,14))]:
                self.assertIn(good,where(ed,cid),(ed,cid))
                self.assertNotIn(bad,where(ed,cid),(ed,cid))
            self.assertNotIn((74,152),where(ed,'polemon'),ed)
            for k in [(74,151),(74,153)]:
                self.assertIn(k,where(ed,'polemon'),(ed,k))

    def test_the_epicycle_of_mercury_is_the_planet(self):
        # 74:9, found by the spot-read. The only place in the first eighty
        # chapters where one of the gods' names is an astronomical one.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((74,9),where(ed,'mercury'),ed)
            self.assertIn((73,90),where(ed,'mercury'),ed)

    def test_dionysius_the_father_is_dionysius_the_elder(self):
        # The two editions name him differently at 74:17 — "the father" against
        # "the elder" — and the bare name later in the same paragraph is his.
        for ed in ['original-en','modern-en']:
            self.assertIn((74,17),where(ed,'dionysius-elder'),ed)
            self.assertEqual([(40,75),(78,6)],where(ed,'dionysius-the-younger'),ed)

    def test_the_chapters_74_to_80_transliterations(self):
        for cid,older,newer in [('soliman','Soliman','Suleiman'),
                                ('mule-moloch','Mule Moloch','Moulay Mohammed'),
                                ('montdore','Montdore','Mondoré'),
                                ('adrian-turnebus','Turnebus','Turnèbe'),
                                ('lactantius','Lactantms','Lactantius'),
                                ('mercurino-de-gattinara','Mercurino de’ Gratinare',
                                 "Mercurino de' Gattinara")]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_chapter_74_men_of_montaignes_own_age(self):
        # 74:157 is Montaigne's own roll of the remarkable men he has seen, and
        # names eleven people in one paragraph.
        for ed in ['original-en','modern-en']:
            for cid in ['duc-de-guise','marshal-strozzi','chancellor-olivier','de-lhospital',
                        'daurat','beza','george-buchanan','montdore','adrian-turnebus',
                        'ronsard','joachim-du-bellay','duke-of-alva','montmorency',
                        'monsieur-de-la-noue']:
                self.assertIn((74,157),where(ed,cid),(ed,cid))
            self.assertEqual([(74,158),(74,159)],where(ed,'marie-de-gournay'),ed)

    def test_the_deliberate_gaps_of_chapters_74_to_80(self):
        # The list of men who wrote of their own actions at 75:0 — "Augustus,
        # Cato, Sylla, Brutus, and others" — gives neither Cato nor Brutus a
        # qualifier, and the Essays have two of the one and five of the other.
        # 80:4 sets "our King Philip" beside "his son John" in a sentence that
        # does not identify either. Aristo at 77:0 is the older gap.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,75,0) if 'cato' in c],ed)
            self.assertEqual([],[c for c in ids(ed,75,0) if 'brutus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,80,4) if 'philip' in c or 'john' in c],ed)
            self.assertEqual([],[c for c in ids(ed,77,0) if 'aristo' in c],ed)

    def test_the_chapters_74_to_80_edition_divergences(self):
        # The abbreviation class, recorded and not repaired: the older edition
        # writes "Mart.", "Aug." and bare "Annals" where the modern edition names
        # the author.
        for cid,k in [('martial',(74,110)),('st-augustine',(75,9)),('tacitus',(77,20))]:
            self.assertIn(k,where('modern-en',cid),cid)
            self.assertNotIn(k,where('original-en',cid),cid)


    # ------------------------------------------------- chapters 81 to 90
    def test_the_three_men_called_ptolemy(self):
        # The king from whom Caesar had three millions and six hundred thousand
        # crowns at 81:0; the astronomer whose bounds of the world were wrong at
        # 69:528 and 69:531, cast nowhere until chapter 81 was read; and the king
        # Philopoemen would not have exercising himself at 85:4.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(81,0)],where(ed,'ptolemy'),ed)
            self.assertEqual([(69,528),(69,531)],where(ed,'ptolemy-astronomer'),ed)
            self.assertEqual([(85,4)],where(ed,'ptolemy-of-the-exercises'),ed)

    def test_the_mithridates_of_pergamus_is_not_the_king(self):
        # 81:0 gives King Deiotarus's kingdom to a gentleman of Pergamus called
        # Mithridates. The king's alias was taking him, so it is suppressed there.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(81,0)],where(ed,'mithridates-pergamus'),ed)
            self.assertEqual([(35,9),(101,12)],where(ed,'mithridates'),ed)
            self.assertIn('deiotarus',ids(ed,81,0),ed)
            self.assertIn('marcus-furius',ids(ed,81,0),ed)

    def test_the_two_men_called_caelius(self):
        # Martial's gouty man at 82:0 and 82:2, and the choleric orator at 88:15,
        # whom the older edition prints Celius.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(82,0),(82,2)],where(ed,'caelius-gout'),ed)
            self.assertEqual([(88,15)],where(ed,'caelius-orator'),ed)
            self.assertEqual([],[c for c in ids(ed,82,1) if 'caelius' in c],ed)
        self.assertIn('Celius',said('original-en','caelius-orator'))
        self.assertIn('Caelius',said('modern-en','caelius-orator'))

    def test_the_tyrant_of_pherae_is_not_alexander_the_great(self):
        # He wept at Hecuba and Andromache in the theatre and murdered people
        # every day out of it.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(84,0)],where(ed,'alexander-of-pherae'),ed)
            self.assertNotIn((84,0),where(ed,'alexander'),ed)
            self.assertEqual([(84,0)],where(ed,'hecuba'),ed)
            self.assertEqual([(84,0)],where(ed,'andromache'),ed)

    def test_the_two_widows_of_herodicus(self):
        # 84:28 is a whole story in one paragraph: Theoxena, Archo, Poris and
        # Herodicus, four people who appear nowhere else in the work.
        for ed in ['original-en','modern-en']:
            for cid in ['herodicus','theoxena','archo','poris']:
                self.assertEqual([(84,28)],where(ed,cid),(ed,cid))
            self.assertIn('philip-v-macedon',ids(ed,84,28),ed)

    def test_the_third_rutilius_is_the_consul(self):
        # 84:21. The Itinerarium poet is at 72:43 and Tacitus's self-biographer at
        # 74:7 — three men, three cards, and none of them aliased.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(84,21)],where(ed,'publius-rutilius-consul'),ed)
            self.assertEqual([(72,43)],where(ed,'rutilius-poet'),ed)
            self.assertEqual([(74,7)],where(ed,'rutilius-rufus'),ed)

    def test_the_two_men_called_rabirius(self):
        # The inform style of 74:26, and the man Caesar condemned at 88:11.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(74,26)],where(ed,'rabirius'),ed)
            self.assertEqual([(88,11)],where(ed,'caius-rabirius'),ed)
            self.assertIn((88,11),where(ed,'julius-caesar'),ed)

    def test_the_second_amurath_is_hunyadis_adversary(self):
        # 86:13 is Amurath's army against Huniades's. The modern edition writes
        # them Murad and Hunyadi, and neither form bound until chapter 86.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(86,13)],where(ed,'huniades'),ed)
            self.assertIn((86,13),where(ed,'amurath'),ed)
        self.assertIn('Huniades',said('original-en','huniades'))
        self.assertIn('Hunyadi',said('modern-en','huniades'))
        self.assertIn('Murad',said('modern-en','amurath'))

    def test_the_two_assassins_of_the_prince_of_orange(self):
        # Montaigne names neither man; the editor's bracketed note at 86:16 does.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(86,15)],where(ed,'prince-of-orange'),ed)
            self.assertEqual([(86,16)],where(ed,'jehan-de-jaureguy'),ed)
            self.assertEqual([(86,16)],where(ed,'balthazar-gerard'),ed)

    def test_the_mythological_collectives_of_chapters_86_to_90(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(86,18)],where(ed,'the-assassins'),ed)
            self.assertEqual([(88,0)],where(ed,'the-cyclopes'),ed)
            self.assertEqual([(90,3)],where(ed,'the-curios'),ed)
            self.assertEqual([(89,10)],where(ed,'the-gracchi'),ed)

    def test_caesars_amours_are_all_in_one_paragraph(self):
        # 90:3 names eleven people besides Caesar, and nine of them appear nowhere
        # else in the work.
        for ed in ['original-en','modern-en']:
            for cid in ['cleopatra','caesario','eunoe','posthumia','servius-sulpitius',
                        'lollia','gabinius','tertulla','mutia','the-curios','aegisthus',
                        'servilia','nicomedes','julius-caesar','pompey','crassus-triumvir',
                        'marcus-brutus','cato-the-younger','plutarch']:
                self.assertIn((90,3),where(ed,cid),(ed,cid))

    def test_the_book_called_cato_is_not_the_man(self):
        # 90:6 opens on "the elocution that Cicero had expended in his Cato" —
        # Cicero's book — and then means Cato the Younger six times over. Keyed by
        # occurrence, with the first slot empty.
        for ed in ['original-en','modern-en']:
            self.assertEqual(6,len([m for m in mentions(ed)
                                    if m['chapterNumber']==90 and m['paragraphIndex']==6
                                    and m['characterId']=='cato-the-younger']),ed)
            self.assertIn((90,6),where(ed,'caius-oppius'),ed)

    def test_the_life_of_caesar_is_not_caesar(self):
        # 81:0 names him four times and the first is Suetonius's title.
        for ed in ['original-en','modern-en']:
            self.assertEqual(3,len([m for m in mentions(ed)
                                    if m['chapterNumber']==81 and m['paragraphIndex']==0
                                    and m['characterId']=='julius-caesar']),ed)

    def test_the_two_catos_of_chapter_85(self):
        # "Such as compare Cato the Censor with the younger Cato" — keyed by
        # occurrence, the Censor first.
        for ed in ['original-en','modern-en']:
            self.assertIn((85,0),where(ed,'cato-the-censor'),ed)
            self.assertIn((85,0),where(ed,'cato-the-younger'),ed)
            self.assertIn((85,0),where(ed,'scipio-africanus'),ed)

    def test_the_captains_whose_names_are_obscured(self):
        # 89:10. The Labienus of 65:39 is the orator and this is the general.
        for ed in ['original-en','modern-en']:
            for cid in ['labienus-general','ventidius','telesinus','camillus','the-gracchi']:
                self.assertEqual([(89,10)],where(ed,cid),(ed,cid))
            self.assertNotIn((89,10),where(ed,'labienus-orator'),ed)

    def test_the_chapters_81_to_90_transliterations(self):
        for cid,older,newer in [('soliman','Solyman','Suleiman'),
                                ('asinius-pollio','Asnius Pollio','Asinius Pollio'),
                                ('mattecoulom','Sieur de Mattecoulom','Sieur de Matecoulom'),
                                ('cercyo','Cercyo','Cercyon'),
                                ('mohammed-ii','Mohammed','Mehmed'),
                                ('archytas-tarentinus','Archytas Tarentinus','Archytas of Tarentum'),
                                ('carillus','Carillus','Charillus'),
                                ('caesario','Caesario','Caesarion'),
                                ('posthumia','Posthumia','Postumia'),
                                ('servius-sulpitius','Servius Sulpitius','Servius Sulpicius'),
                                ('mutia','Mutia','Mucia'),
                                ('aegisthus','AEgisthus','Aegisthus'),
                                ('philopoemen','Philopaemen','Philopoemen'),
                                ('conrad-of-monteferrat','Conrad, Marquis of Monteferrat',
                                 'Conrad, Marquis of Montferrat')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_older_edition_has_a_lacuna_at_90_7(self):
        # The modern edition names Caius Memmius, who had written sharp speeches
        # against Caesar; the older edition's sentence is broken and names nobody.
        self.assertIn((90,7),where('modern-en','memmius'))
        self.assertNotIn((90,7),where('original-en','memmius'))

    def test_the_deliberate_gaps_of_chapters_81_to_90(self):
        # Henry, king of England, at 84:14, whom the Duke of Orleans challenged:
        # the Essays give no numeral and five Henrys stand in the work. Cleomenes
        # at 88:12 and Agis and Cleomenes at 89:10, all unqualified. Cato at
        # 89:10, in the list of Plutarch's pairings. Scipio at 90:15, set against
        # Diogenes. And the Lives of Flamininus and of Pyrrhus at 89:3 are titles.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,84,14) if c.startswith('henry')],ed)
            self.assertEqual([(84,14)],where(ed,'duke-of-orleans'),ed)
            self.assertEqual([],[c for c in ids(ed,88,12) if 'cleomenes' in c],ed)
            self.assertEqual([],[c for c in ids(ed,89,10)
                                 if 'cleomenes' in c or c.startswith('agis')],ed)
            self.assertEqual([],[c for c in ids(ed,89,10) if c.startswith('cato')],ed)
            self.assertEqual([],[c for c in ids(ed,90,15) if 'scipio' in c],ed)
            self.assertEqual([],[c for c in ids(ed,89,3) if 'pyrrhus' in c],ed)


    # ------------------------------------------------- chapters 91 to 98
    def test_the_two_women_called_paulina(self):
        # Saturninus's wife, who thought she lay with the god Serapis, at 69:345;
        # and Seneca's wife Pompeia Paulina in her own chapter. The first was
        # taking the second's bare name.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,345)],where(ed,'paulina'),ed)
            self.assertEqual([(92,13),(92,15)],where(ed,'pompeia-paulina'),ed)

    def test_the_two_women_called_arria(self):
        # 92:9 names the elder and, in the same sentence, "another Arria, the wife
        # of Thrasea Paetus". Keyed by occurrence, the daughter second.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(92,9),(92,11)],where(ed,'arria'),ed)
            self.assertEqual([(92,9)],where(ed,'arria-younger'),ed)
            self.assertNotIn((92,10),where(ed,'arria'),ed)
            for cid in ['caecina-paetus','thrasea-paetus','fannia','scribonianus','junia']:
                self.assertEqual([(92,9)],where(ed,cid),(ed,cid))

    def test_the_fourth_ptolemy(self):
        # King Ptolemy who forbade Hegesias his homicidal lectures at 98:12. Four
        # Ptolemys now, and the Essays join none of them.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(98,12)],where(ed,'ptolemy-of-hegesias'),ed)
            self.assertEqual([(81,0)],where(ed,'ptolemy'),ed)
            self.assertEqual([(85,4)],where(ed,'ptolemy-of-the-exercises'),ed)

    def test_the_third_amurath(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(95,45)],where(ed,'amurath-i'),ed)
            self.assertEqual([(29,17),(86,13)],where(ed,'amurath'),ed)
            self.assertEqual([(78,1)],where(ed,'amurath-iii'),ed)

    def test_helen_of_troy_is_not_constantines_mother(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(93,16)],where(ed,'helen'),ed)
            self.assertEqual([(33,7)],where(ed,'helena'),ed)
            self.assertEqual([(93,16)],where(ed,'hector'),ed)

    def test_the_emperor_adrian_is_not_the_cardinal(self):
        # The emperor at 70:28, 78:0 and 94:28, cast nowhere until chapter 94 was
        # read; the Cardinal of Corneto at 33:2. The modern edition writes the
        # emperor Hadrian.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(70,28),(78,0),(94,28),(101,13)],where(ed,'hadrian'),ed)
            self.assertEqual([(33,2)],where(ed,'cardinal-adrian'),ed)
        self.assertIn('Adrian',said('original-en','hadrian'))
        self.assertIn('Hadrian',said('modern-en','hadrian'))

    def test_the_quoted_verse_of_chapters_91_to_98(self):
        # Caesar at 91:6, Arria at 92:10, Venus and Lucifer at 93:22, Dido at
        # 98:17 all stand in quoted Latin; the version that follows carries the
        # card in each case.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((91,6),where(ed,'julius-caesar'),ed)
            self.assertIn((91,7),where(ed,'julius-caesar'),ed)
            self.assertNotIn((92,10),where(ed,'arria'),ed)
            self.assertNotIn((93,22),where(ed,'venus'),ed)
            self.assertEqual([(93,23)],where(ed,'lucifer'),ed)
            self.assertNotIn((98,17),where(ed,'dido'),ed)
            self.assertIn((98,18),where(ed,'dido'),ed)

    def test_the_three_good_women_have_their_households(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(92,13)],where(ed,'statius-anneus'),ed)
            self.assertIn((92,13),where(ed,'seneca'),ed)
            self.assertIn((92,13),where(ed,'nero'),ed)

    def test_chapter_91_is_all_caesar(self):
        # The chapter on Caesar's conduct of war names him in nineteen paragraphs
        # and nobody else more than twice.
        for ed in ['original-en','modern-en']:
            n=len({m['paragraphIndex'] for m in mentions(ed)
                   if m['chapterNumber']==91 and m['characterId']=='julius-caesar'})
            self.assertGreater(n,9,ed)
            # Afranius and Petreius stand twice, at 91:12 and 91:18; the rest once.
            for cid in ['afranius','petreius']:
                self.assertEqual([(91,12),(91,18)],where(ed,cid),(ed,cid))
            for cid in ['pharnaces','vercingetorix','ariovistus','scaeva',
                        'granius-petronius','marcus-octavius','lucius-cassius',
                        'admiral-chastillon','gaspard-de-coligny','daunus','tigranes']:
                self.assertEqual(1,len(where(ed,cid)),(ed,cid))

    def test_the_chapters_91_to_98_transliterations(self):
        for cid,older,newer in [('commines','Philip’de Comines','Philippe de Commines'),
                                ('statius-anneus','Statius Anneus','Statius Annaeus'),
                                ('hephaestion','Ephistion','Hephaestion'),
                                ('aesculapius','AEsculapius','Aesculapius'),
                                ('hippolytus','Hippolitus','Hippolytus'),
                                ('subrius-flavius','Subrius Flavius','Subrius Flavus'),
                                ('bajazet','Bajazet','Bayezid'),
                                ('clytus','Clytus','Cleitus')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_deliberate_gaps_of_chapters_91_to_98(self):
        # "The family of Lepidus at Rome" at 94:19 is a house and not the man;
        # "not an angel or Cato" at 96:25 has no qualifier.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,94,19) if 'lepidus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,96,25) if c.startswith('cato')],ed)

    def test_the_chapters_91_to_98_edition_divergences(self):
        # The modern edition resolves pronouns to names: it writes Caesar in four
        # paragraphs of chapter 91 where Cotton writes "he", and supplies Augustus
        # at 91:8 and Tiberius at 95:5.
        for cid,k in [('julius-caesar',(91,5)),('julius-caesar',(91,12)),
                      ('julius-caesar',(91,25)),('julius-caesar',(91,30)),
                      ('augustus',(91,8)),('tiberius-emperor',(95,5))]:
            self.assertIn(k,where('modern-en',cid),(cid,k))
            self.assertNotIn(k,where('original-en',cid),(cid,k))


    # ---------------------------------------------------------- chapter 99
    def test_the_four_of_platos_pretended_intercourses(self):
        # 99:46. Phaedo is keyed rather than aliased, because at 60:57 the same
        # name is the title of Plato's dialogue.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,46)],where(ed,'archeanassa'),ed)
            self.assertEqual([(99,46)],where(ed,'stella'),ed)
            self.assertEqual([(99,46),(99,200)],where(ed,'phaedo'),ed)
            self.assertIn((99,46),where(ed,'dion'),ed)
            self.assertEqual([],[c for c in ids(ed,60,57) if 'phaedo' in c],ed)

    def test_origen_and_strato_and_messalina_reach_back(self):
        # Three more cast nowhere until chapter 99 was read, though each stands
        # in a chapter authored before it.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,476),(99,55),(99,57)],where(ed,'origen'),ed)
            self.assertEqual([(69,268),(69,335),(69,412),(94,41),(99,133)],
                             where(ed,'strato'),ed)
            self.assertEqual([(94,42),(99,219)],where(ed,'messalina'),ed)
        self.assertIn('Origeti',said('original-en','origen'))
        self.assertIn('Origen',said('modern-en','origen'))

    def test_the_second_boleslaus_and_his_wife(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,118)],where(ed,'boleslas-v'),ed)
            self.assertEqual([(99,118)],where(ed,'kinge'),ed)
            self.assertEqual([(95,39)],where(ed,'boleslaus'),ed)
            self.assertIn((99,118),where(ed,'clodia-laeta'),ed)
            self.assertIn((99,118),where(ed,'caligula'),ed)

    def test_the_grave_writers_on_love(self):
        # 99:133 names nine books and their authors. The authors are cast; the
        # titles are not.
        for ed in ['original-en','modern-en']:
            for cid in ['strato','theophrastus','aristippus','demetrius-phalereus',
                        'heraclides-ponticus','antisthenes','aristo-of-chios',
                        'cleanthes','sphaereus','chrysippus','jove','juno','zeno-of-citium']:
                self.assertIn((99,133),where(ed,cid),(ed,cid))

    def test_the_fourth_crassus_never_laughed(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,45)],where(ed,'crassus-agelastus'),ed)
            self.assertEqual([(16,9),(16,10)],where(ed,'publius-crassus'),ed)

    def test_the_two_men_called_octavius_and_the_two_posthumias(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(22,54)],where(ed,'octavius'),ed)
            self.assertEqual([(91,34)],where(ed,'marcus-octavius'),ed)
            self.assertEqual([(99,181)],where(ed,'octavius-of-rome'),ed)
            self.assertEqual([(99,181)],where(ed,'pontia-posthumia'),ed)
            self.assertEqual([(90,3)],where(ed,'posthumia'),ed)

    def test_the_third_galba(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,350),(100,17)],where(ed,'galba-emperor'),ed)
            self.assertEqual([(30,0)],where(ed,'sulpicius-galba'),ed)
            self.assertEqual([],[c for c in ids(ed,99,199) if 'galba' in c],ed)

    def test_the_quoted_verse_of_chapter_99(self):
        # Licymnia and Achaemenes at 99:145 against Horace's Latin at 99:144;
        # Lachesis at 99:335 against Juvenal's at 99:334; Juno at 99:177 against
        # the Latin at 99:176.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,145)],where(ed,'licymnia'),ed)
            self.assertEqual([(99,145)],where(ed,'achaemenes'),ed)
            self.assertEqual([(99,335)],where(ed,'lachesis'),ed)
            self.assertIn((99,177),where(ed,'juno'),ed)
            self.assertNotIn((99,176),where(ed,'juno'),ed)

    def test_the_chapter_99_transliterations(self):
        for cid,older,newer in [('demetrius-phalereus','Demetrius Phalereus',
                                 'Demetrius of Phalerum'),
                                ('sphaereus','Sphaereus','Sphaerus'),
                                ('ficinus','Ficinus','Ficino'),
                                ('the-essenes','Essenians','Essenes'),
                                ('menon','Menon','Meno'),
                                ('panaetius','Panetius','Panaetius')]:
            self.assertIn(older,said('original-en',cid),cid)
            self.assertIn(newer,said('modern-en',cid),cid)

    def test_the_deliberate_gaps_of_chapter_99(self):
        # Lepidus at 99:157, the one coxcomb who died for grief, with no numeral
        # among four; Antigonus at 99:85; a third Galba at 99:199; and the
        # Pseudo-Gallus of the citations, which is an editorial doubt and not a
        # man, as at 19:70.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,99,157) if 'lepidus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,99,85) if 'antigonus' in c],ed)
            for k in [(99,34),(99,95),(99,257)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'gallus' in c],(ed,k))
            for cid in ['julius-caesar','pompey','mark-antony','cato-the-younger']:
                self.assertIn((99,157),where(ed,cid),(ed,cid))


    def test_the_agamemnon_of_chapter_100_is_the_man_and_not_the_play(self):
        # 74:68 and 74:78 are "Seneca, Agamemnon" -- citations of the tragedy.
        # Only the English version of Horace's ode at 100:47 means the king, so
        # he is keyed and not aliased. The same trap as Hippolytus at 2:17.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(100,47)],where(ed,'agamemnon'),ed)
            for k in [(74,68),(74,78)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'agamemnon' in c],(ed,k))

    def test_the_queen_catherine_and_the_saints_hill(self):
        # 23:0 is "the St. Catherine's Mount", the battery position at the siege
        # of Rouen. The queen binds by her title, which that hill does not carry.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(100,16)],where(ed,'catherine-de-medici'),ed)
            self.assertEqual(['Queen Catherine'],said(ed,'catherine-de-medici'),ed)
            self.assertEqual([],[c for c in ids(ed,23,0) if 'catherine' in c],ed)

    def test_gregory_xiii_binds_by_his_numeral(self):
        # Both his paragraphs are editor's notes or a list of public works, and
        # both name the numeral, so the alias is safe in a chapter not yet read.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(100,16),(104,45)],where(ed,'gregory-xiii'),ed)
            self.assertEqual({'Gregory XIII'},set(said(ed,'gregory-xiii')),ed)

    def test_cytheris_under_both_her_names(self):
        # The note at 100:14 gives the courtezan her own name and the name Gallus
        # gave her in his elegies. One card, two aliases, one paragraph.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(100,14)],where(ed,'cytheris'),ed)
            self.assertEqual({'Cytheris','Lycoris'},set(said(ed,'cytheris')),ed)
            self.assertIn((100,14),where(ed,'cornelius-gallus-poet'),ed)

    def test_the_three_emperors_of_the_coaches(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(100,15)],where(ed,'firmus'),ed)
            self.assertEqual([(100,31)],where(ed,'probus'),ed)
            self.assertEqual([(99,350),(100,17)],where(ed,'galba-emperor'),ed)
            self.assertEqual([(30,0)],where(ed,'sulpicius-galba'),ed)
            self.assertIn((100,15),where(ed,'heliogabalus'),ed)

    def test_laches_in_both_spellings(self):
        # 12:1 and 84:22 are Plato's Laches; 100:7 is the same man fleeing beside
        # Socrates after Delium, and both editions spell him Lachez there.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(12,1),(84,22),(100,7)],where(ed,'laches'),ed)
            self.assertIn('Lachez',said(ed,'laches'),ed)
            self.assertIn('Laches',said(ed,'laches'),ed)
            self.assertEqual([],[c for c in ids(ed,99,335) if c=='laches'],ed)

    def test_calpurnius_is_cast_from_his_three_citations(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(100,33),(100,39),(100,44)],where(ed,'calpurnius'),ed)

    def test_the_deliberate_gaps_of_chapter_100(self):
        # The tyrant Dionysius at 100:18 carries no numeral and the Essays hold
        # two tyrants of the name; "Plutarch's Life of Antony" at 100:14 is a
        # title, though Marc Antony himself is bound one paragraph earlier;
        # Hermogenes at 100:41 stands inside Martial's Latin, which in this
        # chapter alone has no English version after it; and the daemons and
        # sibyls of 100:59 are classes and not names -- the modern edition
        # lowercases both, which is the evidence for it.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,100,18) if 'dionysius' in c],ed)
            self.assertEqual([],[c for c in ids(ed,100,14) if 'antony' in c],ed)
            self.assertIn((100,13),where(ed,'mark-antony'),ed)
            self.assertEqual([],ids(ed,100,41),ed)
            self.assertEqual([],ids(ed,100,59),ed)
        self.assertIn('Marc Antony',said('original-en','mark-antony'))


    def test_the_fourth_pausanias_is_a_writer(self):
        # Three Spartans and one author. 102:5 is "Pausanias tells us of an
        # ancient player upon the harp", which is the only one of the four who
        # tells us anything, and the sentence says nothing more about him.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(102,5)],where(ed,'pausanias-writer'),ed)
            self.assertEqual([(29,5)],where(ed,'pausanias-sparta'),ed)
            self.assertEqual([(36,10)],where(ed,'pausanias-plataea'),ed)
            self.assertEqual([(59,21)],where(ed,'pausanias-assassin'),ed)

    def test_quintus_cicero_takes_back_his_three_citations(self):
        # The orator's brother, cited from the treatise on canvassing for the
        # consulship. Until chapter 102 was read his citation at 99:315 was
        # binding to his brother -- a live mis-binding in a chapter already
        # signed off, and one no census could see, since both editions print
        # "Q. Cicero" and both were wrong together.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,315),(102,78),(102,80)],where(ed,'quintus-cicero'),ed)
            self.assertEqual({'Q. Cicero'},set(said(ed,'quintus-cicero')),ed)
            for k in [(99,315),(102,78),(102,80)]:
                self.assertNotIn('cicero',ids(ed,*k),(ed,k))
            self.assertIn((102,64),where(ed,'cicero'),ed)

    def test_brisson_under_both_his_names(self):
        # The sentence that names him runs across the editor's note: "Brisson,"
        # ends 101:7 and "running against Alexander" opens 101:9. The note
        # between them says Plutarch calls him Chriso elsewhere.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(101,7),(101,8)],where(ed,'brisson'),ed)
            self.assertEqual({'Brisson','Chriso'},set(said(ed,'brisson')),ed)
            self.assertIn((101,9),where(ed,'alexander'),ed)

    def test_philoxenus_reaches_back_into_the_apology(self):
        # Cast nowhere until chapter 101 was read, though he breaks the earthen
        # vessels at 69:613 in a chapter signed off long before.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(69,613),(101,13)],where(ed,'philoxenus'),ed)

    def test_favorinus_and_the_emperor_of_thirty_legions(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(101,13),(107,155)],where(ed,'favorinus'),ed)
            self.assertIn((101,13),where(ed,'hadrian'),ed)
        self.assertIn('Adrian',said('original-en','hadrian'))
        self.assertIn('Hadrian',said('modern-en','hadrian'))

    def test_the_two_names_of_horaces_warning(self):
        # 102:3 is Horace's Latin and 102:4 the English version. Albus is Albi
        # in the Latin and needs no key; Barrus is spelt alike in both and is
        # keyed to the version, so the Latin stays unbound.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(102,4)],where(ed,'albus'),ed)
            self.assertEqual([(102,4)],where(ed,'barrus'),ed)
            self.assertEqual([],ids(ed,102,3),ed)

    def test_the_silent_visitor_and_the_painter(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(102,42)],where(ed,'megabyzus'),ed)
            self.assertEqual([(102,42)],where(ed,'apelles'),ed)
            self.assertEqual([(102,60)],where(ed,'melanthius'),ed)
            self.assertEqual([(102,47)],where(ed,'seiramnes'),ed)
            self.assertEqual([(102,27)],where(ed,'miso'),ed)
            self.assertEqual([(102,21)],where(ed,'hobbes'),ed)
            # Socrates's interlocutor in three chapters, and a man in all three
            # -- checked before he was given an alias, which is the lesson
            # Agamemnon taught.
            self.assertEqual([(102,26),(106,115),(107,40)],where(ed,'euthydemus'),ed)

    def test_thorius_balbus_against_regulus(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(101,2)],where(ed,'thorius-balbus'),ed)
            self.assertEqual([(52,0),(60,11),(101,2),(101,3)],
                             where(ed,'attilius-regulus'),ed)
            self.assertEqual([(101,5)],where(ed,'otanes'),ed)

    def test_the_deliberate_gaps_of_chapters_101_and_102(self):
        # 101:13 names Philoxenus in the quarries and Plato sold at Aegina, and
        # those are the elder Dionysius's acts, in the sentence. 101:12 and
        # 102:60 give no qualifier at all, and the Essays hold two tyrants of
        # the name. 102:27's "old philosopher" who never wanted an occasion for
        # his tears is named only by description.
        for ed in ['original-en','modern-en']:
            self.assertIn((101,13),where(ed,'dionysius-elder'),ed)
            for k in [(101,12),(102,60)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'dionysius' in c],(ed,k))
            self.assertEqual([],[c for c in ids(ed,102,27) if 'heraclitus' in c],ed)


    def test_the_list_of_titles_at_103_264(self):
        # "The titles of my chapters do not always comprehend the whole matter;
        # they often denote it by some mark only, as these others, Andria,
        # Eunuchus; or these, Sylla, Cicero, Toyquatus." Four books named for the
        # men they are about, and four aliases were binding all four. The same
        # paragraph's "Daemon of Socrates" is Plutarch's title.
        for ed in ['original-en','modern-en']:
            for c in ['cicero','sylla','torquatus','socrates']:
                self.assertNotIn(c,ids(ed,103,264),(ed,c))
            self.assertIn('plato',ids(ed,103,264),ed)
            self.assertIn('plutarch',ids(ed,103,264),ed)
            # and the same rule at 103:18, Plutarch's Life of Paulus Emilius,
            # which the two editions spell differently.
            self.assertNotIn('paulus-aemilius',ids(ed,103,18),ed)
            self.assertIn('montaigne',ids(ed,103,18),ed)

    def test_montaigne_is_neither_the_estate_nor_the_college(self):
        # 103:38 is "building at Montaigne", the house he was born in; 103:257 is
        # "Montaigne College at Paris". The author's alias was taking both, which
        # is the third and fourth time it has done that after 73:71.
        for ed in ['original-en','modern-en']:
            for k in [(103,38),(103,257)]:
                self.assertNotIn('montaigne',ids(ed,*k),(ed,k))

    def test_the_two_pacuviuses(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(11,24),(11,26),(24,10)],where(ed,'pacuvius'),ed)
            self.assertEqual([(103,84)],where(ed,'pacuvius-calavius'),ed)
            self.assertNotIn('pacuvius',ids(ed,103,84),ed)

    def test_the_two_antipaters(self):
        # The Macedonian regent of 24:61, 60:3 and 95:37 held the bare alias and
        # was taking the last man of the Stoic succession at 103:181.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(24,61),(60,3),(95,37)],where(ed,'antipater'),ed)
            self.assertEqual([(103,181)],where(ed,'antipater-of-tarsus'),ed)

    def test_the_fourth_diogenes(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(103,181)],where(ed,'diogenes-of-babylon'),ed)
            self.assertEqual([(11,31)],where(ed,'diogenes-the-atheist'),ed)
            self.assertIn((103,37),where(ed,'diogenes-the-cynic'),ed)
            self.assertIn((103,242),where(ed,'diogenes-the-cynic'),ed)
            self.assertNotIn('diogenes-the-cynic',ids(ed,103,181),ed)
            # the Stoics named beside him in the same sentence
            for c in ['chrysippus','cleanthes','zeno-of-citium','antipater-of-tarsus']:
                self.assertIn((103,181),where(ed,c),(ed,c))

    def test_the_two_monsieurs_de_foix(self):
        # Gaston, dead in the pursuit at Ravenna, and the diplomat lost with
        # Pibrac. Neither carries an alias, because the Essays call both of them
        # by the same three words.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(47,8)],where(ed,'monsieur-de-foix'),ed)
            self.assertEqual([(103,79)],where(ed,'paul-de-foix'),ed)
            self.assertEqual([(103,79)],where(ed,'pibrac'),ed)

    def test_the_two_men_called_antiochus(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(20,4)],where(ed,'antiochus'),ed)
            self.assertEqual([(103,118)],where(ed,'antiochus-of-ascalon'),ed)

    def test_petronius_reaches_back_into_chapter_99(self):
        # The arbiter's citation at 99:5 was cast nowhere; the bare surname at
        # 91:33 belongs to Granius Petronius, so neither man holds the alias.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(99,5),(103,195)],where(ed,'petronius-arbiter'),ed)
            self.assertEqual([(91,33)],where(ed,'granius-petronius'),ed)
            self.assertNotIn('petronius-arbiter',ids(ed,91,33),ed)

    def test_the_third_saturninus(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(68,7)],where(ed,'saturninus'),ed)
            self.assertEqual([(69,345)],where(ed,'saturninus-husband'),ed)
            self.assertEqual([(103,255)],where(ed,'saturninus-general'),ed)

    def test_the_clinias_that_is_a_man(self):
        # 99:133 is the title of a book of Heraclides; 103:239 is the man in
        # whose lap Xenophon wrote against the Aristippic virtue.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(103,239)],where(ed,'clinias'),ed)
            self.assertNotIn('clinias',ids(ed,99,133),ed)
            self.assertEqual([(103,239)],where(ed,'portia'),ed)
            self.assertIn((103,239),where(ed,'aristo-of-chios'),ed)

    def test_the_grammarian_and_the_note_that_corrects_him(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(103,0),(103,1)],where(ed,'diomedes'),ed)
            self.assertEqual([(103,1)],where(ed,'didymus'),ed)

    def test_the_goddess_of_safety_carries_the_english(self):
        # 103:89 is Terence's Latin and 103:90 the version, where she is named
        # as a goddess.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(103,90)],where(ed,'salus'),ed)
            self.assertEqual([],ids(ed,103,89),ed)

    def test_horace_under_his_longer_name(self):
        # "Horatius" in the older edition at 68:24 and 103:13, where the modern
        # edition writes Horace. Two asymmetries closed by one alias.
        for ed in ['original-en','modern-en']:
            for k in [(68,24),(103,13)]:
                self.assertIn('horace',ids(ed,*k),(ed,k))
        self.assertIn('Horatius',said('original-en','horace'))
        self.assertNotIn('Horatius',said('modern-en','horace'))
        for ed in ['original-en','modern-en']:
            self.assertEqual([(88,13),(103,212)],where(ed,'archytas-tarentinus'),ed)

    def test_the_rest_of_the_chapter_103_cast(self):
        for ed in ['original-en','modern-en']:
            for cid,k in [('philotimus',(103,3)),('pyrrha',(103,75)),
                          ('cadmus',(103,75)),('lyncestes',(103,109)),
                          ('valerius-maximus',(103,130)),('nonius',(103,203)),
                          ('olus',(103,247)),('ctesibius',(103,268)),
                          ('tigellinus',(103,195))]:
                self.assertEqual([k],where(ed,cid),(ed,cid))
            self.assertIn((103,93),where(ed,'nicocles'),ed)
            self.assertIn((103,143),where(ed,'hippias-sophist'),ed)
            self.assertIn((103,143),where(ed,'scipio-africanus'),ed)
            self.assertIn((103,268),where(ed,'marcus-brutus'),ed)

    def test_the_deliberate_gaps_of_chapter_103(self):
        # "one Galba of old" at 103:2, like the dog's master "one Pyrrhus" at
        # 69:96; Antigonus at 103:184, where the Essays hold three; Metellus and
        # Scipio at 103:268, four of each; Cato at 103:249, two; and Michael at
        # 103:41, which is Cotton's rendering of Montaigne's own Christian name
        # in a sentence that has come out of the French unintelligible.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,103,2) if 'galba' in c],ed)
            self.assertEqual([],[c for c in ids(ed,103,184) if 'antigonus' in c],ed)
            self.assertEqual([],[c for c in ids(ed,103,249) if 'cato' in c],ed)
            for c in ['metellus','scipio']:
                self.assertEqual([],[x for x in ids(ed,103,268) if x.startswith(c)],(ed,c))
            self.assertEqual([],ids(ed,103,41),ed)
            self.assertIn((103,184),where(ed,'bion'),ed)
            self.assertIn((103,268),where(ed,'lucullus'),ed)


if __name__=='__main__':unittest.main()
