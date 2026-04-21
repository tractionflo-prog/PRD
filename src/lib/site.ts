/** Canonical site origin for metadata, sitemap, and robots. No trailing slash. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "https://tractionflo.com";
  return raw.replace(/\/$/, "");
}
