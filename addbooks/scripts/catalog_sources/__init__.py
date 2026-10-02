"""Catalogue source adapters beyond Gutenberg and Standard Ebooks.

Each adapter is `fetch(fetcher, report) -> list[edition]` using common.edition().
A failing adapter is reported in build-report.json; it never aborts the build.
"""
ADAPTERS = {}
