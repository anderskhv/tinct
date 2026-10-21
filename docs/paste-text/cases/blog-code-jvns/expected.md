---
title: Learning a few things about running SQLite
author: Julia Evans
date: 2026-07-17
language: en
source: https://jvns.ca/blog/2026/07/17/learning-about-running-sqlite/
retrieved: 2026-10-21
sections: 1
words: ~940
---

## Learning a few things about running SQLite

Hello! I’ve been working on a Django site recently, and I decided to use SQLite as the database. When I was getting started with using SQLite as database for a website I read a [bunch](https://alldjango.com/articles/definitive-guide-to-using-django-sqlite-in-production) of blog posts about how it is totally fine to use SQLite in production for a small site and I think it _is_ totally fine, but what I did not fully appreciate is that SQLite is still a database, databases are complicated, and I do not know a lot about operating databases.

So here are a couple of small things I’ve been learning about running SQLite. This is the 4th website I’ve used SQLite for, and I think this one is harder because with the power of the Django ORM I’ve been making the database do more work than I was previously without Django.

I started by turning on WAL mode like all the blog posts said to do and hoping for the best.

### `ANALYZE` is apparently important

Today I was running a query (using [SQLite’s FTS5](https://www.sqlite.org/fts5.html) for full-text search) on a table with 4000 rows and it took 5 seconds. That seemed wrong to me: computers are fast!

…

Some blog posts I’ve looked at, other than the official docs:

- [The definitive guide to using Django with SQLite in production](https://alldjango.com/articles/definitive-guide-to-using-django-sqlite-in-production)
- [a gist on sqlite performance tuning](https://gist.github.com/phiresky/978d8e204f77feaa0ab5cca08d2d5b27)

<!-- excerpt only: third-party text. Complete heading list of the expected output follows. -->

## Section headings (complete)

- `## Learning a few things about running SQLite`
- `### `ANALYZE` is apparently important`
- `### cleaning up the database is tricky`
- `### no notes on performance of ORM queries yet`
- `### backing up sqlite`
- `### you can use multiple databases`
- `### that’s all!`
