const HASHTAG_PATTERN = /^[a-z0-9_]{1,30}$/;

/** `#WebDev ` becomes `webdev`. Returns null when the result is not a valid tag. */
export function normalizeHashtag(raw: string): string | null {
  const tag = raw.trim().replace(/^#+/, '').toLowerCase();
  return HASHTAG_PATTERN.test(tag) ? tag : null;
}
