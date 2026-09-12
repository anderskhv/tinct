import hashlib, json, unittest
from build_aristotle_politics import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class AristotlePoliticsTests(unittest.TestCase):
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

    def test_no_invented_outcomes(self):
        # original-en has 158 characters, not 159: Sardanapalus is absent
        # there due to the documented source defect at 5:59.
        expected = {'original-en': 158, 'modern-en': 159}
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), expected[ed])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_sardanapalus_only_in_modern_en_source_defect(self):
        # original-en's Bekker/Gutenberg apparatus corrupts the sentence
        # naming Sardanapalus (5:59); modern-en, translated fresh, keeps
        # the name. This is a documented source defect, not a bug.
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'], ['sardanapalus'])
        self.assertEqual(self.report['editions']['modern-en']['omittedEntities'], [])
        modern = self.asset['editions']['modern-en']['mentions']
        self.assertTrue(any(m['characterId'] == 'sardanapalus' and (m['chapterNumber'], m['paragraphIndex']) == (5, 59)
                             for m in modern))

    def test_major_entries_are_socrates_and_plato(self):
        expected = {'socrates', 'plato'}
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, expected)

    def test_aristotle_footnote_apparatus_never_bound(self):
        # original-en's footnote apparatus names "Aristotle" twice (7:39,
        # 8:3) as a translator's own third-person cross-reference, not
        # Aristotle naming himself in his prose. Neither location binds
        # to any "Aristotle" entity (there is none), and no entity id
        # resembling one exists in the authored set.
        ids = {c['id'] for d in self.asset['editions'].values() for c in d['characters']}
        self.assertFalse(any('aristotle' in i for i in ids))
        for d in self.asset['editions'].values():
            for ch, pi in [(7, 39), (8, 3)]:
                texts = {m['text'] for m in d['mentions'] if (m['chapterNumber'], m['paragraphIndex']) == (ch, pi)}
                self.assertNotIn('Aristotle', texts)

    def test_two_dionysii_split_by_location_not_alias(self):
        for d in self.asset['editions'].values():
            i_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'dionysius-i'}
            ii_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'dionysius-ii'}
            self.assertEqual(i_locs, {(1, 41), (3, 70), (5, 19), (5, 21), (5, 29), (5, 49), (5, 67)})
            self.assertEqual(ii_locs, {(5, 59), (5, 61), (5, 63)})
            dionysius_texts = {m['characterId'] for m in d['mentions'] if m['text'] == 'Dionysius'}
            self.assertEqual(dionysius_texts, {'dionysius-i', 'dionysius-ii'})

    def test_two_perianders_split_corinth_bare_ambracia_excluded(self):
        for d in self.asset['editions'].values():
            corinth = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'periander-corinth'}
            ambracia = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'periander-ambracia'}
            self.assertEqual(corinth, {(3, 54), (5, 52), (5, 67), (5, 75), (5, 76)})
            self.assertEqual(ambracia, {(5, 15), (5, 54)})
            periander_texts = {m['characterId'] for m in d['mentions'] if m['text'] == 'Periander'}
            self.assertEqual(periander_texts, {'periander-corinth', 'periander-ambracia'})

    def test_two_thrasybuluses_split_miletus_vs_syracuse(self):
        for d in self.asset['editions'].values():
            miletus = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'thrasybulus-miletus'}
            syracuse = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'thrasybulus-syracuse'}
            self.assertEqual(miletus, {(3, 54), (5, 52)})
            self.assertEqual(syracuse, {(5, 63), (5, 76)})

    def test_three_pausaniases_split_by_location_not_alias(self):
        for d in self.asset['editions'].values():
            king = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'king-pausanias'}
            regent = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'pausanias-regent'}
            assassin = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'pausanias-assassin'}
            self.assertEqual(king, {(5, 2), (7, 57)})
            self.assertEqual(regent, {(5, 26)})
            self.assertEqual(assassin, {(5, 54)})
            pausanias_texts = {m['characterId'] for m in d['mentions'] if m['text'] == 'Pausanias'}
            self.assertEqual(pausanias_texts, {'king-pausanias', 'pausanias-regent', 'pausanias-assassin'})

    def test_two_cleisthenes_split_athens_vs_sicyon(self):
        for d in self.asset['editions'].values():
            athens = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'cleisthenes-athens'}
            sicyon = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'cleisthenes-sicyon'}
            self.assertEqual(athens, {(3, 5), (6, 11)})
            self.assertEqual(sicyon, {(5, 74), (5, 78)})

    def test_two_timophaneses_split_mitylene_vs_corinth(self):
        for d in self.asset['editions'].values():
            mitylene = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'timophanes-mitylene'}
            corinth = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'timophanes-corinth'}
            self.assertEqual(mitylene, {(5, 14)})
            self.assertEqual(corinth, {(5, 22)})

    def test_pheidon_and_chares_resolve_by_longest_span_no_scoping(self):
        # Both pairs are clean epithet splits (Pheidon the Corinthian vs.
        # bare Pheidon; Chares [the Parian/of Paros] vs. bare Chares) --
        # plain global aliases and longest-span-first, no custom bind().
        for d in self.asset['editions'].values():
            pheidon_corinthian = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'pheidon-corinthian'}
            pheidon_argos = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'pheidon-argos'}
            chares_parian = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'chares-parian'}
            chares_general = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'chares-general'}
            self.assertEqual(pheidon_corinthian, {(2, 22)})
            self.assertEqual(pheidon_argos, {(5, 49)})
            self.assertEqual(chares_parian, {(1, 40)})
            self.assertEqual(chares_general, {(5, 21)})

    def test_two_amyntases_at_same_paragraph_resolve_by_epithet(self):
        # "Amyntas the little" (global alias) and the unrelated, unaliased
        # bare "Amyntas" (Archelaus's son) both occur within 5:54; the
        # epithet form must win at its own position and the bare form
        # must resolve to the *other* entity, not leak into it.
        for d in self.asset['editions'].values():
            little = [m for m in d['mentions'] if m['characterId'] == 'amyntas-little']
            son = [m for m in d['mentions'] if m['characterId'] == 'amyntas-son-of-archelaus']
            self.assertEqual(len(little), 1)
            self.assertEqual(len(son), 1)
            self.assertEqual((little[0]['chapterNumber'], little[0]['paragraphIndex']), (5, 54))
            self.assertEqual((son[0]['chapterNumber'], son[0]['paragraphIndex']), (5, 54))
            self.assertIn('little', little[0]['text'].lower())
            self.assertNotIn('little', son[0]['text'].lower())


if __name__ == '__main__':
    unittest.main()
