import hashlib, json, unittest
from build_meditations import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class MeditationsTests(unittest.TestCase):
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
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 109)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_major_entries_are_the_two_sustained_figures(self):
        expected = {'socrates', 'antoninus-pius'}
        for d in self.asset['editions'].values():
            majors = {c['id'] for c in d['characters'] if c['storyRole'] == 'major'}
            self.assertEqual(majors, expected)

    def test_supporting_entries_are_the_eleven_book1_teachers(self):
        expected = {
            'verus-grandfather', 'diognetus', 'rusticus', 'apollonius', 'sextus',
            'alexander-grammarian', 'fronto', 'alexander-platonist', 'catulus',
            'severus-brother', 'claudius-maximus',
        }
        for d in self.asset['editions'].values():
            supporting = {c['id'] for c in d['characters'] if c['storyRole'] == 'supporting'}
            self.assertEqual(supporting, expected)

    def test_two_veruses_split_by_location_not_alias(self):
        # "Verus" names Marcus's paternal grandfather (1:0, the book's
        # opening line) and, unrelated, Marcus's own father (8:23, in the
        # "Lucilla buried Verus" couplet). Neither entity carries a global
        # alias for the bare name.
        for d in self.asset['editions'].values():
            grandfather = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                           if m['characterId'] == 'verus-grandfather'}
            father = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                      if m['characterId'] == 'verus-father'}
            self.assertEqual(grandfather, {(1, 0)})
            self.assertEqual(father, {(8, 23)})
            verus_texts = {m['characterId'] for m in d['mentions'] if m['text'] == 'Verus'}
            self.assertEqual(verus_texts, {'verus-grandfather', 'verus-father'})

    def test_two_maximuses_split_by_location_not_alias(self):
        # Claudius Maximus, the Book 1 Stoic teacher, is named in full only
        # once (1:11); the bare form recurs at 1:12 and 1:13 referring back
        # to him. An unrelated household "Maximus" appears once at 8:23,
        # paired with Secunda in the vanitas list of paired deaths.
        for d in self.asset['editions'].values():
            teacher = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                       if m['characterId'] == 'claudius-maximus'}
            household = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                         if m['characterId'] == 'maximus-household'}
            self.assertEqual(teacher, {(1, 11), (1, 12), (1, 13)})
            self.assertEqual(household, {(8, 23)})

    def test_cato_bound_at_1_10_only_scipio_and_4_27_cato_unbound(self):
        # 1:10's "Cato" is unambiguous (grouped with Thrasea, Helvidius,
        # Dio, Brutus -- the standard libertas roll-call) and is bound.
        # 4:27's bare "Cato" and "Scipio" sit in an undifferentiated list
        # of once-famous, now-forgotten Roman names with no distinguishing
        # epithet; neither has any scholarly consensus on which historical
        # figure is meant, so both stay unbound rather than guessed.
        for d in self.asset['editions'].values():
            cato_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                         if m['characterId'] == 'cato-the-younger'}
            self.assertEqual(cato_locs, {(1, 10)})
            at_4_27 = {m['characterId'] for m in d['mentions']
                       if (m['chapterNumber'], m['paragraphIndex']) == (4, 27)}
            self.assertNotIn('cato-the-younger', at_4_27)
            self.assertFalse(any(cid.startswith('scipio') for cid in at_4_27))
            texts_4_27 = {m['text'] for m in d['mentions']
                          if (m['chapterNumber'], m['paragraphIndex']) == (4, 27)}
            self.assertNotIn('Cato', texts_4_27)
            self.assertNotIn('Scipio', texts_4_27)

    def test_severus_bound_at_1_10_only_10_29_severus_unbound(self):
        # 1:10's "brother Severus" is bound. A second, unrelated bare
        # "Severus" in Book 10's private list of namesakes (10:29) has
        # nothing in its context tying it back to that figure and stays
        # unbound.
        for d in self.asset['editions'].values():
            severus_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                            if m['characterId'] == 'severus-brother'}
            self.assertEqual(severus_locs, {(1, 10)})
            texts_10_29 = {m['text'] for m in d['mentions']
                           if (m['chapterNumber'], m['paragraphIndex']) == (10, 29)}
            self.assertNotIn('Severus', texts_10_29)

    def test_marcus_self_references_to_antoninus_stay_unbound(self):
        # Bare "Antoninus" is Marcus referring to himself at 6:22 (spelling
        # out his own name letter by letter) and 6:35 ("my city and
        # country, as I am Antoninus, is Rome"). Per editorial policy, the
        # author of a treatise is not cast as a character, so neither self-
        # reference binds to any entity. The one bare "Antoninus" that does
        # bind is the backward reference to his father within 8:23's
        # "Antoninus Pius ... then Antoninus himself."
        for d in self.asset['editions'].values():
            for loc in [(6, 22), (6, 35)]:
                at_loc = [m for m in d['mentions']
                          if (m['chapterNumber'], m['paragraphIndex']) == loc]
                self.assertEqual(at_loc, [])
            antoninus_locs = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                              if m['characterId'] == 'antoninus-pius'}
            self.assertEqual(antoninus_locs, {(4, 27), (6, 26), (8, 23), (10, 25)})
            bare_at_8_23 = [m for m in d['mentions']
                            if (m['chapterNumber'], m['paragraphIndex']) == (8, 23)
                            and m['text'] == 'Antoninus']
            self.assertEqual(len(bare_at_8_23), 1)
            self.assertEqual(bare_at_8_23[0]['characterId'], 'antoninus-pius')

    def test_two_alexanders_named_teachers_resolve_by_longest_span(self):
        # "Alexander the Grammarian" (1:6) and "Alexander the Platonic"/
        # "the Platonist" (1:8) are two named teachers, each always paired
        # with a distinguishing epithet. Every other bare "Alexander" is
        # Alexander the Great. All three resolve through plain global
        # aliases and longest-span-first, with no location-scoped bind()
        # needed.
        for d in self.asset['editions'].values():
            grammarian = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                          if m['characterId'] == 'alexander-grammarian'}
            platonist = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                         if m['characterId'] == 'alexander-platonist'}
            great = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                     if m['characterId'] == 'alexander-the-great'}
            self.assertEqual(grammarian, {(1, 6)})
            self.assertEqual(platonist, {(1, 8)})
            self.assertEqual(great, {(3, 2), (6, 21), (8, 2), (9, 27), (10, 25)})
            # no leftover, unbound "Alexander" span anywhere
            for m in d['mentions']:
                if 'Alexander' in m['text']:
                    self.assertIn(m['characterId'],
                                  {'alexander-grammarian', 'alexander-platonist', 'alexander-the-great'})

    def test_two_demetriuses_resolve_by_epithet_alias(self):
        # "Demetrius the Platonic" (8:23) and "Demetrius Phalereus" (9:27)
        # are different people; each always carries its own distinguishing
        # epithet in the text, so plain global aliases suffice.
        for d in self.asset['editions'].values():
            platonic = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                        if m['characterId'] == 'demetrius-the-platonic'}
            phalereus = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                         if m['characterId'] == 'demetrius-phalereus'}
            self.assertEqual(platonic, {(8, 23)})
            self.assertEqual(phalereus, {(9, 27)})

    def test_two_fabiuses_resolve_by_longest_span(self):
        # Bare "Fabius" (4:41, an unidentified name in a vanitas list) and
        # "Fabius Catulinus" (12:19, a distinct Book 12 figure) resolve
        # cleanly via longest-span-first -- no location scoping needed.
        for d in self.asset['editions'].values():
            obscure = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                       if m['characterId'] == 'fabius-obscure'}
            catulinus = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions']
                         if m['characterId'] == 'fabius-catulinus'}
            self.assertEqual(obscure, {(4, 41)})
            self.assertEqual(catulinus, {(12, 19)})

    def test_diacritic_and_ligature_spelling_variants_bind_both_editions(self):
        # original-en (a Gutenberg-sourced older translation) renders
        # several names with ae/oe ligatures that modern-en spells out in
        # full; both spellings must resolve to the same entity in each
        # edition.
        original = self.asset['editions']['original-en']['mentions']
        modern = self.asset['editions']['modern-en']['mentions']
        for text, cid in [('Crœsus', 'croesus'), ('Mæcenas', 'maecenas'),
                           ('Cæso', 'caeso'), ('Phœbus', 'phoebus'),
                           ('Cadiciant', 'cadicianus')]:
            self.assertTrue(any(m['text'] == text and m['characterId'] == cid for m in original),
                             f'missing original-en mention {text!r} for {cid}')
        for text, cid in [('Croesus', 'croesus'), ('Maecenas', 'maecenas'),
                           ('Caeso', 'caeso'), ('Phoebus', 'phoebus'),
                           ('Cadicianus', 'cadicianus')]:
            self.assertTrue(any(m['text'] == text and m['characterId'] == cid for m in modern),
                             f'missing modern-en mention {text!r} for {cid}')

    def test_both_editions_agree_on_mention_count(self):
        # Unlike some Lane A books, both English editions here render every
        # name identically enough that no entity is omitted from either.
        orig = self.asset['editions']['original-en']
        mod = self.asset['editions']['modern-en']
        self.assertEqual(len(orig['mentions']), len(mod['mentions']))
        self.assertEqual(len(orig['characters']), len(mod['characters']))


if __name__ == '__main__':
    unittest.main()
