"""Guards for the Ulysses character package.

Episodes 1 to 10 of 18 are authored. These tests pin the identifications that took a
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
    def test_only_the_first_ten_episodes_are_authored(self):
        self.assertIn('episodes 1-10 of 18',REPORT['scope'])
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
        self.assertTrue(all(ch in (1,2,6,7,8,9,10) for ch,_ in table))
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
        # dana-goddess is a fourth: mother Dana, who weaves and unweaves, becomes
        # Mother Nature in the modern edition and is lost.
        # john-aubrey is a fifth: the modern edition drops his name at 9:294 and
        # writes "an ostler and call-boy" where Joyce writes "Aubrey's".
        self.assertEqual(['mercury','chrysostomos','adam-findlater','john-aubrey',
                          'dana-goddess'],
                         REPORT['editions']['modern-en']['omittedEntities'])
        # brian-boru is the inverse case: a man the modern edition puts in where
        # Joyce named his people, so he is unreachable in the older edition.
        # lots-wife is the same case in episode 8: the modern edition writes
        # Lot's wife turned to a pillar of salt where Joyce writes only
        # Pillar of salt.
        self.assertEqual(['brian-boru','lots-wife'],
                         REPORT['editions']['original-en']['omittedEntities'])
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
            self.assertEqual([(1,232),(1,269),(1,275),(2,74),(3,79),(5,65),(6,333),
                              (7,154),(8,17),(9,18),(9,19),(9,28),(9,67),
                              (9,68),(9,69),(9,154),(9,159),(9,207),(9,333),
                              (9,391),(9,427)],
                             [k for k in where(ed,'hamlet') if k!=(9,51)],ed)
            # 9:51 is the prince in the modern edition only: Joyce writes
            # "Khaki Hamlets don't hesitate to shoot", which the plural hides.
            self.assertIn((9,51),where('modern-en','hamlet'))
            self.assertNotIn((9,51),where('original-en','hamlet'))
            # Episode 9 is the Shakespeare episode and binds him in twenty-one
            # paragraphs; outside it the name is keyed one paragraph at a time.
            self.assertEqual([(1,275),(2,74),(2,113),(6,168),(8,16)],
                             [k for k in where(ed,'shakespeare')
                              if k[0]<9 and (k[0]!=6 or k[1]!=333)],ed)

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
            self.assertEqual([(2,123),(3,57),(7,407),(8,111),(8,143),(8,144),(8,145),
                              (9,19),(9,20),(9,25),(9,40),(9,70),(9,112),(9,121),
                              (9,129),(9,144),(9,171),(9,314)],
                             where(ed,'russell'),ed)
            self.assertEqual([(2,6),(9,32)],where(ed,'blake'),ed)
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
            self.assertEqual([(2,174),(7,276)],where(ed,'orourke'),ed)
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
            self.assertEqual([(3,11),(3,17),(3,21),(3,24),(3,25),(3,26),(6,24),(8,110),
                          (10,211),(10,542)],
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
                          ('bruce-brother',(3,68))]:
                self.assertEqual([k],where(ed,cid),(ed,cid))
            self.assertEqual([(3,69),(3,73),(3,75)],where(ed,'cocklepicker-man'),ed)
            # Uncle John the cornetplayer is named twice: once here and once in
            # episode 10, where his brother-in-law tells Dilly to stop imitating
            # his head upon shoulder.
            self.assertEqual([(3,11),(10,302)],where(ed,'goulding-cornet-brother'),ed)
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
                             sorted([k for k in where(ed,'leopold') if k[0]==4]),ed)
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
            self.assertEqual([(4,162),(4,163),(8,87)],where(ed,'matcham'),ed)

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
            self.assertEqual([(5,100),(8,127)],where(ed,'carey'),ed)
            # Three spans in episode 5, and one more at 8:127, where the same
            # hesitation comes back: Peter or Denis or James Carey.
            self.assertEqual(4,len([m for m in mentions(ed)
                                    if m['characterId']=='carey']),ed)
            self.assertIn((5,100),where(ed,'peter-claver'),ed)

    def test_martha_is_the_typist_and_then_the_sister_of_bethany(self):
        # 5:78 and 5:80 are his correspondent; at 5:87 the name slides into the
        # gospel — "Martha, Mary. I saw that picture somewhere" — and the two
        # sisters get their own card.
        for ed in ['original-en','modern-en']:
            self.assertIn((5,78),where(ed,'martha-clifford'),ed)
            self.assertIn((6,330),where(ed,'martha-clifford'),ed)
            self.assertEqual([(5,87),(7,24)],where(ed,'martha-and-mary'),ed)
            # 5:87 names them once each; 7:24 names them again, in the other
            # order, over the same picture.
            self.assertEqual(4,len([m for m in mentions(ed)
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
                # 7:258 and 7:497 are the son, who comes in after his father goes
                # out; episode 9 is the son again, alone in the library, where the
                # quaker librarian and Russell both call him Mr Dedalus.
                if (ch,pi) in [(7,258),(7,497),(10,504)] or ch==9:
                    self.assertEqual('stephen',who,(name,ch,pi))
                else:
                    self.assertEqual('stephen' if ch<3 else 'simon-dedalus',who,
                                     (name,ch,pi))
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
            self.assertEqual([(6,359),(6,360),(10,545)],where(ed,'macintosh'),ed)
            # 10:545 is the man himself again, crossing the viceroy's path in
            # Lower Mount street eating dry bread, passed swiftly and unscathed.
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
            self.assertEqual([(6,113),(7,535)],where(ed,'john-gray'),ed)
            # "By the holy Paul!" at 6:253 is an oath.
            self.assertNotIn('saint-paul',ids(ed,6,253),ed)
            # The Lily of Killarney at 6:80 is an opera.
            self.assertEqual([],[c for c in ids(ed,6,80) if 'lily' in c],ed)
            # Brian Boroimhe house at 6:205 is a pub.
            self.assertEqual([],ids(ed,6,205),ed)

    def test_reuben_j_and_the_son_and_the_boatman(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(6,108),(6,118),(6,125),(6,129),(6,133),(8,364),
                              (10,412),(10,542)],
                             [k for k in where(ed,'reuben-j') if k!=(10,444)],ed)
            self.assertEqual([(6,118),(6,127),(6,129),(6,133),(8,12)],
                             where(ed,'reuben-son'),ed)
            self.assertEqual([(6,131),(6,133)],where(ed,'liffey-boatman'),ed)
            # Barabbas at 6:125 is Mr Dedalus's name for Reuben J, not a card of
            # its own: Christ is not cast anywhere in this package.
            self.assertIn('Barabbas',said(ed,'reuben-j'),ed)
        # 10:444 is Barabbas a second time, in the older edition only: the modern
        # edition writes "you can tell that crook from me".
        self.assertIn((10,444),where('original-en','reuben-j'))
        self.assertNotIn((10,444),where('modern-en','reuben-j'))

    def test_blooms_father_and_mother_are_here_and_neither_is_named(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(5,65),(5,68),(6,171),(6,236),(6,345),(6,386),(7,99),
                          (8,37),(8,336)],
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

class Aeolus(unittest.TestCase):
    """Episode 7. The newspaper office: Stephen and Bloom in the same room for
    the first time, and never in it together."""

    def test_the_two_dedaluses_in_one_episode(self):
        # 7:21 is Simon, quoted by Bloom on Brayden's neck; 7:109 to 7:168 is
        # Simon in the room; 7:258 and 7:497 are his son, who comes in after he
        # has gone out.
        for ed in ['original-en','modern-en']:
            seven=[k for k in where(ed,'simon-dedalus') if k[0]==7]
            self.assertIn((7,21),seven,ed)
            self.assertIn((7,109),seven,ed)
            self.assertNotIn((7,258),seven,ed)
            self.assertIn((7,258),where(ed,'stephen'),ed)
            self.assertIn((7,497),where(ed,'stephen'),ed)

    def test_the_bar_and_the_bench_are_five_separate_men(self):
        # Bushe is three people in two paragraphs: the editor says "Bushe? Well,
        # yes: Bushe, yes" of Seymour, then corrects himself out of Kendal
        # Bushe, an earlier man of the same family.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(7,382)],where(ed,'kendal-bushe'),ed)
            self.assertIn((7,382),where(ed,'seymour-bushe'),ed)
            self.assertIn((7,385),where(ed,'seymour-bushe'),ed)
            # Fitzgibbon the lord justice, not Fitzgibbon street at 10:13
            self.assertEqual([(7,409),(7,411),(7,420)],where(ed,'fitzgibbon'),ed)
            self.assertNotIn('fitzgibbon',ids(ed,10,13),ed)
            # Flood the volunteer, not the year of the Flood at 5:112
            self.assertEqual([(7,378),(7,380)],where(ed,'flood'),ed)
            self.assertNotIn('flood',ids(ed,5,112),ed)

    def test_two_penelopes_one_line_apart(self):
        # "Poor Penelope. Penelope Rich." — Homer's wife at the loom, and then
        # Sidney's Stella, who is not her. Keyed by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(7,519),(7,520),(9,255),(9,256)],
                             where(ed,'penelope'),ed)
            # the alias is safe book-wide: 9:256 is the same woman, in the
            # Shakespeare argument.
            self.assertEqual([(7,520),(9,256)],where(ed,'penelope-rich'),ed)

    def test_the_greys_and_the_hoopers_and_the_kavanaghs(self):
        for ed in ['original-en','modern-en']:
            # Gregor Grey who made the design, and sir John Gray on his island.
            self.assertEqual([(7,358)],where(ed,'gregor-grey'),ed)
            self.assertEqual([(6,113),(7,535)],where(ed,'john-gray'),ed)
            # Paddy Hooper of the press, and alderman Hooper of the stuffed owl.
            self.assertEqual([(7,232),(7,358)],where(ed,'paddy-hooper'),ed)
            self.assertEqual([(6,376)],where(ed,'alderman-hooper'),ed)
            # The invincible the editor corrects Tim Kelly to, not Charley
            # Kavanagh at 8:141 nor Kavanagh's public house at 10:466.
            self.assertEqual([(7,330)],where(ed,'kavanagh'),ed)

    def test_the_modern_edition_supplies_six_names_here(self):
        # Nannetti twice where Joyce writes only the foreman and "Nannan";
        # Bloom at 7:67; Patrick Dignam at 7:99; Gallaher at 7:358; and Mario at
        # 7:27, where Joyce's compound "Jesusmario" is split into two words —
        # the same mechanism as pseudomalachi at 9:194.
        O={(m['characterId'],m['paragraphIndex']) for m in mentions('original-en')
           if m['chapterNumber']==7}
        M={(m['characterId'],m['paragraphIndex']) for m in mentions('modern-en')
           if m['chapterNumber']==7}
        self.assertEqual(set(),O-M)
        self.assertEqual({('ignatius-gallaher',358),('leopold',67),('mario',27),
                          ('nannetti',42),('nannetti',62),('paddy-dignam',99)},M-O)
        # and Long John gets his surname in the modern edition only
        self.assertIn('Long John',said('original-en','long-john-fanning'))
        self.assertIn('Long John Fanning',said('modern-en','long-john-fanning'))

    def test_the_deliberate_gaps_of_episode_seven(self):
        for ed in ['original-en','modern-en']:
            # "Madam, I'm Adam" at 7:357 is a palindrome, and Adam and Eve's at
            # 7:509 is a church.
            self.assertEqual([],[c for c in ids(ed,7,357) if c in ('adam','eve')],ed)
            self.assertEqual([],[c for c in ids(ed,7,509) if c in ('adam','eve')],ed)
            # "Pat and Bull story" at 7:42 is a pun, not a Pat.
            self.assertNotIn('patrice',ids(ed,7,42),ed)
            # "In Martha" at 7:27 is the opera; 7:24 is the sister of Bethany.
            self.assertNotIn('martha-clifford',ids(ed,7,27),ed)
            self.assertIn('martha-and-mary',ids(ed,7,24),ed)
            # Our Saviour at 7:22 and 7:26 carries no card, as everywhere here.
            self.assertEqual([],[c for c in ids(ed,7,22)
                                 if 'christ' in c or 'jesus' in c],ed)


class Lestrygonians(unittest.TestCase):
    """Episode 8. Bloom's lunch hour: the quays, Mrs Breen, the Burton, Davy
    Byrne's, and the blind stripling on Dawson street."""

    def test_the_throwaway_names_two_men_and_a_prophet(self):
        # The handbill's Elijah is the prophet the revivalist has attached to
        # himself; Dowie signs it; Torry and Alexander worked Dublin last year.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(8,5),(8,14),(10,115),(10,351),(10,522),(10,526)],
                             where(ed,'elijah'),ed)
            # Dowie's own name is safe as an alias: every occurrence in the
            # book is this man (14:64, 15:611 and 17:222 among them).
            self.assertIn((8,5),where(ed,'dowie'),ed)
            self.assertEqual([(8,7)],where(ed,'torry'),ed)
            self.assertEqual([(8,7)],where(ed,'alexander-evangelist'),ed)
            # The Alexander of 8:5 is Dowie's own middle name, and every other
            # Alexander in the book is Keyes, Dowie again or the archbishop.
            self.assertNotIn('alexander-evangelist',ids(ed,8,5),ed)

    def test_the_daughter_outside_the_auctionrooms_is_not_named(self):
        # 8:9 names her only by her father: Dedalus' daughter. The father takes
        # the surname, the daughter the word daughter, and "the mother" in the
        # same paragraph is May Dedalus, three months dead.
        for ed in ['original-en','modern-en']:
            # She is Dilly, and episode 10 gives her the name: twenty-one more
            # paragraphs, at the auctionrooms and at the bookcart.
            self.assertEqual([(8,9),(8,10)],
                             [k for k in where(ed,'dedalus-daughter') if k[0]==8],ed)
            self.assertIn((10,296),where(ed,'dedalus-daughter'),ed)
            self.assertIn('simon-dedalus',ids(ed,8,9),ed)
            self.assertIn('may-dedalus',ids(ed,8,9),ed)
            self.assertNotIn('stephen',ids(ed,8,9),ed)

    def test_mrs_breen_is_josie_powell_and_her_husband_is_denis(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((8,44),where(ed,'josie-breen'),ed)
            self.assertIn((8,83),where(ed,'josie-breen'),ed)
            self.assertIn('Josie Powell',said(ed,'josie-breen'),ed)
            self.assertIn((8,103),where(ed,'denis-breen'),ed)
            self.assertIn((8,107),where(ed,'denis-breen'),ed)
            # "Denis will be like that one of these days" is the husband, not
            # the Denis Carey of 8:127.
            self.assertNotIn('carey',ids(ed,8,103),ed)

    def test_bloom_asks_after_mrs_purefoy_under_the_wrong_name(self):
        # He says Mrs Beaufoy because Philip Beaufoy of the prize titbit is in
        # his head; she corrects him with Mina Purefoy in the next line.
        for ed in ['original-en','modern-en']:
            self.assertIn('Beaufoy',said(ed,'mina-purefoy'),ed)
            self.assertIn((8,85),where(ed,'mina-purefoy'),ed)
            self.assertIn((8,86),where(ed,'mina-purefoy'),ed)
            self.assertIn((8,87),where(ed,'philip-beaufoy'),ed)
            self.assertIn((8,87),where(ed,'matcham'),ed)
            self.assertNotIn('philip-beaufoy',ids(ed,8,85),ed)
            self.assertNotIn('mina-purefoy',ids(ed,8,87),ed)

    def test_the_two_parnells(self):
        # 8:140 and 8:198 are the brother, city marshal; 8:134 and 8:141 are
        # Charles Stewart, and the modern edition supplies his full name.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(8,140),(8,141),(8,198)],
                             [k for k in where(ed,'john-howard-parnell') if k[0]==8],ed)
            self.assertIn((8,134),where(ed,'parnell'),ed)
            self.assertIn((8,141),where(ed,'parnell'),ed)
        # The modern edition spells out Charles Stewart Parnell at 8:141 where
        # Joyce writes only "the brother" and "Image of him".
        self.assertIn('parnell',ids('modern-en',8,141))
        self.assertIn('john-howard-parnell',ids('original-en',8,141))

    def test_the_namesakes_of_episode_eight(self):
        # Each of these surnames belongs to somebody else elsewhere in the book,
        # so episode 8's man is keyed rather than aliased.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(8,141)],where(ed,'charley-kavanagh'),ed)   # 7:330 is the invincibles' carman
            self.assertEqual([(8,255)],where(ed,'coffey-butcher'),ed)     # 6:264 is Father Coffey
            self.assertEqual([(8,255)],where(ed,'micky-hanlon'),ed)       # 4:13 is Hanlon's milkman
            self.assertEqual([(8,148)],where(ed,'harris'),ed)             # 9:181 is Frank Harris
            self.assertEqual([(8,112)],where(ed,'stubbs'),ed)             # 12:274 is Stubbs's gazette
            self.assertEqual([(8,189),(10,437)],where(ed,'rock'),ed)      # pineapple rock, Three Rock
            self.assertEqual([(8,250)],where(ed,'rothschild'),ed)         # elsewhere the banking house
            self.assertEqual([(8,121)],where(ed,'tom-moore'),ed)          # 8:255 is Moore street
            self.assertEqual([(8,133)],where(ed,'garibaldi'),ed)          # 12:240 is Caruso-Garibaldi
            self.assertEqual([(8,255)],where(ed,'archduke-otto'),ed)      # 17:108 is Thomas Otto
            self.assertEqual([(8,255)],where(ed,'archduke-leopold'),ed)   # every other Leopold is Bloom

    def test_the_bare_surname_flynn_can_never_be_aliased(self):
        # The alias guard lets "Flynn" through inside "O'Flynn", so Nosey Flynn
        # is keyed paragraph by paragraph and Father O'Flynn of 8:198 gets his
        # own pattern.
        for ed in ['original-en','modern-en']:
            for k in [(8,205),(8,241),(8,260),(8,323)]:
                self.assertIn('nosey-flynn',ids(ed,*k),(ed,k))
            self.assertEqual([(8,198)],where(ed,'father-oflynn'),ed)
            self.assertNotIn('nosey-flynn',ids(ed,8,198),ed)

    def test_the_italic_trap_in_the_cannibal_song(self):
        # Both of MacTrigger's appearances sit inside Gutenberg italics in the
        # older edition, where the trailing underscore defeats the alias guard.
        # He is keyed, and the omittedEntities check is what found him.
        for ed in ['original-en','modern-en']:
            self.assertEqual([(8,208),(8,223)],where(ed,'mactrigger'),ed)

    def test_the_pub_is_the_man_but_not_always(self):
        # Davy Byrne serves in person; 8:361 is Doran's publichouse and carries
        # no card, where 8:159 is Bob Doran himself sloping into the Empire.
        for ed in ['original-en','modern-en']:
            self.assertIn((8,202),where(ed,'davy-byrne'),ed)
            self.assertIn('Mr Byrne',said(ed,'davy-byrne'),ed)
            self.assertIn((8,159),where(ed,'bob-doran'),ed)
            self.assertNotIn('bob-doran',ids(ed,8,361),ed)
            # and 11:465 is money spent at the pub, not the man
            self.assertNotIn('davy-byrne',ids(ed,11,465),ed)

    def test_the_figures_with_no_names(self):
        for ed in ['original-en','modern-en']:
            for cid,k in [('ymca-young-man',(8,1)),('sweetshop-girl',(8,0)),
                          ('applewoman',(8,21)),('barefoot-arab',(8,63)),
                          ('sandwichman-y',(8,35)),('tranquilla-nun',(8,35)),
                          ('burton-server',(8,189)),('davy-byrne-curate',(8,220)),
                          ('drowsing-loafer',(8,335)),('blind-stripling',(8,337)),
                          ('mary-slavey',(8,128)),('turnkey-daughter',(8,133)),
                          ('saint-leger-woman',(8,283)),('nolan-wife',(8,270)),
                          ('horsepoliceman',(8,122)),('power-father',(8,122)),
                          ('farmers-daughter',(8,148)),('lord-lieutenant',(8,365)),
                          ('portobello-soldier',(8,236)),('tom-wall-son',(8,118))]:
                self.assertIn(k,where(ed,cid),(ed,cid))

    def test_the_blind_stripling_is_followed_across_five_paragraphs(self):
        for ed in ['original-en','modern-en']:
            for k in [(8,337),(8,339),(8,343),(8,353)]:
                self.assertIn(k,where(ed,'blind-stripling'),(ed,k))
        # 8:360 is a fifth, in the modern edition only: There the blind man goes
        # into Frederick Street, where Joyce writes only There he goes.
        self.assertIn((8,360),where('modern-en','blind-stripling'))
        self.assertNotIn((8,360),where('original-en','blind-stripling'))
        for ed in ['original-en','modern-en']:
            # Penrose surfaces two paragraphs later and is a different man:
            # Bloom could not get the name at 8:39 and gets it at 8:355.
            self.assertEqual([(8,355)],[k for k in where(ed,'penrose') if k[0]==8],ed)
            self.assertNotIn('penrose',ids(ed,8,39),ed)
            # 8:39 names the dayfather instead, who is Monks of episode 7.
            self.assertIn('monks',ids(ed,8,39),ed)

    def test_the_editions_diverge_on_three_names(self):
        # Joyce truncates Boylan's name at 8:35 (They are not Boyl:) where the
        # modern edition writes Boylan's men; the modern edition supplies
        # Boylan again at 8:255 and Lot's wife at 8:35.
        self.assertNotIn('blazes-boylan',ids('original-en',8,35))
        self.assertIn('blazes-boylan',ids('modern-en',8,35))
        self.assertNotIn('blazes-boylan',ids('original-en',8,255))
        self.assertIn('blazes-boylan',ids('modern-en',8,255))
        self.assertNotIn('lots-wife',ids('original-en',8,35))
        self.assertIn('lots-wife',ids('modern-en',8,35))
        # and the modern edition supplies Reuben J's surname in both places
        self.assertIn("Reuben J. Dodd's son",said('modern-en','reuben-son'))

    def test_the_deliberate_gaps_of_episode_eight(self):
        for ed in ['original-en','modern-en']:
            # 8:144 is Bloom guessing what the initials A. E. stand for, not
            # the Albert Edward of Deasy's mantelpiece.
            self.assertNotIn('albert-edward',ids(ed,8,144),ed)
            # 8:11 is O'Connell bridge, 8:158 is Adam court, 8:140 is Walter
            # Sexton's window, 8:336 is Gray's confectioner's.
            self.assertNotIn('oconnell',ids(ed,8,11),ed)
            self.assertNotIn('adam',ids(ed,8,158),ed)
            self.assertNotIn('walter-goulding',ids(ed,8,140),ed)
            self.assertNotIn('john-gray',ids(ed,8,336),ed)
            # 8:172 is a voice calling Jack, not Jack Power.
            self.assertNotIn('jack-power',ids(ed,8,172),ed)
            # Our Saviour at 8:7 carries no card, as everywhere in this package.
            self.assertEqual([],[c for c in ids(ed,8,7)
                                 if 'christ' in c or 'jesus' in c],ed)


