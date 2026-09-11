import hashlib, json, unittest
from build_genealogy_of_morals import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class GenealogyOfMoralsTests(unittest.TestCase):
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

    def test_paul_ree_and_paul_the_apostle_never_collide(self):
        # Rée is bound only through "Dr. Paul Rée" / "Dr. Rée"; the apostle only
        # through "Paul the tent-maker". A bare "Paul" never occurs in either
        # edition, so no mention text should ever be exactly "Paul".
        for d in self.asset['editions'].values():
            texts = {m['characterId']: set() for m in d['mentions']}
            for m in d['mentions']:
                texts[m['characterId']].add(m['text'])
            self.assertNotIn('Paul', texts.get('paul-ree', set()))
            self.assertNotIn('Paul', texts.get('paul-apostle', set()))
            self.assertEqual(texts['paul-apostle'], {'Paul the tent-maker'})
            self.assertTrue(texts['paul-ree'] <= {'Dr. Paul Rée', 'Dr. Rée'})

    def test_peter_and_jesus_spread_across_both_essays(self):
        # Peter is named once in the First Essay (2:35, "Peter the fisher")
        # and once, unqualified, in the Third Essay (4:32, "An immortal
        # Peter!"). Both are the same apostle -- not a namesake collision.
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'peter'}
            self.assertEqual(locs, {(2, 35), (4, 32)})
            jesus_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'jesus'}
            self.assertEqual(jesus_texts, {'Jesus of Nazareth', 'Jesus', 'Christ'})

    def test_zarathustra_is_not_the_book_title(self):
        # "my Zarathustra" (1:9) and the "Thus Spake Zarathustra" epigraph
        # attribution (4:0) both name Nietzsche's own book, not a person --
        # a work named after its protagonist. Only 3:31's "open alone to
        # Zarathustra, Zarathustra the godless" invokes him as a distinct
        # voice, and that is the only location bound to this entity.
        for d in self.asset['editions'].values():
            locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'zarathustra'}
            self.assertEqual(locs, {(3, 31)})
            self.assertEqual(sum(1 for m in d['mentions'] if m['characterId'] == 'zarathustra'), 2)

    def test_zeus_is_nietzsches_own_greek_reference_only(self):
        # "Zeus" (3:19, 3:26) is Nietzsche's own English-language invocation
        # of the Greek god. The Latin "ipso Jove" inside the quoted Tertullian
        # passage (2:33) is a different author's rhetorical reference in a
        # different language, deliberately left unbound -- see README. No
        # mention text should ever be "Jove".
        for d in self.asset['editions'].values():
            self.assertFalse(any(m['text'] == 'Jove' for m in d['mentions']))
            zeus_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'zeus'}
            self.assertEqual(zeus_locs, {(3, 19), (3, 26)})

    def test_no_mention_leaks_into_an_adjective(self):
        # The alias matcher is word-boundary safe: "Homeric", "Wagnerian",
        # "Schopenhauerian", "Lutherian" and "Anacreontic" must never be
        # captured as mentions of Homer, Wagner, Schopenhauer, Luther or
        # Anacreon.
        forbidden = {'Homeric', 'Wagnerian', 'Schopenhauerian', 'Lutherian', 'Anacreontic'}
        for d in self.asset['editions'].values():
            self.assertFalse(any(m['text'] in forbidden for m in d['mentions']))

    def test_sir_christopher_deliberately_unbound(self):
        # "the authority of Sir Christopher in Shakespeare" (4:23) could not
        # be pinned to one identifiable Shakespeare character from the text
        # alone, so it carries no entity and is recorded in the README rather
        # than guessed.
        for d in self.asset['editions'].values():
            self.assertFalse(any(m['text'] == 'Sir Christopher' for m in d['mentions']))
            self.assertFalse(any(c['id'] == 'sir-christopher' for c in d['characters']))

    def test_no_invented_outcomes_or_missing_reference_entries(self):
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 72)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)
            self.assertEqual(self.report['authoredEntries'], 72)

    def test_major_entries_are_schopenhauer_and_wagner_only(self):
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, {'schopenhauer', 'wagner'})


if __name__ == '__main__':
    unittest.main()
