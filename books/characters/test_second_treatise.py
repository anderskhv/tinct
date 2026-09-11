import hashlib, json, unittest
from build_second_treatise import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class SecondTreatiseTests(unittest.TestCase):
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

    def test_no_bare_isaac_or_jacob(self):
        # Unlike Fear and Trembling, this book never names Isaac or Jacob
        # directly (Genesis 13:5 and 36:6 are cited without naming them);
        # confirm no such entities were invented.
        ids = {e['id'] for e in json.loads((BASE / 'editorial.json').read_text())['entities']}
        self.assertNotIn('isaac', ids)
        self.assertNotIn('jacob', ids)

    def test_jephthah_spelling_variants_all_bind(self):
        # original-en spells this "Jephtha" at 3:5/8:17/16:1 but "Jeptha"
        # (no middle h) at 19:45; modern-en spells it "Jephtha" everywhere,
        # including 19:45. Neither edition ever prints "Jephthah".
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'jephthah'}
            self.assertEqual(locs, {(3, 5), (8, 17), (16, 1), (19, 45)})
            self.assertFalse(any(m['text'] == 'Jephthah' for m in d['mentions']))
        original = self.asset['editions']['original-en']['mentions']
        modern = self.asset['editions']['modern-en']['mentions']
        self.assertTrue(any(m['characterId'] == 'jephthah' and m['text'] == 'Jeptha' for m in original))
        self.assertFalse(any(m['characterId'] == 'jephthah' and m['text'] == 'Jeptha' for m in modern))

    def test_juvenal_case_variant_binds_in_both_editions(self):
        # original-en lowercases "juvenal" at 19:33; modern-en capitalizes it.
        original = self.asset['editions']['original-en']['mentions']
        modern = self.asset['editions']['modern-en']['mentions']
        self.assertTrue(any(m['text'] == 'juvenal' for m in original))
        self.assertTrue(any(m['text'] == 'Juvenal' for m in modern))

    def test_filmer_is_the_polemical_target_throughout(self):
        # Filmer is cited at the structural anchors of the argument: the
        # opening summary of the First Treatise, the definition of
        # freedom he disputes, and the discussion of paternal power.
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'filmer'}
            self.assertEqual(locs, {(1, 5), (4, 0), (6, 10)})

    def test_five_genesis_figures_in_one_paragraph_stay_distinct(self):
        # 5:14 cites Cain and Abel, then Abraham and Lot, then Esau, all in
        # one paragraph illustrating property before fixed boundaries.
        # Confirm all five are bound, and to five distinct entities.
        for d in self.asset['editions'].values():
            ids_at_5_14 = {m['characterId'] for m in d['mentions'] if (m['chapterNumber'], m['paragraphIndex']) == (5, 14)}
            self.assertEqual(ids_at_5_14, {'cain', 'abel', 'abraham', 'lot', 'esau'})

    def test_no_mention_leaks_into_an_adjective(self):
        forbidden = {'Filmerian', 'Hookerian', 'Barclayan', 'Neronian'}
        for d in self.asset['editions'].values():
            self.assertFalse(any(m['text'] in forbidden for m in d['mentions']))

    def test_no_invented_outcomes_or_missing_reference_entries(self):
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 47)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_major_entries_are_filmer_adam_and_hooker_only(self):
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, {'filmer', 'adam', 'hooker'})


if __name__ == '__main__':
    unittest.main()
