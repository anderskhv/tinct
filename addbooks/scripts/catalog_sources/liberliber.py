"""Liber Liber / Progetto Manuzio (Italian): ~4,000 ebooks with per-work licence metadata.

Each work page's structured metadata block names its licence (https://liberliber.it/opere/libri/licenze/):
public-domain texts in a CC BY-NC-SA 4.0 edition by default, some other free licences. Works whose
licence is not recognised (e.g. personal-use-only copyrighted texts) are skipped.
"""
import html
import re
import urllib.error

from .common import clean, edition, licence_from_text, natural_person

NAME = 'Liber Liber'
API = 'https://liberliber.it/wp-json/wp/v2/pages?per_page={size}&page={page}&_fields=id,link,title,content'


def _fields(content):
    pairs = re.findall(r'll_metadati_etichetta">([^<]*):?</div><div class="ll_metadati_dato">(.*?)</div>', content, re.S)
    fields = {}
    for label, value in pairs:
        plain = re.sub(r'<[^>]+>', '', re.sub(r'<br\s*/?>', '; ', value))
        fields[clean(label).rstrip(':')] = (clean(html.unescape(plain)).strip('; '), value)
    return fields


def fetch(fetcher, report):
    fetcher.delay = max(fetcher.delay, 0.3)
    editions, skipped = [], 0
    batches, failed = [], 0
    for page in range(1, 200):
        fell_back = False
        try:
            batch = fetcher.json(API.format(size=100, page=page), 'liberliber/pages-%d.json' % page, timeout=180)
        except (urllib.error.HTTPError, RuntimeError) as error:
            if getattr(error, 'code', None) == 400:  # WordPress answers 400 past the last page.
                break
            # Some 100-page batches make the server fail (or were cached in tens): use pages of ten.
            batch, fell_back = [], True
            for sub in range((page - 1) * 10 + 1, page * 10 + 1):
                try:
                    batch += fetcher.json(API.format(size=10, page=sub), 'liberliber/pages10-%d.json' % sub, timeout=180)
                except (urllib.error.HTTPError, RuntimeError) as sub_error:
                    if getattr(sub_error, 'code', None) == 400:
                        break
                    failed += 1
            if not batch:  # past the end, or a whole range unavailable
                break
        if not batch and not fell_back:
            break
        batches.append(batch)
    for batch in batches:
        for item in batch:
            content = item.get('content', {}).get('rendered', '')
            if 'opera_url_epub' not in content or 'll_metadati' not in content:
                continue
            f = _fields(content)
            title = f.get('titolo', (None,))[0] or html.unescape(item['title']['rendered'])
            licence_text, licence_html = f.get('licenza', ('', ''))
            href = re.search(r'href="([^"]+)"', licence_html)
            licence = licence_from_text((href[1] if href else '') + ' ' + licence_text)
            if not licence:
                skipped += 1
                continue
            authors = [natural_person(html.unescape(a)) for a in re.findall(r'>([^<]+)</a>', f.get('autore', ('', ''))[1])] \
                or ([natural_person(f['autore'][0])] if f.get('autore', ('',))[0] else [])
            translators = [natural_person(t) for t in re.split(r';\s*', f.get('traduzione', ('',))[0]) if t]
            subjects = [s.split('/')[-1].strip() for s in re.split(r';\s*', f.get('soggetto BISAC', ('',))[0]) if s]
            editions.append(edition(
                NAME, item['id'], title, id='ll:' + str(item['id']), sourceUrl=item['link'],
                authors=authors, translators=translators, language=['it'], subjects=subjects,
                quality='proofread' if 'standard' in f.get('affidabilità', ('',))[0] or 'buona' in f.get('affidabilità', ('',))[0] else 'standard',
                rights=licence_text or 'See Liber Liber', licence=licence))
    report.update(skippedUnrecognisedLicence=skipped, failedPagesOfTen=failed)
    return editions
