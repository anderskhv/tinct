/**
 * Internal traffic flag for the reader bundle. The logic lives in
 * public/lab/internal-traffic.js so the plain pages (library, sign-in, about,
 * story, Add a book) share exactly the same rules; importing it here also
 * applies `?internal=1|0` as soon as the reader loads.
 */
export {
  CHECK_HEADER,
  INTERNAL_KEY,
  applyInternalFromUrl as applyInternalTrafficFromUrl,
  isInternal as isInternalTraffic,
  setInternal as setInternalTraffic,
} from '../../public/lab/internal-traffic.js'
import { internalHeaders } from '../../public/lab/internal-traffic.js'

/** Spread into the headers of every AI and narration request: `x-tinct-check: 1` while the flag is set. */
export function internalTrafficHeaders(): Record<string, string> { return internalHeaders() }
