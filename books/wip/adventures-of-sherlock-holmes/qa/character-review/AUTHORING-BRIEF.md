# Brief: Sherlock Holmes character inventory for ONE story

You are drafting position-gated character cards for Tinct, a reading app, for ONE story of
"The Adventures of Sherlock Holmes" (book id adventures-of-sherlock-holmes; 12 stories = 12 chapters).
Read-only on the repository. Write ONLY your output file in the scratchpad drafts folder. No network, no paid APIs.

## Input
Your story file: SCRATCH/stories/storyNN.txt. Every paragraph appears twice: `[ch:idx] O:` (original-en, Doyle's text)
and `[ch:idx] M:` (modern-en rendering). Indices are ZERO-BASED. READ THE WHOLE FILE, BOTH EDITIONS, every paragraph
(read in chunks with the Read tool using offset/limit; do not skip). Also use Grep on the file to verify every alias
and count occurrences in each edition.

Background rules (from books/characters/EDITORIAL-POLICY.md in /home/user/tinct): a card answers "Who is this?" with a
useful identity. Ordinary non-concealed identity (family relation, occupation, role in the opening setup) may appear at
first mention. Concealed identities, disguises, aliases' true owners, culprits, motives, deaths, arrests, and outcomes
MUST stay gated to the end of the paragraph where the story reveals them to the reader. This is a detective collection:
the first card for every person must be safe to read at the very start of the story. A reader who taps a name must never
learn the solution early. Attribute suspicion ("the police suspect...") rather than asserting guilt or innocence.

## Runtime model (how your draft will be compiled)
- Each entity has a first-encounter card (name, subtitle, body) shown from its first bound mention.
- Optional later snapshots, each released at the END of a paragraph `after: [chapter, idx]` (zero-based idx). A snapshot
  may change the displayed `name` and the `body`. The `subtitle` is FIXED for all snapshots, so the subtitle must never
  become false or spoil anything later in the book. Add snapshots only when facts materially change (identity reveal,
  important new role); keep 0-3 per entity typically.
- Mentions are exact, case-sensitive string matches with word boundaries inside your story's chapter only. A longer
  match wins over a shorter overlapping one. Two different entities must never claim the exact same span.
- A disguise name / alias whose owner is concealed must be its OWN entity (e.g. a false name gets its own card), with a
  gated snapshot after the reveal paragraph. Never bind a disguise or an unnamed mysterious figure to the real person
  before the reveal; leave it unbound or give it its own entity.
- Do not bind pronouns, "I" (Watson as narrator), or generic nouns globally. Generic descriptions ("the lady",
  "my client", "the old man") may be bound only in explicitly listed paragraphs where they unambiguously denote one
  entity and where binding does not spoil anything; otherwise leave them unbound.
- Recurring figures use these SHARED ids across the book: `sherlock-holmes`, `watson`, `lestrade`, `bradstreet`,
  `mrs-hudson`, `irene-adler`, `king-of-bohemia`, `mycroft` (if any). For sherlock-holmes and watson do NOT write cards;
  only report the exact alias strings used for them in your story (both editions), and any traps (e.g. other people
  called "doctor", someone named James/John who is not Watson, Holmes's disguises). Lestrade/Bradstreet/Mrs. Hudson/
  Irene Adler: if they occur in your story, report occurrences; if your story is where they are introduced in full,
  draft their card. Mrs. Turner (story 1 landlady) is NOT Mrs. Hudson. Never import facts from other Holmes works.
- Real historical/cultural persons mentioned (e.g. a writer, a judge, a famous criminal, a monarch) may be `reference`
  entries with kind `cultural-figure` or `person`; include them only if the reader would benefit, otherwise list as
  deliberately unbound.
- kinds available: person, unnamed-person, group, family, animal, cultural-figure, reference, unresolved-name.
- category (story role, whole-book weight): central (only Holmes), major (principal client/antagonist/key figure of a
  story), supporting, reference (mentioned only / historical).
- ids: lowercase kebab-case, unique across the whole book, so use full names (e.g. `jabez-wilson`, `mrs-st-clair`),
  never generic ids like `client` or `wife`.

## Output: write SCRATCH/drafts/storyNN.json (valid JSON, UTF-8, curly apostrophes ’ in prose) with:
{
 "story": N,
 "entities": [
  {
   "id": "...", "name": "first display name (non-spoiler)", "kind": "...", "category": "...",
   "subtitle": "short stable identifier, true and spoiler-free for the whole book",
   "body": "1-2 sentence first-encounter card in plain modern English; must be safe at the first mention",
   "aliases": ["exact strings safe to bind anywhere in this chapter, both editions; list each case variant"],
   "aliasRules": [ {"alias": "...", "paragraphs": [idx,...] or null, "from": idx or null, "to": idx or null,
                    "editions": ["original-en","modern-en"], "why": "..."} ],
   "exclude": [ {"alias": "...", "paragraph": idx, "editions": [...], "why": "this occurrence denotes someone else / not a person"} ],
   "snapshots": [ {"after": [N, idx], "name": "optional new display name", "body": "...", "why": "what paragraph idx reveals"} ],
   "roleAfter": null or [N, idx],
   "firstMention": {"original-en": [N, idx, "matched text"], "modern-en": [N, idx, "matched text"]},
   "occurrences": {"original-en": count, "modern-en": count},
   "notes": "..."
  }
 ],
 "recurring": { "sherlock-holmes": {"aliases": [...], "traps": "..."}, "watson": {...}, "...": {...} },
 "concealments": [ {"what": "...", "revealedAt": [N, idx], "entities": [...], "handling": "..."} ],
 "namesakes": [ {"name": "...", "people": [...], "howToldApart": "..."} ],
 "unbound": [ {"text": "...", "where": [[N, idx], ...], "why": "..."} ],
 "editionDivergences": [ {"where": [N, idx], "original": "...", "modern": "...", "handling": "..."} ],
 "threads": { "<entity id>": "1-3 sentence modern-English introduction of this person's part in THIS story. It is
   shown at the START of the story as a cast list, so it must describe only the setup: who they are and why they
   matter at the outset. No culprit, disguise, true identity, death, arrest, or resolution." },
 "threadsHolmesWatson": {"sherlock-holmes": "spoiler-safe 1-2 sentence intro of Holmes's role in this story", "watson": "..."}
}

Quality bar: identities must come from the text, not memory. Verify each alias exists in the edition(s) you list
(grep). If an identity or binding cannot be settled from the text, leave it unbound and say so in "unbound" — never
guess. Include every named person who speaks or acts, every named client/household member, and named people who
matter to the plot even if only mentioned; minor one-off mentions may go to "unbound" with a reason. Final message:
a short summary (entity count, concealments with gate coordinates, anything uncertain).
