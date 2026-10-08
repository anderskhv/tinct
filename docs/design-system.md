# Tinct design system (v1, 2026-10-08)

The shared look for every Tinct screen. Stylesheet: `app/public/lab/tinct-ui.css`.
Live reference (all tokens and components, four themes): `/lab/design-system.html`.
It was extracted from production (library_2's dark room and pills, the reader's
papers and v2 sheets), not invented. Use it instead of writing new buttons,
dialogs or colours.

## Use it

- Link `<link rel="stylesheet" href="/lab/tinct-ui.css?v=YYYYMMDDtag">` and bump the
  tag when the file changes. No dependencies; for EB Garamond and Playfair Display
  also link `/fonts/tinct-fonts.css` (without it the stacks fall back to Georgia).
- Theme with `data-tui-theme="light|book|dark|eink"` on `<html>` or on any element.
  Light is the default. A dialog over the dark library carries `dark`.
  `html[data-eink="true"]` (display-profile.js) overrides everything.
- Classes are all `tui-`: `tui-btn` (+`--primary|--secondary|--quiet|--sm|--lg|--block`),
  `tui-icon-btn`, `tui-close`, `tui-link`, `tui-chip`, `tui-pill`, `tui-tag`,
  `tui-input`, `tui-search`, `tui-list`/`tui-row`, `tui-card`, `tui-scrim` +
  `tui-dialog` (`__head|__title|__body|__fine|__actions`), `tui-check`,
  `tui-sheet` (`__grabber|__head|__title|__body|__row`), `tui-eyebrow`,
  `tui-section-title`, `tui-page-title`, `tui-book-title`, `tui-figure`.
- New CSS uses `--tui-*` tokens, never raw hex. Keep any page-specific class only
  for layout (position, grid), not for colour, type or shape.

## Rules

1. **Fonts per role. Never mono.** Playfair Display: page, dialog and sheet
   titles only. EB Garamond: book text, book titles, list titles, dialog body.
   System UI: all UI chrome (every button, chip, input, meta line, shelf head).
   Figures (page, percent, speed, time) use the role's own font with
   `font-variant-numeric: tabular-nums` (`tui-figure` does this in the UI face).
   IBM Plex Mono is not part of the system; the uses still in production are
   listed under "Mono, to convert" on the reference page.
2. **At most two families on one screen.** Normally book text in EB Garamond and
   UI in the system font. Playfair Display titles a page, dialog or sheet only
   where the screen does not already show two families.
3. **Copy: never add filler text.** Every piece of text has a purpose: it names,
   instructs, or informs a decision. No decorative taglines, no restating what
   the UI already shows, no placeholder prose.
4. **Buttons are pills.** One primary per surface; secondary (outlined) for the
   alternative, placed before the primary; quiet for toolbar navigation. Sentence
   case, no letter-spacing, never mono, never uppercase. 44px tall or 44px tap area.
5. **Chip vs pill vs tag.** Chip toggles (`aria-pressed`). Pill states a fact.
   Tag is an uppercase category above a title. Don't mix.
6. **Overlays.** A decision is a `tui-dialog` (centred on desktop, bottom on phone);
   settings or a list is a `tui-sheet`. Escape and the scrim close; focus returns
   to the opener. No Cancel in the actions → put a `tui-close` in the head.
7. **Colour.** Teal accent (`--tui-accent`) for links, switches and focus only,
   never a large fill. E-ink: no shadows, motion or blur.
8. **Radii.** Pills 999px; inputs 12px; cards and dialogs 18px; phone sheet top 20px.

## Before you ship a screen

Compare it against `/lab/design-system.html` in the same theme and viewport. The
"Drift found in production" section there lists known offenders (Add a book's
rights sheet, the library's three dialog styles, landing's square buttons,
Contents v2's Inter) and every remaining mono use; convert them when you touch them.
