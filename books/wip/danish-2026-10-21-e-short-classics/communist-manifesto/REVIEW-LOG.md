# Review log: communist-manifesto (modern-da, batch e-short-classics)

## Method
1. The modern-en file was split into chunks of whole chapters (or, for long chapters, paragraph ranges), about 3,500 English words each.
2. A translator subagent translated each chunk paragraph for paragraph, following the batch brief (STYLE.md in this package folder's parent) and the fixed term list below, then ran a structural check (segment, paragraph and title counts; English, length-ratio and quote-mark flags) and corrected its own draft.
3. A second, independent reviewer subagent saw only the English chunk and the Danish chunk (no glossary, no older edition, no translator notes). It checked every paragraph and title for meaning, omissions, additions, English left in, stiff phrasing and form, and returned full corrected paragraphs.
4. The orchestrator applied every reviewer fix except those that broke an explicit brief rule (recorded below as NOT APPLIED), then assembled the book and ran the gates (GATES.md).

Totals: 20 reviewer findings logged; 0 not applied (brief conflicts); all others applied.

## Fixed term list given to translators
Fixed terms for the Communist Manifesto (use in every chunk; older Danish edition at /home/user/tinct/app/public/data/editions/communist-manifesto-modern-da.json may be grepped for names, places, terms and quotations only — never copy or adapt its sentences):
- bourgeoisie → bourgeoisiet; bourgeois (adj.) → borgerlig (or bourgeois- in compounds, e.g. bourgeoissamfundet, where natural); a bourgeois (person) → en bourgeois; proletariat → proletariatet; proletarian(s) → proletar(er) / proletarisk; petty bourgeois → småborger / småborgerlig; class struggle → klassekamp; means of production → produktionsmidler; Modern Industry / modern industry → den moderne industri; manufacture → manufaktur; guild → laug; wage-labour → lønarbejde; capital → kapital; Communists → kommunisterne; working class → arbejderklassen; feudal → feudal; reactionary → reaktionær; utopian → utopisk.
- The spectre of communism → kommunismens spøgelse. Final line: »Proletarer i alle lande, foren jer!«


## Translator notes per chunk (judgment calls)
## communist-manifesto-01 (translator)
- check: en=3853 da=3607 ratio=0.936 OK. Title »I. Bourgeois og proletarer« (glossary); chartered freedoms → skriftligt sikrede frihedsrettigheder; ten-hours' bill → titimersloven; Trades Unions → fagforeninger; "Everything solid dissolves into air" → »Alt fast fordamper til luft«.
## communist-manifesto-02 (translator)
- check: en=3117 da=3011 ratio=0.966 OK. ch3 p20 English flag false positive. Title »II. Proletarer og kommunister« (as glossary). community of women → kvindefællesskab; pauper → fattiglem; brave words → flotte ord; country → fædreland (»Arbejderne har intet fædreland«); self-appointed reformer of the world → selvbestaltede verdensforbedrer; list items imperative »1. Afskaf…«.
## communist-manifesto-03 (translator)
- check: en=2893 da=2795 ratio=0.966 OK. Six "for" false positives. »Det Unge England«, »sand« socialisme, Det Ny Jerusalem, »phalanstères«, »Home Colonies« (English kept, as source), »Lille Ikarien«, »Réformistes«; Philistine → spidsborger; duodecimo editions → duodezudgaver; "capital and labour" → kapital og lønarbejde.
  - Note on ch23 p3: original-en (Marriott) reads "...many riches make him wish for more" governed by an earlier "so that ... not"; modern-en lost the governing negation. Danish keeps the intended sense. Integration note: modern-en the-prince ch23 p3 may need a repair.
## communist-manifesto-04 (translator)
- check: en=423 da=408 ratio=0.965 OK. Closing line kept in capitals as source: »PROLETARER I ALLE LANDE, FOREN JER!« without quote marks (English has none). feudal squirearchy → de feudale godsejere; Cracow insurrection → Krakow-opstanden; radical members of the bourgeoisie → radikale bourgeois.
## communist-manifesto-04 (review)
- 12 paragraphs + 1 title checked; 0 findings.

## Independent review per chunk

### communist-manifesto-04 — independent review (applied 2026-10-21T12:45Z)
- Paragraphs checked: 12; titles checked: 1; findings: 0; applied: 0
- Reviewer summary: Accurate, complete and idiomatic throughout: every clause, name and date is carried over, and the Danish reads naturally in the book's register. The closing slogan uses the established Danish form (»Proletarer i alle lande, foren jer!«) in capitals as in the source, which is the right choice. No form problems found.

### communist-manifesto-02 — independent review (applied 2026-10-21T12:45Z)
- Paragraphs checked: 85; titles checked: 1; findings: 6; applied: 6
- Reviewer summary: A strong, faithful and idiomatic translation that keeps the Manifesto's polemical register; numbering, emphasis markup and »…« quotes are correct and nothing is omitted or added. Findings are few: one non-word (graverdere), two small nuance/referent slips (p20 'så længe', p47 'efter deres påstand') and three stiff constructions.
  - ch2 p49 [meaning] 'graverdere' is not a Danish word; the established rendering of grave-diggers is 'dødsgravere'.
  - ch3 p20 [meaning] 'så længe' is temporal; English 'only as far as' means to the extent that.
  - ch3 p26 [stiff] 'ikke gør' as a stand-in verb for possessing is an anglicism.
  - ch3 p38 [stiff] Ungrammatical coordination of an at-clause with a noun phrase ('at familien ... og den offentlige prostitution').
  - ch3 p47 [meaning] 'efter deres påstand' is ambiguous and reads as the Communists' own claim; the English says the bourgeois gentlemen claim it.
  - ch3 p51 [stiff] '_den_ nation' reads as 'that nation' in Danish; the emphasis belongs on the definite noun.

### communist-manifesto-03 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 62; titles checked: 1; findings: 6; applied: 6
- Reviewer summary: A strong, faithful translation in a fitting literary register: no omissions, additions, leftover English or form problems (»…« quotes, _emphasis_ and numbering are all preserved). The only issues are two word choices that shift the meaning (humanister, forhadte) and four small idiom or word-order slips.
  - ch4 p14 [stiff] 'little developed' rendered as 'stadig er lidt udviklet', which reads oddly and repeats 'stadig' in the same sentence; Danish says 'kun lidt udviklet'.
  - ch4 p23 [stiff] 'så blot kravene ... som krav fra' places 'blot' so it reads 'saw only the demands'; the point is that they saw in the demands nothing more than demands of Practical Reason.
  - ch4 p27 [stiff] 'indskydelse' in present-day Danish means a sudden whim, not an insertion; use 'indskydning'.
  - ch4 p37 [stiff] 'den tyske lille spidsborger' has English adjective order; Danish puts 'lille' first.
  - ch4 p40 [meaning] 'humanitarians' is not 'humanister' (humanities scholars / humanist philosophers) but 'menneskevenner'.
  - ch4 p42 [meaning] 'hateful ideas' (spiteful ideas the proletariat holds) is 'hadefulde', not 'forhadte' (ideas that are hated).

### communist-manifesto-01 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 54; titles checked: 2; findings: 8; applied: 8
- Reviewer summary: A strong, faithful and natural translation in a fitting classic register; no omissions or English left in, and quotation marks are correct throughout. Findings are a handful of word-choice slips (fortrydelse, a lost antagonism, an imported 'overbygning'), one agreement error and a few clumsy constructions.
  - ch2 p1 [meaning] 'stod over for hinanden' is merely 'faced each other'; English 'set against each other' is antagonistic.
  - ch2 p4 [stiff] 'igen' reads as 'again' and the word order is clumsy; English: the burgesses provided the first elements from which the bourgeoisie developed.
  - ch2 p16 [stiff] 'modsat' placed mid-clause is unidiomatic for 'by contrast'; use 'derimod'.
  - ch2 p18 [meaning] 'fortrydelse' means regret, not distress/chagrin; also restores 'bitter'. Also adjective agreement: two subjects require 'umulige'.
  - ch2 p21 [addition] 'sejlbare' is added; English simply 'rivers made into canals' (canalisation of rivers).
  - ch2 p28 [stiff] Clumsy cleft construction for 'the cost of producing a worker'; also 'mere arbejde på samme tid' means 'at the same time', not 'within a given time'.
  - ch2 p41 [stiff] 'en truende nedgang til proletariatet' is unidiomatic (preposition, noun-heavy) for 'an imminent descent into the proletariat'.
  - ch2 p45 [addition] 'overbygningen' imports the Marxist term 'superstructure', which the English does not use here; English: 'all the layers of official society piled above it'.

### Orchestrator edits after review (communist-manifesto)
- ch2 p10: »tjente det det halvfeudale …« → »tjente bourgeoisiet det halvfeudale …« (danish-lint DOUBLE-FILLER; the doubled »det det« was grammatical but read as a typo).

