# Danish audiobooks: what it would take (21 October 2026)

This is research only; nothing is changed. Checked against origin/main e8b270332 and the providers' public documentation on 21 October.

## Short answer

The pipeline already works for any language, so the code is not the barrier. Two things block Danish:

- **The engine.** Narration runs on xAI's plain text-to-speech (`grok-tts-v1`, voices helios and ara), and its documentation does not list Danish. Other languages work "with varying degrees of accuracy", and `language: 'auto'` has not been tried.
- **Policy.** Danish narration is switched off on purpose (21 September, English only).

Talk sounding fine in Danish settles nothing. Talk uses a different model (`grok-voice-latest`, real-time speech to speech) that may paraphrase. Narration must read the text word for word, and the text-to-speech API does.

## Today

- **Provider:** `NARRATION_PROVIDER: "grok"` (`app/wrangler.jsonc:27`). `synthesizeWithGrok` (`narration.ts:1003-1050`) sends `language: 'en'` (`:1016`) with timestamps. A Google path exists, set to `en-US` (`:949`, `:187-189`).
- **Chunker:** groups of sentences up to 300 characters (`narrationCore.ts:798-870`). It knows only English abbreviations. A sentence may end only before `[A-Z0-9“‘]`, which leaves out Æ, Ø, Å and the `»` that opens Danish dialogue.
- **Cache:** the language is not part of a clip's identity (`narrationCore.ts:86`).
- **Spend ceilings:** 2M bytes a day and 10M a month. xAI text-to-speech costs $15 per 1M characters.
- **Word timings** come from Grok's timestamps for each character. `grokTimestamps.ts` rejects a clip whose characters differ from the text sent.
- **Gates that keep Danish silent:**
  - `isPilotScope` only allows editions ending in `-en` (`narrationCore.ts:105-109`, `labNarration.ts:62`).
  - `TEXT_ONLY_EDITIONS` covers the six Danish editions (`audioAvailability.ts:52-64`).
  - The old Danish recordings belong to books not offered in Danish.

## Size of the six offered Danish editions

| Book | Characters | Chapter 1 |
|---|---|---|
| To the Lighthouse | 396,877 | 22,930 |
| A Little Princess | 354,491 | 18,289 |
| Around the World in 80 Days | 337,723 | 8,069 |
| The Jungle Book | 260,258 | 38,907 |
| Grimms' Fairy Tales | 481,474 | 11,591 |
| Arabian Nights | 565,034 | 4,343 |
| **Total** | **2.40M (about 44 hours)** | **104k** |

## Engines

| Engine | Danish | Cost of all six | Cost of chapter 1 only | Word timings |
|---|---|---|---|---|
| xAI grok-tts (current) | Not listed; untested | $36 | $1.56 | Yes, checked against the text |
| Google WaveNet / Neural2 da-DK | Yes | about $38 | about $1.70 | Yes (SSML marks; the code exists) |
| Google Chirp 3 HD da-DK | Yes, best Google voices | about $72 | about $3 | No |
| Azure da-DK Neural | Yes | about $38 | about $1.60 | Yes (word boundaries) |
| ElevenLabs Multilingual | Yes, probably best | $192 | $8 | Partial |
| Fish s2.1 | Danish not named | about $37 | about $1.60 | — |
| OpenAI gpt-4o-mini-tts | Probably | about $40 | about $2 | No |

Prices marked "about" are approximate. The figures for Google, Azure and OpenAI were not confirmed on their pricing pages.

## Recommendation

1. **Test first (about $0.10).** Send 3–5 Danish paragraphs with names, numbers and »dialogue« to grok-tts (helios, `language: 'auto'`) and to Google da-DK. Anders listens to both.
2. **If Grok sounds good** and its timestamps match the text: stay on Grok, with one provider, one cache and the same voice as Talk.
3. **Otherwise use Google da-DK Neural2 or WaveNet.** That code path exists and keeps words highlighted as they are read. Choose ElevenLabs only if its quality is worth about five times the cost.

## Steps

**Decision.** Anders reopens Danish audio and logs it in DECISIONS.md.

**Spend.** About $1.60 to warm every chapter 1, about $36–40 for everything on demand, within the ceilings English already uses.

**Code:**
1. Widen `isPilotScope` to the editions in `OFFERED_DANISH_EDITIONS`.
2. Remove those editions from `TEXT_ONLY_EDITIONS` and set their registry `hasAudio` to true.
3. Take the language from the edition (`narration.ts:1016`, `:949`) and add it to the cache identity.
4. Choose voices per language in `narrationConfig`.
5. Update the Danish chunker:
   - allow Æ, Ø, Å and `»` at a sentence start;
   - add the abbreviations bl.a., f.eks., osv., dvs., ca., nr., kl., hr., jf.;
   - bump `NARRATION_CHUNKER_VERSION`.
6. Read number ranges with "til", not "to" (`narrationCore.ts:163`).
7. Translate the reader's narration wording into Danish where it shows.
8. Add tests, then run the warm route.

## Risks

- **Grok on an unlisted language** may have an English accent or mispronounce words.
- **Names** (Ramsay, Phileas Fogg, Mowgli, the Arabic names) vary by engine. Grok's pronunciation replacements break the timestamp check.
- **Engines without word timings** lose the word-by-word highlighting.

Sources: docs.x.ai (text to speech), Google Cloud Text-to-Speech (Chirp 3 HD), ElevenLabs API pricing, the Fish models overview.
