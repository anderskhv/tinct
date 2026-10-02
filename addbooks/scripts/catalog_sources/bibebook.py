"""Bibebook (French): public-domain texts edited under CC BY-SA, credited Bibebook.

Licence: stated on each book's title page ("œuvre du domaine public éditée sous la licence
Creative Commons BY-SA"). One static JSON catalogue; no language/year metadata, all French.
"""
from .common import edition, natural_person

NAME = 'Bibebook'
BASE = 'https://www.bibebook.com'


def fetch(fetcher, report):
    editions = []
    for item in fetcher.json(BASE + '/books.json', 'bibebook/books.json'):
        slug = item['slug']
        editions.append(edition(
            NAME, slug, item['title'], id='bb:' + slug, sourceUrl=BASE + '/' + slug + '/index.html',
            epubUrl=BASE + item['epub'] if item.get('epub') else None, coverUrl=BASE + '/' + slug + '/cover.jpg',
            authors=[natural_person(item['author'])] if item.get('author') else [], language=['fr'],
            quality='proofread', rights='Public-domain text; Bibebook edition CC BY-SA', licence='CC BY-SA'))
    return editions
