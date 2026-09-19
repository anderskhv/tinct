# Reader polish batch — 2026-09-19

Eight items from Anders's phone QA on 2026-09-19 (Bible, Matthew 14–15, v2
chrome, night mode). Decisions are locked; this document was the build brief
and now records the outcome. **Built 2026-09-19 on
`claude/determined-heisenberg-da5vdq`** after the Fish Audio work landed.

## Outcome

| # | Item | Status |
|---|------|--------|
| 1 | Explain: 25-word opener, More/Less, icon circles, prefetch on selection start | Built. Card never clips; expanded card sizes to its text. |
| 2 | Define miss → Explain card | Built. Offline keeps the plain not-found line. |
| 3 | Verse-number highlight band | Built. Root cause below differs from the brief's guess. |
| 4 | Drag-to-edge page flip | Built: one turn per visit to the edge, 32px zone, 450ms hold. Hyphen case still needs a device log. |
| 5 | Compare out of the menu, switch in Reading settings | Built, both chromes. |
| 6 | Paused transport hides on page turn | Built. Playing transport stays. |
| 7 | Back to book with the keyboard up | Built. One tap closes keyboard and chat. |
| 8 | Smaller Chat/Talk | Built as part of 1. |

**Item 3, what it actually was.** v2 paints highlights with the CSS Custom
Highlight API (`::highlight`, `useTextRangeHighlights.ts`), per text
fragment. The verse number is a small raised fragment, so its painted box
was a small raised box: a notch in the band, plus an unpainted slit where
`.lab-verse-mark` had `margin-left`. The earlier fix (an `inline-block`
`.lab-verse-unit` painted as one band via `:has()`) sat a few pixels off the
neighbouring marks in WebKit. Now: the unit is `display: inline`, the
number's own word span keeps a real background in the highlight colour
under the fragment paint (the span's box is the line's box), the margin is
gone and the space before the number carries the room via letter-spacing,
which is painted. Superior figures (`font-feature-settings: "sups"`) were
tried first and rejected: none of the served fonts carry them.

**Item 4, still open.** The finger-stays-put double turn is fixed with an
armed flag reset when the finger leaves the zone. The "hyphenated last word
never turns" report could not be reproduced in headless Chromium, which
has no hyphenation dictionary. Log `edge`, `atEnd`, `next` inside `advance`
in `LabPassage.tsx` on a real phone at Matthew 14:36 before touching it.


Mock-up for item 1 (approved v8): https://claude.ai/artifact/UMuQ3fpTX48UXwX7SVjFQB

All phone screenshots are the **v2 reader** (`app/src/lab/`), not the legacy
`components/Reader.tsx`. Anchors below are v2 unless stated.

---

## 1. Explain: short answer, then More — mock-up approved

### Locked design (mock-up v8)
- Card = frosted glass, 22px radius, one typeface (EB Garamond).
- **Opener**: one sentence, ≤25 words, rendered whole. Card height follows
  the text. **Never clamp, never clip, no inner scroll when collapsed.**
- **More**: own line 2px under the opener, left-aligned with the text,
  EB Garamond 14px, accent colour, 44px hit area. Spinner beside it while the
  rest streams. Expanded → "Less" under the last paragraph.
- **Chat / Talk**: two 34px glass circles, icon only, `aria-label`, centred,
  6px under More, 12px apart. Disabled until the opener is in.
- **Loading** (rare): three skeleton lines, tools dimmed.
- **Expanded**: card grows to the reader's top/bottom margins, page dims 28%,
  answer scrolls inside, circles pinned bottom-centre.

### Prompt change — `app/src/lab/useLabAsk.ts` ~L827
Replace the user message with:

```
Explain this selected passage for a reader at this point in the book.

First paragraph: the answer itself, one sentence, at most 25 words. It must
stand alone. If the passage is a name or place, say what it is and why it is
here, nothing more. Then a blank line.

Then at most three short paragraphs of useful detail, most important first.
Skip any paragraph that only adds background.

Do not repeat the full selected passage. Discuss its meaning and significance
without using knowledge from later in the work.

<selected_passage>…</selected_passage>
```
`max_tokens` 700 → 450. One streamed call (Anders: one call, not two).

### Speculative prefetch — move it earlier, and stop charging it
- **Exists today**: `LabApp.tsx` ~L2670 fires `ask.explainSelection({…,
  speculative: true})` 180ms after the **selection popup opens**, i.e. after
  the drag ends. Anders wants it **when the selection starts**.