class ScyllaAndCharybdis(unittest.TestCase):
    """Episode 9. The librarian's office in Kildare street, where Stephen argues
    that Shakespeare is the ghost and not the prince."""

    def test_the_four_men_in_the_room(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((9,0),where(ed,'lyster'))
            self.assertIn((9,8),where(ed,'john-eglinton'))
            self.assertIn((9,27),where(ed,'mr-best'))
            self.assertIn((9,19),where(ed,'russell'))
            self.assertIn((9,7),where(ed,'stephen'))
            # Magee is Eglinton's own name and is an alias on the same card.
            self.assertIn('Magee',said(ed,'john-eglinton'),ed)
            self.assertIn('Eglinton',said(ed,'john-eglinton'),ed)

    def test_the_bare_surname_best_is_the_adjective_everywhere_else(self):
        # Fourteen paragraphs outside this episode say "best value in Dub" or
        # "best moment" or "best mates", so only three are keyed.
        for ed in ['original-en','modern-en']:
            for k in [(9,280),(9,286),(9,290),(9,365)]:
                self.assertIn('mr-best',ids(ed,*k),(ed,k))
            for k in [(11,352),(8,112),(13,107)]:
                self.assertNotIn('mr-best',ids(ed,*k),(ed,k))

    def test_hamlet_is_the_prince_the_play_and_the_dead_king(self):
        for ed in ['original-en','modern-en']:
            # the prince
            self.assertIn('hamlet',ids(ed,9,67))
            self.assertIn('hamlet',ids(ed,9,333))
            # the dead king, twice
            self.assertEqual([(9,59),(9,66),(9,186),(9,391)],
                             [k for k in where(ed,'king-hamlet') if k[0]==9],ed)
            # and the play, which carries no card at all
            for k in [(9,11),(9,44),(9,55),(9,151),(9,271),(9,404)]:
                self.assertNotIn('hamlet',ids(ed,*k),(ed,k))
                self.assertNotIn('king-hamlet',ids(ed,*k),(ed,k))
        # 9:391 buries both at once: Hamlet pere and Hamlet fils.
        self.assertIn('hamlet',ids('original-en',9,391))
        self.assertIn('king-hamlet',ids('original-en',9,391))

    def test_the_shakespeare_family_is_keyed_by_occurrence(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((9,340),where(ed,'gilbert-shakespeare'))
            self.assertIn((9,340),where(ed,'edmund-shakespeare'))
            self.assertIn((9,340),where(ed,'richard-shakespeare'))
            self.assertIn((9,318),where(ed,'john-shakespeare'))
            self.assertIn((9,333),where(ed,'mary-arden'))
            self.assertIn((9,271),where(ed,'judith'))
            self.assertIn((9,271),where(ed,'joan-shakespeare'))
            self.assertIn((9,271),where(ed,'susanna'))
            self.assertIn((9,271),where(ed,'elizabeth-hall'))
            self.assertIn((9,68),where(ed,'hamnet'))
            # 9:345 names the character and the brother in one paragraph
            self.assertIn('edmund-lear',ids(ed,9,345),ed)
            self.assertIn('edmund-shakespeare',ids(ed,9,345),ed)
            # and 9:381 names the king twice and the brother once
            self.assertIn('richard-iii',ids(ed,9,381),ed)
            self.assertIn('richard-shakespeare',ids(ed,9,381),ed)

    def test_best_makes_a_joke_of_sharing_the_brothers_name(self):
        # "That is my name, Richard, don't you know. I hope you are going to say
        # a good word for Richard." The first Richard is Best, the second the
        # brother, and the table is keyed by occurrence.
        for ed in ['original-en','modern-en']:
            self.assertIn('mr-best',ids(ed,9,342),ed)
            self.assertIn('richard-shakespeare',ids(ed,9,342),ed)

    def test_ann_hathaway_answers_to_four_names(self):
        for ed in ['original-en','modern-en']:
            t=set(said(ed,'ann-hathaway'))
            for n in ['Ann Hathaway','Ann']:
                self.assertIn(n,t,(ed,n))
            # 9:261 calls her Penelope and 9:69 your mother; 9:313 the mobled
            # queen is her too, in the secondbest bed.
            self.assertIn((9,261),where(ed,'ann-hathaway'),ed)
            self.assertIn((9,69),where(ed,'ann-hathaway'),ed)

    def test_the_namesakes_of_episode_nine(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(9,25)],where(ed,'judge-theosophist'),ed)   # 9:207, 9:385 are two other Judges
            self.assertEqual([(9,19)],where(ed,'essex'),ed)               # Essex bridge and Essex gate
            self.assertEqual([(9,217)],where(ed,'jove'),ed)               # everywhere else the exclamation
            self.assertEqual([(9,439)],where(ed,'lucy'),ed)               # 12:513 is S. Lucy
            self.assertEqual([(9,129)],where(ed,'norman-editor'),ed)      # 1:55 is Connolly Norman
            self.assertEqual([(9,382)],where(ed,'george-meredith'),ed)    # 15:900 is Jack Meredith
            self.assertEqual([(9,126)],where(ed,'james-stephens-writer'),ed)
            self.assertEqual([(9,294),(9,381)],where(ed,'philip-sidney'),ed)  # 9:174 is Sidney Lee
            # and the head centre of the Fenians is not the sketcher of 9:126
            self.assertNotIn('head-centre',ids(ed,9,126),ed)
            # 9:117 is Peter Piper, not the man back from Berlin
            self.assertNotIn('piper',ids(ed,9,117),ed)

    def test_the_men_who_are_only_a_description(self):
        for ed in ['original-en','modern-en']:
            for cid,k in [('library-attendant',(9,3)),('egyptian-highpriest',(9,148)),
                          ('dark-lady',(9,181)),('duke-of-rutland',(9,404)),
                          ('stephen-brother',(9,377)),('soothsayer',(9,147)),
                          ('wandering-jew',(9,473)),('ancient-mariner',(9,473)),
                          ('othello',(9,387)),('koot-hoomi',(9,25))]:
                self.assertIn(k,where(ed,cid),(ed,cid))
            # Bloom crosses the room four times and is named once, by Mulligan
            for k in [(9,238),(9,244),(9,246),(9,250),(9,469),(9,476)]:
                self.assertIn('leopold',ids(ed,*k),(ed,k))

    def test_the_compounds_that_only_the_modern_edition_splits(self):
        # Joyce runs names together; the modern edition hyphenates them, and a
        # hyphen is not a word character, so the name becomes bindable there.
        self.assertNotIn('shakespeare',ids('original-en',9,328))   # Rutlandbaconsouthamptonshakespeare
        self.assertIn('shakespeare',ids('modern-en',9,328))        # Rutland-Bacon-Southampton-Shakespeare
        self.assertIn('francis-bacon',ids('modern-en',9,328))
        for ed in ['original-en','modern-en']:
            # pseudomalachi and Sonmulligan are bound by phrase in both
            self.assertIn('mulligan',ids(ed,9,194),ed)
            self.assertIn('mulligan',ids(ed,9,331),ed)
            # and Besteglinton names both men in one word
            self.assertIn('mr-best',ids(ed,9,286),ed)
            self.assertIn('john-eglinton',ids(ed,9,286),ed)

    def test_the_two_names_the_editions_do_not_share(self):
        # Joyce's mother Dana becomes Mother Nature, and Aubrey's ostler loses
        # his Aubrey. Both are omittedEntities for the modern edition.
        self.assertIn((9,157),where('original-en','dana-goddess'))
        self.assertEqual([],where('modern-en','dana-goddess'))
        self.assertIn((9,294),where('original-en','john-aubrey'))
        self.assertEqual([],where('modern-en','john-aubrey'))

    def test_the_deliberate_gaps_of_episode_nine(self):
        for ed in ['original-en','modern-en']:
            # Christ carries no card here either, in the creed run together at
            # 9:195 or in Hiesos Kristos at 9:24.
            for k in [(9,24),(9,195)]:
                self.assertEqual([],[c for c in ids(ed,*k)
                                     if 'christ' in c or 'jesus' in c],(ed,k))
            # 9:250 is Ikey Moses, a slur and not the prophet
            self.assertNotIn('moses',ids(ed,9,250),ed)
            # 9:119 is Isis Unveiled, a book on the shelf
            self.assertNotIn('isis',ids(ed,9,119),ed)
            # 9:8 is The Sorrows of Satan, a novel
            self.assertNotIn('satan',ids(ed,9,8),ed)
            # 9:62 is the bear Sackerson and 9:105 poor Wat the hare, which are
            # animals and not cast; Drake in the same sentence is.
            self.assertEqual(['drake','stephen'],ids(ed,9,62),ed)


class WanderingRocks(unittest.TestCase):
    """Episode 10. Nineteen sections walking the whole city between three and
    four o'clock, with almost every named Dubliner in the book somewhere in it."""

    def test_the_four_dedalus_sisters(self):
        # Katey, Boody and Maggy in the kitchen; Dilly out meeting her father.
        # The surname at 10:71 and 10:84 covers two of them at once and carries
        # no card: each girl is bound on her own first name.
        for ed in ['original-en','modern-en']:
            self.assertIn((10,102),where(ed,'katey-dedalus'),ed)
            self.assertIn((10,114),where(ed,'boody-dedalus'),ed)
            self.assertIn((10,86),where(ed,'maggy-dedalus'),ed)
            self.assertIn((10,296),where(ed,'dedalus-daughter'),ed)
            self.assertNotIn('simon-dedalus',ids(ed,10,71),ed)
            self.assertNotIn('stephen',ids(ed,10,84),ed)

    def test_the_surname_dedalus_has_three_owners_now(self):
        for ed in ['original-en','modern-en']:
            # Simon through the auctionrooms and the quay
            self.assertIn('simon-dedalus',ids(ed,10,300),ed)
            self.assertIn('simon-dedalus',ids(ed,10,411),ed)
            # Stephen at the bookcart and in Mulligan's mouth at the D.B.C.
            self.assertIn('stephen',ids(ed,10,368),ed)
            self.assertIn('stephen',ids(ed,10,504),ed)
            # and the daughter, who is Dilly
            self.assertIn('dedalus-daughter',ids(ed,10,542),ed)

    def test_the_namesakes_of_episode_ten(self):
        for ed in ['original-en','modern-en']:
            self.assertEqual([(10,371)],where(ed,'russell-lapidary'),ed)   # A. E. is the other Russell
            self.assertEqual([(10,349)],where(ed,'john-mulligan'),ed)      # and Buck is the other Mulligan
            self.assertEqual([(10,457)],where(ed,'alderman-cowley'),ed)    # Father Bob is the other Cowley
            self.assertEqual([(10,457)],where(ed,'abraham-lyon'),ed)       # Bantam is the other Lyons
            self.assertEqual([(10,12)],where(ed,'ger-gallaher'),ed)        # Ignatius is the other Gallaher
            self.assertEqual([(10,161)],where(ed,'marion-woman-in-white'),ed)
            self.assertEqual([(10,287)],where(ed,'harvey-litigant'),ed)
            self.assertEqual([(10,525)],where(ed,'lewis-werner'),ed)       # Louis Werner is the other one
            self.assertEqual([(10,33)],where(ed,'nicholas-dudley'),ed)     # the earl is the other Dudley
            # Buck Mulligan's alias is kept off the Hibernian bank manager
            self.assertNotIn('mulligan',ids(ed,10,349),ed)
            # and Molly's name is kept off the one in the novel
            self.assertNotIn('molly',ids(ed,10,161),ed)

    def test_two_people_get_their_names_in_this_episode(self):
        # The daughter Bloom watched in episode 8 is Dilly; the soldier Myler
        # Keogh beat in episode 8 is sergeantmajor Bennett; and the lord
        # lieutenant of the Mirus bazaar placard is William Humble, earl of
        # Dudley, who drives across the whole city in the last section.
        for ed in ['original-en','modern-en']:
            self.assertIn('Dilly',said(ed,'dedalus-daughter'),ed)
            self.assertIn((8,9),where(ed,'dedalus-daughter'),ed)
            self.assertIn('Bennett',said(ed,'portobello-soldier'),ed)
            self.assertIn((8,236),where(ed,'portobello-soldier'),ed)
            self.assertIn((8,365),where(ed,'lord-lieutenant'),ed)
            self.assertIn((10,541),where(ed,'lord-lieutenant'),ed)

    def test_the_people_the_episode_gives_only_a_description(self):
        for ed in ['original-en','modern-en']:
            for cid,k in [('onelegged-sailor',(10,1)),('constable-57c',(10,61)),
                          ('turf-bargeman',(10,31)),('tram-old-woman',(10,39)),
                          ('belgian-jesuit',(10,41)),('flushed-young-man',(10,55)),
                          ('young-woman-daisies',(10,55)),('stout-lady',(10,74)),
                          ('barefoot-urchins',(10,77)),('thornton-blond-girl',(10,117)),
                          ('elderly-female-courts',(10,211)),('bookshop-man',(10,268)),
                          ('lacquey',(10,104)),('bookcart-huckster',(10,378)),
                          ('castle-policeman',(10,449)),('dbc-waitress',(10,501)),
                          ('two-old-women',(10,373)),('gerty-father',(10,542)),
                          ('halfmile-wheelmen',(10,299)),
                          ('quartermile-handicappers',(10,545))]:
                self.assertIn(k,where(ed,cid),(ed,cid))
            # the young woman with the daisies crosses two sections
            self.assertEqual([(10,55),(10,193)],where(ed,'young-woman-daisies'),ed)
            # and the elderly female out of the courts crosses three
            self.assertEqual([(10,211),(10,287),(10,542)],
                             where(ed,'elderly-female-courts'),ed)

    def test_the_man_in_the_macintosh_crosses_the_viceroys_path(self):
        for ed in ['original-en','modern-en']:
            self.assertIn((10,545),where(ed,'macintosh'),ed)
        self.assertIn('macintosh',said('original-en','macintosh'))
        self.assertIn('mackintosh',said('modern-en','macintosh'))

    def test_the_deliberate_gaps_of_episode_ten(self):
        for ed in ['original-en','modern-en']:
            # 10:529 is Mr Bloom the dentist, whose windows Farrell strides past
            self.assertNotIn('leopold',ids(ed,10,529),ed)
            # 10:19 is Dignam's court and 10:13 Fitzgibbon street
            self.assertNotIn('paddy-dignam',ids(ed,10,19),ed)
            # 10:231 is Lynam's the bookmaker, not the schoolboy who posts the letter
            self.assertNotIn('brunny-lynam',ids(ed,10,231),ed)
            # 10:475 is a Henry Clay cigar and 10:542 a wax model called Henry
            self.assertNotIn('jimmy-henry',ids(ed,10,475),ed)
            # 10:444 is Jacko the monkey, who is not cast
            self.assertEqual([],[c for c in ids(ed,10,444) if 'jack' in c],ed)
            # and the shops that carry their owners' names are not cast
            for k in [(10,28),(10,232),(10,349)]:
                self.assertNotIn('grogan',ids(ed,*k),(ed,k))

    def test_the_editions_diverge_on_barabbas(self):
        # Ben Dollard names the moneylender twice in Joyce; the modern edition
        # keeps the first and turns the second into "that crook".
        self.assertIn((10,444),where('original-en','reuben-j'))
        self.assertNotIn((10,444),where('modern-en','reuben-j'))
        # Everything else in this episode binds in both editions.
        O={m['characterId'] for m in mentions('original-en') if m['chapterNumber']==10}
        M={m['characterId'] for m in mentions('modern-en') if m['chapterNumber']==10}
        self.assertEqual(set(),O-M)
        self.assertEqual(set(),M-O)


class Tables(unittest.TestCase):
    def test_no_split_or_phrase_key_is_declared_twice(self):
        # A repeated dict literal silently shadows the earlier one and drops
        # every key in it. This has happened twice while authoring episodes 6
        # and 7, and once undetected: a second 'Jack' table dropped the episode
        # 7 keys for J. J. O'Molloy until this guard was written.
        import ast,collections
        tree=ast.parse(open('build_ulysses.py',encoding='utf-8').read())
        dupes=[]
        for node in ast.walk(tree):
            if not isinstance(node,ast.Assign):continue
            names=[t.id for t in node.targets if isinstance(t,ast.Name)]
            if not (set(names)&{'SPLIT','PHRASE'}):continue
            if not isinstance(node.value,ast.Dict):continue
            seen=collections.Counter()
            for k in node.value.keys:
                try:seen[ast.literal_eval(k)]+=1
                except Exception:pass
            dupes+= [(names[0],k) for k,c in seen.items() if c>1]
        self.assertEqual([],dupes)
