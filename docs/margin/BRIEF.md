# Coder brief: the margin reader

Anders approved this design on 14 October 2026 after two rounds of review. You are the single serialized deploy owner; follow AGENTS.md.

## The three binding files

- **`docs/margin/mockup.html`** — open it in a browser; the Paper/Night switch flips every frame. It is binding for layout, spacing, wording and colour.
- **`docs/margin/margin-reference.css`** — every measured value from the mockup, per look (Paper, Book, Night, e-ink). Rename classes to fit the codebase, but do not change values.
- **`docs/margin/PROMPTS.md`** — the exact prompt text, models, token limits and metering for every new action.

Where these differ from older docs, these win. The shared chat thread from #376 (`public/lab/chat-thread.js` and `.css`) is reused inside cards; do not fork it.

## How to avoid ugly first versions (mandatory)

1. **Build each component as a static fixture first**, at the mockup's sizes, before wiring any data or AI. Components: bar, More, Define card, folded card, open card, stack row, primer trigger, primer, phone bar, phone More, bottom card. Use the fixture route or test page the lab already uses.
2. **Screenshot each fixture beside the same mockup frame**, in Paper and Night, at the same pixel size, and compare. Fix every difference in spacing, size, weight or colour before moving on. Attach the side-by-side pairs to the PR.
3. **Only then wire behaviour.** Do not restyle during wiring; if something must change, change the fixture and re-compare.
4. **No new visual ideas.** If a state is not in the mockup, compose it from existing pieces: same fonts, sizes and tokens. Note it in the PR for Anders.

## Scope and order

Ship in four PRs, each deployable on its own and each reported to Anders with screenshots.

| PR | Contents | Readers |
|---|---|---|
| 1 | Selection menu, phone bar, More, Define card with the dictionary, highlight default, the new actions and their prompts | Book reader and PDF reader. In the book reader, results open where Explain opens today until the book layout gets its margin. |
| 2 | Margin column: cards, leader lines, crowding, whole-PDF foot, narrow-window marks; phone bottom cards for answers and chat | PDF reader |
| 3 | Before you start: trigger, primer, Quiz me from the primer | PDF reader |
| 4 | Polish pass against the mockup, e-ink, keyboard, accessibility audit | PDF reader |

The book reader's own margin layout, with Two page and Compare as alternatives, is a later brief. Do not start it.

## 1. Selection menu

**Items, in order:** Ask (with a blinking caret), separator, Explain, Simplify, More (three dots), separator, highlight dot, note (folded-page icon). Explain and Simplify are words without icons. There is no Talk item. This replaces today's Explain, Chat, Highlight, Copy, Share row in `SelectionPopup.tsx`.

**Placement on desktop:** 56px above the selection's first line, left edge aligned 20px left of the selection start, clamped 16px inside the reader. The tip points at the selection. If there is less than 64px above the selection, show the bar 12px below the last line with the tip up.

**Typing:** with text selected, any printable key opens Ask with that character, so the reader never has to click first. The bar becomes the question field: min 330px wide, grows to 520px, then wraps to three lines. A mic sits left of the send disc. Return sends, Shift-Return breaks a line, and Escape returns to the menu. The mic dictates into the field using the same speech input as the chat composer, and does not start Talk.

**Explain and Simplify** answer in one tap, opening a card (PR 2) or today's Explain surface (PR 1, book reader).

**Highlight dot:** shows the current default colour. One tap highlights in it. A second tap, or a long press, replaces the bar's middle with the four colours (`HIGHLIGHT_COLORS`, unchanged). Picking one highlights and makes it the default. The default persists through the storage layer as today.

**Note:** highlights in the default colour and opens the note editor as today.

**More (desktop):** a 300px menu above the bar, aligned to the dots. Rows, each with a one-line description exactly as in the mockup:
- Define
- Fact-check
- Counterpoint
- Quiz me
- a separator
- Copy quote
- Share as image

There are no icons and no "New" tag. Copy quote copies the passage with the title and page. Share as image is the existing quote card.

## 2. Define (single word)

A one-word selection (double-click, or a word tap on the phone) opens the Define card instead of the bar.

- **Header:** the word, its part of speech and "Dictionary" on the right. Below it come up to three numbered senses from `services/dictionary.ts`, shown immediately, with no network needed.
- **Picking the sense when online:** `define_sense` moves the fitting sense to the top in full ink and turns the rest secondary (see PROMPTS.md). Wait at most 1.5 s, then keep the dictionary order.
- **Missing words:** if the dictionary has no entry, or the word is a name, use the existing contextual `define` when online. Offline, the card says "Not in the offline dictionary."
- **The foot of the card is the bar:** Ask, Explain, Simplify, More, highlight dot and note, acting on the word.
- **Width and colour:** the card is 360px wide, in the bar's colours.

## 3. Margin column (PDF reader, desktop)

