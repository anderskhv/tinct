"""Focused catalogue regressions; no network or app writes."""
import importlib.machinery
import importlib.util
import tempfile
import unittest
from pathlib import Path

loader = importlib.machinery.SourceFileLoader('builder', str(Path(__file__).with_name('build-index')))
spec = importlib.util.spec_from_loader(loader.name, loader)
b = importlib.util.module_from_spec(spec)
loader.exec_module(b)

RDF = '''<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:pg="http://www.gutenberg.org/2009/pgterms/" xmlns:dc="http://purl.org/dc/terms/" xmlns:rel="http://id.loc.gov/vocabulary/relators/">
<pg:ebook rdf:about="ebooks/123"><dc:rights>Public domain in the USA.</dc:rights>
<dc:type><rdf:Description><rdf:value>Text</rdf:value></rdf:Description></dc:type>
<dc:title>The Odyssey</dc:title><dc:creator><pg:agent><pg:name>Homer</pg:name><pg:birthdate>-750</pg:birthdate><pg:deathdate>-650</pg:deathdate></pg:agent></dc:creator>
<rel:trl><pg:agent><pg:name>Butler, Samuel</pg:name></pg:agent></rel:trl>
<dc:language><rdf:Description><rdf:value>en</rdf:value></rdf:Description></dc:language>
<dc:subject><rdf:Description><rdf:value>Epic poetry</rdf:value></rdf:Description></dc:subject>
<pg:downloads>500</pg:downloads><dc:issued>1999-01-01</dc:issued>
<dc:hasFormat><pg:file rdf:about="https://www.gutenberg.org/ebooks/123.epub.images"><dc:format><rdf:Description><rdf:value>application/epub+zip</rdf:value></rdf:Description></dc:format></pg:file></dc:hasFormat>
</pg:ebook></rdf:RDF>'''

class BuilderTests(unittest.TestCase):
    def edition(self, **updates):
        e, reason = b.parse_pg(RDF)
        self.assertIsNone(reason)
        e.update(updates)
        return e

    def test_rights_type_and_unknown_dates(self):
        e = self.edition()
        self.assertEqual(e['authors'][0]['birthYear'], -750)
        self.assertEqual(e['translators'][0]['name'], 'Samuel Butler')
        self.assertEqual(e['subjects'], ['Epic poetry'])
        self.assertEqual(e['popularity'], 500)
        self.assertIsNone(e['firstPublishedYear'])  # never 1999, the ebook release
        self.assertIsNone(e['originalLanguage'])  # English is an edition language
        self.assertEqual(b.parse_pg(RDF.replace('Public domain in the USA.', 'Copyrighted.'))[1], 'notPublicDomainUS')
        self.assertEqual(b.parse_pg(RDF.replace('>Text<', '>Sound<'))[1], 'notText')

    def test_translations_group_without_losing_translator(self):
        original = self.edition()
        translated = self.edition(id='pg:456', sourceId='456', title='The Odyssey of Homer', translators=[b.person('Pope, Alexander')])
        report = {}
        works = b.group_editions([original,translated],report)
        self.assertEqual(len(works),1)
        self.assertEqual(report['duplicatesMerged'],1)
        self.assertEqual({e['translators'][0]['name'] for e in works[0]['editions']},{'Samuel Butler','Alexander Pope'})

    def test_se_preferred_but_cannot_borrow_translator(self):
        se = self.edition(id='se:homer/odyssey',source='Standard Ebooks',sourceId='homer/odyssey',quality='clean',translators=[],popularity=0)
        works = b.group_editions([self.edition(),se],{})
        self.assertEqual(len(works),1)
        self.assertEqual(works[0]['editions'][0]['source'],'Standard Ebooks')
        self.assertEqual(works[0]['translators'],[])
        self.assertEqual(works[0]['popularity'],500)

    def test_distinct_author_language_volume_and_anthology_do_not_merge(self):
        e = self.edition()
        other_author = self.edition(id='pg:2',sourceId='2',authors=[b.person('Someone Else')])
        french = self.edition(id='pg:3',sourceId='3',language=['fr'])
        volume = self.edition(id='pg:4',sourceId='4',title='The Odyssey, Volume 1')
        self.assertEqual(len(b.group_editions([e,other_author,french,volume],{})),4)
        one = self.edition(title='Short Fiction')
        two = self.edition(id='pg:2',sourceId='2',title='Short Fiction')
        self.assertEqual(len(b.group_editions([one,two],{})),2)

    def test_same_named_authors_with_different_dates_are_distinct(self):
        a = self.edition(authors=[b.person('Smith, John',1800,1860)])
        c = self.edition(id='pg:2',sourceId='2',authors=[b.person('Smith, John',1900,1960)])
        self.assertEqual(len(b.group_editions([a,c],{})),2)
        a['authors'] = [b.person('Various')]
        c['authors'] = [b.person('Various')]
        self.assertEqual(len(b.group_editions([a,c],{})),2)

    def test_text_without_epub_is_preserved(self):
        e, reason = b.parse_pg(RDF.replace('application/epub+zip','text/plain'))
        self.assertIsNone(reason)
        self.assertIsNone(e['epubUrl'])

    def test_registry_ignores_staged_books_and_comments(self):
        source = """export const LIVE: Book = {
  id: 'live', title: 'The Odyssey', author: 'Homer', year: -800,
}
export const STAGED: Book = {
  id: 'staged', title: 'Other', author: 'Homer', year: 10,
}
export const BOOKS: Book[] = [LIVE, // STAGED
]
"""
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'registry.ts';path.write_text(source)
            books=b.load_registry(path)
            self.assertEqual([x['id'] for x in books],['live'])
            report={};works=b.group_editions([self.edition()],{})
            b.match_tinct(works,books,report)
            self.assertTrue(works[0]['onTinct'])
            self.assertEqual(works[0]['firstPublishedYear'],-800)

    def test_title_only_match_does_not_claim_on_tinct(self):
        works=b.group_editions([self.edition()],{})
        report={}
        b.match_tinct(works,[{'id':'fake','title':'The Odyssey','author':'Another Person','year':1}],report)
        self.assertFalse(works[0]['onTinct'])
        self.assertEqual(len(report['tinctAmbiguous']),1)

    def test_parse_atom_recommended_epub_and_next_page(self):
        xml='''<feed xmlns="http://www.w3.org/2005/Atom"><link rel="next" href="https://standardebooks.org/next"/><entry><id>https://standardebooks.org/ebooks/homer/odyssey</id><title>The Odyssey</title><author><name>Homer</name></author><rights>Public domain in the United States.</rights><link type="application/epub+zip" href="https://standardebooks.org/advanced_advanced.epub"/><link type="application/epub+zip" href="https://standardebooks.org/recommended.epub"/></entry></feed>'''
        entries, next_urls=b.parse_se(xml)
        self.assertEqual(entries[0]['epubUrl'],'https://standardebooks.org/recommended.epub')
        self.assertEqual(next_urls,['https://standardebooks.org/next'])

if __name__ == '__main__':
    unittest.main()
