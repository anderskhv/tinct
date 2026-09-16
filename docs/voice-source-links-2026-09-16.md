# Voice source links — September 16, 2026

Status: implementation ready for cloud verification and release.

Keep the OpenAI voice and backend models unchanged. Successful outside-source
lookups retain clickable citations in the book-scoped chat transcript and now
instruct the voice to finish with a brief notice that source links are in chat,
without reading URLs aloud. Failed or empty research must not promise links.
A search superseded by another question or book must not announce stale sources.

The existing live transcript and persisted chat both use the same source-link
formatter. Regression coverage checks the notice alongside rendered and persisted
links, unsuccessful research, malformed source results and signed-out lookup.

Verification and production acceptance are pending. Existing authenticated
research requirements remain; this does not grant research to signed-out users.
