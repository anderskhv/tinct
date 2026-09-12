import hashlib, json, unittest
from build_confessions import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class ConfessionsTests(unittest.TestCase):
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
        # Augustine, the narrator, is never named in the running text (he
        # addresses "Thou" throughout) and carries no bindable alias, so he
        # is the one entity omitted in both editions -- 72 of 73 authored
        # entities have at least one bound mention.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 72)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], ['augustine'])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_augustine_never_bound(self):
        for d in self.asset['editions'].values():
            ids = {m['characterId'] for m in d['mentions']}
            self.assertNotIn('augustine', ids)
            self.assertFalse(any(m['text'] == 'Augustine' for m in d['mentions']))

    def test_major_entries_are_the_four_sustained_figures(self):
        expected = {'monnica', 'alypius', 'nebridius', 'ambrose'}
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, expected)

    def test_supporting_entries_are_the_six_named(self):
        expected = {
            'patricius', 'adeodatus', 'simplicianus', 'victorinus',
            'pontitianus', 'faustus',
        }
        for d in self.asset['editions'].values():
            supporting = {c['id'] for c in d['characters'] if c['storyRole'] == 'supporting'}
            self.assertEqual(supporting, expected)

    def test_paul_saul_paulus_distinct_by_spelling_not_location(self):
        # "Paul"/"Saul" (the apostle) and "Paulus" (Sergius Paulus, the
        # converting proconsul) both occur within the same paragraph
        # (8:10), but resolve to different entities purely because the
        # strings never overlap under word-boundary-safe matching -- the
        # "-us" ending of "Paulus" breaks the boundary before bare "Paul"
        # could match inside it. No location-scoped bind() is used or
        # needed anywhere in this package.
        for d in self.asset['editions'].values():
            paul = {(m['chapterNumber'], m['paragraphIndex'], m['text']) for m in d['mentions']
                    if m['characterId'] == 'paul'}
            paulus = {(m['chapterNumber'], m['paragraphIndex'], m['text']) for m in d['mentions']
                      if m['characterId'] == 'paulus-proconsul'}
            self.assertEqual(paul, {
                (7, 26, 'Paul'), (8, 10, 'Paul'), (8, 10, 'Saul'),
                (8, 14, 'Paul'), (13, 36, 'Paul'), (13, 38, 'Paul'),
            })
            self.assertEqual(paulus, {(8, 10, 'Paulus')})

    def test_jove_alias_covers_both_names(self):
        # "Jove" and "Jupiter" name the same god; both spellings are
        # authored as aliases on a single entity.
        for d in self.asset['editions'].values():
            texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'jove'}
            self.assertIn('Jove', texts)
            self.assertIn('Jupiter', texts)

    def test_cicero_tully_alias_covers_both_names(self):
        for d in self.asset['editions'].values():
            texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'cicero'}
            self.assertIn('Cicero', texts)
            self.assertIn('Tully', texts)

    def test_no_bind_override_needed(self):
        # Unlike Aristotle's Politics or Meditations, this package uses
        # reviewed_aliases.bind directly with no book-specific overrides --
        # there are no genuine namesake collisions requiring one.
        import build_confessions
        from reviewed_aliases import bind as exact
        self.assertIs(build_confessions.bind, exact)

    def test_hortensius_and_generic_sect_names_not_bound(self):
        # "Hortensius" is the title of Cicero's dialogue, not a person, and
        # must never be bound. Generic sect/demonym collectives (Manichees,
        # Catholics, Platonists, Academics, Arians, Christians, Gentiles)
        # are excluded as non-persons per the editorial policy's "person or
        # not" check and must never appear as bound mention text.
        excluded_texts = {
            'Hortensius', 'Manichees', 'Manichee', 'Manichaean',
            'Catholic', 'Catholics', 'Platonists', 'Academics',
            'Academicians', 'Arians', 'Christians', 'Gentiles',
        }
        for d in self.asset['editions'].values():
            bound_texts = {m['text'] for m in d['mentions']}
            self.assertEqual(bound_texts & excluded_texts, set())

    def test_both_editions_agree_on_mention_count(self):
        # This translation shows no apparatus contamination or divergence
        # between editions, unlike Aristotle's Politics.
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['mentions']), len(mod['mentions']))
        self.assertEqual(len(orig['characters']), len(mod['characters']))
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'],
                          self.report['editions']['modern-en']['omittedEntities'])

    def test_kind_taxonomy_counts(self):
        # 18 biblical/scriptural persons (kind religious-figure), 8 pagan
        # deities (cultural-figure), 7 non-divine classical/literary
        # figures (literary-figure), the remaining 39 plain person.
        for d in self.asset['editions'].values():
            kinds = {}
            for c in d['characters']:
                kinds[c.get('kind', 'person')] = kinds.get(c.get('kind', 'person'), 0) + 1
            self.assertEqual(kinds, {
                'person': 39, 'religious-figure': 18,
                'cultural-figure': 8, 'literary-figure': 7,
            })


if __name__ == '__main__':
    unittest.main()
