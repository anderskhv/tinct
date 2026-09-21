# Current reader behavior

This note records the active reader, including the September 21 reader polish release.
Release status and verification limits are in [the reader polish plan](reader-panels-selection-2026-09-21.md)
and [the September 17 release plan](reader-feedback-2026-09-17.md).

- Explain uses a compact, stable, scrollable glass card. Its transparent icon expands to the content height, bounded by one
  desktop leaf or the phone viewport. Close stays outside the scrolling text. Chat and Talk retain the explanation.
- Chat opens with fresh writing space; prior messages remain above. Displayed
  explanations are recorded through the book-scoped chat history writer.
- Explain shares the current speculative request for 60 seconds. There is no
  persistent answer cache; displayed explanations remain in chat history.
- Requested personal recall searches available/synced reading records, chats and
  highlights across editions/books. Ordinary voice context stays book-scoped.
- Read selections extend across pages with a 450ms top/bottom edge hold, within
  the chapter. Compare retains its existing selection behavior.
- Edition projection preserves one saved highlight. Shared exact wording stays
  precise; differing Bible wording uses verses, and explicitly aligned prose
  editions use paragraphs. Unsupported alignment never paints guessed words.
- Pausing retains the last audio word without an underline. Explain-to-Talk uses
  the normal call surface while retaining the explanation in model context.

Production verification for this update is recorded in the linked release plan;
the plan distinguishes controlled browser/voice fixtures from live model testing.


## Library and book preparation — September 17

The library displays all eligible books under the existing Houses and Shelves,
below an interactive cover reel. Desktop book clicks, drag, horizontal scrolling
and keyboard selection work. Preparation uses a stable dark frame, left-aligned
scrollable preface, compact optional characters, and existing text/comparison/audio
edition controls; cover artwork moves into place without becoming a magnified
background. [Release and verification](library-preparation-polish-2026-09-17.md).

## Responsive entry surfaces — September 17

The landing uses content-flow copy, a settling cover fan and Pick your book
on phone/portrait tablet, with separate desktop cover columns. The library opens
on a centred starter reel with full descriptions and estimated reading time.
Category rows scroll horizontally; desktop rows also support mouse dragging.
Short novels, Epics and Philosophy lead the complete catalogue. Reading estimates
use published word counts and a disclosed 140–200 words/minute range, without
invented print-page counts. Mobile Featured selection rotates between visits.
Mobile removes the header and places sign-in/account access in Search. The glass
dock is shallower; preparation offers separate Talk / Chat actions and provenance-labelled editions
in Primary, Audiobook, Compare order. Librarian
messages use the existing safe Markdown renderer.
[Release evidence and device-verification limits](library-responsive-2026-09-17.md).

## Selection and anonymous AI — September 17 iteration

Selection offers Explain, Ask, Highlight and Copy. Ask attaches the selection to
Chat; Highlight opens colours and an optional note editor. Preparation suggestion
cards submit immediately. Sign-in retains reader/book return parameters.
Anonymous Explain, Chat and spoken questions share ten AI interactions; further
AI use offers an account with the existing first month free. Book opening and
reading do not trigger an account nudge, and reading remains available without AI.
[Iteration verification and release status](library-iteration-2026-09-17.md).

The September 17 private voice test room was removed by the September 18 Grok
migration. Its [test room plan](voice-test-room-2026-09-17.md) is historical.

## Library conversation surfaces — September 17 follow-up

A dim divider precedes Browse the library. Mobile librarian Chat and Talk occupy
the visible screen and hide the dock until closed. Desktop retains its chat window
and uses a bounded, centred voice surface with round Mute/End controls.
[Verification and release status](library-voice-layout-2026-09-17.md).

## Voice follow-ups — September 18

The earlier Sol/Live chain was superseded by native Grok speech-to-speech
(`grok-voice-latest`, voice `altair`). All Talk entry points use it; dictation
remains separate. The browser sends audio through a WebSocket using an ephemeral
secret minted by the Worker. The minimal prompt and model remain unchanged in
the September 21 capture-recovery work. See [Grok release evidence and limits](voice-grok-2026-09-18.md).

## Page-edge hyphenation — September 18

Measured reader pages may fill their final line with the opening of an English
or Danish word and a discretionary hyphen. The fragment is display-only: the
next page owns the complete logical word for position, selection, accessibility
and audiobook follow. Language patterns load on demand, edition switches cancel
stale layout work, and the reader preserves its logical position through
repagination, page turns and reload. Candidate and production checks run in
muted headless desktop and phone browsers. See the
[hyphenation hardening release plan](hyphenation-hardening-2026-09-18.md).

## Reader polish — September 21

[Release status and acceptance evidence](reader-panels-selection-2026-09-21.md).

- Desktop Chat, Talk, Explain, Define and Reading settings share header dragging
  and viewport bounds. Chat/Talk minimize and restore; Chat/Talk/Explain/Define
  resize. Positions are remembered for the browser session. Small selection
  menus remain attached to the passage; phone cards and sheets remain in place.
- Highlights preserve text geometry around verse numbers. Selection uses visible
  line fragments to reach short final words and paints a trailing hyphenated
  fragment before the page turns. The cross-page instruction hint is removed.
- Explain offers a highlight pen and theme-coloured More/Less. Dictionary misses
  stay in Define: a lexical AI definition with subtle provenance replaces the
  former passage explanation. The existing archaic supplement now participates
  in lookup; failed dictionary downloads can retry.
- Full library is available from the book title. Desktop progress toggles
  percent of book/chapter. Comparison footers separate edition names from folios,
  with the modern edition labelled **Tinct Modern English**.
- Phone titles follow the reading margin; its progress uses the book font at a
  smaller size. Desktop frame and page share paper colour with a subtle centre
  gutter shadow.
- Advanced settings remain reachable within the viewport. Line spacing, paragraph
  spacing and margins use bounded sliders with editable decimal-comma values.
  Restore defaults resets appearance while preserving edition, position and data.
- Talk detects a stopped capture graph, presents reconnect recovery and cleans up
  tracks on End. Same-page restart reuses worklet registration, and stale response
  completions cannot overwrite a new answer. Real-device echo and Bluetooth
  behaviour remain outside silent browser verification.
