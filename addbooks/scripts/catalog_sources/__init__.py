"""Catalogue source adapters beyond Gutenberg and Standard Ebooks.

Each module exposes NAME and `fetch(fetcher, report) -> list[edition]` built with
common.edition(). A failing adapter is reported in build-report.json; it never aborts the build.
"""
from . import (adl, bibebook, bnr, bokselskap, dbnl, dta, ebooksgratuits, kalliope, liberliber, litteraturbanken,
               runeberg, textgrid, wikisource, wolnelektury)

# Key = --sources name. Order is only the order of the report.
ADAPTERS = {
    'wikisource': wikisource, 'kalliope': kalliope, 'runeberg': runeberg, 'adl': adl, 'litteraturbanken': litteraturbanken, 'bokselskap': bokselskap,
    'dbnl': dbnl, 'dta': dta, 'textgrid': textgrid, 'wolnelektury': wolnelektury, 'bibebook': bibebook,
    'ebooksgratuits': ebooksgratuits, 'bnr': bnr, 'liberliber': liberliber,
}
