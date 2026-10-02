"""Deutsches Textarchiv: dated OAI-DC metadata dump (historical German first editions).

Licence per record from dc:rights. https://www.deutschestextarchiv.de/doku/nutzungsbedingungen
Newspapers are excluded; DTA offers TEI/HTML/TXT but no EPUB.
"""
import re
import xml.etree.ElementTree as ET
import zipfile

from .common import clean, edition, integer, licence_from_text, person

NAME = 'Deutsches Textarchiv'
URL = 'https://www.deutschestextarchiv.de/media/download/dta_metadaten_oai_dc_2026-02-12.zip'
DC = '{http://purl.org/dc/elements/1.1/}'


def fetch(fetcher, report):
    path = fetcher.path(URL, 'dta/' + URL.rsplit('/', 1)[1])
    editions, skipped = [], 0
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if not name.endswith('.oai_dc.xml'):
                continue
            root = ET.fromstring(archive.read(name))
            get = lambda tag: [clean(x.text) for x in root.iter(DC + tag) if clean(x.text)]
            subjects = get('subject')
            if any(s.startswith('Zeitung') for s in subjects):
                skipped += 1
                continue
            url = next(iter(get('identifier')), '')
            dirname = url.rstrip('/').rsplit('/', 1)[-1]
            rights = ' '.join(get('rights'))
            licence = licence_from_text(rights) or ('PD' if not rights else None)
            if not licence:
                skipped += 1
                continue
            title = re.sub(r'\s*\(vollständige digitalisierte Ausgabe\)\s*$', '', next(iter(get('title')), ''))
            title, _, subtitle = title.partition(' – ')
            year = integer(next(iter(get('date')), None))
            editions.append(edition(
                NAME, dirname, title, id='dta:' + dirname, subtitle=subtitle or None, sourceUrl=url,
                authors=[person(c) for c in get('creator')], language=get('language') or ['de'],
                # The digitised print's year. DTA favours first editions but does not guarantee it.
                editionYear=year,
                subjects=subjects, quality='proofread',
                coverUrl='https://www.deutschestextarchiv.de/media/images/{0}/{0}_0001_400px.jpg'.format(dirname),
                rights=rights or 'Public domain text (Deutsches Textarchiv)', licence=licence))
    report['skippedNewspapersOrUnlicensed'] = skipped
    return editions
