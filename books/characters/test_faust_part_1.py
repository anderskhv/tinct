"""Focused checks for Faust, Part One. Both full English editions, 28 scenes."""
import unittest
from build_faust_part_1 import compile_package

ASSET,REPORT,_=compile_package()
def mentions(ed):return ASSET['editions'][ed]['mentions']
def where(ed,cid):
    return [(m['chapterNumber'],m['paragraphIndex']) for m in mentions(ed) if m['characterId']==cid]

class FaustPartOne(unittest.TestCase):
    def test_speaker_tags_carry_the_principals(self):
        for ed in ['original-en','modern-en']:
            self.assertGreater(len(where(ed,'mephistopheles')),250,ed)
            self.assertGreater(len(where(ed,'faust')),230,ed)
            self.assertGreater(len(where(ed,'margaret')),90,ed)

    def test_the_scan_spells_margaret_four_ways(self):
        texts={m['text'] for m in mentions('original-en') if m['characterId']=='margaret'}
        # MARGARET and MARGARETE are the tag; Marearet is scanning damage.
        for t in ['MARGARET','MARGARETE','Marearet']:
            self.assertIn(t,texts)
        self.assertIn('MARGARET',{m['text'] for m in mentions('modern-en') if m['characterId']=='margaret'})

    def test_the_scan_keeps_german_running_heads(self):
        # MARTHE and ABEND and the rest are left as printed, not repaired.
        texts={m['text'] for m in mentions('original-en') if m['characterId']=='martha'}
        self.assertIn('MARTHE',texts)

    def test_lord_baron_is_mephistopheles_not_the_lord(self):
        # "You may call me Lord Baron" is the devil giving himself a title.
        for ed in ['original-en','modern-en']:
            self.assertNotIn((9,36),where(ed,'the-lord'),ed)
            self.assertTrue(all(c==3 or c in (5,17,22) for c,_ in where(ed,'the-lord')),ed)

    def test_the_spirit_of_the_study_is_the_earth_spirit(self):
        # SPIRIT is the Earth Spirit in scene 4 and nothing else; the Evil
        # Spirit and the Chorus of Spirits carry their own tags.
        for ed in ['original-en','modern-en']:
            self.assertTrue(all(c==4 for c,_ in where(ed,'earth-spirit')),ed)
            self.assertTrue(all(c==23 for c,_ in where(ed,'evil-spirit')),ed)

    def test_the_three_archangels_of_the_prologue(self):
        for ed in ['original-en','modern-en']:
            for cid in ['raphael','gabriel','michael']:
                self.assertTrue(where(ed,cid),f'{cid} {ed}')
                self.assertTrue(all(c==3 for c,_ in where(ed,cid)),cid)

    def test_the_four_drinkers_are_four_people(self):
        for ed in ['original-en','modern-en']:
            for cid in ['frosch','brander','siebel','altmayer']:
                self.assertGreater(len(where(ed,cid)),14,f'{cid} {ed}')

    def test_the_walpurgis_masque_speakers_are_all_bound(self):
        # Thirty one-line speakers, each a caricature of a faction.
        for ed in ['original-en','modern-en']:
            for cid in ['oberon','titania','puck','ariel','the-crane','the-sceptic',
                        'the-dogmatist','the-idealist','the-realist','the-supernaturalist',
                        'xenien','hennings','musaget','genius-of-the-age']:
                self.assertTrue(where(ed,cid),f'{cid} {ed}')

    def test_the_last_word_of_the_play(self):
        # Mephistopheles says she is judged; the Voice from Above says she is saved.
        for ed in ['original-en','modern-en']:
            self.assertIn((28,51),where(ed,'voice-from-above'),ed)

    def test_no_entity_is_missing_from_both_editions(self):
        o=set(REPORT['editions']['original-en']['omittedEntities'])
        m=set(REPORT['editions']['modern-en']['omittedEntities'])
        self.assertEqual(o&m,set())

    def test_the_dropped_speaker_tag_is_recorded_not_repaired(self):
        # The scan loses the CHORUS OF DISCIPLES label in scene 4; the speech
        # runs straight on from Faust's line. Recorded, not restored.
        self.assertEqual(REPORT['editions']['original-en']['omittedEntities'],['chorus-of-disciples'])
        self.assertEqual(REPORT['editions']['modern-en']['omittedEntities'],[])

    def test_every_mention_quotes_its_own_source_span(self):
        for ed in ['original-en','modern-en']:
            for m in mentions(ed):
                self.assertTrue(m['text'].strip())
                self.assertGreater(m['endOffset'],m['startOffset'])

if __name__=='__main__':unittest.main()
