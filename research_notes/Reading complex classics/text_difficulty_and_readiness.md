# Text Difficulty and Reader Readiness: Measuring and Sequencing Literary and Philosophical Classics

Scope note: research was capped at about 20 tool calls. Several primary documents (the Nelson et al. 2012 report PDF, Common Core Appendix A, Bjork lab papers) could not be fetched in full. Where a figure comes from a secondary summary, a library catalog, or a vendor, this is flagged. Most evidence on reader matching comes from K-12 students or adult L2 learners, not adult L1 readers of classics.

## 1. Quantitative readability measures: what they capture, where they fail for literature, and known scores for classics

### Takeaway
Classic formulas (Flesch-Kincaid, Lexile, ATOS) rest on two surface proxies: sentence length and word frequency. They rank school texts reasonably well, but they cannot see what makes literary classics hard. Lexile scores *The Grapes of Wrath* at about a grade 2-3 level, and catalog Lexiles put *Ulysses* (about 1050L) barely above *The Awakening* (about 960-1030L). The Chopin-to-Joyce gap the user describes is close to invisible to Lexile. Multi-dimensional tools (Coh-Metrix/T.E.R.A.) and LLM-based estimators capture more: GPT-4 reaches r = .76 with human judgments, against about r = .5-.58 for formulas. Even these are validated on short excerpts, not whole modernist novels.

