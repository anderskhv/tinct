import hashlib, json, unittest
from build_walden import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class WaldenTests(unittest.TestCase):
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
        # Thoreau, the narrator, is never named in the running text and
        # carries no bindable alias -- the one entity omitted in both
        # editions, out of 122 authored.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 121)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], ['thoreau'])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_thoreau_never_bound(self):
        for d in self.asset['editions'].values():
            ids = {m['characterId'] for m in d['mentions']}
            self.assertNotIn('thoreau', ids)
            self.assertFalse(any(m['text'] == 'Thoreau' for m in d['mentions']))

    def test_no_major_entries(self):
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, set())

    def test_supporting_entries_are_the_local_cast(self):
        expected = {
            'john-field', 'cato-ingraham', 'brister-freeman', 'fenda',
            'zilpha', 'hugh-quoil', 'john-farmer', 'hermit', 'poet',
        }
        for d in self.asset['editions'].values():
            supporting = {c['id'] for c in d['characters'] if c['storyRole'] == 'supporting'}
            self.assertEqual(supporting, expected)

    def test_two_catos_split_by_location_not_alias(self):
        # Cato the Elder, the Roman agricultural writer (1:102, 2:6, 7:19,
        # 13:5), carries the global alias "Cato." Cato Ingraham, the
        # formerly enslaved Concord resident of Chapter 14 (14:1 x3,
        # 14:11) -- whom the text itself disambiguates from the Roman
        # Cato of Utica in the same breath -- carries no global alias and
        # is bound only by location-scoped match, which also excludes
        # cato-elder's own match at those two locations.
        for d in self.asset['editions'].values():
            elder = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                     if m['characterId'] == 'cato-elder'}
            ingraham = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                        if m['characterId'] == 'cato-ingraham'}
            self.assertEqual(elder, {(1, 102), (2, 6), (7, 19), (13, 5)})
            self.assertEqual(ingraham, {(14, 1), (14, 11)})
            cato_texts = {m['characterId'] for m in d['mentions'] if m['text'] == 'Cato'}
            self.assertEqual(cato_texts, {'cato-elder', 'cato-ingraham'})

    def test_nutting_and_stratton_split_by_location_not_alias(self):
        # "Nutting" and "Stratton" each name a bare-surname Chapter 14
        # former-inhabitant family (no global alias) and a Chapter 15
        # individual introduced by full name and then referred to again
        # by bare surname later in the same sentence (global alias on
        # the full name only; the bare backward reference is bound by a
        # location-scoped match covering all of 15:10).
        for d in self.asset['editions'].values():
            nutting_family = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                               if m['characterId'] == 'nutting-le-grosse'}
            sam_nutting = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                           if m['characterId'] == 'sam-nutting'}
            stratton_family = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                               if m['characterId'] == 'stratton-family'}
            hezekiah = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                        if m['characterId'] == 'hezekiah-stratton'}
            self.assertEqual(nutting_family, {(14, 8)})
            self.assertEqual(sam_nutting, {(15, 10)})
            self.assertEqual(stratton_family, {(14, 0), (14, 4)})
            self.assertEqual(hezekiah, {(15, 10)})
            sam_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'sam-nutting'}
            self.assertEqual(sam_texts, {'Sam Nutting', 'Nutting'})
            hez_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'hezekiah-stratton'}
            self.assertEqual(hez_texts, {'Hezekiah Stratton', 'Stratton'})

    def test_adam_resolves_by_longest_span(self):
        # Adam (biblical, bare, six mentions) and Adam Smith (one
        # mention, always with "Smith") resolve via longest-span-first
        # with no location scoping needed.
        for d in self.asset['editions'].values():
            biblical = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                        if m['characterId'] == 'adam-biblical'}
            smith = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                     if m['characterId'] == 'adam-smith'}
            self.assertEqual(biblical, {(1, 15), (1, 45), (2, 23), (9, 7), (10, 16), (18, 20)})
            self.assertEqual(smith, {(1, 79)})

    def test_say_bound_only_at_economist_location(self):
        # "Say" is a common-word collision, not a namesake one: the
        # economist Jean-Baptiste Say (1:79) shares his surname with the
        # ordinary verb "say," capitalized at two sentence-openings
        # (12:1, 18:16). say-economist carries no global alias and must
        # never bind those two unrelated locations.
        for d in self.asset['editions'].values():
            say_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                        if m['characterId'] == 'say-economist'}
            self.assertEqual(say_locs, {(1, 79)})
            for loc in [(12, 1), (18, 16)]:
                at_loc = {m['characterId'] for m in d['mentions']
                          if (m['chapterNumber'], m['paragraphIndex']) == loc}
                self.assertNotIn('say-economist', at_loc)

    def test_atropos_italic_underscores_bind_cleanly(self):
        # "_Atropos_" is printed with markdown-style italic underscores;
        # underscore is a \w character, so the ordinary word-boundary
        # alias regex cannot match it. A dedicated custom-bind rule
        # matches the underscored form directly and binds only the inner
        # word, so the mention text reads "Atropos," not "_Atropos_".
        for d in self.asset['editions'].values():
            matches = [m for m in d['mentions'] if m['characterId'] == 'atropos']
            self.assertEqual(len(matches), 1)
            self.assertEqual(matches[0]['text'], 'Atropos')
            self.assertEqual((matches[0]['chapterNumber'], matches[0]['paragraphIndex']), (4, 10))

    def test_both_editions_agree_on_mention_count(self):
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['mentions']), len(mod['mentions']))
        self.assertEqual(len(orig['characters']), len(mod['characters']))
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'],
                          self.report['editions']['modern-en']['omittedEntities'])


if __name__ == '__main__':
    unittest.main()