- New trigger: in `LabPassage.tsx`, `localSelecting` (L448) becomes non-null
  when the drag starts. Lift a debounced (400ms after the range last changed)
  `onSelectingStable(range)` callback to `LabApp`, which calls
  `explainSelection` speculatively. Handle change of range → new key → old
  promise ignored (the cache is keyed by text, L794, so this is automatic).
  Keep the existing popup-open trigger as a fallback for desktop native
  selection.
- **Quota**: `explainSelection` calls `gateAiAction('chat')` (useLabAsk.ts
  L800) before the speculative fetch. Anders: speculation is on him, the
  user is charged only when Explain is tapped. Split: speculative path skips
  `gateAiAction`; the `onExplain` tap path calls it (and if not allowed,
  shows the account prompt and does not reveal the cached answer).
  Confirm with `gateLabAiAction` whether "gate" is auth-only or also counts
  messages; if it only checks sign-in, the quota concern is on the worker
  side (`/api/chat`) and needs a `speculative: true` body flag the worker
  accepts without counting. Check `worker/routes/chat.ts` before assuming.
- Cancel: when the popup is dismissed without Explain, or the user picks
  Highlight/Copy, abort the in-flight fetch (`AbortController` in the entry;
  the cache entry already has `listeners`).
- Offline (`navigator.onLine === false`): no prefetch.

### Component — `app/src/components/reader/ContextualExplainCard.tsx`
- Split `answer` at the first `\n\n` into `opener` and `rest`.
- Collapsed renders `opener` + More line + tools. Expanded renders all.
- `status` gains `'opener'` (opener complete, rest streaming) so More can
  show its spinner; `'ready'` when the stream ends.
- Remove the top-right heading button (`.lab-contextual-explain-heading`).
- Footer: replace `.lab-super-row` buttons with the two icon circles.
- Tests: `ContextualExplainCard.test.tsx` (7 cases) and
  `SelectionPopup.test.tsx` (1) will need updating; do not weaken the
  "reveal complete paragraphs" behaviour, it is what gives the opener.

### CSS — `app/src/lab/lab.css`
- Delete the fixed four-line height block (L1182–1187:
  `height: calc(4 * 1.4 * 18px + 28px)`). This is the clamp.
- Delete `.lab-contextual-explain-scroll { max-height … }` for collapsed
  (L1113–1119, L1208); keep a max-height only under `.is-expanded`.
- New `.lab-contextual-explain-more` (14px Garamond accent, 44px hit area).
- Replace footer pill styles (L1210–1222) with 34px circles.
- Verify in both v1 and v2 chrome, light and night, desktop and phone.

---

## 2. Define miss → Explain fallback

- `SelectionPopup.tsx` L349–353 renders "No definition found for …".
  Replace that branch with the `ContextualExplainCard` in the same popup,
  passage = the looked-up word, same prompt, same More/Chat/Talk.
- Wire through the existing `onRequestExplanation` prop; `LabApp.tsx` L4816
  already builds the request from `selectionPopup.text`.
- Show the card's loading skeleton immediately (no "No definition found"
  flash). Offline: keep the existing not-found text.
- Dictionary hit stays as is (no extra Explain button; corner case where the
  dictionary sense is wrong for the context is accepted for now).

---

## 3. Verse-number highlight rendering (v2, Bible)

**Correct target**: `LabPassage.tsx`, not `Reader.tsx`. v2 renders one
`<span data-testid="lab-word">` per word, gap spans between them, and wraps a
verse marker + following word in `<span class="lab-verse-unit">`
(`renderWordGroups`, L113–135). Highlights are per-word classes
(`.lab-hearing-word.is-hl-warm`, `.lab-highlight-gap.is-hl-warm`, lab.css
L623–628). A `:has()` rule already tries to paint the verse unit as one band
when both children are highlighted (lab.css L7499–7512).

What the screenshots show: the band steps at the verse marker (marker box is
smaller/raised) and the gap after the marker is unpainted.

Diagnosis to do first (dev server, phone viewport, night, Matthew 14):
1. Inspect the verse marker word span: font-size, `vertical-align`,
   `line-height`, and whether the gap span between marker and word has the
   `is-hl-*` class.
2. Candidate fix: give `.lab-verse-unit` `display: inline` with the
   highlight background on the unit (already attempted by the `:has()` rule;
   check specificity vs `.lab-passage.is-reading .lab-hearing-word`), set the
   marker `line-height: 0` / `position: relative; top: -.4em` so it does not
   change the line box, and make sure the gap span inside the unit inherits
   the highlight class.
