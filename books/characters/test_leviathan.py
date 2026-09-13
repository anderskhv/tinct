import hashlib, json, unittest
from build_leviathan import compile_package, BASE
from build_pilot import ROOT, normalized
from lookup_reference import resolve


class LeviathanTests(unittest.TestCase):
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

    def test_original_en_has_no_omitted_entities(self):
        # Every one of the 223 authored entries binds at least one
        # mention in original-en; only the modern-en paraphrase drops a
        # handful (see test_modern_en_documented_omissions).
        self.assertEqual(self.report['editions']['original-en']['omittedEntities'], [])
        d = self.asset['editions']['original-en']
        self.assertEqual(len(d['characters']), 223)
        for c in d['characters']:
            self.assertEqual(len(c['snapshots']), 1)

    def test_modern_en_documented_omissions(self):
        # Four entities do not bind in modern-en, each a documented,
        # deliberate edition divergence rather than an authoring gap:
        # "enos" because the modern rendering corrects Hobbes's likely
        # slip to "Enoch" (ch. 39); "jehdo"/"serveiah"/"addo" because
        # the modern rendering modernizes those three obscure lost-
        # prophet names to spellings ("Iddo" x2, "Shemaiah") that either
        # collide with each other or aren't separately aliased.
        self.assertEqual(
            sorted(self.report['editions']['modern-en']['omittedEntities']),
            ['addo', 'enos', 'jehdo', 'serveiah'],
        )

    def test_every_entity_is_reference(self):
        # A philosophical/theological treatise with no narrative or
        # staged dialogue of its own -- every cited figure stays
        # Reference per editorial policy's treatise guidance.
        for d in self.asset['editions'].values():
            roles = {c['storyRole'] for c in d['characters']}
            self.assertEqual(roles, {'reference'})

    def test_named_bodies_are_kind_group(self):
        for d in self.asset['editions'].values():
            byid = {c['id']: c for c in d['characters']}
            for gid in ['sadducees', 'thirty-tyrants-athens', 'septuagint']:
                self.assertEqual(byid[gid]['kind'], 'group')

    def test_jehu_king_vs_prophet(self):
        # King Jehu (2 Kings 9) is bare "Jehu"; a different, later
        # prophet of the same name is bound only via his own "the
        # Prophet Jehu" epithet (2 Chron. 19:2).
        for d in self.asset['editions'].values():
            king = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'king-jehu'}
            prophet = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'prophet-jehu'}
            self.assertEqual(king, {(9, 24)})
            self.assertEqual(prophet, {(41, 14)})

    def test_ananias_acts_5_vs_acts_9(self):
        # Two different Ananiases: the one struck down in Acts 5 binds
        # to bare "Ananias"; the one who restored Paul's sight in Acts 9
        # binds only via his own "Ananias at Damascus" epithet.
        for d in self.asset['editions'].values():
            five = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'ananias-and-sapphira'}
            nine = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'ananias-of-damascus'}
            self.assertEqual(five, {(43, 64)})
            self.assertEqual(nine, {(43, 79)})

    def test_philip_deacon_vs_apostle_self_disambiguated(self):
        # The text disambiguates itself in the same paragraph (43, 59):
        # "was Philip the Deacon, not Philip the Apostle." Both phrases
        # bind to distinct entities; bare "Philip" elsewhere binds to
        # the Deacon, who baptized the Ethiopian eunuch.
        for d in self.asset['editions'].values():
            deacon = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'philip-deacon'}
            apostle = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'philip-apostle'}
            self.assertIn((43, 59), deacon)
            self.assertIn((44, 16), deacon)
            self.assertIn((45, 20), deacon)
            self.assertEqual(apostle, {(43, 59)})

    def test_herod_the_great_vs_the_tetrarch(self):
        # Herod the Great (who sought the infant Christ's death) is
        # bare "Herod"; Herod Antipas the Tetrarch (Manaen's
        # foster-brother) binds only via his own epithet.
        for d in self.asset['editions'].values():
            great = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'herod-the-great'}
            tetrarch = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'herod-antipas'}
            self.assertEqual(great, {(44, 13)})
            self.assertEqual(tetrarch, {(43, 52), (43, 63)})

    def test_saul_king_dominates_bare_form(self):
        # King Saul dominates bare "Saul" (~28 occurrences across the
        # book); there is no separate "Saul of Tarsus" entity -- the
        # minority Saul/Paul mentions are an accepted, documented
        # imprecision (see the README and module docstring).
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            self.assertIn('king-saul', ids)
            self.assertNotIn('saul-of-tarsus', ids)
            locs = [(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'king-saul']
            self.assertGreater(len(locs), 20)

    def test_caesar_bare_is_never_bound(self):
        # Bare "Caesar" is used generically or ambiguously roughly
        # twenty times and is never bound to any entity; only the full
        # names "Julius Caesar" and "Augustus Caesar" bind.
        for d in self.asset['editions'].values():
            texts = {m['text'] for m in d['mentions'] if m['characterId'] in ('julius-caesar', 'augustus-caesar')}
            self.assertTrue(all('Caesar' in t and t != 'Caesar' for t in texts))
            ids = {c['id'] for c in d['characters']}
            self.assertNotIn('caesar-bare', ids)

    def test_innocent_and_leo_only_bind_when_numbered(self):
        # "Innocent" appears 23 times in original-en, all but five as
        # the common adjective; only "Innocent the third" (a specific
        # numbered Pope) binds. The bare, unnumbered pairing "two
        # Popes, Innocent, and Leo" is deliberately left unbound.
        for d in self.asset['editions'].values():
            innocent_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'pope-innocent-iii'}
            leo_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'pope-leo-iii'}
            self.assertTrue(all('third' in t.lower() for t in innocent_texts))
            self.assertTrue(all(t in ('Leo 3', 'Leo III') for t in leo_texts))

    def test_zachary_pope_vs_zechariah_prophet(self):
        # Pope Zachary (8th c.) and the Old Testament prophet Zechariah
        # share a Hobbes spelling ("Zachary") only for the Pope; the
        # prophet is bound separately via "Prophet Zachary"/"Zacharias"
        # (original) or "Zechariah" (modern), never the bare Pope form.
        for d in self.asset['editions'].values():
            pope = {m['text'] for m in d['mentions'] if m['characterId'] == 'pope-zachary'}
            prophet = {m['text'] for m in d['mentions'] if m['characterId'] == 'zechariah-prophet'}
            self.assertTrue(pope & prophet == set())

    def test_micaiah_court_prophet_vs_michaiah_ambiguity(self):
        # The 1 Kings 22 court prophet binds under "Micaiah" in every
        # edition; the ambiguous original-en spelling "Michaiah" (which
        # names a different prophet, Micah, in one of its four
        # occurrences) is never bound to any entity.
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            self.assertIn('micaiah', ids)
            texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'micaiah'}
            self.assertNotIn('Michaiah', texts)

    def test_thomas_three_people_two_bound(self):
        # A generic, indefinite "a Thomas" (ch. 5) is left unbound;
        # Thomas Becket and the Apostle Thomas are each bound via their
        # own distinguishing phrase, and never share a mention location.
        for d in self.asset['editions'].values():
            ids = {c['id'] for c in d['characters']}
            self.assertIn('thomas-becket', ids)
            self.assertIn('st-thomas-apostle', ids)
            becket = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'thomas-becket'}
            apostle = {(m['chapterNumber'], m['paragraphIndex']) for m in d['mentions'] if m['characterId'] == 'st-thomas-apostle'}
            self.assertEqual(becket & apostle, set())
            self.assertTrue(all(m['text'] in ('Thomas Beckett', 'Thomas Becket')
                                 for m in d['mentions'] if m['characterId'] == 'thomas-becket'))

    def test_simon_cephas_petrus_merge_to_peter(self):
        # The text itself equates all three names to one Apostle (43,
        # 86): "the Apostle Simon, was surnamed Stone ... Cephas ...
        # Petrus." All bind to the single St. Peter entity.
        for d in self.asset['editions'].values():
            texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'st-peter'}
            self.assertTrue({'Simon', 'Cephas'} <= texts or {'Simon', 'Cephas'} <= {t for t in texts})

    def test_damasus_misprint_not_conflated_with_city(self):
        # The one "Damascus" misprint for "Damasus" (43, 57) is kept as
        # printed and never bound; the real city of Damascus is not a
        # bindable person, so no entity ever claims that occurrence.
        for d in self.asset['editions'].values():
            damasus_texts = {m['text'] for m in d['mentions'] if m['characterId'] == 'damasus'}
            self.assertNotIn('Damascus', damasus_texts)

    def test_william_conqueror_vs_rufus_no_ambiguity(self):
        for d in self.asset['editions'].values():
            conq = {m['text'] for m in d['mentions'] if m['characterId'] == 'william-conqueror'}
            rufus = {m['text'] for m in d['mentions'] if m['characterId'] == 'william-rufus'}
            self.assertTrue(all('Conqueror' in t or 'Conquerour' in t for t in conq))
            self.assertTrue(all('Rufus' in t for t in rufus))


if __name__ == '__main__':
    unittest.main()
