"""Guards for the Ulysses character package.

Episodes 1 to 6 of 18 are authored. These tests pin the identifications that took a
reading to make, and the traps that a later pass must not undo.
"""
import json,unittest
from build_ulysses import compile_package
ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):return sorted({(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid})
def said(ed,cid):return [m['text'] for m in mentions(ed) if m['characterId']==cid]
def ids(ed,ch,pi):return sorted({m['characterId'] for m in mentions(ed) if m['chapterNumber']==ch and m['paragraphIndex']==pi})
CARDS={e['id']:e for e in json.loads(open('ulysses/editorial.json').read())['entities']}

class Ulysses(unittest.TestCase):
    def test_only_the_first_six_episodes_are_authored(self):
        self.assertIn('episodes 1-6 of 18',REPORT['scope'])
        for ed in ['original-en','modern-en']:
            self.assertEqual(REPORT['editions'][ed]['chapters'],18,ed)
            self.assertEqual(REPORT['editions'][ed]['paragraphs'],7148,ed)

    def test_the_three_in_the_tower(self):
        for ed in ['original-en','modern-en']:
            for cid in ['stephen','mulligan','haines']:
                w=where(ed,cid)
                self.assertTrue([k for k in w if k[0]==1],(ed,cid))
            self.assertIn((1,4),where(ed,'stephen'),ed)
            self.assertIn((1,0),where(ed,'mulligan'),ed)
            self.assertIn((1,21),where(ed,'haines'),ed)

    def test_stephen_answers_to_three_names(self):
        # Stephen Dedalus, Stephen and Kinch are all him, and the full name takes
        # one span rather than two.
        for ed in ['original-en','modern-en']:
            t=set(said(ed,'stephen'))
            for n in ['Stephen Dedalus','Stephen','Kinch']:
                self.assertIn(n,t,(ed,n))
            self.assertIn('Stephen Dedalus',[m['text'] for m in mentions(ed)
                                             if m['chapterNumber']==1 and m['paragraphIndex']==4],ed)

    def test_the_ashplant_calls_his_name(self):
        # 1:306 spells it Steeeeeeeeeeeephen, which no alias can match. Both
        # editions keep the spelling.
        for ed in ['original-en','modern-en']:
            self.assertIn('Steeeeeeeeeeeephen',said(ed,'stephen'),ed)

    def test_stephen_is_not_the_square_nor_the_saint(self):
        # 17:39 is 16 Stephen's Green and 15:407 is Saint Stephen's day in the
        # wren song. Both are outside episode 1, and the book-wide alias was
        # binding both until every occurrence of the name was listed.
        for ed in ['original-en','modern-en']:
            for k in [(17,39),(15,407)]:
                self.assertNotIn('stephen',ids(ed,*k),(ed,k))

    def test_mulligan_is_not_the_banker_nor_the_high_king_nor_the_saint(self):
        # 10:349 is John Mulligan of the Hibernian bank; 12:50 is the ardri
        # Malachi among the Irish heroes; 12:513 is Saint Malachy in the
        # procession of saints beside Saint Patrick.
        for ed in ['original-en','modern-en']:
            for k in [(10,349),(12,50),(12,513)]:
                self.assertNotIn('mulligan',ids(ed,*k),(ed,k))
            # but the Oxen of the Sun pastiche is him
            for k in [(14,18),(14,33),(14,47)]:
                self.assertIn('mulligan',ids(ed,*k),(ed,k))

    def test_dedalus_is_keyed_and_never_defaulted(self):
        # Stephen in episode 1; his father from episode 6; his sisters in 10.
        # The table has no default, so no unread episode gets a card.
        from build_ulysses import SPLIT
        table,default=SPLIT['Dedalus']
        self.assertIsNone(default)
        self.assertTrue(all(ch in (1,2,6) for ch,_ in table))
        for ed in ['original-en','modern-en']:
            self.assertIn((1,23),where(ed,'stephen'),ed)
            for k in [(6,1),(10,1)]:
                self.assertNotIn('stephen',ids(ed,*k),(ed,k))

    def test_every_table_refuses_to_default(self):
        from build_ulysses import SPLIT
        for name,(table,default) in SPLIT.items():
            self.assertIsNone(default,name)

    def test_every_table_key_names_a_real_entity(self):
        from build_ulysses import SPLIT,PHRASE
        for name,(table,_) in SPLIT.items():
            for k,v in table.items():
                for id in (v if isinstance(v,list) else [v]):
                    if id:self.assertIn(id,CARDS,(name,k,id))
        for k,rows in PHRASE.items():
            for _,id in rows:self.assertIn(id,CARDS,(k,id))

    def test_no_key_matches_nothing(self):
        # The opposite failure to a missing key, and the one that leaves a card
        # unreachable without any test noticing. Every SPLIT key and every PHRASE
        # pattern must actually match its paragraph in at least one edition.
        import re,json as _j
        from build_ulysses import SPLIT,PHRASE
        from build_pilot import normalized
        P={}
        for ed in ['original-en','modern-en']:
            d=_j.load(open(f'/home/user/tinct/app/public/data/editions/ulysses-{ed}.json'))
            P[ed]={(c['number'],i):normalized(p) for c in d['chapters'] for i,p in enumerate(c['paragraphs'])}
        dead=[]
        for name,(table,_d) in SPLIT.items():
            for k in table:
                pat=r'(?<![A-Za-z])'+name+r'(?![A-Za-z])'
                if not any(re.search(pat,P[ed][k]) for ed in P):dead.append((name,k))
        for k,rows in PHRASE.items():
            for pat,_id in rows:
                if not any(re.search(pat,P[ed][k]) for ed in P):dead.append((pat,k))
        self.assertEqual(dead,[])

    def test_the_mother_is_bound_where_the_text_makes_her_the_subject(self):
        # She is never named in episode 1. The word "mother" is hers at the
        # deathbed and the dream, the sea's at 1:35, 1:37 and 1:45, Mulligan's
        # at 1:83, part of mother Grogan's name at 1:155 and 1:162, and the jew
        # mother of the ballad at 1:288.
        for ed in ['original-en','modern-en']:
            w=where(ed,'may-dedalus')
            for k in [(1,39),(1,41),(1,89),(1,91)]:
                self.assertIn(k,w,(ed,k))
            for k in [(1,35),(1,37),(1,45),(1,288)]:
                self.assertNotIn('may-dedalus',ids(ed,*k),(ed,k))
            self.assertIn('mulligan-mother',ids(ed,1,83),ed)

    def test_the_unnamed_figures_of_the_episode(self):
        # Nine people the text names only by a description.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(1,15),(1,39),(1,59),(3,53),(3,54)],where(ed,'mulligan-aunt'),ed)
            self.assertEqual([(1,83)],where(ed,'mulligan-mother'),ed)
            self.assertEqual([(1,327)],where(ed,'mulligan-brother'),ed)
            self.assertIn((1,176),where(ed,'milkwoman'),ed)
            self.assertIn((1,239),where(ed,'milkwoman'),ed)
            self.assertEqual([(1,321),(1,323)],where(ed,'cliff-boatman'),ed)
            self.assertEqual([(1,321)],where(ed,'cliff-businessman'),ed)
            self.assertEqual([(1,326),(1,333),(1,348)],where(ed,'creek-young-man'),ed)
            self.assertEqual([(1,331)],where(ed,'creek-elderly-man'),ed)
            self.assertEqual([(1,325),(3,68)],where(ed,'drowned-man'),ed)

    def test_the_modern_edition_substitutes_and_drops_names(self):
        # The modern edition of this book is a rewrite, not a normalisation. It
        # prints Swinburne where Joyce wrote Algy and William where he wrote
        # Billy; it names Stephen where Joyce wrote "poor dogsbody" and Mulligan
        # where he wrote "him"; and it drops Chrysostomos and Mercury's hat
        # altogether, so those two stand in the older edition alone.
        self.assertIn('Algy',said('original-en','algy'))
        self.assertIn('Swinburne',said('modern-en','algy'))
        self.assertIn('Billy Pitt',said('original-en','billy-pitt'))
        self.assertIn('William Pitt',said('modern-en','billy-pitt'))
        self.assertEqual([(1,9)],where('original-en','chrysostomos'))
        self.assertEqual([],where('modern-en','chrysostomos'))
        self.assertIn((1,293),where('original-en','mercury'))
        self.assertEqual([],where('modern-en','mercury'))
        self.assertEqual(['mercury','chrysostomos','adam-findlater'],
                         REPORT['editions']['modern-en']['omittedEntities'])
        # brian-boru is the inverse case: a man the modern edition puts in where
        # Joyce named his people, so he is unreachable in the older edition.
        self.assertEqual(['brian-boru'],REPORT['editions']['original-en']['omittedEntities'])
        self.assertIn((1,101),where('original-en','loyola'))
        self.assertNotIn('loyola',ids('modern-en',1,101))

    def test_the_heresiarchs_of_stephens_memory(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((1,318),where(ed,'photius'),ed)
            self.assertIn((1,318),where(ed,'arius'),ed)
            self.assertIn((1,318),where(ed,'valentine'),ed)
            self.assertIn((1,318),where(ed,'sabellius'),ed)
            self.assertIn((1,318),where(ed,'pope-marcellus'),ed)
            self.assertIn((1,318),where(ed,'mulligan'),ed)

    def test_the_namesakes_that_are_keyed_and_not_aliased(self):
        # Each of these names belongs to somebody else somewhere in the book, so
        # the episode-1 man is keyed and the rest of the book gets no card.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(1,59)],where(ed,'ursula'),ed)          # 12:513 is S. Ursula
            self.assertEqual([(1,70)],where(ed,'aubrey-oxford'),ed)   # 9:294 is the theatre owner
            self.assertEqual([(1,158)],where(ed,'mrs-cahill'),ed)     # 10:542 is Cahill's corner
            self.assertEqual([(1,335)],where(ed,'lily-carlisle'),ed)  # six women called Lily
            self.assertEqual([(1,255)],where(ed,'butterly'),ed)       # 15:449 is Maurice Butterly
            self.assertEqual([(1,329),(4,135)],where(ed,'bannon'),ed)  # Milly writes home about him
            self.assertEqual([(1,232),(1,269),(1,275),(2,74),(3,79),(5,65),(6,333)],
                             where(ed,'hamlet'),ed)
            self.assertEqual([(1,275),(2,74),(2,113),(6,168)],
                             [k for k in where(ed,'shakespeare') if k[0]!=6 or k[1]!=333],ed)

    def test_the_deliberate_gaps_of_episode_one(self):
        # "By Jove" at 1:156 is the exclamation, not the god, like the epicycle
        # of Mercury in Montaigne; "Mercurial Malachi" at 1:250 is an adjective;
        # the ballad of joking Jesus at 1:296 names Christ, who is deliberately
        # not cast, with the Christian God.
        for ed in ['original-en','modern-en']:
            self.assertEqual([],[c for c in ids(ed,1,156) if c!='haines'],ed)
            self.assertEqual(['mulligan'],ids(ed,1,250),ed)
            self.assertEqual([],[c for c in ids(ed,1,296) if 'jesus' in c or 'christ' in c],ed)

    def test_no_card_is_a_bare_cross_reference(self):
        # A reader gets one card at a time and no neighbours.
        import re
        NAME=re.compile(r'[A-Z][A-Za-z’\'-]{2,}')
        thin=[(cid,e['body']) for cid,e in CARDS.items() if not NAME.search(e['body'])]
        self.assertEqual(thin,[])

    def test_every_card_is_reachable_in_the_older_edition(self):
        self.assertEqual(REPORT['authoredEntries'],len(CARDS))
        for ed in ['original-en','modern-en']:
            bound={m['characterId'] for m in mentions(ed)}
            missing=[c for c in CARDS if c not in bound]
            self.assertEqual(missing,REPORT['editions'][ed]['omittedEntities'],ed)


    def test_episode_two_surnames_all_belong_to_somebody_else(self):
        # Every one of these is a different person or a different thing
        # elsewhere in the book, which is why none of them is an alias. This is
        # the rule in Ulysses rather than the exception.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(2,0),(2,57),(2,91)],where(ed,'cochrane'),ed)
            self.assertEqual([(2,30),(2,32),(2,36),(2,40),(2,43)],where(ed,'talbot'),ed)
            self.assertEqual([(2,91)],where(ed,'halliday'),ed)
            self.assertEqual([(2,123)],where(ed,'curran'),ed)
            self.assertEqual([(2,123),(3,35)],where(ed,'temple'),ed)  # 3:35 is the same man
            self.assertEqual([(2,123),(3,57)],where(ed,'russell'),ed)  # A E on the strand
            self.assertEqual([(2,6)],where(ed,'blake'),ed)
            self.assertEqual([(2,151),(2,152)],where(ed,'henry-blackwood-price'),ed)
            self.assertEqual([(2,141)],where(ed,'duke-of-westminster'),ed)
            self.assertEqual([(2,141)],where(ed,'duke-of-beaufort'),ed)
            self.assertEqual([(2,20)],where(ed,'school-gerty'),ed)
            self.assertEqual([(2,20)],where(ed,'school-lily'),ed)
            # and none of them reaches the paragraph where the name is somebody else
            for cid,k in [('cochrane',(5,65)),('talbot',(10,43)),('halliday',(12,312)),
                          ('curran',(7,380)),('temple',(10,235)),('blake',(7,42)),
                          ('henry-blackwood-price',(17,587))]:
                self.assertNotIn(cid,ids(ed,*k),(ed,cid,k))

    def test_deasy_calls_stephen_mr_dedalus(self):
        # The same two words are his father from episode 6, so they are keyed.
        for ed in ['original-en','modern-en']:
            for k in [(2,137),(2,154),(2,195)]:
                self.assertIn('stephen',ids(ed,*k),(ed,k))
            self.assertIn('Mr Dedalus',said(ed,'stephen'),ed)

    def test_the_schoolroom_and_the_study(self):
        for ed in ['original-en','modern-en']:
            self.assertTrue([k for k in where(ed,'deasy') if k[0]==2],ed)
            self.assertEqual([(2,13),(2,23),(2,29)],where(ed,'comyn'),ed)
            self.assertIn((2,66),where(ed,'sargent'),ed)
            self.assertIn('Cyril Sargent',said(ed,'sargent'),ed)
            self.assertEqual([(2,73)],where(ed,'sargent-mother'),ed)
            self.assertEqual(['someone'],said(ed,'sargent-mother'),ed)
            self.assertEqual([(2,136)],where(ed,'sir-john-blackwood'),ed)

    def test_deasys_three_women_and_his_horses(self):
        for ed in ['original-en','modern-en']:
            for cid in ['helen','menelaus','macmurrough-wife','orourke','parnell']:
                self.assertIn((2,174),where(ed,cid),(ed,cid))
            self.assertEqual([(2,141)],where(ed,'lord-hastings'),ed)
        self.assertIn('lord Hastings',said('original-en','lord-hastings'))
        self.assertIn('Lord Hastings',said('modern-en','lord-hastings'))

    def test_the_curly_and_straight_apostrophes(self):
        # The older edition sets O\u2019Connell and O\u2019Rourke with a curly
        # apostrophe and the modern one with a straight apostrophe. A pattern
        # that spells only one of them binds in one edition alone, which is the
        # commonest way to lose half a book's mentions in this library.
        for ed in ['original-en','modern-en']:
            self.assertIn((2,129),where(ed,'oconnell'),ed)
            self.assertEqual([(2,174)],where(ed,'orourke'),ed)
        self.assertIn('O\u2019Connell',said('original-en','oconnell'))
        self.assertIn("O'Connell",said('modern-en','oconnell'))

    def test_the_deliberate_gaps_of_episode_two(self):
        # 2:78's "Love of the mother" is the abstraction, not a woman; 2:145's
        # "mother's darling" is a phrase for a player on the field; the fox of
        # 2:60 buries his grandmother in a riddle and she is no one.
        for ed in ['original-en','modern-en']:
            for k in [(2,78),(2,145),(2,60)]:
                self.assertEqual([],[c for c in ids(ed,*k) if 'mother' in c],(ed,k))


if __name__=='__main__':unittest.main()

class Proteus(unittest.TestCase):
    """Episode 3. Stephen alone on Sandymount strand: no dialogue but a
    remembered visit, and the densest allusion in the book so far."""

    def test_the_goulding_household(self):
        # The visit to Strasburg terrace that Stephen imagines and does not pay.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(3,11),(3,17),(3,21),(3,24),(3,25),(3,26),(6,24)],
                             where(ed,'richie-goulding'),ed)
            self.assertEqual([(3,11),(3,21),(3,41),(6,22)],where(ed,'aunt-sara'),ed)
            self.assertEqual([(3,11),(3,15),(3,19),(3,28)],where(ed,'walter-goulding'),ed)
            self.assertEqual([(3,22),(6,22)],where(ed,'crissie-goulding'),ed)
            # 4:30 names him in full for the first time, still out of sight:
            # Simon Dedalus takes Larry O'Rourke off to a tee with his eyes
            # screwed up. He is present in person from episode 6.
            self.assertEqual([(3,11),(4,30)],
                             [k for k in where(ed,'simon-dedalus') if k[0]<6],ed)

    def test_richie_is_not_shakespeares_brother(self):
        # 9:375 and 9:391 are "nuncle Richie" in the argument about the two
        # noble kinsmen: Richard Shakespeare, not Stephen's uncle.
        for ed in ['original-en','modern-en']:
            for k in [(9,375),(9,391)]:
                self.assertNotIn('richie-goulding',ids(ed,*k),(ed,k))
            # 6:24 is him, read and keyed; 11:334 is not, and stays unbound
            # until episode 11 is read.
            self.assertIn('richie-goulding',ids(ed,6,24),ed)
            self.assertNotIn('richie-goulding',ids(ed,11,334),ed)

    def test_sara_walter_and_pat_are_keyed_against_their_namesakes(self):
        for ed in ['original-en','modern-en']:
            self.assertNotIn('aunt-sara',ids(ed,12,172))      # Sara Curran
            self.assertNotIn('walter-goulding',ids(ed,9,256)) # Sir Walter Raleigh
            self.assertNotIn('walter-goulding',ids(ed,8,140)) # Walter Sexton
            self.assertEqual([(3,44),(3,57),(3,59),(15,1283)],where(ed,'patrice'),ed)
            self.assertNotIn('patrice',ids(ed,11,200))        # bald Pat the waiter

    def test_the_two_tandys_are_two_men(self):
        # Master Shapland Tandy drafts uncle Richie's bills of costs; Napper
        # Tandy takes Kevin Egan by the hand in the song. Both are in this one
        # episode and nowhere else, forty paragraphs apart.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(3,19)],where(ed,'shapland-tandy'),ed)
            self.assertEqual([(3,59)],where(ed,'napper-tandy'),ed)

    def test_the_high_king_is_not_buck_mulligan(self):
        # "when Malachi wore the collar of gold" is the ardri, and the alias for
        # Malachi Mulligan had to be suppressed at 3:67 for the key to carry it.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(3,67),(12,50)],where(ed,'king-malachi'),ed)
            self.assertNotIn('mulligan',ids(ed,3,67),ed)

    def test_the_unnamed_figures_of_proteus(self):
        # Nine more people the text gives only a description, and one it gives
        # only an office.
        for ed in ['original-en','modern-en']:
            for cid,k in [('the-froeken',(3,57)),
                          ('egan-wife',(3,59)),('bookshop-woman',(3,83)),
                          ('two-maries',(3,66)),('berkeley',(3,82)),
                          ('goulding-cornet-brother',(3,11)),
                          ('bruce-brother',(3,68))]:
                self.assertEqual([k],where(ed,cid),(ed,cid))
            self.assertEqual([(3,69),(3,73),(3,75)],where(ed,'cocklepicker-man'),ed)
            # The head centre is the exception: episode 3 names him by his
            # office only, and Bloom gives him his name in episode 4.
            self.assertEqual([(3,58),(4,159),(8,133),(12,234),(15,433)],
                             where(ed,'head-centre'),ed)
            self.assertEqual([(3,69),(3,75)],where(ed,'cocklepicker-woman'),ed)

    def test_the_modern_edition_adds_names_of_its_own(self):
        # Episode 1 showed the modern edition substituting and deleting names.
        # Episode 3 shows it doing the opposite: four people are named in the
        # modern edition and named nowhere in Joyce's paragraph.
        for cid,k in [('aristotle',(3,0)),('brian-boru',(3,57)),
                      ('deasy',(3,10)),('queen-victoria',(3,94))]:
            self.assertIn(cid,ids('modern-en',*k),(cid,k))
            self.assertNotIn(cid,ids('original-en',*k),(cid,k))
        # and nothing in this episode goes the other way
        O={(m['characterId'],m['paragraphIndex']) for m in mentions('original-en')
           if m['chapterNumber']==3}
        M={(m['characterId'],m['paragraphIndex']) for m in mentions('modern-en')
           if m['chapterNumber']==3}
        self.assertEqual(set(),O-M)

    def test_the_editions_describe_the_same_people_in_different_words(self):
        # Where one edition has a phrase and the other has another phrase, both
        # readers get the card. These were found by reading the paragraphs side
        # by side, not by any count.
        for ed in ['original-en','modern-en']:
            self.assertIn((3,63),where(ed,'haines'),ed)   # panthersahib / Englishman
            self.assertIn((3,63),where(ed,'mulligan'),ed) # his pointer / his gun dog
            self.assertIn((3,56),where(ed,'belluomo'),ed) # the name / a handsome man
            self.assertIn((3,65),where(ed,'sir-lout'),ed) # Sir Lout / some giant
            self.assertIn((3,58),where(ed,'head-centre'),ed)
        self.assertIn('Belluomo',said('original-en','belluomo'))
        self.assertIn('A handsome man',said('modern-en','belluomo'))

    def test_the_italic_underscores_hide_the_demiurge(self):
        # Joyce sets Los Demiurgos in Gutenberg italic underscores, and the
        # alias binder guards with \\w, which an underscore satisfies: the name
        # could not be bound by alias at all. It is a phrase for that reason.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(3,1)],where(ed,'demiurge'),ed)
        self.assertIn('Los Demiurgos',said('original-en','demiurge'))
        self.assertIn('God the Creator',said('modern-en','demiurge'))

    def test_columbanus_reaches_back_into_episode_two(self):
        # Found by listing every occurrence of the name before choosing between
        # an alias and a key: the fiery Columbanus is at 2:73 as well, in a
        # chapter that had already been signed off without him.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(2,73),(3,51),(12,513)],where(ed,'columbanus'),ed)

    def test_the_deliberate_gaps_of_episode_three(self):
        for ed in ['original-en','modern-en']:
            # "by the law Harry" at 3:27 is an oath, like "By Jove" at 1:156.
            self.assertEqual([],ids(ed,3,27),ed)
            # Madeline the mare of the song is a horse, and is not the Madeleine
            # of Rodot's: the two are spelt differently and forty paragraphs
            # apart.
            self.assertEqual([],ids(ed,3,2),ed)
            self.assertEqual([(3,56)],where(ed,'madeleine'),ed)
            # Tatters the dog is an animal and carries no card.
            self.assertEqual([],ids(ed,3,72),ed)
            # delta of Cassiopeia at 3:82 is a star, not the queen.
            self.assertEqual(['berkeley'],ids(ed,3,82),ed)

class Calypso(unittest.TestCase):
    """Episode 4. Bloom arrives, and with him the surname that is five people."""

    def test_bloom_is_five_people_and_a_mountain_range(self):
        # The surname is Leopold, Marion, Milly, Rudolph and Rudy — and, at
        # 4:38, Slieve Bloom, the mountains in Offaly, in the middle of Bloom's
        # own thoughts. The `Bloom` table never defaults and 4:38 is not a key
        # in it; every other mention is keyed on a longer phrase.
        from build_ulysses import SPLIT
        table,default=SPLIT['Bloom']
        self.assertIsNone(default)
        self.assertNotIn((4,38),table)
        for ed in ['original-en','modern-en']:
            self.assertEqual([],ids(ed,4,38),ed)
            self.assertEqual([(4,0),(4,5),(4,7),(4,47),(4,64),(4,80),(4,134),(4,164)],
                             [k for k in where(ed,'leopold') if k[0]==4],ed)
            self.assertEqual([(4,27),(4,57),(4,63),(4,87),(4,94),(4,135),(4,146)],
                             [k for k in where(ed,'molly') if k[0]==4],ed)
            self.assertIn('Mr Leopold Bloom',said(ed,'leopold'),ed)
            self.assertIn('Mrs Marion Bloom',said(ed,'molly'),ed)
            self.assertIn('Milly Bloom',said(ed,'milly'),ed)

    def test_the_names_the_family_use_for_each_other(self):
        # Poldy is hers for him, Papli is the daughter's, mummy is the
        # daughter's for her, silly Milly is his for the daughter.
        for ed in ['original-en','modern-en']:
            self.assertIn('Poldy',said(ed,'leopold'),ed)
            self.assertIn((4,134),where(ed,'leopold'),ed)
            self.assertIn((4,135),where(ed,'molly'),ed)
        self.assertIn('Papli',said('original-en','leopold'))
        self.assertIn('Daddy',said('modern-en','leopold'))

    def test_the_head_centre_gets_his_name(self):
        # Episode 3 names him by his office; Bloom names him here. 9:126 is the
        # other James Stephens, the writer doing some clever sketches, and gets
        # no card.
        for ed in ['original-en','modern-en']:
            self.assertIn((4,159),where(ed,'head-centre'),ed)
            self.assertNotIn('head-centre',ids(ed,9,126),ed)
            self.assertIn('James Stephens',said(ed,'head-centre'),ed)

    def test_bannon_joins_up_across_three_episodes(self):
        # He sends a card from Westmeath in episode 1 about a sweet young thing,
        # a photo girl; Milly writes home from Mullingar in episode 4 about a
        # young student named Bannon. The occurrence list is what connects them.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(1,329),(4,135)],where(ed,'bannon'),ed)

    def test_the_modern_edition_deletes_two_dubliners(self):
        # 4:37: "they blossom out as Adam Findlaters or Dan Tallons" becomes
        # "they blossom into successful businessmen". Findlater is named nowhere
        # else, so he is an omittedEntity for that edition; Tallon survives at
        # 17:109 as the new lord mayor, Daniel Tallon.
        self.assertEqual([(4,37)],where('original-en','adam-findlater'))
        self.assertEqual([],where('modern-en','adam-findlater'))
        self.assertEqual([(4,37),(17,109)],where('original-en','dan-tallon'))
        self.assertEqual([(17,109)],where('modern-en','dan-tallon'))
        O={(m['characterId'],m['paragraphIndex']) for m in mentions('original-en')
           if m['chapterNumber']==4}
        M={(m['characterId'],m['paragraphIndex']) for m in mentions('modern-en')
           if m['chapterNumber']==4}
        self.assertEqual({('adam-findlater',37),('dan-tallon',37)},O-M)
        self.assertEqual(set(),M-O)

    def test_the_italic_trap_again(self):
        # Matcham's Masterstroke stands in Gutenberg italics at 4:162 and 4:163,
        # so the alias binder could not reach it, exactly as with Los Demiurgos
        # at 3:1. Keyed, and bound in both editions.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(4,162),(4,163)],where(ed,'matcham'),ed)

    def test_no_alias_in_this_package_is_hidden_by_italics(self):
        # The standing check that found the two above. An alias whose only
        # occurrence sits inside _underscores_ is unbindable and silent: the
        # shared binder guards with \w, which an underscore satisfies. The two
        # cases still open are both in unread episodes: Stephen at 15:1133,
        # inside a stage direction, and Patrice at 16:212, which is not Patrice
        # Egan at all but the faubourg Saint Patrice.
        import re,json as _j
        from build_pilot import normalized
        P={}
        for ed in ['original-en','modern-en']:
            with open(f'/home/user/tinct/app/public/data/editions/ulysses-{ed}.json') as f:
                d=_j.load(f)
            P[ed]={(c['number'],i):normalized(p) for c in d['chapters']
                   if c['number']<=4 for i,p in enumerate(c['paragraphs'])}
        missed=[]
        for e in CARDS.values():
            for a in e['aliases']:
                strict=re.compile(r'(?<!\w)'+re.escape(a)+r'(?!\w)')
                loose=re.compile(r'(?<![A-Za-z])'+re.escape(a)+r'(?![A-Za-z])')
                for ed,ps in P.items():
                    for k,t in ps.items():
                        if len(loose.findall(t))<=len(strict.findall(t)):continue
                        # the alias cannot reach it; a key must, or the name is lost
                        if a not in [m['text'] for m in mentions(ed)
                                     if (m['chapterNumber'],m['paragraphIndex'])==k]:
                            missed.append((e['id'],a,ed,k))
        self.assertEqual([],missed)

    def test_the_deliberate_gaps_of_episode_four(self):
        for ed in ['original-en','modern-en']:
            # The cat has more dialogue than most of the cast and is not cast.
            self.assertEqual([],ids(ed,4,4),ed)
            self.assertEqual([],ids(ed,4,9),ed)
            # Saint Joseph's National school at 4:38 is not Joseph the Joiner.
            self.assertNotIn('joseph-the-joiner',ids(ed,4,38),ed)
            # "O'Brien." at 4:159 is a bare surname the text never settles, and
            # "Did Roberts pay you yet?" at 4:164 is another. Both unbound.
            self.assertEqual(['head-centre'],ids(ed,4,159),ed)
            self.assertEqual(['gretta-conroy','leopold'],ids(ed,4,164),ed)
            # The shops keep their owners' names and are not people: Buckley's,
            # Denny's, Boland's, Plasto's, Drago's, Andrews, Cassidy's,
            # M'Auley's, Thornton's.
            self.assertEqual([],ids(ed,4,25),ed)
            self.assertEqual(['larry-orourke'],ids(ed,4,29),ed)

class LotusEaters(unittest.TestCase):
    """Episode 5. Bloom under his other name, and the church at Westland row."""

    def test_bloom_has_a_second_name_and_it_is_a_second_card(self):
        # Henry Flower is the name he writes under and collects letters under,
        # and it gets a card of its own rather than being folded into his.
        for ed in ['original-en','modern-en']:
            # The alias is safe book-wide: every Henry Flower in the book is
            # this one, including the three typewritten letters listed at
            # 17:497 and the apparition in Circe.
            self.assertEqual([(5,8),(5,76),(5,77),(5,91),(6,76),(11,203),(11,617),
                              (15,227),(15,665),(15,707),(17,497),(17,505),(17,629)],
                             where(ed,'henry-flower'),ed)
            self.assertIn('Henry Flower',said(ed,'henry-flower'),ed)
            self.assertIn('Henry',said(ed,'henry-flower'),ed)
            # and the two men who say "Hello, Bloom" to his face are bound to him
            self.assertIn((5,12),where(ed,'leopold'),ed)
            self.assertIn((5,131),where(ed,'leopold'),ed)

    def test_leopold_is_two_men_twelve_lines_apart(self):
        # 5:67 is Bloom's father calling him Leopold; 5:121 is the duke of
        # Albany, one of the old queen's sons, who had only one skin — and whose
        # name is the only reason Bloom remembers him.
        for ed in ['original-en','modern-en']:
            self.assertIn((5,67),where(ed,'leopold'),ed)
            self.assertEqual([(5,121)],where(ed,'duke-of-albany'),ed)
            self.assertNotIn('leopold',[c for c in ids(ed,5,121)],ed)
            # and the old queen in the same sentence is Victoria
            self.assertIn((5,121),where(ed,'queen-victoria'),ed)

    def test_the_three_careys_are_one_man_and_the_claver_between_them_is_not(self):
        # Bloom cannot fix the informer's first name: "Carey was his name. This
        # very church. Peter Carey, yes. No, Peter Claver I am thinking of.
        # Denis Carey." Three spans for one man, and a saint in the middle.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(5,100)],where(ed,'carey'),ed)
            self.assertEqual(3,len([m for m in mentions(ed)
                                    if m['characterId']=='carey']),ed)
            self.assertIn((5,100),where(ed,'peter-claver'),ed)

    def test_martha_is_the_typist_and_then_the_sister_of_bethany(self):
        # 5:78 and 5:80 are his correspondent; at 5:87 the name slides into the
        # gospel — "Martha, Mary. I saw that picture somewhere" — and the two
        # sisters get their own card.
        for ed in ['original-en','modern-en']:
            self.assertIn((5,78),where(ed,'martha-clifford'),ed)
            self.assertIn((6,330),where(ed,'martha-clifford'),ed)
            self.assertEqual([(5,87)],where(ed,'martha-and-mary'),ed)
            self.assertEqual(2,len([m for m in mentions(ed)
                                    if m['characterId']=='martha-and-mary']),ed)

    def test_michael_reaches_back_into_episode_one(self):
        # 1:318 is Michael's host, the embattled angels of the church, in a
        # chapter that had already been signed off without him. Found the same
        # way as Columbanus at 2:73: by listing every occurrence of the name.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(1,318),(5,109)],where(ed,'saint-michael'),ed)

    def test_the_editions_disagree_about_one_name_in_this_episode(self):
        # The modern edition supplies M'Coy's name at 5:27 where Joyce writes
        # only "Talking of one thing or another", writes My wife for My missus,
        # Mary for Mairy, and the Prophet Muhammad for Mohammed.
        self.assertNotIn('mccoy',ids('original-en',5,27))
        self.assertIn('mccoy',ids('modern-en',5,27))
        self.assertIn('Mohammed',said('original-en','mohammed'))
        self.assertIn('Muhammad',said('modern-en','mohammed'))
        for ed in ['original-en','modern-en']:
            self.assertEqual([(5,45),(5,63)],where(ed,'mccoy-wife'),ed)
            self.assertEqual([(5,84)],where(ed,'mairy'),ed)
        O={(m['characterId'],m['paragraphIndex']) for m in mentions('original-en')
           if m['chapterNumber']==5}
        M={(m['characterId'],m['paragraphIndex']) for m in mentions('modern-en')
           if m['chapterNumber']==5}
        self.assertEqual(set(),O-M)
        self.assertEqual({('mccoy',27)},M-O)

    def test_the_deliberate_gaps_of_episode_five(self):
        for ed in ['original-en','modern-en']:
            # O'Connell street at 5:9 is a street, and the O'Connell key does
            # not reach it.
            self.assertNotIn('oconnell',ids(ed,5,9),ed)
            # Cantrell and Cochrane's ginger ale at 5:65 and 5:101 is a firm,
            # and is not the schoolboy Cochrane of episode 2.
            self.assertNotIn('cochrane',ids(ed,5,65),ed)
            self.assertNotIn('cochrane',ids(ed,5,101),ed)
            # "our holy mother the church" at 5:107 is not anybody's mother.
            self.assertNotIn('may-dedalus',ids(ed,5,107),ed)
            # Leah and Rachel at 5:65 are the names of plays, not women; the
            # actresses beside them are cast.
            self.assertIn('mrs-bandmann-palmer',ids(ed,5,65),ed)
            self.assertIn('kate-bateman',ids(ed,5,65),ed)
            self.assertEqual([],[c for c in ids(ed,5,65) if 'rachel' in c or 'leah'==c],ed)

class Hades(unittest.TestCase):
    """Episode 6. The funeral: the largest named cast in the book so far, and
    the episode where the surname Dedalus changes hands."""

    def test_the_surname_dedalus_changes_hands_here(self):
        # Episodes 1 and 2 key Dedalus and Mr Dedalus to Stephen. From episode 6
        # every one of them is his father, who sits in the carriage all morning.
        from build_ulysses import SPLIT
        for name in ['Dedalus','Mr Dedalus']:
            table,default=SPLIT[name]
            self.assertIsNone(default,name)
            for (ch,pi),who in table.items():
                self.assertEqual('stephen' if ch<3 else 'simon-dedalus',who,(name,ch,pi))
        for ed in ['original-en','modern-en']:
            self.assertIn((6,3),where(ed,'simon-dedalus'),ed)
            self.assertNotIn('stephen',ids(ed,6,3),ed)

    def test_stephen_is_in_this_episode_and_is_never_named_in_it(self):
        # He is seen once from the carriage window and named by nobody: a lithe
        # young man clad in mourning, and his father's son and heir.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(6,14),(6,17)],[k for k in where(ed,'stephen') if k[0]==6],ed)
        self.assertIn('a lithe young man',said('original-en','stephen'))
        self.assertIn('a slim young man',said('modern-en','stephen'))

    def test_two_oconnells_and_one_paragraph_that_holds_both(self):
        # Daniel O'Connell, whose circle and monument the funeral passes, and
        # John O'Connell, the caretaker of the cemetery. 6:330 names both, four
        # lines apart, and is keyed by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertIn('john-oconnell',ids(ed,6,330),ed)
            self.assertIn('oconnell',ids(ed,6,330),ed)
            self.assertIn((6,276),where(ed,'oconnell'),ed)
            self.assertNotIn('john-oconnell',ids(ed,6,276),ed)
            self.assertIn((6,315),where(ed,'john-oconnell'),ed)
            self.assertNotIn('oconnell',ids(ed,6,315),ed)

    def test_the_thirteenth_mourner_gets_his_name_from_a_mistake(self):
        # Bloom says the word for the coat; Hynes writes it down as a name, and
        # M'Intosh is what the book calls him from then on.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(6,359),(6,360)],where(ed,'macintosh'),ed)
        self.assertIn('Macintosh',said('original-en','macintosh'))
        self.assertIn('Mackintosh',said('modern-en','macintosh'))

    def test_the_namesakes_of_the_funeral(self):
        for ed in ['original-en','modern-en']:
            # Molly's father and Molly's namesake the crown solicitor, in two
            # paragraphs two hundred apart, and Molly herself as Marion Tweedy.
            self.assertEqual([(6,103)],where(ed,'waterford-tweedy'),ed)
            self.assertIn((6,305),where(ed,'molly'),ed)
            self.assertNotIn('major-tweedy',ids(ed,6,103),ed)
            # Paddy is Dignam five times and Paddy Leonard once.
            self.assertNotIn('paddy-dignam',ids(ed,6,65),ed)
            self.assertIn('paddy-leonard',ids(ed,6,65),ed)
            # Grey sprouting beard at 6:330 is a colour, not sir John Gray.
            self.assertEqual([(6,113)],where(ed,'john-gray'),ed)
            # "By the holy Paul!" at 6:253 is an oath.
            self.assertNotIn('saint-paul',ids(ed,6,253),ed)
            # The Lily of Killarney at 6:80 is an opera.
            self.assertEqual([],[c for c in ids(ed,6,80) if 'lily' in c],ed)
            # Brian Boroimhe house at 6:205 is a pub.
            self.assertEqual([],ids(ed,6,205),ed)

    def test_reuben_j_and_the_son_and_the_boatman(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(6,108),(6,118),(6,125),(6,129),(6,133)],
                             where(ed,'reuben-j'),ed)
            self.assertEqual([(6,118),(6,127),(6,129),(6,133)],where(ed,'reuben-son'),ed)
            self.assertEqual([(6,131),(6,133)],where(ed,'liffey-boatman'),ed)
            # Barabbas at 6:125 is Mr Dedalus's name for Reuben J, not a card of
            # its own: Christ is not cast anywhere in this package.
            self.assertIn('Barabbas',said(ed,'reuben-j'),ed)

    def test_blooms_father_and_mother_are_here_and_neither_is_named(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(5,65),(5,68),(6,171),(6,236),(6,345),(6,386)],
                             where(ed,'rudolph-bloom'),ed)
            self.assertEqual([(6,348)],where(ed,'ellen-bloom'),ed)

    def test_the_editions_disagree_about_six_names_in_this_episode(self):
        # The modern edition supplies Daniel O'Connell three times where Joyce
        # writes the Liberator, old Dan O' and nothing at all; it adds Madame
        # Bloom, Shakespeare and Martha; and it drops the sentence about Wren's
        # auction. Nothing else in 402 paragraphs differs.
        O={(m['characterId'],m['paragraphIndex']) for m in mentions('original-en')
           if m['chapterNumber']==6}
        M={(m['characterId'],m['paragraphIndex']) for m in mentions('modern-en')
           if m['chapterNumber']==6}
        self.assertEqual({('wren',204)},O-M)
        self.assertEqual({('leopold',104),('martha-clifford',386),('oconnell',106),
                          ('oconnell',277),('oconnell',278),('shakespeare',333)},M-O)

    def test_the_italic_trap_caught_a_third_name(self):
        # "_That's not Mulcahy_, says he" at 6:325 is set in Gutenberg italics,
        # so the alias reaches 6:320 and 6:323 and not this one. Keyed.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(6,320),(6,323),(6,325)],where(ed,'terence-mulcahy'),ed)
