# lib/storage/

Private file storage in any S3-compatible bucket (Backblaze B2 now; Cloudflare R2 works by changing the `STORAGE_*` settings).

files.ts: S3 client and short-lived presigned URLs. Server-only. Paid files never go in /public.
