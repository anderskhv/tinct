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

It turned out that what I needed to do was to run [`ANALYZE`](https://sqlite.org/lang_analyze.html)! Immediately the problem query went from taking 5 seconds to like 0.05 seconds (or some other number small enough that I didn’t care to investigate further). I still don’t know exactly what went wrong in the query plan, but my best guess is that it was some sort of [accidentally quadratic](https://accidentallyquadratic.tumblr.com/) thing.

`ANALYZE` generates “statistics” (I guess about the number of rows in each table? and presumably other things?) so that the query planner can make better choices.

Maybe one day I’ll learn to read a query plan.

### cleaning up the database is tricky

Occasionally I’ve run into situations where I accidentally put a bunch of rows in my database that I don’t want to be there (for example completed tasks from [django-tasks-db](https://github.com/RealOrangeOne/django-tasks-db)), and I want to clean them up.

What’s happened to me a few times in this case is:

1. I run some kind of command to clean up the rows
2. The command takes more than 5 seconds, since there are a lot of rows (though I still have some questions about why these DELETE statements are so slow honestly, maybe there’s a bunch of Python code running inside a transaction, I’m not sure)
3. One of the other workers tries to write the database while this is happening, and times out after 5 seconds (I have a timeout of 5 seconds set)

…

Mess with DNS has been running on SQLite for 4 years now (since 2022) and it’s been great, I think the move from Postgres was a great choice for that project.

### that’s all!

It’s always kind of fun to see how long it takes me to learn sort of basic things about the technologies I’m using. I think I used SQLite for a web project for the first time in 2022 and I only learned that `ANALYZE` existed today! I imagine in a year or two I’ll be learning about some other very basic feature.

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
