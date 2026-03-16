# AI-Enhanced Reading Platform — Tinct

## Organization

This project is part of Anders's portfolio, managed by `claude.md` (Group CEO) at the Documents root. This CLAUDE.md is the project CEO — it owns this project end-to-end.

**IMPORTANT: You are a project CEO, NOT the Group CEO.** Do NOT run the session protocol from the root claude.md (no Garmin sync, no calendar check, no morning check-in, no time tracking). That is handled by the Group CEO in the root Documents folder. You focus only on this project's code and tasks.

**Functional experts available on request** (load when needed):
- `../../agents/design.md` — UX/UI standards, visual consistency, house design language
- `../../agents/marketing.md` — Growth strategy, positioning, launch planning
- `../../agents/deutsch.md` + `../../agents/deutsch-condensed.md` — David Deutsch philosophical advisor

**Screenshots folder:** `../../Screenshots/` — Anders drops screenshots here for review. Use the Read tool to view them (it handles images natively). When asked to "check the screenshot" or "look at this", check this folder for the latest files.

When Anders says "consult the design lead" or "what would marketing say?", load the relevant file.

---

## Auto-Documentation Rule

**Automatically update this file** when making decisions during conversations. When we settle on a design choice, product direction, architecture decision, or project standard, append it to the Decisions Log at the bottom. Use judgment — log things useful for future sessions, skip trivial one-off choices.

---

## Project Overview
An AI-enhanced reading platform (desktop-first, mobile later) for engaging deeply with literary classics. Starting with The Odyssey. Features include: multiple reading styles/translations (original, modern, kids; in English + Danish), collapsible side panel with standard analysis content, Claude-powered chat for discussing highlighted passages, annotation system, chapter synopses (spoiler/no-spoiler), voice input, and a "takeaways" file. Long-term: custom e-reader hardware with voice interface + EPUB bookstore.

---

## Popperian Critique — March 5, 2026

### Critique 1: The Zero-Moat Problem
Public domain books are free and available everywhere. Project Gutenberg, Standard Ebooks, Internet Archive, and dozens of beautiful reader apps already serve this content. The *text itself* cannot be your competitive advantage because anyone can offer the same books. Your moat has to come entirely from the AI layer — and that layer is trivially replicable. Any competitor can wrap Claude or GPT around the same texts within a week.

**Implication**: The product must create value through *experience design* and *accumulated user data* (annotations, chats, takeaways), not through content access. Think hard about what makes the experience sticky enough that users wouldn't just paste a passage into ChatGPT.

### Critique 2: You May Be Solving a Problem Readers Don't Have
The Kindle's simplicity is a feature, not a bug. Deep reading requires sustained focus. A side panel with chat, analysis, annotations, multiple versions, and voice input could turn reading into a *fragmented, distracted* experience. Most serious readers of classics specifically seek *immersion*, not interruption.

**Counter-question**: Is your target user someone who *already reads* classics and wants more depth? Or someone who *doesn't yet* read them and needs the support? These are very different products. The first group may resent the scaffolding; the second may not be willing to read The Odyssey even with it.

### Critique 3: LLM Translations Are Not Good Enough (Yet)
Literary translation is one of the hardest creative tasks. Professional translators of The Odyssey (Fagles, Lattimore, Wilson) spend years on a single work, making deliberate choices about tone, register, rhythm, and cultural nuance. Current LLMs produce *functional* translations but not *literary* ones. A "contemporary English" version via Claude will read like a Wikipedia summary of Homer, not like Emily Wilson's Odyssey.

**Risk**: If users compare your LLM translation to a real one, your product loses credibility. The "kids version" is more defensible because no one expects literary artistry there, but the "modern English" version sets expectations it may not meet.

### Critique 4: Starting With One Book Makes the Product Unjustifiable
Who downloads an app to read one book? The Odyssey is ~130,000 words — a committed reader finishes it in a week or two. Then what? Even if the reading experience is magical, the product becomes useless after one book. You need at minimum 10-20 books ready at launch to give users a reason to *stay*.