### Cited Findings
**What the formulas measure**
- Lexile scores come from word frequency in a lexical database plus sentence length. Coh-Metrix measures syntactic complexity through things like modifiers per noun phrase and the number of words before the main verb. — [NAU: Text variables as predictors of reading difficulty](https://legacy.nau.edu/wp-content/uploads/sites/117/Text_variables_predictors_reading_difficulty.pdf)
- Most readability measures are "based exclusively on two features of text: the difficulty of sentences and the familiarity of words." — [T.E.R.A., ASU SoLET Lab](https://soletlab.asu.edu/t-e-r-a/)
- Lexile is calibrated with the Rasch psychometric model. — [MetaMetrics/Lexiles in Education fact sheet](https://www.rcboe.org/cms/lib/GA01903614/Centricity/Domain/2141/Lexiles-in-Education-0504%20Fact%20Sheet.pdf)

**Validation of commercial metrics (Nelson, Perfetti, Liben & Liben 2012, report to the Gates Foundation / CCSSO)**
- The study compared six metrics (Lexile, ATOS, DRP, REAP, SourceRater, Pearson Reading Maturity Metric) plus Coh-Metrix against five reference sets of texts with known grade level or student-performance difficulty. — [Achieve the Core report page](https://achievethecore.org/page/1196/measures-of-text-difficulty-testing-their-predictive-value-for-grade-levels-and-student-performance)
- Secondary summaries say all metrics were "reliably and often highly correlated" with grade level and student-performance measures, and that no single measure was significantly better at predicting student outcomes. — [CDE summary document](https://www.cde.ca.gov/BE/cc/cd/documents/sept2012item2aatt4.doc). An ETS press release claims SourceRater correlated highest in five of six comparisons. ETS has a commercial interest, and this conflicts with the "no significant difference" summary — [firmenpresse](https://www.firmenpresse.de/pressrelease98386/study-confirms-gold-standard-quality-of-ets-s-sourcerater-sm.html)
- Caveat: all reference sets were K-12 school texts, so this validation does not extend to adult classics.

**Multi-dimensional measures (Coh-Metrix / T.E.R.A.)**
- Graesser, McNamara and Kulikowich (2011, *Educational Researcher* 40) found five factors that explain most of the variance in texts across grade levels and genres: narrativity, syntactic simplicity, word concreteness, referential cohesion and deep (causal) cohesion. — [Educational Researcher DOI 10.3102/0013189X11413260](https://https-sage-cnpereading-com-443.webvpn1.xju.edu.cn/doi/10.3102/0013189X11413260); [T.E.R.A.](https://soletlab.asu.edu/t-e-r-a/)
- T.E.R.A. treats narrativity as an easing factor: the more story-like a text, the easier it is, and low narrativity signals denser information. Low referential cohesion makes it harder to connect ideas between sentences. — [T.E.R.A.](https://soletlab.asu.edu/t-e-r-a/)

**Lexile mis-ranking of classics**
- *The Grapes of Wrath* is 680L, the lowest of the Common Core grade 9-10 fiction exemplars. The grade 9-10 Lexile band is 1050-1335, yet 10 of the 13 fiction exemplars fall below it. Hemingway's *A Farewell to Arms* is 730L. Measured by Lexile alone, *Jane Eyre*, *Crime and Punishment* and *A Farewell to Arms* would fall into grades 2-3 or 4-5. — [Kathy Short, WOW Literacy (2018)](https://wowlit.org/blog/2018/05/14/limitations-of-lexile-levels-for-global-literature)
- Common Core materials state that Flesch-Kincaid and Lexile both rate *The Grapes of Wrath* as suitable for grades 2-3. — [Davidson Gifted forum quoting CCSS materials](https://giftedissues.davidsongifted.org/bb/ubbthreads.php/posts/205593.html); see also [The New Republic, "Common Core Standards Make a Mockery of Novels' Complexity"](https://newrepublic.com/article/115393/common-core-standards-make-mockery-novels-complexity) and [Education Week, "Guess my Lexile"](https://www.edweek.org/education/opinion-guess-my-lexile/2012/07)

**Lexiles for the user's example books (from library catalogs, not the official Lexile Hub)**
- *Ulysses* (Joyce): 1050L, Accelerated Reader level 7.5, across the 1997 Knopf and 2008 Oxford editions. — [Marmot library catalog record](https://bemis2.marmot.org/Record/.b20369104) (from a search-result snippet; the page itself returned 403)
- *The Awakening* (Chopin): 960L for the Dover, Avon and Canongate editions, and 1030L for some Oxford and Capricorn editions; one reading-list site places it in grades 11-12. — [Wake County catalog](https://catalog.wake.gov/Record/39911); [readinglist.school](https://readinglist.school/book/the-awakening)
- So Lexile puts *Ulysses* only about 20-90L above *The Awakening*, well within the measurement noise between editions of the same book.

**Newer ML and LLM measures**
- CLEAR corpus (Crossley et al. 2022, *Behavior Research Methods*): about 4,700 excerpts of 140-200 words each, drawn from sources such as Project Gutenberg and published 1875-2020. Teachers judged pairs of excerpts for relative readability, and the pairs were combined with a Bradley-Terry model. Traditional formulas correlate around r > .50 with these scores; the best formula, CAREC, reaches r = .58. Formulas explain only about 23-34% of the variance. Older passages were rated harder (r = .206 with publication year). — [PMC10027808](https://pmc.ncbi.nlm.nih.gov/articles/PMC10027808)
- Trott & Rivière (2024): zero-shot GPT-4 Turbo readability estimates correlate r = .76 with human judgments on 4,724 excerpts (GPT-4o mini r = .74), beating traditional formulas and psycholinguistic indices. — [arXiv 2410.14028](https://arxiv.org/abs/2410.14028)
- Feldkamp et al. (NoDaLiDa 2025) modelled several layers of complexity across more than 9,000 English novels from the 19th and 20th centuries. Stylistic and sentiment complexity move together roughly linearly, and information-density features relate to difficulty rankings and reading times. — [ACL Anthology 2025.nodalida-1.15](https://preview.aclanthology.org/setup/2025.nodalida-1.15)
- One talk on literary text mining noted that whole-text lexical diversity does not reliably track literary prestige or complexity. — [HKU CITE seminar](https://www.cite.hku.hk/event/cite-seminar-text-mining-for-digital-humanities-measuring-complexity-of-literary-texts/)

### Inferences
- Lexile cannot represent the Chopin-to-Joyce gap. Both books have ordinary vocabulary in short-to-medium sentences. *Ulysses* is hard because of structure (shifting style per episode), stream of consciousness, allusion density and knowledge demands, none of which a frequency-and-length formula measures.
- Any "book difficulty" score Tinct uses should be multi-dimensional. At minimum: (a) surface or lexical difficulty, including archaic vocabulary; (b) syntactic difficulty; (c) cohesion and narrativity, the Coh-Metrix-style dimensions; and (d) qualitative dimensions, rated by a person or an LLM, covering structure, ambiguity of meaning, allusion and knowledge demands, and argument density for philosophy.
- LLM pairwise or rubric judgments look like the most practical way to score the qualitative dimensions, given the r = .76 result. They should be applied per chapter or section and then aggregated, because the validation evidence covers excerpts only. Pairwise comparison, as in CLEAR's Bradley-Terry method, is a sound way to place books on one scale.
- For philosophy (Plato, Kant), narrativity and cohesion carry most of the signal. Plato's dialogues are fairly narrative and conversational. Kant has low narrativity, high abstraction (low word concreteness) and long embedded syntax. This ordering is inferred from the dimensions, not from measured scores.

### Gaps
- No exact Nelson et al. 2012 correlation coefficients were retrieved; the PDF did not load. My recollection is roughly .5-.8 depending on the text set, but this is unverified, so it should not be reported.
- No Lexile or other published measure was found for Plato or Kant.
- No study was found that applies Coh-Metrix or an LLM to *Ulysses* or to stream-of-consciousness difficulty specifically.

## 2. The Common Core three-part model and the qualitative dimensions of literary difficulty

### Takeaway
CCSS Appendix A defines text complexity in three parts: quantitative measures, qualitative features (levels of meaning, structure, language conventionality and clarity, knowledge demands) and reader-and-task. The qualitative dimensions are where classics differ from each other. The CCSS authors themselves called these dimensions tentative.

### Cited Findings
- The four qualitative dimensions are levels of meaning or purpose, structure, language conventionality and clarity, and knowledge demands. Each is described as a continuum, not a set of stages. — [Rhode Island DOE guide](https://ride.ri.gov:443/Portals/0/Uploads/Documents/Common-Core/Considering-Text-Complexity-Qs-to-Guide-Discussion.pdf); [ASCD module](https://pdo.ascd.org/LMSCourses/PD11OC132/media/Literacy_HSS_M2_Reading_Complex_Texts.pdf)
- Structure: simple texts are predictable and chronological, while complex texts rely on unpredictability and shifts in chronology and point of view. Language: simple means literal, familiar and conversational, while complex means figurative, ironic and abstract. Knowledge demands rise with themes outside common experience, culture-specific or distant-in-time content, and texts that allude to other texts. — [same sources, quoting Appendix A](https://ride.ri.gov:443/Portals/0/Uploads/Documents/Common-Core/Considering-Text-Complexity-Qs-to-Guide-Discussion.pdf)
- Reader and task covers background knowledge, motivation, interests, and the complexity a task creates; it is left to professional judgment. — [Georgia CCGPS text complexity framework](https://www.georgiastandards.org/Common-Core/Common%20Core%20Frameworks/CCGPS_ELA_Moneyball_TC.pdf)
- Hiebert notes that the CCSS writers acknowledged their qualitative dimensions were tentative and that better qualitative measures were "urgently needed". — [Hiebert, Scholastic Book Summit 2012 keynote](https://textproject.org/wp-content/uploads/powerpoints/Hiebert_Scholastic-Book-Summit-2012-10-22_Keynote-Inside-Text-Complexity.pdf)
- Achieve the Core publishes qualitative rubrics for literary and informational text. — [achievethecore.org file 824](https://achievethecore.org/file/824) (not fetched; contents unverified)
- CCSS grade 9-10 Lexile band: 1050-1335. — [WOW Literacy](https://wowlit.org/blog/2018/05/14/limitations-of-lexile-levels-for-global-literature)

### Inferences
- The four CCSS qualitative dimensions map directly onto what separates *The Awakening* from *Ulysses*. On structure, *The Awakening* is linear and third-person while *Ulysses* shifts style and point of view between episodes. On meaning, both are layered, but Joyce more so. On language, Joyce uses parody, neologism and multilingual play. On knowledge demands, Joyce requires Homer, Catholic liturgy, Dublin history and Shakespeare. A 1-4 rating on each dimension would likely put a 2-3 point gap on structure and knowledge demands. This is an inference, not a measurement.
- For the classics, I would add dimensions that CCSS under-specifies:
  - archaic or translated language, which CLEAR's year effect partly confirms
  - allusion density
  - argument density and abstraction, for philosophy
  - length and stamina
  - narrative reliability and irony
- Tinct already produces modern-English editions. Those editions mostly reduce the language-conventionality dimension, not structure or knowledge demands, so a book's difficulty should be recorded per edition.

### Gaps
- Could not read the primary text of CCSS Appendix A or the Achieve the Core rubric; wording above comes from state and ASCD secondary materials.
- No inter-rater reliability data was found for the qualitative rubrics.

## 3. ZPD, instructional vs frustration levels, vocabulary-coverage thresholds, Shanahan, desirable difficulties

### Takeaway
The classic "instructional level" (Betts 1946: 95-98% word accuracy, 75-89% comprehension) was never empirically validated. Studies of students suggest that harder texts with scaffolding produce learning equal to or better than matched texts. For L2 adult readers, vocabulary coverage rises roughly linearly with comprehension, with no sharp threshold. 98% known words is a reasonable target for unassisted reading, and 95% is a reasonable target with support. Disfluency-type "desirable difficulty" has not replicated for reading. The defensible model is stretch plus scaffold, not match.

### Cited Findings
**Betts levels and their evidence**
- Betts (1946) defined three levels. Independent: fluency 99-100%, comprehension 90-100%. Instructional: fluency 95-98%, comprehension 75-89%. Frustration: fluency 92% or below, comprehension 50% or below. Later variants were Gickling at 93-97%, and Clay / Fountas & Pinnell at 90%. Shanahan reports that none of these variants came with evidence of effectiveness. — [Shanahan, "Teaching Reading With Complex Text" (2026 slides)](https://www.shanahanonliteracy.com/upload/publications/308/pdf/Teaching-Reading-With-Complex-Text.pdf)
- Shanahan says the Betts levels came from a doctoral student's study and were "made up" without empirical evidence, and that replications gave very different results. — [Fordham Institute](https://fordhaminstitute.org/national/commentary/leveled-reading-making-literacy-myth)
- Evidence Shanahan cites (all from K-12 students):
  - Powell (1968) found instructional accuracy in the low-to-mid 80s.
  - Dunkeld (1981) found students taught at frustration level made the largest gains.
  - Jorgensen et al. (1977) found no link between placement and gains.
  - Morgan et al. (2000) found frustration-level placement led to more learning, and Brown et al. (2017) replicated this.
  - Kuhn et al. (2006) found grade-level text with FORI more effective than guided reading at reading level.
  - Homan et al. (2010) found no advantage for instructional-level text over text one year harder (grade 6).
  - Lupo et al. (2019) found grade-level text as effective as easier text for grade 9 students when they had support.
  - O'Connor et al. (2002, 2010) found benefits of easier text only for very low-level students with learning disabilities, and the effect disappeared once scaffolding was equated.

  — [Shanahan slides](https://www.shanahanonliteracy.com/upload/publications/308/pdf/Teaching-Reading-With-Complex-Text.pdf)
- Shanahan reports one study in which weaker readers using texts two to four grade levels above their instructional level, with help from lead readers, outscored control groups. He also says harder text alone does not help and needs support for vocabulary, syntax, cohesion and structure. — [Reading Rockets: new evidence on frustration-level teaching](https://www.readingrockets.org/blogs/shanahan-on-literacy/new-evidence-teaching-reading-frustration-levels)
- Shanahan also says standard errors of measurement in reading assessments are wider than the level criteria they try to detect, so precise level placement is impossible. — [Shanahan slides](https://www.shanahanonliteracy.com/upload/publications/308/pdf/Teaching-Reading-With-Complex-Text.pdf)
- Caveat: these are mostly short-term studies with no large long-term RCT; the strongest summary is Shanahan's own advocacy. — [Education Next review of Shanahan's 2025 book](https://www.educationnext.org/wp-content/uploads/2025/10/ednext_25_4_review_portermagee.pdf)

**Vocabulary coverage (adult L2 readers)**
- Hu & Nation (2000) used a 633-word fiction text at 100%, 95%, 90% and 80% known-word coverage. No learner reached adequate comprehension at 80%, and only a few did at 90-95%. The 98% figure was extrapolated by regression from 66 NZ university students; it was not tested directly. — [ERIC EJ887877](https://files.eric.ed.gov/fulltext/EJ887877.pdf); [AILA 2021 replication abstract](https://aila2021.dryfta.com/program/abstract-archive/abstract/public/416/unknown-vocabulary-density-reading-comprehension-and-the-98-coverage-figure-replicating-hu-nation-2000)
- Schmitt, Jiang & Grabe (2011): 661 participants from 8 countries. The relationship between known vocabulary and comprehension was relatively linear, with no threshold. The authors suggest 98% as a reasonable target for academic texts; earlier estimates ranged from 95% (Laufer 1989) to 98%. — [Schmitt et al. 2011 PDF](https://www.lextutor.ca/cover/papers/schmitt_etal_2011.pdf); [NAU record](https://experts.nau.edu/en/publications/the-percentage-of-words-known-in-a-text-and-reading-comprehension/)

**Lexile's own matching model**
- In the Lexile framework, a reader and a text at the same Lexile give a forecast of 75% comprehension. MetaMetrics calls this "targeted" reading and describes it as positive but adequately challenging. A text about 250L below the reader gives about 90% comprehension, and assistance raises the rate. These are vendor claims. — [Lexile Framework PDF](https://cdn.lexile.com/cms%5fpage%5fmedia/135/The%20Lexile%20Framework%20for%20Reading.pdf); [Rasch Measurement note](https://rasch.org/pm/pm3-18.pdf)

**Desirable difficulties**
- Perceptual disfluency, such as hard-to-read fonts, is a frequently cited "desirable difficulty". A meta-analysis of 39 experiments (25 articles, 3,135 participants; Xie et al. 2018) found no reliable learning benefit. It found disfluency lowered judgments of learning (d = -0.54) and may have hurt learning (d = -0.36, p = .06). A preregistered direct replication (N = 96) of the working-memory moderator finding was null. — [Springer, Metacognition & Learning 2023](https://link.springer.com/10.1007/s11409-023-09366-7); [Educational Psychology Review 2018](https://springerlink.bibliotecabuap.elogim.com/10.1007/s10648-018-9442-x)

### Inferences
- For Tinct, the useful ZPD-style rule is to let readers stretch above their comfort level, but only with support available. Tinct already offers modern-English editions, chat, cast lists and glossing. The literature does not support refusing to let someone read *Ulysses*. It supports warning them and scaffolding them.
- A vocabulary-coverage estimate is computable per book and edition, as the share of tokens beyond a frequency band such as the top 9k word families. It is a defensible single quantitative component for lexical difficulty: below about 95% known words, recommend the modern edition or glossing. Thresholds come from adult L2 research, so treat them as rough guides for L1 adults.
- Effortful reading helps when the effort is generative (rereading, self-explanation, retrieval), not when it comes from friction. App design should avoid "making it hard" for its own sake.

### Gaps
- Bjork lab primary papers on desirable difficulties (spacing, retrieval, generation) were not fetched; the support for generative difficulties is from my background knowledge and is not cited here.
- No adult L1 study of classics found for instructional vs frustration level.
- Vygotsky's ZPD is a theoretical construct; no operational measures specific to literary reading were found.

## 4. Estimating a reader's level from behaviour

### Takeaway
Small lab studies show that eye movements can classify skilled vs less-skilled adult readers (about 75-80% accuracy). No published work was found on inferring reader level from e-reader telemetry such as lookups, rereading or abandonment. Item response theory (Rasch, as Lexile uses) is the standard way to put readers and texts on one scale, and could be adapted to behavioural signals.

### Cited Findings
- SVM on eye movements of 61 undergraduates separated high- and low-literacy readers with 80.3% accuracy. — [Univ. of Turku / Behavior Research Methods 2017](https://research.utu.fi/converis/portal/detail/Publication/18188002?lang=en_US)
- Skilled readers (41 university students) showed shorter fixations and longer saccades on normal vs difficult digital texts; XGBoost classified skill at F1 = .753. — [Universidad de Concepción thesis](https://repositorio.udec.cl/items/4d8016b4-8005-48b1-9aaa-457fb3ffd55e)
- Predicting comprehension scores from eye movements has historically been weak, and both text difficulty and reader affect how well it works. — [ANU: Effects of text difficulty and readers on predicting comprehension from eye movements](https://researchportalplus.anu.edu.au/en/publications/effects-of-text-difficulty-and-readers-on-predicting-reading-comp/)
- Lexile places readers and texts on a single Rasch scale and turns the reader-minus-text difference into a forecast comprehension rate (75% at a difference of 0). — [Lexile Framework PDF](https://cdn.lexile.com/cms%5fpage%5fmedia/135/The%20Lexile%20Framework%20for%20Reading.pdf)
- Reading times relate to information-density features in novels. — [Feldkamp et al. 2025](https://preview.aclanthology.org/setup/2025.nodalida-1.15)

### Inferences
- Tinct cannot use eye tracking but has proxy signals: time per page normalised against the book's own words-per-page, chat and lookup frequency per chapter, back-navigation (rereading), session abandonment, and completion. An IRT-style model could treat each (reader, chapter) pair as an "item response", such as finished without heavy lookups versus abandoned, and estimate reader ability and chapter difficulty together. This is how Rasch calibration works, and Tinct's 100+ books provide many items.
- Short optional comprehension checks (1-2 questions per chapter) would provide the most reliable signal for calibration, because behavioural proxies are confounded by interest, available time and device.
- Privacy: behavioural modelling of reading collects personal data. Per CLAUDE.md, any new data category needs the privacy notice updated and approval from Anders.

### Gaps
- No peer-reviewed work found on reader-level estimation from e-book logs, dictionary lookups or abandonment. These are commercial practices (for example Amazon, Readwise) that are not published.
- No published adaptive reading system for adult literature was found.

## 5. Existing difficulty ladders for adult classics

### Takeaway
No well-known adult classics programme publishes a quantified difficulty ladder. Bauer's *The Well-Educated Mind* orders books chronologically within each genre, not by difficulty. Adler's *How to Read a Book* orders by influence (read an author's predecessors first) and by reading level as a skill: elementary, inspectional, analytical, syntopical. School lists (Lexile and CCSS bands) are the only quantified ladders, and they mis-rank classics.

### Cited Findings
- Bauer: each genre list of about 30 works is read chronologically. The novels run from *Don Quixote* (1605) to *Possession* (1990), and autobiography from Augustine to Wiesel. Her method is three stages: grammar, logic, rhetoric. Search results gave no difficulty ranking. — [Publishers Weekly](https://www.publishersweekly.com/9780393050943); [Anythink Libraries blog](https://www.anythinklibraries.org/blog/my-attempt-well-educated-mind)
- Adler & Van Doren: the four levels of reading, plus an appendix reading list. The sequencing principle is to read the books that influenced an author before that author. — [Wikipedia: How to Read a Book](https://en.wikipedia.org/wiki/How_to_Read_a_Book)
- The College Board's recommended reading list, a pre-college list of classics with no difficulty grading, appeared in search results. — [Knox Schools PDF](https://www.knoxschools.org/cms/lib/TN01917079/Centricity/Domain/2662/college_board_recommended_books.pdf)

### Inferences
- The chronological ordering used by Bauer and Adler partly builds knowledge in sequence, because later works allude to earlier ones (*Ulysses* to the *Odyssey*). Ordering by knowledge prerequisites is a real complexity factor under CCSS "knowledge demands". A Tinct ladder could combine a difficulty score with prerequisite edges, for example *Odyssey* before *Ulysses* and Plato before Kant.
- No one appears to have published a quantified adult classics ladder, so Tinct would be first. That is an opportunity, but it also means there is no external validation set. Bootstrap one by pairwise LLM comparisons plus a small human panel, as CLEAR did.

### Gaps
- Could not retrieve Adler's appendix list or confirm any difficulty notes in it. St. John's College and University of Chicago Great Books sequences were not researched for difficulty notes.
