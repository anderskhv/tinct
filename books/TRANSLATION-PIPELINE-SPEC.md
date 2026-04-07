# Translation Pipeline Spec — Tinct

**Purpose:** High-quality EN→DA book translation using a 4-pass LLM pipeline. Based on Andrew Ng's `translation-agent` pattern (github.com/andrewyng/translation-agent), extended with glossary support, style rules, few-shot examples, cross-chunk consistency, and a sentence-level comprehension check.

**Reference:** Ng's repo is a single-file implementation (~680 lines). We steal the pattern, not the code. No dependency on his repo.

---

## Architecture

```
Source text (English)
        │
        ▼
   ┌─────────┐
   │  CHUNK   │  Split into ~800-1000 token chunks at paragraph boundaries
   └─────────┘
        │
        ▼ (for each chunk, sequentially)
   ┌─────────────────────────────────┐
   │  PASS 1: TRANSLATE              │
   │  Role: native Danish author     │
   │  Inputs: chunk + full context   │
   │         + glossary + few-shot   │
   │         + previous chunk terms  │
   │  Output: Danish draft           │
   └─────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────┐
   │  PASS 2: REFLECT                │
   │  Role: Danish literary editor   │
   │  Inputs: English + Danish draft │
   │         + translation rules     │
   │  Output: list of critiques      │
   └─────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────┐
   │  PASS 3: REFINE                 │
   │  Role: Danish author again      │
   │  Inputs: English + Danish draft │
   │         + critiques             │
   │  Output: final Danish text      │
   └─────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────┐
   │  PASS 4: COMPREHENSION CHECK    │
   │  Role: Danish native reader     │
   │  Input: ONE sentence at a time  │
   │         (no English visible)    │
   │  Output: fixes or "ok"          │
   └─────────────────────────────────┘
        │
        ▼
   Accumulate → next chunk
```

---

## Chunking Strategy

