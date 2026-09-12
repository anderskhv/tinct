import hashlib, json, unittest
from build_nicomachean_ethics import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class NicomacheanEthicsTests(unittest.TestCase):
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

    def test_no_omitted_entities_in_either_edition(self):
        # 57 of 57 authored entries bind in both editions, one snapshot each.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 57)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_every_entity_is_reference(self):
        # A lecture-course treatise per editorial policy: no narrative or
        # staged dialogue of its own, so no Central/Major/Supporting --
        # every cited thinker, poet, or legendary figure stays Reference.
        for d in self.asset['editions'].values():
            roles = {c['storyRole'] for c in d['characters']}
            self.assertEqual(roles, {'reference'})

    def test_named_groups_are_kind_group(self):
        for d in self.asset['editions'].values():
            byid = {c['id']: c for c in d['characters']}
            self.assertEqual(byid['pythagoreans']['kind'], 'group')
            self.assertEqual(byid['sophists']['kind'], 'group')

    def test_demus_and_alope_never_bind_a_person(self):
        # (8, 66) "Demus" is Aristotle's technical term for a political
        # subdivision, not a person; (7, 68) "Alope" is a play's title,
        # not a character (only Cercyon, the character within it, is
        # bound). Neither gets an entity at all.
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            self.assertNotIn('demus', ids)
            self.assertNotIn('alope', ids)
            all_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']}
            self.assertNotIn((8, 66), all_locs)

    def test_edition_naming_variants_resolve_to_one_entity(self):
        # Ulysses (orig) / Odysseus (mod); Jupiter+Jove (orig) / Zeus (mod);
        # Venus (orig) / Aphrodite (mod); Anexagoras+Anaxagoras (orig,
        # inconsistent) / Anaxagoras (mod, both times).
        orig_texts = {cid: {m['text'] for m in self.asset['editions']['original-en']['mentions']
                             if m['characterId'] == cid}
                      for cid in ['odysseus', 'zeus', 'aphrodite', 'anaxagoras']}
        mod_texts = {cid: {m['text'] for m in self.asset['editions']['modern-en']['mentions']
                            if m['characterId'] == cid}
                     for cid in ['odysseus', 'zeus', 'aphrodite', 'anaxagoras']}
        self.assertIn('Ulysses', orig_texts['odysseus'])
        self.assertIn('Odysseus', mod_texts['odysseus'])
        self.assertTrue({'Jupiter', 'Jove'} & orig_texts['zeus'])
        self.assertEqual(mod_texts['zeus'], {'Zeus'})
        self.assertIn('Venus', orig_texts['aphrodite'])
        self.assertIn('Aphrodite', mod_texts['aphrodite'])
        self.assertEqual(orig_texts['anaxagoras'], {'Anexagoras', 'Anaxagoras'})
        self.assertEqual(mod_texts['anaxagoras'], {'Anaxagoras'})

    def test_sophists_binds_both_capitalization_styles_in_modern_en(self):
        # modern-en capitalizes "Sophists" at its first occurrence (9, 4)
        # but lowercases "sophists" at the other two (10, 117; 10, 120) --
        # an internal inconsistency within that edition; both are bound.
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions']
                     if m['characterId'] == 'sophists'}
        self.assertEqual(mod_texts, {'Sophists', 'sophists'})
        mod_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['modern-en']['mentions']
                    if m['characterId'] == 'sophists'}
        self.assertEqual(mod_locs, {(9, 4), (10, 117), (10, 120)})

    def test_hector_mention_count_variance_is_paraphrase_not_omission(self):
        # modern-en names Hector explicitly ("Hector says") where
        # original-en uses the pronoun-equivalent "The latter says" at
        # the same location (3, 105) -- a legitimate paraphrase giving
        # modern-en one extra genuine mention, not an omission on either
        # side.
        orig_locs = [(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['original-en']['mentions']
                     if m['characterId'] == 'hector']
        mod_locs = [(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['modern-en']['mentions']
                    if m['characterId'] == 'hector']
        self.assertEqual(len(orig_locs), 5)
        self.assertEqual(len(mod_locs), 6)
        self.assertEqual(mod_locs.count((3, 105)), 2)
        self.assertEqual(orig_locs.count((3, 105)), 1)

    def test_both_editions_bind_every_entity(self):
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['characters']), len(mod['characters']))
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'], [])
        self.assertEqual(self.report['editions']['modern-en']['omittedEntities'], [])


if __name__ == '__main__':
    unittest.main()
