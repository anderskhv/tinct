# Human Review Queue: The Manual (Epictetus)
Date: 2026-04-09
Total flagged: 5 (of max 100)
Estimated review time: ~5 minutes

## How to review
For each item: read the original, read the translation, decide OK/FIX.
Mark with [OK] or [FIX] + your correction. Return the file to the QA agent.

---

## Structural Note (no review needed — action required)

`the-manual-modern-da 2.json` exists in the editions folder — a different Danish translation left over from generation. The app loads `the-manual-modern-da.json` (the version below). The duplicate should be deleted.

---

## Flagged Items

### 1. [Chapter 20, Paragraph 1] (reason: polysemy — "dom")
- **Original (EN):** "you must know that it is your own opinion which has irritated you"
- **Danish:** "...vid, at det er din egen **dom**, der har gjort dig vred"
- **Issue:** "dom" means verdict/judgment (legalistic). Original says "opinion." "din egen **mening**" or "din egen **bedømmelse**" would be closer and less heavy.
- **Suggestion:** "vid, at det er din egen mening, der har gjort dig vred"
- [ ] OK  [ ] FIX: _______________

### 2. [Chapter 40, Paragraph 1] (reason: deflated register — "frøkener" vs "dominæ")
- **Original (EN):** "Women forthwith from the age of fourteen are called by the men mistresses (dominæ)"
- **Modern EN:** "Girls from the age of fourteen are called 'mistresses' by men"
- **Danish:** "Piger bliver fra fjortenårsalderen kaldt **»frøkener«** af mænd"
- **Issue:** "Frøkener" (young ladies/misses) is considerably lighter than "dominæ" or "mistresses." The point is that men address these girls as objects of desire — "frøkener" reads as a polite social title. Something like "»madammer«" or "»de voksne«" or even keeping "dominæ" with a gloss might carry the edge better.
- **Suggestion:** Consider "»de voksnes ligemænd«" or leave as-is if register match to EN version is intended.
- [ ] OK  [ ] FIX: _______________

### 3. [Chapter 50, Paragraph 1] (reason: clunky double subordinate clause)
- **Original (EN):** "abide by them, as if they were laws, as if you would be guilty of impiety if you transgressed any of them"
- **Danish:** "Hold fast ved de principper, du har besluttet dig for i din livsførelse, **som var de love, som om du begik helligbrøde** ved at overtræde dem"
- **Issue:** "som var de love, som om du begik" — two stacked subordinate openers in a row, slightly clunky. The original's two "as if" clauses work in English rhythm but not quite in Danish.
- **Suggestion:** "Hold fast ved de principper, du har lagt dig fast på — som om de var love, og det var helligbrøde at bryde dem."
- [ ] OK  [ ] FIX: _______________

### 4. [Chapter 1, Paragraph 2] (reason: editorial addition — Modern EN only)
- **Original (EN):** "...if you want both [things in your power and things not in your power]..."
- **Modern EN:** "But if you want both — **inner freedom and worldly power** — you will get neither"
- **Issue:** "inner freedom and worldly power" is added by the translator — the original leaves this implicit. The addition is reasonable and clarifies the point, but it's an editorial choice that shifts from paraphrase to interpretation.
- [ ] OK  [ ] FIX: _______________

### 5. [Chapter 32, Paragraph 1] (reason: watchlist match — "spådom" contains "dom")
- This was a false positive from the polysemy scanner. "Spådom" (divination) is correct usage. No action needed.
- [x] OK — false positive, no fix required
