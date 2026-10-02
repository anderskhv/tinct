"""Shared helpers for catalogue source adapters. Python standard library only."""
import json
import re
import shutil
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

USER_AGENT = 'TinctAddBooksPrototype/1.1 (catalogue metadata only; https://tinct.app)'
# Letters NFKD does not decompose. Folding them lets "Kobenhavn" find "København".
FOLD = str.maketrans({'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i'})


def clean(value):
    return ' '.join((value or '').split())


def norm(value):
    value = unicodedata.normalize('NFKD', (value or '').casefold().translate(FOLD))
    value = ''.join(c for c in value if not unicodedata.combining(c))
    return clean(re.sub(r'[^\w]+', ' ', value, flags=re.UNICODE)).replace('_', ' ')


# Leading articles per language. Only used for grouping/matching keys, never for display.
ARTICLES = {'en': 'the|a|an', 'fr': 'le|la|les|l|un|une', 'de': 'der|die|das|ein|eine',
            'es': 'el|la|los|las|un|una', 'it': 'il|lo|la|i|gli|le|l|un|una', 'pt': 'o|a|os|as|um|uma',
            'nl': 'de|het|een', 'da': 'den|det|de|en|et', 'no': 'den|det|de|en|et|ei', 'sv': 'den|det|de|en|ett'}


def title_key(value, languages=('en',)):
    words = '|'.join(ARTICLES[l] for l in languages if l in ARTICLES)
    value = norm(value)
    return re.sub(r'^(' + words + r') ', '', value) if words else value


def name_key(value):
    return ' '.join(sorted(norm(re.sub(r'\([^)]*\)', '', value or '')).split()))


def integer(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def year(value):
    """First signed year in an ISO-ish or free-text date; None when absent."""
    match = re.search(r'(-?)(\d{1,4})', str(value or ''))
    if not match:
        return None
    return int(match[2]) * (-1 if match[1] else 1)


def person(name, birth=None, death=None, aliases=None):
    """Gutenberg-style "Surname, Firstname" (optionally followed by an honorific)."""
    name = clean(name)
    parts = name.split(', ', 1)
    display = parts[1] + ' ' + parts[0] if len(parts) == 2 else name
    return {'name': display, 'birthYear': birth, 'deathYear': death,
            'aliases': sorted(set(a for a in (aliases or []) if a) - {display})}


def natural_person(name, birth=None, death=None, aliases=None):
    """A name already in display order, e.g. "Hans Christian Andersen"."""
    name = clean(name)
    return {'name': name, 'birthYear': birth, 'deathYear': death,
            'aliases': sorted(set(clean(a) for a in (aliases or []) if clean(a)) - {name})}


def edition(source, source_id, title, **fields):
    """Every adapter returns this shape. Unknown stays None/empty; nothing is guessed."""
    record = {'id': None, 'source': source, 'sourceId': str(source_id), 'sourceUrl': None,
              'title': clean(title), 'subtitle': None, 'authors': [], 'translators': [],
              'language': ['und'], 'originalLanguage': None, 'firstPublishedYear': None,
              'subjects': [], 'bookshelves': [], 'epubUrl': None, 'coverUrl': None,
              'popularity': 0, 'quality': 'standard', 'rights': None, 'licence': None}
    record.update(fields)
    for key in ('epubUrl', 'coverUrl', 'sourceUrl'):
        if record[key] and record[key].startswith('http://'):
            record[key] = 'https://' + record[key][7:]
        if record[key] and not record[key].startswith('https://'):
            record[key] = None
    record['subjects'] = sorted({clean(s) for s in record['subjects'] if clean(s)})
    record['language'] = sorted({l for l in record['language'] if l}) or ['und']
    if not record['rights'] or not record['licence']:
        raise ValueError(source + ' edition without an explicit rights statement: ' + str(source_id))
    return record


class Fetcher:
    """Cached, polite HTTP. Cache files make --offline builds reproducible."""

    def __init__(self, cache, offline=False, refresh=False, delay=0.0):
        self.cache, self.offline, self.refresh, self.delay = Path(cache), offline, refresh, delay
        self.cache.mkdir(parents=True, exist_ok=True)
        self.requests = 0

    def path(self, url, path, headers=None, data=None, timeout=120, attempts=5):
        path = self.cache / path
        if path.exists() and not self.refresh:
            return path
        if self.offline:
            raise RuntimeError('Missing cached input: ' + str(path))
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + '.part')
        for attempt in range(attempts):
            if self.delay and self.requests:
                time.sleep(self.delay)
            self.requests += 1
            request = urllib.request.Request(url, data=data, headers={'User-Agent': USER_AGENT, **(headers or {})})
            try:
                with urllib.request.urlopen(request, timeout=timeout) as response, tmp.open('wb') as out:
                    shutil.copyfileobj(response, out)
                tmp.replace(path)
                return path
            except urllib.error.HTTPError as error:
                retry = error.code in (429, 500, 502, 503, 504)
                if not retry or attempt == attempts - 1:
                    raise
                wait = integer(error.headers.get('Retry-After')) or 2 ** (attempt + 1)
                time.sleep(min(wait, 60))
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                if attempt == attempts - 1:
                    raise
                time.sleep(2 ** (attempt + 1))
            finally:
                tmp.unlink(missing_ok=True)

    def bytes(self, url, path, **kwargs):
        return self.path(url, path, **kwargs).read_bytes()

    def json(self, url, path, **kwargs):
        return json.loads(self.bytes(url, path, **kwargs))
