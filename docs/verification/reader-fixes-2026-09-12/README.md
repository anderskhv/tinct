# Reader fixes — verification, 2026-09-12

Chromium (Playwright, `/opt/pw-browsers/chromium-1194`) against `CI=true npm run build`
output served statically. `before` is a build of `origin/main`; `after` is this branch.
Every `/api/*` call is answered locally by the script — nothing reached Anthropic.
Desktop shots are 1440×900, phone shots 393×852.

## 1 — the compare row in the menu

| | before | after |
|---|---|---|
| desktop, compare showing | `Main Version` (`data-desktop-view=compare`) | `Compare off` |
| phone, compare showing | `Main Version` | `Main Version` (unchanged) |

`menu-desktop-compare-*.png/.txt`, `menu-phone-compare-*.png/.txt`.
The action was already correct on desktop — the row turns the second pane off —
so only the label moved.

## 2 — Enter in the desktop chat composer

`chat-typed-*.png` (text typed), `chat-after-enter-*.png` (after one Enter).
Before: Enter inserted a newline and the composer grew. After: Enter sends.
Shift+Enter still inserts the newline, and the phone sheet is untouched.

### the "black dot" above the field's top-right

Not reproducible on Linux: a full-document census across the Enter press found
691 elements before and after, three mutations, all of them the textarea's own
`style` and text. No element, pseudo-element or visibility change appears
anywhere. The two `style` mutations are the auto-grow measurement — `height: 0px`,
read `scrollHeight`, set the height — and at `height: 0px` the content overflows
the field by its whole height, so the field paints a scrollbar. Where scrollbars
are overlays (macOS) that is a short dark thumb pinned at the top-right, because
`scrollTop` is 0; on Linux headless overlay scrollbars are not painted at all,
which is exactly what the pixel diffs show. The field now carries no scrollbar
until it is genuinely clipped. Not Enter-specific: any keystroke that adds a
line, a wrap included, ran the same measurement.

## 3 — three free interactions before the gate

`gate-send-first-*.png`, `gate-send-second-*.png` — two chats sent with the send
button (Enter did not send on main):

- before: `spent=1`, the account sheet is **shown** on the second message
- after: `spent=2`, no sheet

`gate-after-third-*.png` / `gate-after-fourth-*.png` — three chats then a fourth:
`tinct:lab-ai-actions = 3`, no sheet after the third; the sheet appears on the
fourth with its wording and design unchanged, and the unsent draft stays in the
composer. Chat and voice spend the same counter.

## 4 — the Margins ("marking") setting on desktop

`margins-desktop-*.txt` reports the passage's side padding at the narrow and wide
ends of the control:

| | narrow | wide | moves |
|---|---|---|---|
| desktop before | 43.2px | 43.2px | **no** |
| desktop after | 30.24px | 62.64px | yes |
| phone before | 17.6px | 35.2px | yes |
| phone after | 17.6px | 35.2px | yes |

`margins-desktop-control-*.png` is the control itself; `margins-*-narrow/wide-*.png`
are the pages. Alignment, line spacing and paragraph spacing all already changed
the desktop page; Margins was the only one that did not.
