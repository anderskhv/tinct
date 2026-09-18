Model: sonnet

# Chapter 339 — corrections log

Source of findings: `ch339-fidelity.md`. All MAJOR and MODERATE findings applied. MINOR findings applied only where the fix restores a single source word/phrase or removes an added intensifier/connective with no source support. Paragraph count and order unchanged (11 paragraphs, same order).

## ¶1
Before: "If the goal of the European wars at the start of the nineteenth century had really been the aggrandizement of Russia, that goal could have been reached without any of the wars that came before it, and without the invasion at all. If the goal was the aggrandizement of France, that could have been reached without the Revolution and without the Empire. If the goal was spreading certain ideas, the printing press could have done that job far better than warfare ever could. If the goal was the progress of civilization, it's easy enough to see that there are other, better ways of spreading civilization than by destroying wealth and human lives."
After: "If the goal of the European wars at the start of the nineteenth century had been the aggrandizement of Russia, that goal could have been reached without all the wars that came before it, and without the invasion. If the goal was the aggrandizement of France, that could have been reached without the Revolution and without the Empire. If the goal was spreading ideas, the printing press could have done that job far better than warfare. If the goal was the progress of civilization, it's easy enough to see that there are other, more expedient ways of spreading civilization than by destroying wealth and human lives."
Findings answered: MINOR (added intensifiers "really", "any of"/"at all", "certain", "ever could" — all removed or restored to source; "expedient" restored, replacing the flattened general "better").

## ¶2
Before: "So why did it happen this way, and not some other way?"
After: "Why did it happen this way, and not some other way?"
Findings answered: MINOR (added connective "So" — removed).

## ¶5
Before: "The words \"chance\" and \"genius\" don't point to any real, existing thing, and so they can't actually be defined. They only mark a certain stage in our understanding of events. I don't know why some particular event happens; I decide I can't know it; so I stop trying to know it, and I call it chance. ..."
After: "The words \"chance\" and \"genius\" don't point to any real, existing thing, and so they can't be defined. They only mark a certain stage in our understanding of phenomena. I don't know why some particular event happens; I think I can't know it; so I do not try to know it, and I call it chance. ..."
Findings answered: MINOR (added intensifier "actually" — removed; "phenomena" restored, un-narrowing "events"; "decide"/"stop trying" restored to source's "think"/"do not try", which state belief and inaction rather than a choice and reversed effort).

## ¶6
Before: "... And it must seem an astonishing coincidence of genius with a whole run of extraordinary luck that this particular ram—..."
After: "... And it must seem an astonishing coincidence of genius with a whole run of extraordinary chances that this particular ram—..."
Findings answered: MODERATE, mandatory (restore "extraordinary chances" — the chapter's defined term, established at ¶4–5 and needed again at ¶7–9; "luck" breaks the chain the ram parable exists to build).

## ¶7
Before: "But all the rams would have to do is stop assuming that everything that happens to them happens purely for the sake of their own sheepish goals; they'd only have to admit that whatever happens to them might also serve purposes beyond their understanding, ... they would no longer need the ideas of chance or genius at all."
After: "But all the rams would have to do is stop assuming that everything that happens to them happens purely for the sake of their sheepish goals; they'd only have to admit that whatever happens to them might also have purposes beyond their understanding, ... they would no longer need the ideas of chance or genius."
Findings answered: MINOR (added "own" and "at all" — removed; "serve" restored to source's "have", removing the added teleology).

## ¶8
Before: "... Only then can we begin to see the pattern running through the experiences of historical figures, and grasp the real cause behind the effects they produce—..."
After: "... Only then can we see the sequence running through the experiences of historical figures, and grasp the cause behind the effects they produce—..."
Findings answered: MINOR ("begin to" inserts a stage not in source — removed; "pattern" restored to source's "sequence" (order, not design); added intensifier "real" — removed).

## ¶9
Before: "We need only admit that we don't know the purpose behind the European convulsions. All we actually know are the facts: the killing, first in France, then in Italy, in Africa, in Prussia, in Austria, in Spain, and in Russia. And we need only admit that the movements from west to east and then from east to west form the essence and the point of these events. Once we admit that, we won't just have no need to see extraordinary ability and genius in Napoleon and Alexander—we'll be unable to see them as anything but men like other men. And we won't need to reach for chance to explain the small events that made these particular men what they were, because it will be plain that every one of those small events was inevitable."
After: "We need only admit that we don't know the purpose behind the European convulsions. All we know are the facts: the murders, first in France, then in Italy, in Africa, in Prussia, in Austria, in Spain, and in Russia. And we need only admit that the movements from west to east and from east to west form the essence and the point of these events. Once we admit that, we won't just have no need to see extraordinary ability and genius in Napoleon and Alexander—we'll be unable to see them as anything but men like other men. And we won't need to reach for chance to explain the small events that made these men what they were, but it will be plain that every one of those small events was inevitable."
Findings answered: MODERATE, mandatory (restore "murders" — Tolstoy's deliberate moral charge, softened to neutral "killing"; restore source's "but" where the candidate wrote "because", which turned the source's two side-by-side consequences into a causal claim). MINOR (added intensifier "actually" — removed; added sequencing "then" before "from east to west" — removed; added "particular" — removed).

## ¶10
Before: "By giving up any claim to know the ultimate purpose, we'll see clearly that no one could imagine a blossom or a seed better suited to any given plant than the ones it actually produces. In just the same way, it's impossible to imagine two people more perfectly fitted, down to the smallest detail, for the purpose they had to fulfill, than Napoleon and Alexander, with everything that made them who they were."
After: "By giving up any claim to know the ultimate purpose, we'll see clearly that no one could imagine a blossom or a seed better suited to any given plant than the ones it produces. In just the same way, it's impossible to imagine any two people more perfectly fitted, down to the smallest detail, for the purpose they had to fulfill, than Napoleon and Alexander, with all their antecedents."
Findings answered: MINOR (added intensifier "actually" — removed; universal quantifier "any" restored before "two people"; "with everything that made them who they were" restored to source's "with all their antecedents").

## Findings deliberately not applied
- ¶6: the source's repeated phrase "a special enclosure" (candidate varies it to "a separate pen" / "a special pen full of oats") and "swelling with fat" → "now bursting with fat" — flagged MINOR but not a single-word fix; left as accessibility variation.
- ¶0: the restructuring of the opening conditional into two sentences ("Historians assume... If we make that same assumption...") — review rated this COSMETIC, not a finding; kept.
- ¶3, ¶5: modernized diction inside the quoted maxim ("genius made use of it") and added quotation marks around "chance"/"genius" as named words — review rated these COSMETIC; kept.

## Verification
```
python3 books/edition_checks.py war-and-peace --candidate books/wip/war-and-peace-repair/repair/ch339-corrected.json
```
