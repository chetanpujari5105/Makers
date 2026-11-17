# lib/storage/

Private file storage (Cloudflare R2).

**Built in:** Phase 2. Empty in Phase 0 on purpose — see `BUILD_PLAN.md`.

r2.ts: S3-compatible client and short-lived presigned URLs. Server-only. Paid files never go in /public.
