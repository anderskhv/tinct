# Review log: the-art-of-war (modern-da, batch e-short-classics)

## Method
1. The modern-en file was split into chunks of whole chapters (or, for long chapters, paragraph ranges), about 3,500 English words each.
2. A translator subagent translated each chunk paragraph for paragraph, following the batch brief (STYLE.md in this package folder's parent) and the fixed term list below, then ran a structural check (segment, paragraph and title counts; English, length-ratio and quote-mark flags) and corrected its own draft.
3. A second, independent reviewer subagent saw only the English chunk and the Danish chunk (no glossary, no older edition, no translator notes). It checked every paragraph and title for meaning, omissions, additions, English left in, stiff phrasing and form, and returned full corrected paragraphs.
4. The orchestrator applied every reviewer fix except those that broke an explicit brief rule (recorded below as NOT APPLIED), then assembled the book and ran the gates (GATES.md).

Totals: 28 reviewer findings logged; 0 not applied (brief conflicts); all others applied.

## Fixed term list given to translators
Fixed terms for The Art of War (use these in every chunk):
- Master Sun → Mester Sun. The Way → Vejen. Heaven → Himlen. Earth → Jorden. the Leader → Føreren. Law → Loven. Yin and Yang → yin og yang. the Commander → Feltherren (capitalised as in English). the State → Staten. their Lord / the Lord → deres herre / herren (follow English capitalisation).
- Nine grounds: distracting ground → spredende terræn; disturbing ground → usikkert terræn; contested ground → omstridt terræn; intersecting ground → åbent terræn; ground crossed by roads → terræn ved vejknuder; deeply involved ground → dybt terræn; difficult ground → vanskeligt terræn; enclosed ground → indesluttet terræn; death ground → dødens terræn.
- Other: chariot → stridsvogn; spies → spioner; direct/indirect → direkte/indirekte; li → li (Chinese measure, keep).


## Translator notes per chunk (judgment calls)
## the-art-of-war-01 (translator)
- check: en=2469 da=2489 ratio=1.008 OK. Caps titles mirrored (INDLEDENDE OVERVEJELSER, KRIGENS FØRELSE, ANGREB GENNEM LIST, SLAGORDENEN, TROPPERNES ÅND). Ordinary/extraordinary force → almindelig/usædvanlig styrke. "their Lord" → "sin herre" (folket singular). "autumn fleece" → efterårsuld.
## the-art-of-war-02 (translator)
- check: en=2786 da=2891 ratio=1.038 OK. leagues → mil; Nine Changes / Five Advantages → de Ni Forandringer / de Fem Fordele; God of war → Krigsguden; caps titles mirrored.
## the-art-of-war-03 (translator)
- check: en=2462 da=2539 ratio=1.031 OK. ch10 p26 English flag = false positive. open terrain → frit terræn (åbent terræn reserved for intersecting ground); suspended terrain → afventende terræn; names Chu, Kuei, Wu, Yueh, stars Chi, Pi, I, Chen kept; Mt. Chang → Chang-bjerget; Nine Grounds → de ni terræner.
## the-art-of-war-04 (translator)
- check: en=567 da=566 ratio=0.998 OK. Mysterious Thread → Den Hemmelighedsfulde Tråd; Lord's Treasure → Herrens Skat; the Presence → Hans Nærhed; leagues → mil; converted spies → omvendte spioner; names Yin, Ichih, Hsia, Chu, Luya, Shang unchanged; lowercase feltherren where English lowercase.
## the-art-of-war-04 (review)
- 24 paragraphs + 1 title checked; 3 findings applied: p1 meaning (overstated "mister deres levebrød"), p3 omission ("the small cost"), p7 meaning ("Herrens Skat" → "Herskerens Skat", ruler not God).

## Independent review per chunk

### the-art-of-war-04 — independent review (applied 2026-10-21T12:45Z)
- Paragraphs checked: 24; titles checked: 1; findings: 3; applied: 3
- Reviewer summary: A faithful, fluent translation in a fitting register, with correct form and no English left in. Three small issues: an overstated consequence in p1, the dropped 'small cost' in p3, and 'Herrens Skat', which suggests God rather than the ruler.
  - ch13 p1 [meaning] 'livelihoods ... are disrupted' is softened damage, not total loss; 'mister deres levebrød' overstates it.
  - ch13 p3 [omission] 'the small cost' is lost; the point is that the outlay is trivial compared with the cost of war.
  - ch13 p7 [meaning] 'the Lord's Treasure' means the ruler's treasure; Danish 'Herrens' reads as God's.

### the-art-of-war-01 — independent review (applied 2026-10-21T12:45Z)
- Paragraphs checked: 100; titles checked: 5; findings: 6; applied: 6
- Reviewer summary: A faithful, complete and generally fluent translation: no omissions, additions or leftover English, and quotation marks and capitalised titles follow the conventions. The six findings are local: one wrong word with a misleading meaning ('fortegner'), one non-verb ('splid') and four stiff or inconsistent constructions.
  - ch1 p17 [stiff] 'splid' is a noun, not a verb; the imperative of 'splitte' is 'split'.
  - ch2 p6 [stiff] 'behøver ingen ny udskrivning ... og heller ikke at læsse' mixes a noun object and an infinitive awkwardly; a hverken/eller verb construction reads naturally.
  - ch2 p10 [stiff] 'er tyve værd af dem, vi selv bringer' is ungrammatical/translated-sounding.
  - ch3 p9 [stiff] Inconsistent address: starts with impersonal 'man', then switches to 'I'; English stays impersonal.
  - ch4 p16 [meaning] 'fortegne' in modern Danish means to draw/depict incorrectly (distort), not to record; use 'registrerer'.
  - ch5 p11 [stiff] 'slår til i pludselige øjeblikke' is a literal anglicism; Danish says 'slår pludselig til'.

### the-art-of-war-03 — independent review (applied 2026-10-21T12:45Z)
- Paragraphs checked: 123; titles checked: 3; findings: 6; applied: 6
- Reviewer summary: A strong, faithful translation: no omissions, mistranslations or form errors found, quotes and punctuation are correct, and the terrain terminology is used consistently. The few findings are local idiom issues (a couple of calques and awkward word order) and one small addition.
  - ch10 p11 [stiff] 'tilbagedrivning' is an awkward, barely used noun; Danish says 'at blive drevet tilbage'.
  - ch11 p11 [stiff] 'ved at blive' is ambiguous (reads as 'by becoming'); 'lingering' is better rendered as hesitating/staying put.
  - ch11 p20 [stiff] 'skære ... fra' is unidiomatic (should be 'afskære ... fra'); 'høje og lave rækker' is a calque of 'higher and lower ranks'.
  - ch11 p33 [stiff] First sentence follows English word order and reads awkwardly.
  - ch11 p56 [addition] 'lokale' is not in the English ('employs no guides'); 'førere' alone is ambiguous, so use 'vejvisere'.
  - ch12 p9 [stiff] 'begynder ved dagslys' is unidiomatic; Danish says a wind 'rejser sig om dagen'.

### the-art-of-war-02 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 138; titles checked: 4; findings: 13; applied: 13
- Reviewer summary: A faithful, complete and generally fluent translation: no omissions, additions or meaning errors found, and quote/dash form is correct. Findings are confined to a dozen calques and unidiomatic word choices (krop, afslå, sættes i arbejde, åbner ham for, holde sig fra, ligeså) plus one English loanword (timing).
  - ch6 p15 [stiff] 'krop' for a body of troops is an anglicism; Danish uses 'styrke'.
  - ch7 p3 [english] 'timing' is an English loanword, anachronistic in this register.
  - ch7 p7 [stiff] 'jage en fordel' is unidiomatic; 'på jagt efter en fordel'.
  - ch7 p14 [stiff] 'uden for modstanderens forståelse som mørket' is a literal rendering of 'beyond understanding'.
  - ch7 p22 [stiff] 'mod er ivrigt' is an odd collocation (mod = courage); 'kampånd' renders 'spirits' naturally.
  - ch7 p27 [stiff] 'Afslå' means decline an offer, wrong verb for 'refuse to chase'.
  - ch7 p30 [stiff] 'der gælder for at sætte soldater ind' is clumsy.
  - ch8 p4 [stiff] 'sættes i arbejde' calques 'put to work'.
  - ch8 p13 [stiff] 'åbner ham for vanære' calques 'opens him to'; noun-heavy.
  - ch8 p15 [stiff] 'får hære til at blive slået og ... til at blive dræbt' is clumsy.
  - ch9 p3 [stiff] 'holde sig fra' means abstain from; 'keep clear of' is 'holde sig væk fra'.
  - ch9 p17 [stiff] 'ligeså' means 'just as'; 'likewise' is 'ligeledes'.
  - ch9 p37 [stiff] Awkward split word order ('Lader tropperne bytte ligge, der er ...').

### Orchestrator edits after review (the-art-of-war)
- ch11 p37: »får det det bedste frem« → »får man det bedste frem« (danish-lint DOUBLE-FILLER).

