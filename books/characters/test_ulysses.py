"""Guards for the Ulysses character package.

Episodes 1 and 2 of 18 are authored. These tests pin the identifications that took a
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
    def test_only_the_first_two_episodes_are_authored(self):
        self.assertIn('episodes 1-2 of 18',REPORT['scope'])
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
        self.assertTrue(all(ch in (1,2) for ch,_ in table))
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
            self.assertEqual([(1,15),(1,39),(1,59)],where(ed,'mulligan-aunt'),ed)
            self.assertEqual([(1,83)],where(ed,'mulligan-mother'),ed)
            self.assertEqual([(1,327)],where(ed,'mulligan-brother'),ed)
            self.assertIn((1,176),where(ed,'milkwoman'),ed)
            self.assertIn((1,239),where(ed,'milkwoman'),ed)
            self.assertEqual([(1,321),(1,323)],where(ed,'cliff-boatman'),ed)
            self.assertEqual([(1,321)],where(ed,'cliff-businessman'),ed)
            self.assertEqual([(1,326),(1,333),(1,348)],where(ed,'creek-young-man'),ed)
            self.assertEqual([(1,331)],where(ed,'creek-elderly-man'),ed)
            self.assertEqual([(1,325)],where(ed,'drowned-man'),ed)

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
        self.assertEqual(['mercury','chrysostomos'],
                         REPORT['editions']['modern-en']['omittedEntities'])
        self.assertEqual([],REPORT['editions']['original-en']['omittedEntities'])
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
            self.assertEqual([(1,329)],where(ed,'bannon'),ed)
            self.assertEqual([(1,232),(1,269),(1,275),(2,74)],where(ed,'hamlet'),ed)
            self.assertEqual([(1,275),(2,74),(2,113)],where(ed,'shakespeare'),ed)

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
            self.assertEqual([(2,123)],where(ed,'temple'),ed)
            self.assertEqual([(2,123)],where(ed,'russell'),ed)
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
            self.assertEqual([(2,129)],where(ed,'oconnell'),ed)
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