3. Also cover the in-progress `is-selecting` state, same rules.

A prior Chromium test on the **legacy** reader showed saved `<mark>`
highlights are clean there and the only artefact is a native `::selection`
slit after `.verse-num`'s `margin-right`. That finding is valid for the
desktop legacy reader only (swap `margin-right: .18em` for
`letter-spacing: .18em` on `.verse-num`, index.css L9562, if desired) and does
not explain the phone screenshots.

---

## 4. Drag-to-select page flip (v2)

Logic: `LabPassage.tsx` `onPointerMove` L605–652.
- Flip zones are **vertical**: `clientY >= bounds.bottom - 24` (next) or
  `<= bounds.top + 24` (prev), armed after a 700ms hold (`edgeTimerRef`),
  then `advance` re-runs **every 700ms while the finger stays in the zone**
  (L649). That repeat is the "super quick second flip".
- Fix (double flip): after one flip, require the pointer to leave the zone
  (`direction === null` for at least one move event) before re-arming.
  Remove the self-rescheduling `setTimeout(advance, 700)` at L649; keep the
  200ms post-flip re-anchor at L639–648.
- Fix (too hard): 24px zone + 700ms hold. Try 32px and 450ms. Tune on device.
- Hyphenated last word: **unverified**. Hypothesis: when the last word on
  the page is hyphenated across the column break, `visible[visible.length-1]`
  (L631) is that word's span whose bounding box extends into the next
  column, so `wordPlaceFromTarget` / `atEnd` logic or the 200ms re-anchor
  picks a place that is already on the next page and the flip is cancelled
  or the selection end jumps. Reproduce on device with Matthew 14:36
  ("gar-ment"), log `edge`, `atEnd`, `next` inside `advance`. Fix follows
  from the log; do not guess.

Keep this change confined to `onPointerMove` and `cancelEdge`. Highlight
persistence is untouched.

---

## 5. Remove Compare Version from the menu (phone and desktop)

- Row source: `app/src/lab/labSuperMenu.ts` L42
  `if (input.compare) rows.push({ id: 'compare', … })`. Stop pushing it.
  Delete the `'compare'` icon branch in `LabSuperMenu.tsx` L34 and the
  handler in `LabApp.tsx` L3630. Update `labSuperMenu.test.ts` and
  `LabV2Compare.test.tsx` L248.
- Add a toggle in **Reading settings**: `LabSettingsSheet.tsx` already has a
  "Compare edition" select in the `audio` view (L55) and a legacy "Compare"
  action in the hub (L50). Make the hub entry a proper toggle row labelled
  **"Compare"** with a switch bound to `prefs.compareOpen`, and remove the
  legacy `lab-ss-legacy-action` button. Phone swipe to Compare stays.
- Desktop: same removal, same settings toggle (Anders: both platforms).

---

## 6. Audio transport auto-dismiss on page turn

- `LabApp.tsx` L2363–2372: `pausedTransportVisible` keeps the transport up
  after pause; it is reset only on book/chapter change (L2367).
- Add: in `goNext` (L3141) and `goPrev` (L3186), when `!listen.playing`,
  `setPausedTransportVisible(false)`. Page turn while playing leaves the bar
  up (Anders: always visible while audio plays).
- Test in `BottomBar.audioLifecycle.test.tsx` or a new LabApp test: pause →
  next page → transport hidden; play → next page → transport still shown.

---

## 7. Back-to-book pill while the keyboard is up (phone chat)

- `lab.css` L7339–7341 hides `.lab-ask-toolbar` (which holds the
  "← Back to book" button, `LabAskPane.tsx` L636–645) whenever
  `.has-phone-keyboard` is set.
- Change: keep the toolbar visible with the keyboard up, as the normal
  transparent pill, top-left. Tapping it blurs the input (dismisses the
  keyboard) **and** closes chat in one go (`onDone`), per Anders.
- Check `LabAskPane.tsx` L575 comment about keeping the focused input stable
  while the keyboard is up; the pill must not steal focus on render.

---

## 8. Smaller Chat / Talk in the Explain card

Covered by item 1 (34px icon circles). No separate work.

---

## Order and verification

1. Item 1 (prompt + component + CSS + prefetch), then item 2 on top of it.
2. Item 6, 7, 5 (small, independent).
3. Item 3 and 4 need on-device diagnosis first; do them last and one at a
   time, each with a before/after screenshot on the phone.

Each item: `npm test`, `npm run build`, dev-server screenshot at phone
viewport (390px) in night mode, then deploy per `AGENTS.md`.
