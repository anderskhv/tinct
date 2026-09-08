# Library completion and audio browsing — 8 September 2026

The new library hydrated explicit book-completed records but omitted legacy progress records. A scoped account audit confirmed terminal progress for The Awakening and War and Peace, alongside Symposium’s explicit completion. Recognise both formats on device and cloud, validate matching book IDs, and preserve existing records without inventing dates or rewriting history. Partial progress is not completion.

V2 now retains word-relative ink while browsing during audio. Back to audio returns the displayed page to the live follow target without seeking or restarting playback. The pill is positioned outside normal layout; pagination measurements are unchanged. Browser theme color, document background and body background are aligned, with cleanup on leaving the reader; Safari controls its toolbar tint.

Verification: 141 test files, 1,548 tests passed, including V1 DOM snapshot, legacy progress fixtures, unread-word paint and return-without-seeking regression. Build, bundle and production results recorded below after release.

Originally deployed as Worker a53d2416-0587-478b-a3b0-bf60354a1b86. Follow-up signed-in production verification confirmed all three Finished books and matching document/body/theme colors. Screenshots saved under the completion-audio walkthrough directory.
