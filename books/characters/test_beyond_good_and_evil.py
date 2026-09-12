import hashlib, json, unittest
from build_beyond_good_and_evil import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class BeyondGoodAndEvilTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.asset, cls.report, _ = compile_package()

    def test_saved_package_current(self):
        self.assertEqual(self.asset, json.loads((BASE / 'characters.v1.json').read_text()))

    def test_exact_spans_and_sources(self):
        for d in self.asset['editions'].values():
            raw = (ROOT / d['sourcePath']).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(), d['sourceSha256'])
            seen = set()
            ps = {(c['number'], i): normalized(p) for c in json.loads(raw)['chapters'] for i, p in enumerate(c['paragraphs'])}
            for m in d['mentions']:
                k = (m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset'])
                self.assertNotIn(k, seen)
                seen.add(k)
                text = ps[k[:2]]
                self.assertEqual(text.encode('utf-16-le')[2 * k[2]:2 * k[3]].decode('utf-16-le'), m['text'])
                self.assertEqual(resolve(d, *k, text)['id'], m['characterId'])

    def test_no_invented_outcomes_or_missing_reference_entries(self):
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 119)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_major_entries_are_the_eight_sustained_figures(self):
        expected = {'plato', 'socrates', 'kant', 'pascal', 'goethe', 'napoleon',
                    'wagner', 'schopenhauer'}
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, expected)

    def test_two_fredericks_split_by_location_not_alias(self):
        # "Frederick" names Frederick II of Hohenstaufen (6:14) and Frederick
        # the Great of Prussia (7:5). Neither entity carries a global alias
        # for the bare name -- both are bound only by their one location.
        for d in self.asset['editions'].values():
            hohenstaufen = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                             if m['characterId'] == 'frederick-ii-hohenstaufen'}
            great = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                     if m['characterId'] == 'frederick-the-great'}
            self.assertEqual(hohenstaufen, {(6, 14)})
            self.assertEqual(great, {(7, 5)})
            # every "Frederick" mention in the book resolves to exactly one of these two
            frederick_texts = {m['characterId'] for m in d['mentions'] if m['text'] == 'Frederick'}
            self.assertEqual(frederick_texts, {'frederick-ii-hohenstaufen', 'frederick-the-great'})

    def test_two_sands_split_by_location_not_alias(self):
        # "Sand" names the novelist George Sand (8:19) and Kotzebue's
        # assassin Karl Ludwig Sand (9:4).
        for d in self.asset['editions'].values():
            george = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                       if m['characterId'] == 'george-sand'}
            karl = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                    if m['characterId'] == 'karl-ludwig-sand'}
            self.assertEqual(george, {(8, 19)})
            self.assertEqual(karl, {(9, 4)})

    def test_caesar_borgia_does_not_leak_into_julius_caesar(self):
        # original-en spells the Renaissance Borgia "Caesar Borgia," which
        # contains the bare word "Caesar" -- this must resolve to the
        # borgia entity at 6:11, never to Julius Caesar, whose own mention
        # is at 6:14 ("Alcibiades and Caesar").
        for d in self.asset['editions'].values():
            caesar_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                           if m['characterId'] == 'julius-caesar'}
            self.assertEqual(caesar_locs, {(6, 14)})
            borgia_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                           if m['characterId'] == 'borgia'}
            self.assertEqual(borgia_locs, {(6, 11)})

    def test_pascal_like_adjective_is_not_a_mention(self):
        # original-en's "Pascal-like SACRIFIZIA DELL' INTELLETO" (8:15) is
        # an adjective, not a citation of Pascal -- modern-en's own word
        # there is "Pascalian," which never matches the bare alias at all.
        for d in self.asset['editions'].values():
            pascal_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                           if m['characterId'] == 'pascal'}
            self.assertNotIn((8, 15), pascal_locs)
            self.assertEqual(pascal_locs, {(4, 0), (4, 1), (4, 17)})

    def test_all_caps_emphasis_aliases_bind(self):
        # This translation renders some of Nietzsche's own italics as small
        # caps or full caps; the case-sensitive matcher needs the literal
        # alias to catch each one in original-en.
        original = self.asset['editions']['original-en']['mentions']
        for text, cid in [('PLATO', 'plato'), ('KANT', 'kant'), ('LOCKE', 'locke'),
                           ('BIZET', 'bizet'), ('DIONYSUS', 'dionysus')]:
            self.assertTrue(any(m['text'] == text and m['characterId'] == cid for m in original),
                             f'missing ALL-CAPS mention {text!r} for {cid}')

    def test_dionysus_and_dionysius_stay_distinct(self):
        # Dionysus (the god, Chapter 10) and Dionysius (the tyrant of
        # Syracuse behind Epicurus's "Dionysiokolakes" joke, Chapter 1) are
        # different spellings of different figures; confirm neither
        # entity's locations bleed into the other's.
        for d in self.asset['editions'].values():
            god = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                   if m['characterId'] == 'dionysus'}
            tyrant = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                      if m['characterId'] == 'dionysius-tyrant'}
            self.assertEqual(tyrant, {(2, 6)})
            self.assertTrue(all(loc[0] == 10 for loc in god))
            self.assertEqual(god & tyrant, set())

    def test_accented_spelling_variants_bind_in_modern_en(self):
        # modern-en restores diacritics original-en's ASCII text dropped:
        # confirm the accented forms still resolve to the same entities.
        modern = self.asset['editions']['modern-en']['mentions']
        for text, cid in [('Molière', 'moliere'), ('Dühring', 'eugen-duhring'),
                          ('Helvétius', 'helvetius'), ('Madame de Staël', 'madame-de-stael'),
                          ('Saint-Évremond', 'saint-evremond'), ('Épinay', 'epinay')]:
            self.assertTrue(any(text in m['text'] and m['characterId'] == cid for m in modern),
                             f'missing accented mention {text!r} for {cid}')


if __name__ == '__main__':
    unittest.main()
