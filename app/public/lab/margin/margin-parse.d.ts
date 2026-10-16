// Types for margin-parse.js (the same API as src/companion/marginParse.ts).
/** The kinds of citation a PDF answer may carry, as printed: {p. 12}, {pp. 12–13}, {eq. 1.2}, {fig. 1.3}, {table 2}, {sec. 2.4}. */
export declare const CITATION_KINDS: readonly ["p", "pp", "eq", "fig", "table", "sec"];
export type CitationKind = typeof CITATION_KINDS[number];
export interface CitationToken {
    type: 'cite';
    kind: CitationKind;
    label: string;
    to?: string;
    raw: string;
}
export interface TextPart {
    type: 'text';
    text: string;
}
export type CitationPart = TextPart | CitationToken;
/**
 * Text split into text and citation parts, in order. A `{…}` that is not a citation, or one
 * `resolve(token)` turns down (the page or equation is not in this PDF), stays text exactly
 * as written. A range is only for pages ({pp. 12–13}); {p. 12–13} is read as the same range.
 * -> [{ type: 'text', text } | { type: 'cite', kind, label, to?, raw }]
 */
export declare function parseCitations(text: unknown, resolve?: (token: CitationToken) => boolean): CitationPart[];
/** The citation tokens alone (no text), for a cite field or a quick count. */
export declare function citationTokens(text: unknown): CitationToken[];
/**
 * The card's bottom line: the first sentence of the first paragraph, bolded by the client
 * (it never parses Markdown bold). `rest` is everything after it, paragraphs kept.
 * `prefixes` (Fact-check's verdict words) count as part of the first sentence.
 * -> { lead, rest }
 */
export declare function splitBottomLine(text: unknown, options?: {
    prefixes?: readonly string[];
}): {
    lead: string;
    rest: string;
};
/** Fact-check's verdict words, in the prompt's order, and Note. for context that is not a verdict. */
export declare const VERDICTS: readonly ["Holds.", "Partly holds.", "Outdated.", "Disputed.", "Can't check."];
export type Verdict = typeof VERDICTS[number];
export declare const NOTE = "Note.";
/** The links on a "Sources:" line: Markdown links first, else bare http(s) URLs (titled by host). */
export interface Source {
    title: string;
    url: string;
}
export declare function parseSourcesLine(line: unknown): Source[];
/**
 * A Fact-check answer: the overall verdict and its sentence (the bottom line), one entry per
 * paragraph after it with its verdict word (or Note., or none), and the sources.
 * -> { opening: [paragraph], verdict, lead, claims: [{ verdict, text }], sources: [{ title, url }] }
 * `verdict` is one of VERDICTS or null; a claim's is one of VERDICTS, NOTE or null.
 */
export interface Factcheck {
    /** The opening paragraphs before the verdict (written from the document while the search runs); empty on an older answer. */
    opening: string[];
    verdict: Verdict | null;
    lead: string;
    claims: Array<{
        verdict: Verdict | typeof NOTE | null;
        text: string;
    }>;
    sources: Source[];
}
export declare function parseFactcheck(text: unknown): Factcheck;
/**
 * The JSON object in a reply: inside a code fence or after stray text, the first {...}
 * that parses. -> the object, or null.
 */
export declare function extractJson(text: unknown): Record<string, unknown> | null;
/**
 * Quiz me's questions: up to three valid ones (a question and an answer each), in order.
 * -> { questions: [{ q, answer, why, cite }] } with 1 to 3 questions, or null.
 */
export interface QuizQuestion {
    q: string;
    answer: string;
    why: string;
    cite: string;
}
export declare function parseQuiz(text: unknown): {
    questions: QuizQuestion[];
} | null;
/** The three marks a quiz answer can get, and how the card shows each as its bottom line. */
export declare const QUIZ_VERDICTS: readonly ["right", "nearly", "not_yet"];
export type QuizVerdict = typeof QUIZ_VERDICTS[number];
export declare const QUIZ_VERDICT_LINE: Readonly<Record<QuizVerdict, string>>;
/** quiz_check's mark. -> { verdict: 'right' | 'nearly' | 'not_yet', feedback } or null. */
/** Quiz me while it streams: the complete questions so far, up to three. */
export declare function parseQuizPartial(text: unknown): Array<{ q: string; answer: string; why: string; cite: string }>;
export declare function parseQuizCheck(text: unknown): {
    verdict: QuizVerdict;
    feedback: string;
} | null;
/**
 * define_sense's pick: the 1-based number of the sense that fits, or 0 when none does.
 * `count` is how many senses were sent; a number outside 0..count is null (keep the
 * dictionary order), as is anything unreadable.
 */
export declare function parseDefineSense(text: unknown, count?: number): number | null;
/** One of Related's places: a citation or a few quoted words (or neither), then what happens there. */
export interface RelatedRow {
    cite: CitationToken | null;
    quote: string | null;
    text: string;
}
/** Related's bottom line and its places. */
export declare function parseRelated(text: unknown): {
    lead: string;
    rows: RelatedRow[];
};
export declare const PDF_EXPLAIN_FORMAT_BEFORE: string;
export declare const PDF_EXPLAIN_FORMAT: string;
export declare const PASSAGE_IMAGE_LINE: string;
/** An answer without a sentence about the passage picture, or one that opens on it ("The image shows…"). */
export declare function withoutPictureTalk(text: unknown): string;
/** Explain without its template lines: no notation, what the passage lacks, where the selection stops; an opening on the selection reads as one on its meaning. */
export declare function withoutTemplateTalk(text: unknown): string;
/** A sentence that opens on the selection ("The selected passage says that X") as one on its meaning ("X"). */
export declare function withoutSelectionTalk(sentence: string): string;
/** An answer without references to its own earlier replies ("This also corrects my earlier remark"). */
export declare function withoutSelfReference(text: unknown): string;
/** Counterpoint without "The strongest objection is that" and the author's reply. */
export declare function counterpointAnswer(text: unknown): string;
/** A source's title without the site's name after " | ", " · ", " - " or " — ". */
export declare function sourceTitle(title: unknown): string;
