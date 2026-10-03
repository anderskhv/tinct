"""Catalogue source adapters beyond Gutenberg and Standard Ebooks.

Each module exposes NAME and `fetch(fetcher, report) -> list[edition]` built with
common.edition(). A failing adapter is reported in build-report.json; it never aborts the build.

Libraries whose editions are only licensed for non-commercial use are not included (Tinct is a
commercial service); git history holds the removed Ebooks libres et gratuits, BNR, Bokselskap,
Liber Liber and Arkiv for Dansk Litteratur adapters.
"""
from . import bibebook, dbnl, dta, kalliope, litteraturbanken, runeberg, textgrid, wikisource, wolnelektury

# Key = --sources name. Order is only the order of the report.
ADAPTERS = {
    'wikisource': wikisource, 'kalliope': kalliope, 'runeberg': runeberg, 'litteraturbanken': litteraturbanken,
    'dbnl': dbnl, 'dta': dta, 'textgrid': textgrid, 'wolnelektury': wolnelektury, 'bibebook': bibebook,
}