- Split at paragraph boundaries (double newline), not mid-sentence
- Target ~800-1000 tokens per chunk
- Each chunk sees: full source document as context, but only translates its portion (Ng's `<TRANSLATE_THIS>` tag pattern)
- Blockquotes and terminology sections are never split

---

## Pass 1: Translate

### System prompt
```
You are a native Danish author and philosopher. You are NOT translating — you are rewriting this text as if it were originally written in Danish. Think in Danish. Write in Danish. If a sentence sounds like it was translated from English, rewrite it until it doesn't.
```

### User prompt
```
Here is the full English text for context:
<FULL_SOURCE>
{full_english_text}
</FULL_SOURCE>

Translate ONLY the section between the tags below into Danish:
<TRANSLATE_THIS>
{current_chunk}
</TRANSLATE_THIS>

## Glossary (use these terms consistently)
{glossary}

## Style examples (learn the desired Danish voice from these corrections)
{few_shot_examples}

## Terms from previous chunk (maintain consistency)
{previous_chunk_terms}

Output only the Danish text. No explanations.
```

---

## Pass 2: Reflect

### System prompt
```
You are an expert Danish literary editor reviewing a translation from English. Your goal is to identify every place where the Danish sounds translated rather than native. Be specific and thorough.
```

### User prompt
```
## Source (English)
{current_chunk_english}

## Translation (Danish)
{pass1_output}

## Translation Rules
{translation_rules}

Review the translation and provide specific suggestions for improvement. For each issue, state:
1. The problematic Danish phrase
2. What's wrong (which rule it violates, or why it sounds translated)
3. Your proposed fix

Check specifically for:
- Words translated by dictionary lookup rather than by function (e.g. "nemlig" for "namely" — "nemlig" confirms, it doesn't specify)
- Noun constructions where Danish wants a verb ("har udbredelse" → "cirkulerer")
- English-calqued phrases ("i termer af", "involveret i", "på bekostning af")
- Unnecessary commas before "at"-clauses
- English nesting patterns (2+ insertions between subject and verb)
- Adjective used where adverb is needed ("delvis" vs "delvist")
- Overly formal register ("uundgåeligt" → "nødvendigvis", "forbliver" → "er stadig")
- Missing explicit nouns where Danish needs them ("mere" → "mere indhold")
- "Det at [verb]" gerund calques
- Any phrase that just sounds "translated"

Output only your list of suggestions.
```

---

## Pass 3: Refine

### System prompt
```
You are a native Danish author. You have written a draft and received editorial feedback. Incorporate all valid suggestions to produce the final text. The result should read as if originally written in Danish.
```

### User prompt
```
## Source (English)
{current_chunk_english}

## Your draft (Danish)
{pass1_output}

## Editorial suggestions
{pass2_output}

Rewrite the Danish text incorporating the editorial suggestions. Where you disagree with a suggestion, keep your original if it genuinely reads better. Output only the final Danish text.
```

---

## Pass 4: Sentence-Level Comprehension Check

This is the key innovation. Passes 1-3 operate on chunks and paragraphs — the LLM "gets lazy" and skips past incomprehensible sentences. Pass 4 forces attention on every single sentence in isolation.

### How it works

Split the Pass 3 output into individual sentences. For each sentence, send it alone — **no English source visible, no surrounding context** — and ask one question.

### System prompt
```
You are a native Danish reader. You have never seen any English source text. You are reading a Danish book about physics and philosophy.
```

### User prompt (repeated per sentence)
```
Read this sentence:

"{danish_sentence}"

Is this a clear, meaningful, natural Danish sentence? Would you understand it if you encountered it in a book?

If YES: respond with just "OK"
If NO: explain what is unclear or unnatural, and propose a rewrite.
```

### Key design choices

1. **One sentence at a time.** Not a paragraph, not a chunk. One sentence. The LLM cannot skip ahead or get lazy.
2. **No English visible.** The LLM judges the Danish purely on its own merits. It cannot rationalize "well, the English was awkward too" or "this makes sense if you know the original."
3. **No translation rules visible.** This isn't a rule-check — it's a comprehension check. "Does this make sense?" is a simpler, more fundamental question than "does this follow 10 rules?"
4. **Fast and cheap.** Each call is tiny (~50 tokens in, ~10 tokens out for "OK" responses). Use Haiku or Sonnet for speed.

### Processing

- Collect all "NO" responses with their rewrites
- Apply the rewrites to the Pass 3 output
- This produces the final text

### Why this works

The reflect pass (Pass 2) found 40 issues in Chapter 1. But many of those were stylistic preferences, not comprehension failures. Pass 4 catches the sentences that are genuinely incomprehensible in Danish — the kind Anders finds and immediately says "this doesn't make sense." Those are the highest-priority fixes.

---

## Glossary

Loaded from `DA-translation-instructions.md` terminology section. Current terms:

| English | Danish |
|---|---|
| fabric of reality | virkelighedens struktur |
| world-view | verdensbillede |
| common sense | sund fornuft |
| explanation | forklaring |
| understanding | forståelse |
| theory of everything | teorien om alt |
| reductionism | reduktionisme |
| instrumentalism | instrumentalisme |
| positivism | positivisme |
| emergence / emergent | emergens / emergent |
| holism | holisme |
| epistemology | erkendelsesteori |
| the theory of evolution | evolutionsteorien |
| the theory of computation | beregningsteorien |
| quantum theory/physics | kvanteteori/kvantefysik |
| shadow (Deutsch technical) | skygge |
| photon | foton |
| multiverse | multiverset |
| interference | interferens |
| matter (physics) | materie (NOT "stof") |
| tangible | håndgribelig |

**This glossary grows per book.** Each new book adds domain-specific terms.

---

## Few-Shot Examples

These are human-corrected before/after pairs. They teach the model the desired Danish voice.

```
AI: "i høj grad takket være" → Human: "takket være"
AI: "forforståelser" → Human: "forudindtagelser"
AI: "Men i praksis er det netop det" → Human: "Men det er det i praksis"
AI: "en bekvem måde" → Human: "en god måde"
AI: "epitomeret af" → Human: "illustreret ved"
AI: "har stadig udbredelse" → Human: "cirkulerer stadig"
AI: "involveret i væksten af" → Human: "vokser på"
AI: "det at spise" → Human: "at spise"
AI: "formuleret i termer af" → Human: "handler om"
AI: "uundgåeligt" → Human: "nødvendigvis"
AI: "delvis" (modifying verb) → Human: "delvist"
AI: "virkelighedens væv" → Human: "virkelighedens struktur"
AI: "Teorien om alting" → Human: "Teorien om alt"
AI: "nemlig en videnskabelig teori..." → Human: (dropped "nemlig" — it confirms, doesn't specify)
AI: "uden for pointen" → Human: "ved siden af sagen"
AI: "den udvalgte" (for "distinguished") → Human: "skiller mig ud"
```

**This list grows as the human editor corrects more chapters.**

---

## Cross-Chunk Consistency

After each chunk, extract key terms and their chosen Danish translations. Pass these to the next chunk's translate prompt as "Terms from previous chunk." This prevents the same English term from getting different Danish translations across chunks.

Format:
```
- "explanation" → "forklaring" (not "redegørelse")
- "understanding" → "forståelse" (not "indsigt")  
- "fabric of reality" → "virkelighedens struktur" (not "væv")
```

---

## Integration with Tinct

### Book ingestion
When a new English book is added, the pipeline can auto-generate a Danish draft:
1. Parse book into chapters → chunks
2. Run 3-pass pipeline per chunk
3. Store Danish version alongside English in Tinct's book JSON format
4. Flag as "AI draft — needs human review"

### Human review workflow
The split-screen view (DA left, EN right) already exists in Tinct. The human editor:
1. Reads side by side
2. Edits the Danish directly
3. Any corrections become new few-shot examples for future translations

### QA pass
After human review, run Danish spellcheck using existing `da_DK.aff` / `da_DK.dic` assets.

---

## LLM Configuration

- **ZERO API spend.** All LLM calls go through Claude CLI (subscription tokens), never the Anthropic API.
- The script handles chunking, prompt assembly, glossary injection, and file I/O. The LLM calls happen through the CLI conversation.
- Pass 1-3: Claude Opus (via CLI) for literary/philosophical texts, Sonnet for straightforward prose
- Pass 4: Sonnet or Haiku — fast and cheap, one sentence at a time
- No `anthropic` SDK imports. No API key usage.

---

## Metrics

Track per chapter:
- Issues found in Pass 2 (reflect)
- Issues remaining after Pass 3 (refine) — run a second reflect to count
- Issues remaining after Pass 4 (comprehension check)
- Issues found by human editor
- Goal: <10 human corrections per chapter

### Baseline data (Fabric of Reality, Chapter 1)

| Version | Pipeline | Issues found |
|---|---|---|
| v1 | Single-pass, no rules | 55 |
| v2 | 3-pass (translate+reflect+refine) + rules + 16 few-shot examples | 40 (-27%) |
| v3 | v2 + separate refine agent applying v2's review | 22 (-60% from v1) |
| v4 | v3 + Pass 4 (sentence-level comprehension) | NOT YET TESTED |

### What each pass eliminates

| Error type | Eliminated by |
|---|---|
| Gerund calques ("det at [verb]") | Pass 1 (few-shot examples) — 100% eliminated |
| Over-punctuation (commas before "at") | Pass 1 (rules) — 100% eliminated |
| "Nemlig" misuse | Pass 2 (reflect) — caught when rules explicitly list it |
| English calques ("i termer af") | Pass 1+2 — reduced 42%, not eliminated |
| Formal register ("subsumere", "ophørte") | Pass 3 (refine) — caught when reviewer flags specific words |
| Grammar/typos (doubled words, gender, word order) | NOT caught by Passes 1-3 — **Pass 4 should catch these** |
| Semantic precision (right word, wrong function) | Hardest category — partially caught by Pass 2, 7 remain after v3 |

### Key insight

**Passes 1-3 review at paragraph/chunk level and get lazy.** They catch pattern violations (rules they know to look for) but miss:
1. Grammar errors (doubled "er", wrong gender, inverted word order)
2. Sentences that are technically "correct" but incomprehensible in Danish

**Pass 4 (sentence-level, no English visible) is designed specifically for these.** Each sentence gets individual attention. The LLM cannot skip ahead or rationalize "it makes sense if you know the English."

### Error budget target

| After pass | Target issues | Actual (Chapter 1) |
|---|---|---|
| Pass 1 (translate) | <60 | ~55 (estimated) |
| Pass 2+3 (reflect+refine) | <25 | 22 |
| Pass 4 (comprehension) | <10 | TBD |
| Human review | 0 | TBD |
