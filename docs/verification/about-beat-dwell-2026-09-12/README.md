# About page: three beats get more scroll, e-reader asterisk dropped (2026-09-12)

Chromium (Playwright, `reducedMotion: 'no-preference'` — without it the scroll animations are off and
nothing is measurable), `app/public` served on a static server, two viewports: 393×852 and 1440×900.

`measure.mjs` walks the whole page in 50px steps, waiting 12 frames at each step so the story's
per-frame speed cap can settle, and records which beat is on stage and the effective opacity of the
elements in question. `summarise.mjs` turns a sweep into per-beat scroll ranges; `diff.mjs` compares
two sweeps run by run. Raw sweeps: `before-*.json`, `after-*.json`. Measurement granularity is one
step, 50px, so ±50px is noise.

The scroll handling itself is untouched: no damping, no easing, no following, no snapping. Each beat
simply owns more of the page, and what arrives inside it is respaced over the longer run.

## The three beats — legible scroll distance

"Legible" = the element is in the viewport and its effective opacity is ≥ 0.6.

| Beat | 393×852 before → after | 1440×900 before → after |
|---|---|---|
| "So what could we do about it?" | **900px → 2050px** (2.3×) | **950px → 2150px** (2.3×) |
| "I don't understand this. / Talk to the book." (whole beat) | **2500px → 4400px** (1.8×) | **2600px → 4700px** (1.8×) |
| — the voice panel on screen | 1300px → 3150px (2.4×) | 1350px → 3350px (2.5×) |
| — the spoken answer readable | 850px → 2400px (2.8×) | 900px → 2550px (2.8×) |
| "Is this really what we want?" | **800px → 1650px** (2.1×) | **900px → 1750px** (1.9×) |
| — with "…or" beside it | 450px → 1150px (2.6×) | 500px → 1200px (2.4×) |

The talk beat is the one that needed respacing rather than only distance: the panel used to arrive at
34–53% of the beat and the spoken answer at a hard 64%, which on a longer beat would have meant a much
longer wait and then the same short read. The panel now arrives at 17–30% and the answer at 42%, i.e.
both land at roughly the scroll position they land at today, and the whole of the added distance is
spent with the answer standing still and readable.

## Every other beat is unchanged

`diff.mjs`, run by run, in story order. Everything outside the three beats is within one 50px sample.

```
=== phone-393x852   page height 38723 -> 42813  (+4090px)
  beat                          before     after      delta
  feed                          1950px    1950px       0px
  ai                            3250px    3250px       0px
  infinite                      3000px    3000px       0px
  stop                           800px    1650px     850px   <== changed
  none                           200px     400px     200px   <== changed (the stop chapter's own handoff)
  better                        1100px    1100px       0px
  none                           250px     250px       0px
  books                         2600px    2550px     -50px
  none                           500px     500px       0px
  effortless                     500px     500px       0px
  none                           250px     300px      50px
  reading-cases:overview        3700px    3700px       0px
  none                           750px     700px     -50px
  reading-cases:bridge           900px    2050px    1150px   <== changed
  reading-cases:brand           1400px    1450px      50px
  reading-cases:voice           2500px    4400px    1900px   <== changed
  reading-cases:language        2500px    2500px       0px
  reading-cases:character       2550px    2550px       0px
  reading-cases:return          2850px    2850px       0px
  reading-cases (audio)         4400px    4400px       0px
  none                           800px     750px     -50px
  invitation                    1150px    1200px      50px

=== desktop-1440x900   page height 40905 -> 45225  (+4320px)
  beat                          before     after      delta
  feed                          2050px    2050px       0px
  ai                            3400px    3400px       0px
  infinite                      3150px    3150px       0px
  stop                           900px    1750px     850px   <== changed
  none                           200px     450px     250px   <== changed (the stop chapter's own handoff)
  better                        1150px    1150px       0px
  none                           300px     250px     -50px
  books                         2700px    2750px      50px
  none                           550px     500px     -50px
  effortless                     500px     550px      50px
  none                           300px     250px     -50px
  reading-cases:overview        3900px    3950px      50px
  none                           750px     750px       0px
  reading-cases:bridge           950px    2150px    1200px   <== changed
  reading-cases:brand           1550px    1500px     -50px
  reading-cases:voice           2600px    4700px    2100px   <== changed
  reading-cases:language        2650px    2650px       0px
  reading-cases:character       2650px    2650px       0px
  reading-cases:return          3050px    3000px     -50px
  reading-cases (audio)         4650px    4700px      50px
  none                           800px     800px       0px
  invitation                    1300px    1250px     -50px
```

The `none` rows are the handoffs between chapters, where one frame is leaving and the next has not
taken the stage. The one after `stop` grows by 200–250px because that handoff is a fraction of the
chapter it belongs to, and that chapter doubled. It is part of the lengthened beat, not another beat.

## Page height

38,723px → 42,813px on the phone (+4,090px, +10.6%); 40,905px → 45,225px on the desktop (+4,320px,
+10.6%). The three beats asked for the distance and there is no way to give it to them without the
page getting longer; none of the three is now out of family with the beats around it (the audio scene
is 4,400px, the great-books questions 3,700px).

## Screenshots

Before/after at both sizes:

- `beat1-what-could-we-do-*` — "So what could we do about it?"
- `beat2-talk-question-*` — the panel with the question, before it answers
- `beat2-talk-answer-*` — the panel answering ("more honoured in the breach than the observance")
- `beat3-is-this-what-we-want-*` — "Is this really what we want? / …or"
- `ereader-line-*` — the e-reader line in the audio scene: the asterisk and the
  "* Android-based e-readers only" footnote are gone, the line stands on its own.
