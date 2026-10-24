# Reader menu reference · 24 October 2026

This is the control map for the reader parity repair. It describes the existing
Tinct chrome and the layout choices being restored, not a new visual design.
The [margin mockup](margin/mockup.html), [19 October port plan](margin-port-plan-2026-10-19.md),
[23 October actual reader captures](shared-reader-previews-2026-10-23.md),
and the old reader's `app/public/lab/addbook/book.html` and `js/reader.js`
establish the surrounding look and labels.

| Surface | Header and entry | Aa / appearance | Book settings / source | Layout choice |
| --- | --- | --- | --- | --- |
| Desktop catalogue text | Back, book/chapter, visible **Aa**, Play, **t**; Notebook remains in the shared reader's t menu | Book / Light / Dark, text size, Advanced settings (font, alignment, line and paragraph spacing, margins), then Layout | Main and Compare versions, only if offered for this book | **Margin**, **Two-page**, **Compare**. Compare appears only with a distinct compatible version; selecting one keeps chapter/word place. |
| Desktop own EPUB or pasted text | Same header and visible Aa | Same text appearance and Layout | Only when a separate source is offered; a single source need not have a Book settings row | **Margin** and **Two-page** remain in Aa even with one edition. No synthetic Compare of the book with itself. |
| Desktop own PDF, Tinct text | Same shared text reader header | Same text appearance and eligible text layouts | **Tinct text** and **Original pages** are source choices, not compare editions | Margin / Two-page for Tinct text; Original pages opens its own PDF reader at the matched place. |
| Desktop own PDF, Original pages | The PDF reader's back/title, Notebook, Aa, and t controls | Original page theme and page size/fit/zoom, matching the old static PDF page reader | Original pages / Tinct text return at the matched source place | No text Compare and no invented reflow of the original PDF page. |
| Phone text reader | Back/title and t menu; no extra desktop header Aa | t → Aa keeps the existing themes, size, and Advanced settings | t → Book settings only for real version/source choices | Read and Compare remain the phone's established separate views; no desktop Margin/Two-page chooser in Aa. |
| Phone Original PDF | Back/title and t menu | t → Aa for page appearance/fit | t → Book settings for Original pages / Tinct text | The original PDF stays in its page/text-layer reader. |

The desktop Aa sheet uses the established paper-coloured, softly blurred V2
panel and 44px menu controls. Layout is a labelled choice group beneath theme
and size; its active choice has a check and `aria-pressed`. The t menu keeps
Librarian, Summarize, Catch me up, Notebook where applicable, Aa, Book settings,
Audio settings, and Profile. On the phone, Chat · Talk share the first row,
followed by chapter actions, Notebook, the three settings groups, Library, and
Profile. The old static margin reader keeps its own current menu until that
surface is unified; its Book settings also contains Focus view and conversion
actions that belong to that older reader.

## Selection and passage actions

