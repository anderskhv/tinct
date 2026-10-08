// Types for printed-contents.js (imported by the EPUB converter and the Worker).
export function isContentsHeading(text: string): boolean
export function printedContentsRange(paragraphs: string[], options?: { titles?: string[]; heading?: boolean }): [number, number] | null
export function dropPrintedContents<T extends { number: number; title: string; paragraphs: string[] }>(chapters: T[]): T[]
