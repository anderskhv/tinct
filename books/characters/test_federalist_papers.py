import hashlib, json, unittest
from build_federalist_papers import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class FederalistPapersTests(unittest.TestCase):
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
        # 80 of 80 authored entries bind in both editions, one snapshot each.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 80)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_every_entity_is_reference(self):
        # A political-essay treatise with no narrative or staged dialogue
        # of its own -- every cited authority, founder, or named body
        # stays Reference per editorial policy's treatise guidance.
        for d in self.asset['editions'].values():
            roles = {c['storyRole'] for c in d['characters']}
            self.assertEqual(roles, {'reference'})

    def test_named_bodies_are_kind_group(self):
        for d in self.asset['editions'].values():
            byid = {c['id']: c for c in d['characters']}
            for gid in ['ephori', 'tribunes-rome', 'cosmi-crete', 'decemvirs']:
                self.assertEqual(byid[gid]['kind'], 'group')

    def test_publius_hamilton_madison_are_distinct_entities(self):
        # PUBLIUS is the shared pen name (11, 14); HAMILTON and MADISON
        # are separately bound from the literal "MADISON, with HAMILTON"
        # byline that opens essays No. 18-20 (18:0, 19:0, 20:0) -- three
        # distinct entities, none of which merge.
        for d in self.asset['editions'].values():
            pub = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'publius']
            ham = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'hamilton']
            mad = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'madison']
            self.assertEqual(pub, [(11, 14)])
            self.assertEqual(sorted(ham), [(18, 0), (19, 0), (20, 0)])
            self.assertEqual(sorted(mad), [(18, 0), (19, 0), (20, 0)])

    def test_only_the_roman_brutus_is_bound(self):
        # The automation queue flags this book's genre for a Brutus
        # collision (Roman consul vs. the Anti-Federalist pen name).
        # Only one Brutus is ever named in the body text, and it is the
        # Roman one (38, 1); no second "Brutus" entity exists.
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            self.assertIn('brutus-roman', ids)
            self.assertNotIn('brutus-anti-federalist', ids)
            locs = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'brutus-roman']
            self.assertEqual(locs, [(38, 1)])

    def test_marlborough_namesake_pair_stays_distinct(self):
        # The Duchess of Marlborough (footnote 7, No. 6) and the Duke of
        # Marlborough (footnote 10, No. 6) are two different real people
        # sharing a surname -- a genuine namesake pair, found while
        # reading rather than flagged in advance. Confirm they bind to
        # different entities at different locations and never collide.
        for d in self.asset['editions'].values():
            duchess = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'duchess-of-marlborough']
            duke = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'duke-of-marlborough']
            self.assertEqual(duchess, [(6, 24)])
            self.assertEqual(duke, [(6, 27)])

    def test_pseudonymous_critics_bind_under_their_pen_names(self):
        # CATO, the federal farmer, and TAMONY are cited only by pen
        # name in the source; bound as reference entities under those
        # names without asserting a disputed real identity.
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            for pid in ['cato-pseudonym', 'federal-farmer', 'tamony']:
                self.assertIn(pid, ids)

    def test_necker_spelling_variant_resolves_to_one_entity(self):
        orig_texts = {m['text'] for m in self.asset['editions']['original-en']['mentions'] if m['characterId'] == 'necker'}
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions'] if m['characterId'] == 'necker'}
        self.assertEqual(orig_texts, {'Neckar'})
        self.assertEqual(mod_texts, {'Necker'})

    def test_cleomenes_mention_count_variance_is_paraphrase_not_omission(self):
        # modern-en names Cleomenes explicitly a second time within
        # (18, 18) where original-en uses the pronoun "who" at the same
        # location -- a legitimate paraphrase giving modern-en one extra
        # genuine mention, not an omission on either side.
        orig_locs = [(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['original-en']['mentions']
                     if m['characterId'] == 'cleomenes']
        mod_locs = [(m['chapterNumber'], m['paragraphIndex']) for m in self.asset['editions']['modern-en']['mentions']
                    if m['characterId'] == 'cleomenes']
        self.assertEqual(len(orig_locs), 3)
        self.assertEqual(len(mod_locs), 4)
        self.assertEqual(mod_locs.count((18, 18)), 2)
        self.assertEqual(orig_locs.count((18, 18)), 1)

    def test_both_editions_bind_every_entity(self):
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['characters']), len(mod['characters']))
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'], [])
        self.assertEqual(self.report['editions']['modern-en']['omittedEntities'], [])


if __name__ == '__main__':
    unittest.main()
