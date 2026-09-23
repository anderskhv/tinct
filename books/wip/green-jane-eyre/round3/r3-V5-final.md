# Round 3 final re-verification — batch V5

## Coverage
7 paragraphs verified: 21.154, 24.172, 17.138, 13.45, 24.67, 17.100, 21.179

## Counts
- VERIFIED: 6
- DEFECT: 1

## Defects

### 21.179
- NEW: `I am, Madam, etc., etc., "JOHN EYRE, Madeira."`
- Problem: the added opening quote sits in the middle of the paragraph, before the signature. That leaves "I am, Madam, etc., etc.," outside the quoted letter and makes "JOHN EYRE, Madeira." read as a separate quotation. The letter opens with a quote mark in 21.178 and doesn't close there, so under the multi-paragraph convention this continuation paragraph should start with the quote mark. The source's stray mid-line quote is a typesetting quirk; this edition already normalized the source's "MADAM,— "Will you" to one opening quote in 21.178. "etc., etc." for "&c., &c." is fine.
- Corrected: `"I am, Madam, etc., etc., JOHN EYRE, Madeira."`
