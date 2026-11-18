/**
 * Which books are not served to this request's country (`GET
 * /api/restricted-books`, src/worker/lib/regionGate.ts), for the bundled code.
 * One implementation, shared with the library's own modules:
 * public/lab/restricted-books.js (one request per page, nothing stored, any
 * failure means "none").
 */
export {
  RESTRICTED_BOOKS_PATH as RESTRICTED_BOOKS_URL,
  fetchRestrictedBookIds,
  loadRestrictedBookIds,
  parseRestrictedBookIds,
  resetRestrictedBookIdsForTest,
  restrictedBookIdsNow,
} from '../../public/lab/restricted-books.js'
