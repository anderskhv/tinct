# Tinct Kids — Concept Document

**Created:** 2026-03-25
**Status:** Concept / parking lot — not yet in development

---

## The Idea

Illustrated, long-form retellings of Western classics for kids aged 8+. Not dumbed down. The original story structure is respected — hard parts are explained, not removed.

Part of the Tinct family. Same mission: make the classics accessible. Tinct is for adults. Tinct Kids is for children and families.

## What makes it different

Most kids' adaptations do one of two things wrong:
1. **Oversimplify** — 20-page picture book that loses the story
2. **Sanitize** — cut Cain and Abel, cut Noah's drunkenness, skip the Cyclops blinding

Tinct Kids does neither. The full story, told at length, with illustrations and context where it's hard. We trust that the original authors were good storytellers and that children can handle real stories when they're well-told.

## Core principles

- **Don't talk down.** Kids 8+ can handle complexity. Explain, don't remove.
- **Respect the original structure.** Don't rearrange the story to "help" the reader. If the Odyssey starts in medias res, so does ours.
- **Full-length, not abridged.** Shorter than the original, yes. But 100+ pages, not 20.
- **The hard parts stay.** Cain kills Abel. The flood destroys the world. Odysseus blinds the Cyclops. Context and illustration make these teachable moments, not trauma.
- **Optionality on length, NOT on content.** Parents can choose a shorter or longer version. They cannot choose to skip difficult scenes.

## Features

- **Illustrations** — DALL-E generated, consistent character design across the book. Full-page illustrations at key moments, smaller illustrations throughout.
- **Interactive dialogue** — SMS-style message bubbles between characters. Click through conversations. Makes characters feel alive.
- **Audiobook** — TTS or pre-generated read-aloud. Parents can play it for kids at bedtime without reading themselves.
- **AI chat** — Kids can ask questions about the story ("Why did Odysseus lie about his name?"). Same Tinct chat engine, tuned for age-appropriate responses.
- **Offline PWA** — Download books for vacation/travel. No wifi needed.
- **Physical books** — Export as PDF/print. Not just digital.

## Library (initial candidates)

- The Odyssey (already in Tinct)
- The Bible — book by book (Genesis, Exodus, etc.)
- Dante's Inferno
- Shakespeare (selected plays)
- The Iliad
- Aesop's Fables
- Norse mythology (Edda)
- Greek myths (collected)

Each book gets a go/no-go decision on whether a kids' version adds value.

## Business model

Subscription-based. AI features + ongoing content justify recurring revenue. Free preview of first chapter/book, then paid.

## Branding

Part of the Tinct family. Working names:
- Tinct Kids
- Tinct Junior
- Tinct Young Readers
- Little Tinct

Should share Tinct's visual DNA (warm tinted palette) but feel distinct — more playful, more illustrated. The brand connection matters: parents who use Tinct discover Tinct Kids, and vice versa.

## Technical approach

- PWA (shared with Tinct's reading engine)
- Different reading UI — more visual, larger text, illustration-heavy
- Shares Tinct's Supabase backend, auth, billing infrastructure
- Content generation: kids editions via CLI (same as Tinct), illustrations via DALL-E
- Prior art: Spirerne project (Books/Spirerne/) used DALL-E for illustrations successfully

## Connection to Anders's mission

"Spreading optimism about humanity" — these classics ARE the story of humanity. Making them accessible to children is the most direct version of the mission. A kid who reads the Odyssey at 8 understands something about perseverance, cunning, and homecoming that stays with them. A kid who reads Genesis understands creation, fall, and covenant. This is Western cultural literacy as a gift, not a curriculum.

## Open questions

1. Separate app/domain or section within tinct.app?
2. Character consistency in DALL-E illustrations across 100+ images — how to solve?
3. What age rating system, if any?
4. How to handle genuinely mature content (sexual violence in Greek myths, genocide in the Bible)?
5. What does the SMS-style dialogue interaction actually look like? Prototype needed.
6. Pricing: per-book or subscription?
