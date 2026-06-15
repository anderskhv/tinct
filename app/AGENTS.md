# App Agent Instructions

This directory contains the production web app. Follow the root `../AGENTS.md` first.

## Commands

Run from `app/`:

```bash
npm run build
npm run verify-bundle
```

Deploy only when Anders explicitly asks:

```bash
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run deploy
```

If Vite cannot empty `dist/`, delete only the generated `app/dist` folder and rebuild.

## High-Risk Areas

Treat these as high-risk and keep diffs small:

- `src/App.tsx`
- `src/components/Reader.tsx`
- `src/components/SplitReader.tsx`
- `src/hooks/useReadingPosition.ts`
- `src/hooks/useReadingPosition.guards.ts`
- `src/hooks/useMobile.ts`
- auth, billing, storage, worker, service worker, and offline caching paths

For these files, inspect nearby logic before editing and avoid opportunistic refactors.

## Reader / Compare Rules

- Read and Compare are separate reader surfaces.
- On mobile, both can be mounted, but only the active view may commit shared page state.
- Switching Read -> Compare should sync to roughly the same paragraph/sentence in the same chapter.
- Switching Compare -> Read should do the same.
- Chapter transitions reset both views: next chapter starts at page 1; previous chapter starts at the last page.
- Read/Compare sync signals must include the chapter they belong to or be cleared on chapter change.
- Stale sync, saved position, resize effects, and hidden readers must not override an intentional chapter transition.

## Pagination Rules

- `totalPages` and the visible page model should come from the same rendered layout.
- Do not fix pagination by adding blind offsets or magic page clamps.
- For empty/phantom page bugs, inspect the DOM and rendered columns before patching.
- For delayed mobile layout bugs, identify which effect/timer/observer wrote the bad page before changing behavior.

## Position Rules

- Persisted position must come from the reducer-backed readerSession passed into `useReadingPosition`; legacy page/chapter state is an adapter while the UI migration continues and must not be used as the persisted content tuple.
- Never write a position while the app is in a transient state where book/chapter/page do not belong together.
- Saved/cloud position is used for restore and direct open, not for overriding an explicit chapter advance.
- Intentional chapter advance has priority over saved position for that transition only.
- Do not destructively clear cloud position to solve a local navigation race unless Anders explicitly approves.

## UI / Interaction Rules

- One physical user gesture should trigger one reader action.
- Guard against delayed WebView/mobile clicks landing on newly mounted UI.
- Reader navigation must not accidentally activate Chat, Feed, Cast, audio, selection popups, or settings.
- Text selection and highlighting should not turn pages.

## Verification Notes

Useful manual checks after reader changes:

- Mobile Read: last page -> next chapter lands on page 1.
- Mobile Compare: same.
- Read mid-chapter -> Compare syncs to similar paragraph.
- Sync in chapter N does not affect chapter N+1.
- Hidden mobile reader does not change visible page count/state.
- Second-last -> last -> next chapter does not jump to Chat.

The project build is currently a more reliable gate than raw `tsc --noEmit`, which has pre-existing unrelated failures.
