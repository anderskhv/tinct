# Coder brief: the reader chat, redrawn

Anders approved this on 9 October 2026. It changes what is inside the chat, not where the chat lives. You remain the single serialized deploy owner; follow AGENTS.md.

**The design:** `docs/chat/mockup.html` (open in a browser; Paper/Night switch at the top). Its section "The thread, measured" carries every value. Where this brief and the mockup differ, the mockup wins.

## Two homes, one component
- **Book reader, desktop:** the floating box over the right page stays exactly where it is (`.lab-ask`: width `min(30rem, 38vw)`, 24px from the right, 24px corners, the `›` collapse tab). Only its contents change.
- **PDF reader (own books), desktop:** the docked panel stays as it is (`.byob-dock`: fixed, 14px from the right, 380px wide, full height below the bar, 16px corners; the page area narrows while open). Only its contents change.
- **Phone, both readers:** the full-height sheet as today, with the new header, thread and composer.
- Build **one** thread component and use it in both readers. The only difference is the divider's label: the edition's chapter label in the book reader ("The Window · 1", "Chapter 14"), the page or section in the PDF reader ("Page 12").

## What changes
1. **No sender labels.** The reader's words sit in one right-aligned bubble; the companion's answers are plain text at full width. Remove "You" and "Tinct".
2. **No timestamps under messages.** One italic divider appears only when the chapter/page or the calendar day changes: `{chapter label} · {day}`. The exact time appears in the hover/press row.
3. **Hover / press row.** Hidden by default. Desktop: on hover; phone: on press-and-hold, fading after 3 s or on scroll. Copy and listen (copy only on the reader's own bubble), plus the time right-aligned. The **newest answer** shows copy, listen and ask again permanently, until a newer answer exists.
4. **Quoted passage.** A question that came from a highlight or Explain carries the passage above the bubble as an italic quote with a 2px bar, cut at 240 characters. Tapping it scrolls the page to the passage.
5. **Composer.** One line at rest (44px), "Ask about this page", mic and Talk as quiet discs inside. Grows to five lines. Once there is text, an ink disc with an up arrow replaces mic and Talk. Return sends, Shift-Return breaks a line. Desktop shows the hint once per session.
6. **Streaming:** a blinking 2px cursor, no "thinking" line.
7. **"Latest" pill** when the reader has scrolled more than a screen up.
8. **Rhythm and type:** see the measured table. EB Garamond for every word in the thread; Playfair for the word "Chat"; the system font only for the 12px time and the 11px hint. Never monospace, never uppercase, never an accent colour. Follows the reader's look (Paper, Night, e-ink).

## Keep
- Minimise and close in the header, the collapse tab on desktop, the phone sheet behaviour, Talk and dictation, history and context exactly as today.

## Acceptance
- Phone, desktop book reader and desktop PDF reader match the mockup in Paper and Night (and e-ink renders without fills or shadows).
- A thread with messages from two chapters and two days shows exactly two dividers.
- Hover and press-and-hold reveal the row; the newest answer's actions move when a new answer arrives.
- Composer: 44px at rest, grows to five lines, send arrow appears with text, Return/Shift-Return behave as specified.
- No monospace, no sender labels, no per-message timestamps anywhere in either reader.

Report to Anders with screenshots of all three surfaces in both looks.
