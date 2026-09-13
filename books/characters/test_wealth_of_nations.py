import hashlib, json, unittest
from build_wealth_of_nations import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class WealthOfNationsTests(unittest.TestCase):
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
        # 176 of 176 authored entries bind in both editions, zero
        # omissions -- every archaic spelling that modern-en
        # modernizes was found and given a matching alias.
        for ed, d in self.asset['editions'].items():
            self.assertEqual(len(d['characters']), 176)
            self.assertEqual(self.report['editions'][ed]['omittedEntities'], [])
            for c in d['characters']:
                self.assertEqual(len(c['snapshots']), 1)

    def test_every_entity_is_reference(self):
        # An economic treatise with no narrative or staged dialogue of
        # its own -- every cited figure stays Reference per editorial
        # policy's treatise guidance.
        for d in self.asset['editions'].values():
            roles = {c['storyRole'] for c in d['characters']}
            self.assertEqual(roles, {'reference'})

    def test_zeno_of_citium_vs_zeno_of_elea(self):
        # Both appear in the same paragraph (30, 179), each carrying
        # its own city-epithet; neither is a bare "Zeno".
        for d in self.asset['editions'].values():
            citium = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'zeno-citium'}
            elea = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'zeno-elea'}
            self.assertEqual(citium, {(30, 179)})
            self.assertEqual(elea, {(30, 179)})

    def test_king_john_of_england_vs_france(self):
        for d in self.asset['editions'].values():
            england = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'king-john-england'}
            france = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'king-john-france'}
            self.assertEqual(england, {(19, 9)})
            self.assertEqual(france, {(32, 68)})

    def test_louis_the_fat_vs_louis_xiv(self):
        for d in self.asset['editions'].values():
            fat = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'louis-vi'}
            xiv = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'louis-xiv'}
            self.assertEqual(fat, {(19, 9)})
            self.assertEqual(xiv, {(29, 3)})

    def test_three_distinct_roberts(self):
        # Robert Bruce, Robert II of France, and Sir Robert Walpole
        # never collide; there is no bare "Robert" entity.
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            self.assertIn('robert-bruce', ids)
            self.assertIn('robert-ii-france', ids)
            self.assertIn('robert-walpole', ids)
            bruce = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'robert-bruce'}
            france = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'robert-ii-france'}
            walpole = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'robert-walpole'}
            self.assertEqual(bruce, {(4, 9)})
            self.assertEqual(france, {(30, 225)})
            self.assertEqual(walpole, {(31, 193)})

    def test_vasco_da_gama_vs_vasco_nunez_de_balboa(self):
        for d in self.asset['editions'].values():
            gama = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'vasco-da-gama'}
            balboa = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'vasco-nunez-de-balboa'}
            self.assertEqual(gama, {(27, 7), (27, 8)})
            self.assertEqual(balboa, {(27, 18)})

    def test_raleigh_misprint_kept_as_printed_and_aliased(self):
        # Original-en prints "Waiter Raleigh" (a likely compositor
        # misprint for "Walter"); modern-en corrects it. Both bind to
        # the one entity via distinct spelling aliases.
        orig_texts = {m['text'] for m in self.asset['editions']['original-en']['mentions'] if m['characterId'] == 'walter-raleigh'}
        mod_texts = {m['text'] for m in self.asset['editions']['modern-en']['mentions'] if m['characterId'] == 'walter-raleigh'}
        self.assertTrue(all('Waiter' in t for t in orig_texts))
        self.assertTrue(all('Walter' in t for t in mod_texts))

    def test_john_smith_wool_distinct_from_adam_smith(self):
        # "Rev. John Smith" (author of the Memoirs of Wool) is a real,
        # distinct historical person from Adam Smith himself; the
        # entity id and body make that explicit and no entity claims
        # to be the treatise's own author.
        ids = {e['id'] for e in json.loads((BASE / 'editorial.json').read_text())['entities']}
        self.assertIn('john-smith-wool', ids)
        self.assertNotIn('adam-smith', ids)


if __name__ == '__main__':
    unittest.main()