**Suggestion**: Consider launching with a curated "canon starter pack" — perhaps 10 works across different eras: Homer, Virgil, Dante, Shakespeare (a play), Austen, Dostoevsky, a philosophical text (Plato's Republic), a religious text (Book of Genesis), an epic poem (Paradise Lost), and one more. This gives users a journey, not a one-off.

### Critique 5: The Revenue Model Is Absent
- Free books → no content revenue
- AI chat costs *you* money (Claude API calls per user)
- Hardware is capital-intensive with razor-thin margins
- EPUB bookstore means competing with Amazon, Apple, and Kobo simultaneously

You're building something that costs you money for every engaged user. The more someone uses the chat, the more it costs you. This is the classic AI product trap: your best users are your most expensive users.

**Question**: Is this a subscription product? An ad-supported product? A loss leader for hardware? The answer shapes everything about how you build it.

### Critique 6: The Hardware Vision Is a Distraction (For Now)
Building consumer electronics requires: industrial design, supply chain management, FCC certification, firmware engineering, manufacturing relationships, inventory management, and customer support infrastructure. Each of these is a company-sized problem. History is littered with failed e-readers (Nook, Kobo Aura, Remarkable's pivot struggles).

**Recommendation**: Keep this in the long-term vision document but do not let it influence any near-term decisions. Build a *software* product that works beautifully in a browser. If it succeeds, the hardware conversation becomes meaningful. If it doesn't, you've saved yourself millions.

### Critique 7: Dual-Version Display May Confuse More Than Clarify
Showing two versions of the text side by side (e.g., original + modern) sounds great in theory, but in practice: (a) it halves your readable area, (b) the eye constantly jumps between versions creating fatigue, (c) scholarly parallel-text editions exist and are used almost exclusively by academics, not general readers.

**Suggestion**: Make this a power-user feature, hidden by default. The default should be one version, beautifully displayed, with a quick-toggle to switch between versions rather than showing both.

### Critique 8: "Chat With Your Book" Already Exists
Readwise Reader, Kindle + ChatGPT, Notion AI + epub imports, and dozens of Chrome extensions already let you highlight text and ask an AI about it. The standalone chat-with-a-book experience is not novel. You need to articulate what makes *your* version 10x better.

**Possible differentiators that might actually work**:
- Pre-computed, book-specific analysis that's *always there* (not just on-demand)
- An annotation system that builds a personal "reading journal" over time
- The style/translation flexibility (if quality is high enough)
- A curated, opinionated experience rather than a generic AI wrapper

### Critique 9: Voice Input for Reading Is Awkward
Reading is typically done in silent, private contexts: bed, libraries, cafes, commutes. Speaking to your book is socially awkward in most reading contexts. The Kindle's lack of voice input is not a shortcoming — it reflects how people actually read.

**Counter-argument**: There are contexts where voice works — reading at home alone, studying at a desk. But this is a nice-to-have, not a core feature. Don't let it drive design decisions.

### Critique 10: The "Takeaways" Feature Assumes a Utilitarian View of Reading
Not everyone reads classics to extract "key takeaways." Many read for aesthetic pleasure, for the experience of encountering beautiful language, for escapism, or for the slow accumulation of wisdom that resists bullet-point summarization. A takeaways-oriented design might attract productivity-minded readers but alienate literary ones.

**Suggestion**: Frame this as a "reading journal" rather than "takeaways." The former invites reflection; the latter implies optimization.

---

## Strongest Counter-Arguments (Why It Might Work Anyway)

1. **The existing tools are all generic**: Nobody has built a *purpose-designed, book-specific* AI reading companion. The difference between "paste into ChatGPT" and a deeply integrated reading experience is the difference between a text editor and Google Docs.

2. **Classics are intimidating**: There's a real market of people who *want* to read The Odyssey but find it impenetrable. The kids/modern versions + contextual chat could genuinely unlock these texts for new audiences.

3. **The annotation/journal system could be genuinely sticky**: If you build something that accumulates value over time (your reading history, your annotations, your conversations with books), it becomes hard to leave.

4. **Personal project first = no market pressure**: Since you're building this for yourself initially, you can focus entirely on making the experience *right* without worrying about monetization or scale. Many great products started this way.

---

## Design Direction
- Inspired by Poetry Editor (poetryeditor.com) — warm, literary, clean
- Light mode default, dark mode available
- Free system fonts (no paid fonts)
- Collapsible right panel (like Poetry Editor's Analysis panel)
- Desktop-first

## Tech Stack
- React + TypeScript + Vite (same stack as Poetry Editor)
- Claude API for chat features
- Public domain texts from Project Gutenberg / Internet Archive
- Deployed via Vercel (like Poetry Editor)

## Current State (March 2026)

### What Exists
- Basic React + TypeScript + Vite project scaffolded
- Components: Header, Reader, SidePanel, Chat
- Custom hook: `useClaude.ts` for Claude API communication
- The Odyssey text: Butler (1900) and Pope (1726) translations indexed by chapter
- Design direction: warm, literary, inspired by Poetry Editor

### What Does NOT Exist Yet
- No deployed version
- No product name or domain decided
- No strategy document
- No annotation system
- No reading journal / takeaways feature
- No voice input
- No mobile design

### Blocking Decision
The Popperian Critique (above) raised fundamental questions that remain unanswered:
- Target audience?
- Content scope (1 book vs. canon starter pack)?
- Revenue model?
- Personal project vs. commercial ambition?

**These decisions must be made before significant development resumes.**

## Next Steps (Post-Critique)
1. Decide on product name + domain
2. Create strategy document answering the blocking questions above
3. Build desktop prototype with The Odyssey

---

## Error Handling & Resilience

- **Never stop on errors.** Work around issues and continue.
- **If Claude API fails**: Degrade gracefully — reading experience should work without AI features.
- **Keep working through blockers**: Don't stop on API issues or minor problems.

## Working Style

- **Be autonomous** — don't ask permission on routine decisions
- **Be concise** — short answers, no fluff
- **Keep momentum** — complete the requested task fully before stopping

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately

### 2. Subagent Strategy
- Use subagents to keep main context window clean
- Offload research and exploration to subagents

### 3. Self-Improvement Loop
- After ANY correction from the user, update the Decisions Log with the pattern

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Test in browser before claiming done

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it
- Zero context switching required from the user

## Task Management

1. **Plan First**: Write plan before starting implementation
2. **Verify Plan**: Check in before starting
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Note what was done
6. **Capture Lessons**: Update Decisions Log after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible.
- **No Guesswork**: Find root causes. No temporary fixes.
- **Minimal Impact**: Changes should only touch what's necessary.

---

## Collaboration Preferences

- **The user (Anders) is the product owner**: He has strong opinions about UX and product direction. Respect his instincts.
- **Show mockups before building**: For UI-heavy features, create an HTML mockup and iterate on feedback before writing production code.
- **Plan before code**: Enter plan mode for non-trivial tasks. Show the plan. Get approval. Then build.
- **Don't ask unnecessary questions**: Be autonomous on routine decisions.
- **Deep root-cause analysis before fixing**: Don't patch symptoms.

---

## Decisions Log

<!-- Append new decisions here as they're made during conversations -->
<!-- Format: **[Category]**: Description of the decision and rationale -->

**[Design Direction]**: Warm, literary, clean aesthetic inspired by Poetry Editor. Light mode default, dark mode available. Free system fonts. Collapsible right panel.

**[Translation Display 2026-03]**: Single version displayed with quick-toggle to switch — NOT dual side-by-side display. Dual display rejected as confusing and fatiguing for general readers.

**[Naming 2026-03]**: "Reading journal" NOT "takeaways" — invites reflection, not optimization.

**[Voice Input 2026-03]**: Downgraded to nice-to-have. Not a core feature. Reading is typically silent/private.

**[Popperian Critique 2026-03-05]**: 10-point critique written challenging project assumptions. Counter-arguments documented. Blocking decisions identified. Project paused for strategic reflection.
