const SAFE_FILENAME_REGEX = /[^A-Za-z0-9._-]+/g;

/**
 * Returns a filesystem-safe filename derived from {@code rawName}.
 * The function preserves ASCII letters, digits, dots, hyphens, and underscores
 * while collapsing whitespace and separators into single hyphens.
 * If the sanitization strips the entire string, the provided {@code fallback} is used instead.
 */
export function sanitizeFileName(rawName: string, fallback: string) {
  const normalized = rawName
    .trim()
    .replace(/[\\/]+/g, "-")
    .replace(/\s+/g, "-")
    .normalize("NFKD")
    .replace(SAFE_FILENAME_REGEX, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : fallback;
}
