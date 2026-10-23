# Shared reader compatible rollback candidate

This records preparation, not deployment or release approval. Anders must
approve merge and deployment explicitly.

The old Worker alone is not a safe rollback target after new private reader
records have been written. It does not understand revision-bearing annotation
envelopes, file-generation keys, EPUB text/page variants or the distinct PDF
text sets. Keep the compatible storage reader and exporter when reverting UI.

## Candidate inspected

- UI baseline: main `d8b667e659009b590bb5e5c9218081c935f74927`.
- Compatible backend: the reviewed `userBooks.ts`, its fake bucket and route/
  account tests saved through `8721c5065df06d248174a6fc13f530ff0538c0ff`.
- Keep the accurate privacy notice and its assertions, plus the offline unit
  test boundary. No migrations, providers or production bindings change.
- In a separate checkout, 121 Worker/account/privacy tests pass against that
  composition. The old UI built and passed bundle verification as
  `index-By9mGwgg.js`; later backend-only additions pass the updated tests.

The compatibility test runs the shipped static PDF client's real
`TinctMargin.mergeCards`, then writes its result without the new optional file
token. It preserves a new page-only recap beside old geometry cards. Distinct
PDF text marks and legacy EPUB page cards remain intact and account-exportable.
Generation guards, revisions, legacy bare-array reads and deletion are covered
by the same route suites.

## Limits and remaining acceptance

The old static margin column omits a card with no geometry. Its Notebook reads
the complete stored card list, so page-only cards remain accessible there.
This is a temporary presentation difference, not permission to drop records.

The backend candidate does not, by itself, establish old-UI compatibility for
the new owner-qualified browser journals. Before public cutover, verify that
rollback retains new private text annotations, claimed legacy records and
device-only Talk transcripts, and that returning to the new reader restores
them without duplication or deletion. Do not substitute an account export test
for this browser upgrade/rollback/reopen journey.

Private ordinary Ask/Talk is device-only in the existing implementation. The
shared release preserves that contract using an owner-qualified journal and
Notebook Copy/Download. Account export covers data held by the account service;
it does not claim to contain an unsynced browser transcript. Sign-out and book
deletion must honor the existing cleanup contract.

The release owner must select a tested compatible rollback version when the
eventual deployment is approved. Never let the automatic rollback choose an
incompatible pre-floor Worker after new records can be written publicly.
