# Responsive landing and library — September 17, 2026

Approved: Anders requested the centred reel, full descriptions, horizontal
catalogue rows, compact controls, and corrections for real-phone overlap and iPad
artwork. Before-you-begin remains unchanged.

Failure class: absolutely positioned phone copy, covers and CTA each used
independent viewport offsets; tablet artwork inherited conflicting intrinsic
sizes. Emulator screenshots did not cover the shorter visible browser viewport.

Changes prepared: shared content-flow landing on phones/portrait tablets;
proportionate desktop columns; animated covers with pause/reduced motion and
rotation updates; mobile library header removed, sign-in available from Search;
compact heading/dock, duration before full description, category rows preserving
all eligible books and existing House membership. The librarian reuses the existing
safe Markdown renderer.

Verification pending: cloud tests/build/bundle gates, Chromium and WebKit at
375x560, 390x660, 430x780, 820x1024, 1180x720 and 1440x900; geometry, rotation,
animation/reduced motion, scrolling and visual review. Physical iOS is not
available to this agent and is not claimed as verified.

Earlier preparation acceptance: [release record](library-preparation-polish-2026-09-17.md).
Next action: correct cloud acceptance failures, deploy, inspect production artifacts.
Previously reported preparation-chat suggestion submission and auth return
continuity remain separate follow-ups; this release does not modify reader state.
