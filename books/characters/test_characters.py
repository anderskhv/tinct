import json
import unittest
from pathlib import Path
from build_pilot import ROOT, compile_book, key, normalized, point, u16
from lookup_reference import reminder, gallery, resolve


class CharacterContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package, cls.report, _ = compile_book('the-awakening')
        cls.ed = cls.package['editions']['original-en']
        cls.source = json.loads((ROOT / cls.ed['sourcePath']).read_text())

    def test_compiled_artifact_is_current(self):
        saved = json.loads((Path(__file__).parent/'the-awakening/characters.v1.json').read_text())
        self.assertEqual(self.package, saved)

    def test_every_span_round_trips_in_both_editions(self):
        for edition in self.package['editions'].values():
            source = json.loads((ROOT / edition['sourcePath']).read_text())
            paras = {(c['number'], i): normalized(p) for c in source['chapters'] for i,p in enumerate(c['paragraphs'])}
            for m in edition['mentions']:
                raw = paras[m['chapterNumber'], m['paragraphIndex']].encode('utf-16-le')
                self.assertEqual(raw[2*m['startOffset']:2*m['endOffset']].decode('utf-16-le'), m['text'])

    def test_no_future_people_in_opening_gallery(self):
        ids = {c['id'] for c in gallery(self.ed, point(1,0,0))}
        self.assertNotIn('arobin', ids)
        self.assertNotIn('reisz', ids)

    def test_all_snapshot_gates_are_inclusive_and_do_not_leak_early(self):
        for c in self.ed['characters']:
            for s in c['snapshots']:
                at = s['availableAt']
                card = reminder(self.ed, c['id'], at)
                latest = max((x for x in c['snapshots'] if key(x['availableAt']) <= key(at)), key=lambda x:key(x['availableAt']))
                self.assertEqual(card['body'], latest['body'])
                if at['offset']:
                    before = reminder(self.ed, c['id'], {**at, 'offset':at['offset']-1})
                    prior = [x for x in c['snapshots'] if key(x['availableAt']) < key(at)]
                    self.assertEqual(before['body'] if before else None, prior[-1]['body'] if prior else None)

    def test_first_mention_hides_future_role(self):
        c = next(c for c in self.ed['characters'] if c['id']=='arobin')
        self.assertIsNone(reminder(self.ed, 'arobin', c['firstMention'])['role'])
        self.assertEqual(reminder(self.ed, 'arobin', c['roleVisibleAt'])['role'], c['storyRole'])

    def test_going_back_restores_earlier_card(self):
        c = self.ed['characters'][0]
        first = reminder(self.ed, c['id'], c['firstMention'])
        self.assertNotEqual(first['body'], reminder(self.ed, c['id'], point(39,999,999))['body'])
        self.assertEqual(first, reminder(self.ed, c['id'], c['firstMention']))

    def test_edition_omission_is_not_invented(self):
        self.assertTrue(any(c['id']=='holy-ghost' for c in self.ed['characters']))
        self.assertFalse(any(c['id']=='holy-ghost' for c in self.package['editions']['modern-en']['characters']))

    def test_selection_resolves_and_changed_text_fails_closed(self):
        m = next(m for m in self.ed['mentions'] if m['characterId']=='edna')
        args = [m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']]
        text = self.source['chapters'][m['chapterNumber']-1]['paragraphs'][m['paragraphIndex']]
        self.assertEqual(resolve(self.ed,*args,text)['id'], 'edna')
        self.assertIsNone(resolve(self.ed,*args,text+' changed'))
        self.assertIsNone(resolve(self.ed,*args,text,existing_highlight=True))

    def test_hidden_fields_are_not_returned(self):
        for card in gallery(self.ed, point(39,999,999)):
            self.assertEqual(set(card), {'id','kind','role','name','subtitle','body'})

    def test_utf16_not_python_character_count(self):
        self.assertEqual(u16('A😀B'),4)
        self.assertEqual(normalized('one\n  two'), 'one two')

if __name__ == '__main__':
    unittest.main()
