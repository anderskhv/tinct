import hashlib, json, unittest
from build_democracy_in_america import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class DemocracyInAmericaTests(unittest.TestCase):
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

    def test_both_editions_bind_every_entity(self):
        # 86 of 86 authored entries bind in both editions, zero
        # omissions -- every original-en spelling that modern-en
        # modernizes (Sylla/Sulla, Labruyere/Labruyère,
        # Moliere/Molière, Sevigne/Sévigné) was found and given a
        # matching alias.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 86)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_every_entity_is_reference(self):
        # A work of political and social analysis with no narrative
        # cast of its own -- every cited figure stays Reference per
        # editorial policy's treatise guidance.
        for d in self.asset['editions'].values():
            roles = {c['storyRole'] for c in d['characters']}
            self.assertEqual(roles, {'reference'})

    def test_washington_person_dominant_over_city(self):
        # Bare "Washington" binds to George Washington the person
        # (14 occurrences) rather than splitting off the 4 occurrences
        # that name the city -- an accepted, documented imprecision;
        # no separate city entity competes for the bind.
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'george-washington'}
            self.assertEqual(len(locs), 14)
            self.assertIn((9, 3), locs)
            # the four place-only paragraphs are still bound here
            self.assertIn((14, 20), locs)
            self.assertIn((19, 256), locs)
            self.assertIn((19, 258), locs)
            self.assertIn((19, 265), locs)
            ids = {c['id'] for c in d['characters']}
            self.assertNotIn('washington-dc', ids)

    def test_philip_of_macedon_never_collides_with_metacom(self):
        # Metacom ("King Philip" to the English) is only ever named
        # "Metacom" in this book -- never "Philip" -- so the one bare
        # "Philip" mention is unambiguously Philip of Macedon, and
        # neither entity's aliases overlap the other's name.
        for d in self.asset['editions'].values():
            philip = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'philip-of-macedon'}
            self.assertEqual(philip, {(9, 187)})
            metacom_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'metacom'}
            self.assertTrue(metacom_texts)
            self.assertTrue(all('Philip' not in t for t in metacom_texts))
        entities = {e['id']: e for e in json.loads((BASE / 'editorial.json').read_text())['entities']}
        self.assertNotIn('Philip', entities['metacom']['aliases'])

    def test_jacques_louis_david_distinct_from_biblical_king_david(self):
        # The one "David" in this book is the Neoclassical painter,
        # contrasted with Raphael; the biblical king is never
        # separately named.
        for d in self.asset['editions'].values():
            david = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'jacques-louis-david'}
            self.assertEqual(david, {(32, 11)})
            ids = {c['id'] for c in d['characters']}
            self.assertNotIn('king-david', ids)

    def test_peter_and_francis_are_river_fragments_not_people(self):
        # "the St. Peter's, the St. Francis" (2, 4) names two rivers;
        # no entity is bound at that paragraph.
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']}
            self.assertNotIn((2, 4), locs)

    def test_chester_is_a_place_not_a_person(self):
        # "the county of Chester (State of New York)" -- a place name;
        # no entity is bound at either paragraph naming it.
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']}
            self.assertNotIn((18, 68), locs)
            self.assertNotIn((18, 69), locs)

    def test_bare_caesar_left_unbound(self):
        # Both occurrences of "Caesar" are a generic nickname/byword
        # for seizing power, never a specific narrative reference --
        # left unbound throughout.
        ids = {e['id'] for e in json.loads((BASE / 'editorial.json').read_text())['entities']}
        self.assertFalse(any('caesar' in i for i in ids))

    def test_sulla_printed_as_sylla_aliased_to_modern_spelling(self):
        # Original-en prints "Sylla"; modern-en modernizes to "Sulla".
        orig_texts = {m['text'] for m in self.asset['editions']['original-en']['mentions'] if m['characterId'] == 'sulla'}
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions'] if m['characterId'] == 'sulla'}
        self.assertEqual(orig_texts, {'Sylla'})
        self.assertEqual(mod_texts, {'Sulla'})


if __name__ == '__main__':
    unittest.main()
