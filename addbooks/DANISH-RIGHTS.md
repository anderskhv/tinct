# Danish rights eligibility for Add

Engineering policy, checked 2026-10-01. This is a conservative admission rule for
new imports, not legal advice, a lawyer's clearance, a guarantee against claims,
or a worldwide public-domain determination. Have Danish copyright counsel review
the policy before opening a broad commercial catalogue.

## Why a US catalogue flag is insufficient

Denmark's ordinary term for a named author is the author's life plus 70 years,
counted through the end of the seventieth year after death. Joint works use the
last surviving author. In 2026 the ordinary cutoff is therefore **1955**, not
1956. An English-language text is still subject to applicable Danish rights;
language is not a jurisdiction filter.

Translations and creative adaptations have their own rights. Cover art,
illustrations, introductions, annotations, compilations and recordings may also
need separate permission. Anonymous works and first publication of previously
unpublished works have special rules; section 64 can provide a 25-year
publication right. Attribution and integrity considerations do not disappear
merely because the ordinary economic term has ended (including section 75).

Sources:

- [Danish Copyright Act, sections 3–6, 63–64 and 75](https://www.retsinformation.dk/eli/lta/2023/1093).
- [Ministry of Culture: books and texts](https://kum.dk/kulturomraader/vil-du-vide-mere-om-ophavsret/boeger-og-tekster).
- [Standard Ebooks' US public-domain policy](https://standardebooks.org/about/standard-ebooks-and-the-public-domain).
- [Project Gutenberg licence and non-US guidance](https://www.gutenberg.org/policy/license.html).

Neither a Gutenberg US designation nor inclusion in Standard Ebooks clears the
underlying work in Denmark. “Free to download,” an author's age, and a publisher's
general philosophy are not reuse permissions. A modern book needs an explicit
licence covering the exact edition, territory and intended commercial uses.
Redistribution, adaptation and audio each need consideration. The pilot does not
yet admit licensed works automatically.

## Enforced scope

The shared record in `app/src/addbooks/danishRights.json` identifies a book and
edition, all relevant contributors and evidence, a completed edition audit,
resolved special cases, and immutable source/output SHA-256 hashes. Missing or
unresolved evidence means **excluded**, not presumed public domain. Source
metadata alone cannot create a completed review.

- The converter refuses unreviewed editions and substituted source/output bytes.
- The Add list and unlisted reader handoffs use the same reviewed edition list.
- Python and browser tests exercise the same acceptance/exclusion cases.
- Revoking a review removes the edition from Add and handoffs on the next build.
  Previously delivered or directly addressed static files require separate
  removal/cache handling; this gate is not a remote revocation system.
- Cover art and audio are outside this review. The pilot uses a typographic cover
  and has no recording, translation, introduction or annotations.

Only **The Time Machine, original English text**, is currently admitted. Wells
died in 1946 ([Imperial College biography](https://www.imperial.ac.uk/centenary/images/presskit/PR_Imperial.pdf));
the novel was published during his lifetime in 1895. Its ordinary Danish economic
term ended on 2016-12-31. The review applies to the exact converted chapters and
epilogue, not everything found in any edition bearing that title. The checked
source, output and conversion limitations remain in the provenance record.

The existing public Tinct library has **not** been audited by this change. The
separate search prototype on `codex/addbooks-search-prototype` is still a US-based
discovery dataset and must not become an import eligibility list. Before wiring
it into Add, filter **editions before grouping works**, remove works with no
eligible edition, and choose a preferred edition only among eligible ones.
Matching a title already on Tinct must not bypass the review.

## Expansion checklist

1. Gather contributor identities, death dates and evidence per exact edition;
   audit additions, translations and first-publication history. Uncertain or
   special-case records stay out pending rights review. Do not infer missing
   translators or dates from the underlying author's record.
2. Review source terms independently from the underlying work's copyright.
   Retain attribution, edition provenance and an audit trail.
3. Introduce a separate licence-based path for modern open books and essays,
   with licence text/version, rights holder, territories, commercial permissions,
   attribution requirements and restrictions. Do not reinterpret those books as
   public domain.
4. Audit the existing Tinct library separately and assess other countries where
   Tinct distributes. Danish eligibility alone is not worldwide clearance.
5. Before broader launch, agree a takedown/contact process and review how to
   withdraw assets and cached copies when a rights record is corrected.
