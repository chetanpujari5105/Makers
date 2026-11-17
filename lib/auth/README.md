# lib/auth/

Buyer magic-link sessions and owner admin sessions.

**Built in:** Phase 2 (buyers) and Phase 4 (admin). Empty in Phase 0 on purpose — see `BUILD_PLAN.md`.

Store only token hashes. httpOnly, secure, sameSite cookies.
