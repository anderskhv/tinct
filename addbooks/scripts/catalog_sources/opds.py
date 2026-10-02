"""Shared OPDS/Atom entry parsing."""
import urllib.parse
import xml.etree.ElementTree as ET

from .common import clean

NS = {'a': 'http://www.w3.org/2005/Atom', 'dcterms': 'http://purl.org/dc/terms/', 'dc': 'http://purl.org/dc/elements/1.1/'}


def entries(data, base):
    root = ET.fromstring(data)
    for entry in root.findall('a:entry', NS):
        links = entry.findall('a:link', NS)
        absolute = lambda href: urllib.parse.urljoin(base, href) if href else None
        yield {
            'id': clean(entry.findtext('a:id', '', NS)),
            'title': clean(entry.findtext('a:title', '', NS)),
            'authors': [clean(a.findtext('a:name', '', NS)) for a in entry.findall('a:author', NS) if clean(a.findtext('a:name', '', NS))],
            'language': [clean(l.text) for l in entry.findall('dcterms:language', NS) + entry.findall('dc:language', NS) if clean(l.text)],
            'categories': [c.get('label') or c.get('term') for c in entry.findall('a:category', NS) if c.get('term')],
            'content': clean(entry.findtext('a:content', '', NS)),
            'epub': next((absolute(l.get('href')) for l in links if l.get('type') == 'application/epub+zip'), None),
            'html': next((absolute(l.get('href')) for l in links if l.get('type') == 'text/html' and l.get('rel') == 'alternate'), None),
            'cover': next((absolute(l.get('href')) for l in links if l.get('rel') in ('http://opds-spec.org/image/thumbnail',)), None)
                     or next((absolute(l.get('href')) for l in links if l.get('rel') == 'http://opds-spec.org/image'), None),
        }
