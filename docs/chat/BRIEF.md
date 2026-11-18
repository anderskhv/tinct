# Coder brief: the reader chat, redrawn

Anders approved this on 9 October 2026. It changes what is inside the chat, not where the chat lives. You remain the single serialized deploy owner; follow AGENTS.md.

**The design:** `docs/chat/mockup.html` (open in a browser; Paper/Night switch at the top). Its section "The thread, measured" carries every value. Where this brief and the mockup differ, the mockup wins.

## Overrides after Anders's iPhone test (10 October 2026)
These replace the matching rules below and in the mockup.
- **Order:** the thread is ordered by each message's own time, newest at the bottom. A refresh (the tab coming back) never reorders, drops or re-pins it.
- **Caret (rules 5, 9, 10):** no drawn 2px bar. The composer uses the system's own thin caret, tinted with the muted ink (`caret-color: var(--tc-muted)`). An empty, unfocused composer shows just the hairline.
- **Streaming (rule 6):** no cursor anywhere. Before the first word, three small faint dots breathe slowly; then new words fade in. Static under `prefers-reduced-motion`.
- **Scrolling while answering:** on send the thread scrolls once so the question sits near the top, with a little of the previous answer above it. The answer grows downward under it; the view does not follow. If it runs past the bottom, the Latest pill shows (no jump). A reader's own scroll is never undone, and nothing moves when the answer finishes. The previous answer keeps its copy mark until the new one finishes (rule 3), so nothing above the question shifts as the answer begins.
- **Back to book (rule 8):** the faint 12px × is replaced by the pre-redesign "← Back to book" pill (EB Garamond 14px, 36px tall, bubble tone; outline only in e-ink), top left of the thread in both readers, phone and desktop. It closes Chat exactly as the × did; Escape still closes on the desktop, and the book box keeps its › collapse tab. The thread's top padding and fade are 60px (solid paper under the pill) so it never covers a line.
- **Type (rule 11):** answers 18px (17px desktop), bubbles 17px (16px desktop); line-heights keep their ratios (1.5, 1.4).

## Two homes, one component
- **Book reader, desktop:** the floating box over the right page stays exactly where it is (`.lab-ask`: width `min(30rem, 38vw)`, 24px from the right, 24px corners, the `›` collapse tab). Only its contents change.
- **PDF reader (own books), desktop:** the docked panel stays as it is (`.byob-dock`: fixed, 14px from the right, 380px wide, full height below the bar, 16px corners; the page area narrows while open). Only its contents change.
- **Phone, both readers:** the full-height sheet as today, with the new header, thread and composer.
- Build **one** thread component and use it in both readers. The only difference is the divider's label: the edition's chapter label in the book reader ("The Window · 1", "Chapter 14"), the page or section in the PDF reader ("Page 12").

## What changes
1. **No sender labels.** The reader's words sit in one right-aligned bubble; the companion's answers are plain text at full width. Remove "You" and "Tinct".
2. **No timestamps under messages.** One italic divider appears only when the chapter/page or the calendar day changes: `{chapter label} · {day}`. The exact time appears in the hover/press row.
3. **Hover / press row.** Hidden by default. Desktop: on hover; phone: on press-and-hold, fading after 3 s or on scroll. Copy, plus the time right-aligned (same on the reader's own bubble). No read-aloud button and no regenerate button. The **newest answer** shows a copy mark permanently, until a newer answer exists.
4. **Quoted passage.** A question that came from a highlight or Explain carries the passage above the bubble as an italic quote with a 2px bar, cut at 240 characters. Tapping it scrolls the page to the passage.
5. **Composer.** See rule 9: a hairline and a caret, no box, no placeholder.
6. **Streaming:** a blinking 2px cursor, no "thinking" line.
7. **"Latest" pill** when the reader has scrolled more than a screen up.
8. **No header.** Nothing above the thread: no "Chat" title, no discs. One faint 12px close mark top right (28px hit area); the book-reader box keeps its collapse tab. Escape closes on desktop, swipe down on the phone.
9. **Composer is a line and a caret.** A 1px hairline, 12px of air, then the text with a blinking 2px caret. No fill, border, corners or placeholder text. Mic and Talk as bare 17px faint marks; a bare ink up-arrow replaces them once there is text. Return sends, Shift-Return breaks a line, ↑ in an empty composer recalls the last question. Grows to five lines. Hint once per session on desktop: "Return sends · Shift-Return new line · ↑ last question · Esc closes".
10. **No empty-state copy.** An empty thread shows the caret only.
11. **Rhythm and type:** see the measured table. EB Garamond for every word in the thread; no Playfair (there is no title); the system font only for the 12px time and the 11px hint. Sizes one step below the reader's text: answers 17px (16px desktop), bubbles 16px (15px desktop), divider 13px, quoted passage 14px. Never monospace, never uppercase, never an accent colour. Follows the reader's look (Paper, Night, e-ink).

## Keep
- Minimise and close in the header, the collapse tab on desktop, the phone sheet behaviour, Talk and dictation, history and context exactly as today.

## Acceptance
- Phone, desktop book reader and desktop PDF reader match the mockup in Paper and Night (and e-ink renders without fills or shadows).
- A thread with messages from two chapters and two days shows exactly two dividers.
- Hover and press-and-hold reveal the row; the newest answer's copy mark moves when a new answer arrives.
- No header, title, placeholder, welcome line or suggested questions anywhere in either reader; an empty chat is a caret.
- Escape closes and ↑ recalls the last question on desktop.
- Composer: 44px at rest, grows to five lines, send arrow appears with text, Return/Shift-Return behave as specified.
- No monospace, no sender labels, no per-message timestamps, no read-aloud or regenerate buttons anywhere in either reader.

Report to Anders with screenshots of all three surfaces in both looks.
