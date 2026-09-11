"""Focused checks for the ambiguities the Odyssey actually has."""
import unittest
from build_odyssey import compile_package

ASSET,REPORT,_=compile_package()
def mentions(edition):return ASSET['editions'][edition]['mentions']
def at(edition,ch,pi):return [m for m in mentions(edition) if m['chapterNumber']==ch and m['paragraphIndex']==pi]
def ids(edition,ch,pi,text=None):
    return [m['characterId'] for m in at(edition,ch,pi) if text is None or m['text']==text]
def where(edition,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(edition) if m['characterId']==cid]

class Odyssey(unittest.TestCase):
    def test_roman_and_greek_names_reach_one_entity(self):
        # The original says Ulysses, Jove, Minerva, Neptune; the modern says
        # Odysseus, Zeus, Athena, Poseidon. One card has to serve both.
        for cid in ['odysseus','zeus','athena','poseidon','hermes','hephaestus','persephone','helios']:
            for edition in ['original-en','modern-en']:
                self.assertTrue(where(edition,cid),(cid,edition))
        self.assertEqual(ids('original-en',1,1,'Ulysses')[:1],['odysseus'])
        self.assertEqual(ids('modern-en',1,1,'Odysseus')[:1],['odysseus'])

    def test_the_two_ajaxes_are_separated(self):
        # Ajax son of Oileus is the one Poseidon wrecks on the rocks of Gyrae;
        # every other Ajax in the poem is Telamon's son.
        self.assertEqual(set(where('original-en','ajax-oileus')),{(4,41)})
        for edition in ['original-en','modern-en']:
            self.assertNotIn((4,41),where(edition,'ajax'))
            self.assertIn((11,44),where(edition,'ajax'))

    def test_four_men_named_polybus(self):
        for edition in ['original-en','modern-en']:
            self.assertEqual(set(where(edition,'polybus-egypt')),{(4,10)})
            self.assertEqual(set(where(edition,'polybus-phaeacian')),{(8,31)})
            self.assertEqual(set(where(edition,'polybus-suitor')),{(22,25),(22,28)})
            self.assertIn((1,29),where(edition,'polybus-eurymachus'))
            self.assertNotIn((4,10),where(edition,'polybus-eurymachus'))

    def test_remaining_namesakes(self):
        for edition in ['original-en','modern-en']:
            for cid,expected in [
                ('amphion',{(11,19)}),('amphion-orchomenus',{(11,22)}),
                ('antiphates-melampus',{(15,19)}),('antiphus-elder',{(17,6)}),
                ('castor',{(11,23)}),('castor-hylax',{(14,11)}),
                ('anchialus-taphian',{(1,13)}),('anchialus-phaeacian',{(8,7)}),
                ('pisenor-herald',{(2,3)}),
                ('iasus-orchomenus',{(11,22)}),('iasus-cyprus',{(17,42)}),
            ]:
                self.assertEqual(set(where(edition,cid)),expected,(edition,cid))
            self.assertNotIn((15,19),where(edition,'antiphates'))

    def test_argos_is_the_dog_and_nothing_else(self):
        # Argos is also a place, sixteen times over. Only the dog is cast.
        for edition in ['original-en','modern-en']:
            self.assertEqual(set(where(edition,'argos')),{(17,26),(17,29)})
            self.assertEqual(ids(edition,3,14,'Argos'),[])

    def test_the_name_odysseus_gives_the_cyclops(self):
        # Noman in the original, Nobody in the modern; the lowercase pun in the
        # same sentence is not the name and stays unbound.
        self.assertEqual(len(where('original-en','noman')),7)
        self.assertEqual(len(where('modern-en','noman')),7)
        self.assertEqual(set(where('original-en','noman')),set(where('modern-en','noman')))
        self.assertEqual([m['text'] for m in at('modern-en',9,27) if m['characterId']=='noman'],['Nobody'])

    def test_singular_cyclops_is_polyphemus(self):
        for edition in ['original-en','modern-en']:
            self.assertEqual(ids(edition,2,1,'Cyclops'),['polyphemus'])
            self.assertNotIn('cyclopes',ids(edition,2,1,'Cyclops'))

    def test_modern_edition_gives_the_phaeacian_nurse_penelopes_housekeepers_name(self):
        # A defect in the modern edition: Nausicaa's old nurse is called
        # Eurynome there, which is also Penelope's housekeeper's name.
        self.assertEqual(ids('modern-en',7,0,'Eurynome'),['eurymedusa'])
        self.assertEqual(ids('original-en',7,0,'Eurymedusa'),['eurymedusa'])
        self.assertNotIn((7,0),where('modern-en','eurynome'))

    def test_assumed_names_are_their_own_entries(self):
        for cid,ch in [('aethon',19),('eperitus',24)]:
            for edition in ['original-en','modern-en']:
                self.assertEqual([c for c,_ in where(edition,cid)],[ch],(cid,edition))

    def test_only_two_entities_are_missing_from_the_modern_edition(self):
        self.assertEqual(REPORT['editions']['original-en']['omittedEntities'],[])
        self.assertEqual(sorted(REPORT['editions']['modern-en']['omittedEntities']),['gaia','sicels'])

    def test_places_are_not_cast(self):
        ids_=set(e['id'] for e in ASSET['editions']['original-en']['characters'])
        for place in ['ithaca','troy','pylos','sparta','crete','olympus','egypt','scheria','aeaea','ogygia']:
            self.assertNotIn(place,ids_)

    def test_snapshots_release_after_the_paragraph_that_earns_them(self):
        chars={c['id']:c for c in ASSET['editions']['original-en']['characters']}
        tel=chars['telemachus']
        self.assertEqual(len(tel['snapshots']),2)
        self.assertEqual(tel['snapshots'][1]['availableAt']['chapterNumber'],16)
        self.assertEqual(tel['snapshots'][1]['availableAt']['paragraphIndex'],22)
        # The first card must not anticipate the meeting the snapshot releases.
        self.assertNotIn('has now met',tel['snapshots'][0]['body'])

    def test_every_mention_quotes_its_own_source_span(self):
        for edition in ['original-en','modern-en']:
            for m in mentions(edition):
                self.assertTrue(m['text'].strip(),m)
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
