import hashlib, json, unittest
from build_vindication_rights_of_woman import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class VindicationRightsOfWomanTests(unittest.TestCase):
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
        # 71 of 71 authored entries bind in both editions, one snapshot each.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 71)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_every_entity_is_reference(self):
        # A treatise per editorial policy: no Central/Major/Supporting --
        # cited thinkers remain references, including Rousseau despite
        # his far longer engagement, and the author gets no entry at all.
        for d in self.asset['editions'].values():
            roles = {c['storyRole'] for c in d['characters']}
            self.assertEqual(roles, {'reference'})

    def test_eloisa_namesake_collision_resolved_by_location(self):
        # "Eloisa" names two different women: Rousseau's fictional Julie
        # at (4, 51), and the real historical Heloise at (6, 85) (also
        # spelled "Heloisa" at (9, 21)). Neither entity carries a global
        # alias for the colliding spelling.
        for d in self.asset['editions'].values():
            julie = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                     if m['characterId'] == 'eloisa-julie'}
            heloise = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                       if m['characterId'] == 'heloise-historical'}
            self.assertEqual(julie, {(4, 51)})
            self.assertEqual(heloise, {(6, 85), (9, 21)})

    def test_day_never_binds_outside_its_one_confirmed_location(self):
        # "Day" is an ordinary word throughout the book (vacation days,
        # present day, etc.); Thomas Day the author is bound only at his
        # one confirmed prose location, (5, 9).
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                    if m['characterId'] == 'thomas-day'}
            self.assertEqual(locs, {(5, 9)})

    def test_title_only_references_bind_by_title_not_by_name(self):
        # Talleyrand and Catherine the Great are never named directly in
        # bindable paragraph text -- only by ecclesiastic title and by
        # imperial title, respectively.
        for d in self.asset['editions'].values():
            talleyrand_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'talleyrand'}
            catherine_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'catherine-the-great'}
            self.assertEqual(talleyrand_texts, {'bishop of Autun', 'Bishop of Autun'})
            self.assertEqual(catherine_texts, {'Empress of Russia'})
            # And "Russia" bare (the unrelated whip-trade aside at (15, 81))
            # is never swept into Catherine's mentions.
            catherine_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                               if m['characterId'] == 'catherine-the-great'}
            self.assertNotIn((15, 81), catherine_locs)

    def test_mahomets_coffin_binds_both_apostrophe_styles(self):
        orig_texts = {m['text'] for m in self.asset['editions']['original-en']['mentions']
                      if m['characterId'] == 'mahomet'}
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions']
                     if m['characterId'] == 'mahomet'}
        self.assertEqual(orig_texts, {"Mahomet's coffin"})
        self.assertEqual(mod_texts, {'Mahomet’s coffin'})

    def test_louis_xiv_binds_both_edition_spellings(self):
        orig_texts = {m['text'] for m in self.asset['editions']['original-en']['mentions']
                      if m['characterId'] == 'louis-xiv'}
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions']
                     if m['characterId'] == 'louis-xiv'}
        # Both editions use "Lewis" at (6, 22) inside the quoted Adam
        # Smith passage; only the (6, 14) topic sentence differs.
        self.assertIn('Lewis', orig_texts)
        self.assertIn('Lewis', mod_texts)
        orig_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['original-en']['mentions']
                     if m['characterId'] == 'louis-xiv'}
        mod_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['modern-en']['mentions']
                    if m['characterId'] == 'louis-xiv'}
        self.assertEqual(orig_locs, {(6, 14), (6, 22)})
        self.assertEqual(mod_locs, {(6, 14), (6, 22)})

    def test_both_editions_bind_every_entity_identically_in_count(self):
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['characters']), len(mod['characters']))
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'], [])
        self.assertEqual(self.report['editions']['modern-en']['omittedEntities'], [])


if __name__ == '__main__':
    unittest.main()
