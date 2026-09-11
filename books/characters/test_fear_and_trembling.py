import hashlib, json, unittest
from build_fear_and_trembling import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class FearAndTremblingTests(unittest.TestCase):
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

    def test_two_sarahs_split_exactly_at_the_tobit_digression(self):
        # Abraham's wife everywhere except 7:40-7:46 (the Book of Tobit
        # digression), where "Sarah" names a wholly different person: the
        # daughter of Raguel and Edna. 7:41 and 7:45 contain no "Sarah" at
        # all, so the boundary set need not include them.
        tobit_paras = {40, 42, 43, 44, 46}
        for d in self.asset['editions'].values():
            for m in d['mentions']:
                if m['characterId'] not in ('sarah', 'sarah-tobit'):
                    continue
                self.assertEqual(m['text'], 'Sarah')
                in_tobit_range = m['chapterNumber'] == 7 and m['paragraphIndex'] in tobit_paras
                expected = 'sarah-tobit' if in_tobit_range else 'sarah'
                self.assertEqual(m['characterId'], expected,
                                  f"{m['chapterNumber']}:{m['paragraphIndex']} bound to {m['characterId']}")
            # Both Sarahs are actually present in both editions.
            ids = {m['characterId'] for m in d['mentions']}
            self.assertIn('sarah', ids)
            self.assertIn('sarah-tobit', ids)

    def test_sarah_boundary_paragraphs_bind_abrahams_wife(self):
        # 7:60 and 7:68 are back in the Abraham frame narrative, immediately
        # after and long after the Tobit digression -- not part of it.
        for d in self.asset['editions'].values():
            for ch, pi in [(7, 60), (7, 68), (2, 4), (3, 3), (6, 20)]:
                ms = [m for m in d['mentions'] if m['characterId'] == 'sarah' and (m['chapterNumber'], m['paragraphIndex']) == (ch, pi)]
                self.assertTrue(ms, f'expected sarah at {ch}:{pi}')

    def test_edition_specific_spellings_still_bind(self):
        # original-en: Cartesius, Johannes de silentio, Gloster; modern-en:
        # Descartes, Johannes de Silentio, Gloucester. Neither is a
        # namesake -- just an edition-specific spelling of the same entity.
        for d in self.asset['editions'].values():
            self.assertTrue(any(m['characterId'] == 'cartesius' for m in d['mentions']))
            self.assertTrue(any(m['characterId'] == 'johannes-de-silentio' for m in d['mentions']))
            self.assertTrue(any(m['characterId'] == 'gloster' for m in d['mentions']))
        original = self.asset['editions']['original-en']['mentions']
        modern = self.asset['editions']['modern-en']['mentions']
        self.assertTrue(any(m['text'] == 'Cartesius' for m in original))
        self.assertFalse(any(m['text'] == 'Cartesius' for m in modern))
        self.assertTrue(any(m['text'] == 'Descartes' for m in modern))
        self.assertTrue(any(m['text'] == 'Johannes de silentio' for m in original))
        self.assertTrue(any(m['text'] == 'Johannes de Silentio' for m in modern))
        self.assertTrue(any(m['text'] == 'Gloster' for m in original))
        self.assertTrue(any(m['text'] == 'Gloucester' for m in modern))

    def test_cain_is_not_confused_with_isaac_or_abraham(self):
        # "for Cain and Abraham are not identical" (6:15) distinguishes
        # Abraham (who loves Isaac) from Cain (who hated Abel); it is not a
        # scribal slip for "Cain and Abel."
        for d in self.asset['editions'].values():
            cain = [m for m in d['mentions'] if m['characterId'] == 'cain']
            self.assertEqual(len(cain), 1)
            self.assertEqual((cain[0]['chapterNumber'], cain[0]['paragraphIndex']), (6, 15))

    def test_kildevalle_deliberately_unbound(self):
        for d in self.asset['editions'].values():
            self.assertFalse(any(m['text'] == 'Kildevalle' for m in d['mentions']))
            self.assertFalse(any(c['id'] == 'kildevalle' for c in d['characters']))

    def test_no_mention_leaks_into_an_adjective(self):
        forbidden = {'Hegelian', 'Socratic', 'Homeric', 'Aristotelian', 'Platonic', 'Faustian'}
        for d in self.asset['editions'].values():
            self.assertFalse(any(m['text'] in forbidden for m in d['mentions']))

    def test_no_invented_outcomes_or_missing_reference_entries(self):
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 68)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_abraham_is_the_only_central_entry(self):
        for d in self.asset['editions'].values():
            central = {c['id'] for c in d['characters'] if c['storyRole'] == 'central'}
            self.assertEqual(central, {'abraham'})


if __name__ == '__main__':
    unittest.main()