The [mockup's selection sequence](margin/mockup.html) establishes the hierarchy:
the six-item bar is **Ask · Explain · Simplify · More · highlight dot · note**,
with no Talk action in the selection bar. More groups passage tools (Define,
Fact-check, Counterpoint, Quiz me) before output actions (Copy quote, Share as
image). Desktop More has a short description beneath each name; phone More has
names only. A selected single word opens Define first, preferably from the
offline dictionary. Ask expands into a question field; answers belong to the
selected passage. Highlight taps use the last colour and a further colour
choice changes that default. These are the mockup's intended rules, not a claim
that every route implements every detail today.

| Entry and state | Current shared reader | Difference from the mockup / capability rule |
| --- | --- | --- |
| Fresh desktop selection | [SelectionDeskBar](../app/src/components/reader/SelectionDeskBar.tsx) renders Ask, Explain, Simplify, More, colour dot, note. [SelectionPopup](../app/src/components/reader/SelectionPopup.tsx) supplies the actions. | The in-bar Ask question field is wired on shared routes; its current input has Send but no mockup mic. Single-word dictionary-first behaviour must be verified on each source rather than inferred from the mockup. |
| Desktop More | Define; Fact-check and Counterpoint when contextual explanation is available; Quiz me only with a shared-reader quiz callback; Character gallery when character data exists. Copy is in the second group; Share as image requires an existing highlight and share callback; Show page requires a source-page callback. | The mockup says **Copy quote** and **Share as image** for a selection and has no Character gallery or Show page. The current conditional Share is narrower. Do not advertise unsupported actions merely to match the picture; Related is absent from this menu. |
| Existing desktop highlight | Ask, Explain, More, four colours, note and remove. | This is a distinct edit state, not the six-item fresh-selection bar; Simplify is reached through fresh selection. |
| Fresh phone selection | [LabPhoneBar](../app/src/lab/marginPhone/LabPhoneBar.tsx) renders the same six top-level actions. More lists Define, Fact-check, Counterpoint, Quiz me, Copy; Show page appears only when a PDF source callback exists. | Phone More currently says **Copy**, not **Copy quote**, and does **not** expose Share as image. Its names-only presentation agrees with the mockup; the missing action and label difference remain explicit gaps. |
| Existing phone highlight | Ask, Explain, four colours, note, remove; More appears only when Show page exists. | Recolour and edit are available, while fresh-selection passage actions are not all repeated. PDF Show page is a source navigation action, not a text layout. |

The action hierarchy is selection → More or one direct action → an answer/card
or a source action. [LabApp's phone action handler](../app/src/lab/LabApp.tsx)
turns Define, Simplify, Fact-check, Counterpoint and Quiz me into passage
cards; Copy copies the selection. The more advanced answer format in the mockup
(verdict vocabulary and sources for Fact-check, one-question-at-a-time quiz,
follow-up mic) remains a visual and content reference, not a guarantee that
every current companion response has that exact form.

## Cards and chapter controls

| Level | Current reader and source | Mockup intent / known limit |
| --- | --- | --- |
| Desktop passage card | Shared text uses the companion/selection response paths in [LabApp](../app/src/lab/LabApp.tsx); the [margin preview bridge](../app/src/lab/marginPreview/marginPreviewCards.ts) maps stored conversation turns to passage cards. | The mockup specifies a 380px right column with 56px gap, ordered cards that push down, one open card, folded others, leader lines and an overflow row. Treat those exact dimensions and crowding rules as mockup intent; confirm them visually on each source before claiming full parity. Original PDF retains original pages and selection through its text layer. |
| Phone answer and chat | [LabPhoneCard](../app/src/lab/marginPhone/LabPhoneCard.tsx) and [LabApp](../app/src/lab/LabApp.tsx) implement a single bottom-card state for passage actions, notes and Quiz me; Chat/Talk close the prior card when phone margin mode is active. | This describes the source implementation, not a browser-verified promise for every shared phone route. The mockup calls for a half-height card, swipe-up full thread and passage underline; verify those gestures and dimensions in the actual route. |
| Chapter opening | [LabChapterHeading](../app/src/lab/LabChapterHeading.tsx) has Primer and Catch me up entry points when callbacks are supplied; the mockup calls its folded start card “Before you start” and also mentions a B shortcut. | Public and own chapters supply different callbacks. Current ContinuousReader renders a chapter-bounded window, unlike the old static all-chapters scroll; chapter navigation advances separately. Do not infer a Primer card at every boundary or silently change this design choice. |
| Chapter ending | [LabChapterEnd](../app/src/lab/LabChapterEnd.tsx) renders Recap when enabled, Quiz me in phone margin mode when Recap is enabled, Note when enabled, Next chapter when present, and an optional finished-book sharing card. | An own book can suppress Recap for a chapter; the finished card is conditional. Chapter controls are distinct from selection More's passage Quiz me. Verify visibility and placement in the chapter-bounded continuous window and in paged views. |

The [19 October port plan](margin-port-plan-2026-10-19.md) and
[mockup](margin/mockup.html) are design references. The conditional rules above
come from the named source modules; they distinguish current capabilities from
desired consistency across catalogue text, own EPUB/text, and PDF. The tables
report source-level implementation and reference intent; they do not replace
browser verification of each repaired route.

The actual pre-repair desktop menu in Light, Book, and Dark is captured in
`docs/assets/shared-reader-2026-10-23/candidate16-desktop-*-reader-menu-1440x900.png`.
Those images are evidence of the current colours and chrome, not screenshots
of this repaired layout chooser. Acceptance should capture the repaired Aa
sheet and each applicable source state from a local build before release.
