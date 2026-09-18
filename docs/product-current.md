# Current reader behavior

This active-checkout note records the September 17 reader update. It does not
replace or silently import the broader, historical Documents product inventory.
Release evidence and limits are in [the reader feedback plan](reader-feedback-2026-09-17.md).

- Explain uses a compact, stable, scrollable glass card. Its icon expands to one
  desktop leaf or the phone reader viewport. Chat and Talk retain the explanation.
- Chat opens with fresh writing space; prior messages remain above. Displayed
  explanations are recorded through the book-scoped chat history writer.
- Explain shares the current speculative request for 60 seconds. There is no
  persistent answer cache; displayed explanations remain in chat history.
- Requested personal recall searches available/synced reading records, chats and
  highlights across editions/books. Ordinary voice context stays book-scoped.
- Read selections extend across pages with a 700ms top/bottom edge hold, within
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

The private `/lab/voice` test room allows site administrators to compare editable
Live1 speaking/reasoning prompts and Terra/Sol/Luna backend models. It leaves
ordinary reader voice defaults unchanged. See [test room scope and verification](voice-test-room-2026-09-17.md).

## Library conversation surfaces — September 17 follow-up

A dim divider precedes Browse the library. Mobile librarian Chat and Talk occupy
the visible screen and hide the dock until closed. Desktop retains its chat window
and uses a bounded, centred voice surface with round Mute/End controls.
[Verification and release status](library-voice-layout-2026-09-17.md).

## Voice follow-ups — September 18

Sol with compact context is the approved next Talk default. The change supplies
reader location at connection, explicitly suppresses fillers and retains the
original turn identity of late backend continuations. Release status and the
limits of managed Live speech steering are recorded in
[the voice follow-up plan](voice-sol-light-2026-09-18.md).
