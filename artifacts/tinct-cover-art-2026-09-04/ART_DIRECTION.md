# Tinct Cover System — art direction v1

## The idea

The library should feel like one excellent independent press rather than a pile of unrelated commodity editions. Each cover is a **single intelligent visual proposition** about the book: one metaphor, one dominant silhouette, one controlled accent. The shared family resemblance comes from print process, paper, typography, proportions, and restraint—not from repeating a template so literally that every book becomes interchangeable.

The source aesthetic is Tinct's landing surface: warm uncoated paper (`#ece7db` family), near-black ink, deep mineral blue (`#1f4a5c` family), copper/ochre accents, visible material grain, and literary serif typography.

## Image language

- Printmaking, not digital spectacle: linocut, woodcut, letterpress, cut paper, stencil, or restrained two-to-four-color screenprint.
- A bold motif must survive at the current mobile card size of **108×162 px**.
- Prefer symbols, spatial relationships, and visual paradoxes over plot summaries or character portraits.
- Keep the top ~24% and bottom ~18% quiet enough for deterministic type.
- Texture should suggest ink and paper, never distressed-template noise for its own sake.
- Use culture- and period-specific geometry or material cues carefully; avoid exotic shorthand.

## Typography

Artwork is always generated **without text**. Title and author are applied deterministically after approval. This avoids malformed lettering and guarantees accessibility and localization.

- Title: EB Garamond display treatment, centered, high contrast, usually 1–3 lines.
- Author: tracked capitals, smaller, centered.
- Title must remain readable at 108×162. Long titles get fewer words per line and a smaller calibrated size; they do not become illegibly condensed.
- The artwork crop, not the title, carries primary recognition at tiny 58×86 uses; alt text carries semantic identity.

## Palette

- Foundation: parchment, charcoal/blue-black.
- One book-specific secondary: mineral blue, oxblood, plum, sage, terracotta, or smoke.
- One optional accent: ochre/copper/cinnabar, used sparingly.
- Avoid rainbow series coding, neon, high-gloss gradients, and generic beige minimalism.

## Non-negotiable avoid list

- Generic fantasy concept art, glowing magic, cinematic fog, photorealistic statues, or “epic” hero poses.
- Literal montage of plot points.
- Stock-looking portraits, imitation of famous editions, or borrowed contemporary artwork.
- AI lettering, pseudo-text, signatures, logos, watermarks, or mockups of physical books.
- Cultural caricature, decorative “ancient” glyphs, or symbols used without editorial confidence.
- Fine detail that collapses at thumbnail scale.

## Prompt template v1

Every manifest row supplies title, author, form, era, themes, and a book-specific concept seed to this fixed scaffold:

> Original symbolic cover artwork for `{title}` by `{author}`. Express one visual metaphor grounded in `{themes}`; use `{concept_seed}`. Sophisticated limited-palette linocut/letterpress on warm uncoated paper, flat shapes, visible ink grain, strong silhouette. Exact 2:3 portrait. Must read at 108×162 px. Quiet low-detail upper 24% and lower 18% for later deterministic typesetting. Artwork only: no words, letters, numerals, pseudo-text, borders, logos, signatures, watermarks, or physical-book mockup. Avoid generic AI fantasy, plot montage, photorealism, gradients, and imitation of an existing edition.

The editorial pass must replace the manifest's initial concept seed with a concrete book-specific motif before generation. The seed is a planning cue, not permission to batch generic images.