- **Placement:** the page keeps its place. The column is 380px wide, starting 56px right of the page's right edge, and replaces the docked chat (`.byob-dock`). The page area narrows as it does today when the dock is open.
- **What becomes a card:** every kept result with a passage. That means Ask threads with a passage, Explain, Simplify, Define, Fact-check, Counterpoint, Quiz and highlights with notes. Highlights without notes do not get cards. Cards are a view of what is already stored; add new kinds to the store that holds kept explanations, with a `kind` field.
- **Alignment:** each card's top aligns with its passage's first line minus 4px. Cards keep the page's order and never overlap: a card that would collide moves down to 14px below the previous one.
- **One card open at a time.** Opening one folds the previous. A folded card shows its label and two lines, with a 1.5px rule on its left, or a 2px rule in the highlight colour for notes.
- **Open card contents:** label, close, the passage quote (italic 14px, cut at 120 characters), the question bubble (Ask only), and the answer with its first sentence in weight 600. Then the action-specific parts (verdicts, sources, quiz), the copy icon, and a follow-up line with caret and mic. A follow-up continues that card's thread.
- **Leader lines:** one SVG over page and column. Each line starts at a 2.6px dot 8px right of the page edge, level with the passage's first line, and curves to the card's label line. Lines to the open card are full strength; lines to folded cards are at 45%. The open card's passage gets a 1.5px underline in the same colour.
- **Crowding:** if the next card would end within 46px of the column foot, it and all after it gather into one row: "{n} more on this page" on the left, their kinds on the right. Clicking the row, or any passage, opens that card, folds the others and rescrolls the column.
- **Scrolling:** cards move with the page and stay level with their passages; the column foot does not move.
- **Column foot:** a hairline, a caret, and the hint "[/] the whole PDF" with a mic. The slash key focuses it. It is the existing whole-file chat; its answer opens as a card at the top of the column labelled "Whole PDF", and its full history is the existing thread.
- **Narrow windows:** below 1180px wide the column hides. Cards become 8px marks at the page's right edge, in the lead colour; clicking one opens its card as a floating card beside the mark.

## 4. The new actions

The card layouts are in mockup section 6. The prompts are in PROMPTS.md.

- **Simplify:** passage quote, then the answer. No question bubble.
- **Fact-check:**
  - While the search runs, the card shows the status line "Checking sources…".
  - Then the verdict line, with one paragraph per claim starting with an italic verdict word.
  - Sources appear as a row of plain underlined links in the system font, 12px.
  - Fact-check is the only action that uses the web.
- **Counterpoint:** the objection as the bottom line, the reasoning, then the author's reply.
- **Quiz me:**
  - The label shows "1 of 3" on the right, and the question is set at 18px.
  - The reader types or dictates an answer in the follow-up line. "Show answer" is on its right.
  - After an answer, the reader's bubble appears, then "Right.", "Nearly." or "Not yet." as the bottom line, the feedback and the cite tag. "Next question →" replaces "Show answer".
  - After question 3, the card shows the score and the question to reread.
- **Citation tags:** a `{p. 12}`-style token in any answer renders as a tag; clicking it scrolls the PDF there.

## 5. Before you start (primer)

- **Trigger:** at the start of a PDF, or of a top-level outline entry, a folded card sits at the top of the column. It reads "Before you start", with a [B] key and "The gist, the key claims and a map of {unit}." Clicking it or pressing B anywhere opens the primer in place. Its close button folds it back.
- **Contents:** gist, Key claims (numbered, with cite tags), Keep in mind (left rule), Map (rows with page ranges that scroll the PDF on click), the "Quiz me on this chapter" row, then a footer with "Made when you opened the file" and "Redo".
- **Storage:** stored with the file once made, so reopening never regenerates it. Generation starts only when the reader opens the trigger, not on file open.

## 6. Phone

- **Bar:** 48px tall, 10px from each screen edge, 12px below the selection's last line with its tip up, so it clears the phone's own Copy/Look Up menu above. If there is no room below, it goes 12px above the first line. Items: Ask, Explain, Simplify, More, the dot and note.
- **More:** a 210px list of names only, opening below the bar, aligned under the dots.
- **Define:** the same card as desktop, full width minus 20px, placed like the bar.
- **Bottom card:** answers and the chat open as a card along the bottom, about half the screen high. The page scrolls so the passage sits just above the card, still underlined. Swipe up for full height; swipe down or tap the page to close. Chat on the phone uses this same card instead of taking the whole screen.

## Keys (desktop)

| Key | Action |
|---|---|
| Typing with a selection | Ask |
| / | Ask about the whole PDF |
| B | Primer |
| N | Note on the selection |
| Escape | Close the menu, card or primer, one step at a time |
| Up/Down in More | Move between rows |
| Return in More | Choose the row |

## Must not change

- **Reading position:** it survives every action, card and resize; follow the position invariants in CLAUDE.md. Opening or closing the column must not move the reader's place on the page.
- **The PDF stays the PDF:** it is never re-rendered as text. Selection comes from the PDF text layer.
- **Visual rules:** no monospace, no capitals-only labels, and no teal accent in any of these components.

## Acceptance

- **Fixture pairs:** fixture screenshots beside the mockup frames, Paper and Night, for every component in the "mandatory" list, attached to each PR.
- **Real readers:** screenshots in a real book and a real technical PDF, at 1440×900 and 390×844, in Paper, Book, Night and e-ink.
- **Desktop selection:**
  - Typing with a selection opens Ask without a click.
  - One-word selections open Define with dictionary senses, offline too, as checked with the network off.
  - The highlight dot highlights in the last colour in one tap.
- **Margin:**
  - Five cards on one stretch of page never overlap, and the sixth onward gathers into the "more" row.
  - Leader lines stay attached while scrolling.
- **Narrow windows:** below 1180px wide, cards become marks.
- **Tests:**
  - Unit tests for every new prompt builder and intent parser.
  - Unit tests for card placement (order, 14px gaps, gathering) and citation-token parsing.
  - Existing tests pass, including the position guards.
  - All AI calls are mocked in tests and development.
