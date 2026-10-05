"""Kalliope (Danish and Nordic poetry): versioned open dataset at https://kalliope.org/api/v1/.

About page: "det er tilladt at bruge indholdet i Kalliope til hvad man måtte ønske". Only works by
poets who died more than 70 years ago are indexed. No EPUB; editions link to the Kalliope page.
"""
import gzip
import json

from .common import edition, natural_person, public_domain_cutoff, year

NAME = 'Kalliope'
API = 'https://kalliope.org/api/v1/'
LANGUAGES = {'da', 'sv', 'no', 'nb', 'nn', 'is', 'fo', 'de', 'en', 'fr', 'it', 'la'}


def _jsonl(fetcher, name):
    data = gzip.decompress(fetcher.bytes(API + name, 'kalliope/' + name))
    return [json.loads(line) for line in data.splitlines() if line.strip()]


def fetch(fetcher, report):
    cutoff = public_domain_cutoff()
    poets = {p['id']: p for p in _jsonl(fetcher, 'poets.jsonl.gz')}
    editions, skipped = [], 0
    for work in _jsonl(fetcher, 'works.jsonl.gz'):
        poet = poets.get(work['poet_id'])
        if not poet or not work.get('title'):
            continue
        died = year((poet.get('dead') or {}).get('date'))
        if died is None or died >= cutoff or poet.get('lang') not in LANGUAGES:
            skipped += 1
            continue
        language = {'nb': 'no', 'nn': 'no'}.get(poet['lang'], poet['lang'])
        editions.append(edition(
            NAME, work['id'], work['title'], id='kal:' + work['id'],
            subtitle='Udvalg' if work.get('status') == 'incomplete' else None,
            sourceUrl=work.get('canonical_url'),
            authors=[natural_person(poet['name'], year((poet.get('born') or {}).get('date')), died)],
            language=[language], firstPublishedYear=year(work.get('published')) if work.get('published') else None,
            subjects=['Poetry' if work.get('type') == 'poetry' else 'Prose'], quality='proofread',
            rights='Public-domain text; Kalliope permits any use of its content', licence='PD'))
    report['skippedRecentOrUnknownDeath'] = skipped
    return editions
