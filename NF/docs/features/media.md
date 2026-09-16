# Media library — feature dossier

**Phase 3.11** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — albums grid loading/error/empty; upload queue per-file pending/uploading/done/error; unsaved-uploads recovery banner
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## What changed
- **Cloudinary asset deletion**: new `cloudinary-destroy` edge function (signed destroy, admin roles with media rights, idempotent on `not found`). `deleteMediaItem` deletes the row, then the asset; a failed destroy warns but does not roll back.
- **Bulk upload mid-batch failure**: a failed file is marked and can be retried ("Retry N failed uploads"). If the album save fails after uploads succeeded, the assets are kept in an "uploaded but not in the album" state with **Retry save** / **Discard** (discard destroys them).
- Album ↔ programme/event linkage and synced items (`source_table`) are still read-only here by design.

## Env required for destroy
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` on the Supabase project. Without them the function answers 503 and the UI warns.

## Verified
Every admin-uploaded image is served through `buildCloudinaryUrl` / `OptimizedImage` (helpers now in `src/lib/cloudinaryUrls.ts`).
