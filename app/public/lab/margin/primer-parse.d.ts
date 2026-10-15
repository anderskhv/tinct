// Types for primer-parse.js (the same API as src/companion/primerParse.ts).
export interface PrimerClaim { text: string; cite: string }
export interface PrimerSection { title: string; pages: string }
export interface Primer {
    gist: string;
    claims: PrimerClaim[];
    keepInMind: string[];
    map: PrimerSection[];
}
export interface StoredPrimer extends Primer {
    /** When it was made: ISO 8601, UTC. */
    madeAt: string;
    unitKey: string;
}
/** Counts and caps. A list longer than its maximum keeps its first items; shorter than its minimum is invalid. */
export declare const PRIMER_LIMITS: Readonly<{
    claims: Readonly<{ min: number; max: number }>;
    keepInMind: Readonly<{ min: number; max: number }>;
    map: Readonly<{ min: number; max: number }>;
    gistChars: number;
    itemChars: number;
    titleChars: number;
    citeChars: number;
    pagesChars: number;
}>;
/** A unit's key: "all" for a PDF without an outline, else the client's name for a top-level entry (e.g. "outline-3"). */
export declare const PRIMER_UNIT_KEY_RE: RegExp;
/** The primer's content, validated; null when any part is missing or too short. */
export declare function normalizePrimer(value: unknown): Primer | null;
/** The model's answer as a primer, or null when it is not one. */
export declare function parsePrimer(text: unknown): Primer | null;
/** A stored primer: its content plus when it was made (ISO, UTC) and its unit's key. Null when out of shape. */
export declare function normalizeStoredPrimer(value: unknown): StoredPrimer | null;
/** Why an answer is not a primer (for the Worker's log, never the text): null when it is one. */
export declare function primerFailure(text: unknown): 'empty' | 'no_json' | 'invalid_json' | 'shape' | null;
