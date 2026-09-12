import hashlib, json, unittest
from build_imitation_of_christ import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class ImitationOfChristTests(unittest.TestCase):
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
        # No entity is omitted from either edition: 27 of 27 authored
        # entries bound in each, one snapshot each.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 27)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_central_and_major_entries(self):
        for d in self.asset['editions'].values():
            central = {c['id'] for c in d['characters'] if c['storyRole'] == 'central'}
            major = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(central, {'christ'})
            self.assertEqual(major, {'the-disciple'})

    def test_bible_book_named_entities_never_bind_inside_footnote_citations(self):
        # 76 of 774 paragraphs per edition are dedicated scripture-
        # citation strings (e.g. "(1) Job vii. 1 (Vulg.)."). Every
        # Bible-book-named entity (David, Solomon, Noah, Joshua, Samuel,
        # Moses, Job, Luke, John the Baptist, Paul, Peter) is bound only
        # at its location-scoped prose mention(s), confirmed here against
        # every mention in the book, not a sample.
        expected = {
            'john-baptist': {(101, 2), (113, 4)},
            'job-person': {(34, 5)},
            'luke-evangelist': {(19, 7)},
            'moses': {(39, 1), (39, 3), (75, 2), (97, 5)},
            'samuel-prophet': {(39, 1)},
            'solomon': {(97, 5)},
            'noah': {(97, 5)},
            'joshua': {(75, 2)},
            'david': {(97, 9)},
            'paul-apostle': {(13, 9), (31, 4), (37, 12), (73, 1)},
            'peter-apostle': {(90, 1)},
        }
        for d in self.asset['editions'].values():
            for cid, locs in expected.items():
                actual = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                          if m['characterId'] == cid}
                self.assertEqual(actual, locs, cid)

    def test_footnote_citation_paragraphs_never_bind_a_person(self):
        # A footnote-citation paragraph (starting "(1)") never yields a
        # mention for any of the Bible-book-named entities above, even
        # though several of those citations name the very same books
        # (e.g. "1 Samuel," "1 Peter") that elsewhere name a real person.
        import re
        for ed_name, d in self.asset['editions'].items():
            import json as _json
            raw = _json.loads((ROOT / d['sourcePath']).read_bytes())
            footnote_locs = {(c['number'], i) for c in raw['chapters']
                              for i, p in enumerate(c['paragraphs']) if re.match(r'^\(1\)', p.strip())}
            self.assertEqual(len(footnote_locs), 76)
            person_ids = {'john-baptist', 'job-person', 'luke-evangelist', 'moses',
                          'samuel-prophet', 'solomon', 'noah', 'joshua', 'david',
                          'paul-apostle', 'peter-apostle'}
            for m in d['mentions']:
                if m['characterId'] in person_ids:
                    self.assertNotIn((m['chapterNumber'], m['paragraphIndex']), footnote_locs)

    def test_mary_magdalene_and_virgin_mary_resolve_by_longest_span(self):
        for d in self.asset['editions'].values():
            magdalene = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                         if m['characterId'] == 'mary-magdalene'}
            virgin = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                      if m['characterId'] == 'virgin-mary'}
            self.assertEqual(magdalene, {(33, 1), (70, 2)})
            self.assertEqual(virgin, {(113, 3)})

    def test_holy_spirit_binds_both_edition_phrasings(self):
        # original-en's "Holy Ghost" is modern-en's "Holy Spirit"
        # throughout; both are aliased so the entity binds in both
        # editions with no omission.
        orig_texts = {m['text'] for m in self.asset['editions']['original-en']['mentions']
                      if m['characterId'] == 'holy-spirit'}
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions']
                     if m['characterId'] == 'holy-spirit'}
        self.assertIn('Holy Ghost', orig_texts)
        self.assertIn('Holy Spirit', mod_texts)
        self.assertNotIn('Holy Ghost', mod_texts)

    def test_both_editions_bind_every_entity(self):
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['characters']), len(mod['characters']))
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'], [])
        self.assertEqual(self.report['editions']['modern-en']['omittedEntities'], [])


if __name__ == '__main__':
    unittest.main()
