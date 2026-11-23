// Imported first by main.tsx: in free reading mode the guard is in place before any other module can send a request.
import { FREE_MODE, installFreeModeGuard } from './freeMode'

if (FREE_MODE) installFreeModeGuard(window)
