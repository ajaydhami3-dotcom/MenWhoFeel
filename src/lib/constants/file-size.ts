/**
 * Maximum allowed size for a featured/OG image upload. Imported by both
 * FeaturedImageField.tsx (client-side pre-check, before any network request
 * is made) and actions.ts (server-side check, the actual source of truth —
 * never trust client-side validation alone).
 *
 * IMPORTANT: this number must stay comfortably BELOW the
 * `experimental.serverActions.bodySizeLimit` value in next.config.mjs.
 * Next.js enforces that limit on the raw POST body at the framework level,
 * before any Server Action's own code — including the check that uses this
 * constant — ever runs. If this constant is ever raised, bodySizeLimit in
 * next.config.mjs must be raised to comfortably exceed it, or uploads at
 * the new limit will fail with a framework-level error instead of the
 * friendly message this constant is meant to enable.
 */
export const MAX_FEATURED_IMAGE_SIZE_MB = 5;
export const MAX_FEATURED_IMAGE_SIZE_BYTES = MAX_FEATURED_IMAGE_SIZE_MB * 1024 * 1024;