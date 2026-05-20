import "server-only";

/**
 * OpenNext on Cloudflare without R2 incremental cache: `unstable_cache` often 500s.
 * Vercel / local dev: keep Next data cache enabled.
 */
export function useNextDataCache(): boolean {
  if (process.env.FORCE_NEXT_CACHE === "1") return true;
  if (process.env.DISABLE_NEXT_CACHE === "1") return false;
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.VERCEL) return true;
  return false;
}
