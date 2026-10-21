---
title: Why I Stopped Highlighting Books
subtitle: And what I do in the margins instead
author: Theo Marsh
date: 2026-03-03
language: en
source: synthetic (Medium markup)
sections: 1
words: ~210
---

## Why I Stopped Highlighting Books

![](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Nh7.jpeg)

For ten years I read with a yellow highlighter in my hand. By the end of a book, a third of the pages glowed. I could not tell you what most of those books said.

The problem is not the ink. It is that highlighting feels like thinking while asking almost nothing of you. You agree with a sentence, you mark it, you move on. **Nothing has been put into your own words.**

> _“A highlight is a promise to think later that you almost never keep.”_

### The three-question margin

Now I keep a pencil and write one of three things beside a passage:

1. **Why?** — when the author asserts something I cannot yet see.
2. **So?** — when I understand it but not why it matters.
3. **Like…** — when it reminds me of something else I have read.

It is slower. I read perhaps twenty pages an hour instead of forty. But a month later I can still argue with the book, which is the whole point.

If you want to try it, start with a book you already know. The questions come more easily when the plot is not pulling you forward. I keep a small script that exports my margin notes, too:

```
grep -h "^> " notes/*.md | sort | uniq -c | sort -rn | head
```

That is all. One pencil, three questions.
