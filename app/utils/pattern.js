/**
 * Deobfuscate common leetspeak substitutions.
 * (e.g. 'b4b1' -> 'babi', '4nj1ng' -> 'anjing')
 *
 * @param {string} str
 * @returns {string}
 */
export function deobfuscateLeetspeak(str) {
  if (!str) return '';
  return str
    .replace(/[4@]/g, 'a')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[3]/g, 'e')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b');
}

/**
 * Collapse repeated characters (e.g. 'baaaabiii' -> 'babi').
 *
 * @param {string} str
 * @returns {string}
 */
export function collapseRepeats(str) {
  if (!str) return '';
  return str.replace(/(.)\1{2,}/g, '$1');
}

/**
 * Escape special regex characters in a string.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Predefined URL/Link pattern regexes.
 */
const PRESET_PATTERNS = {
  'link:wa': /(https?:\/\/)?(chat\.whatsapp\.com\/[a-zA-Z0-9_-]+)/i,
  'link:telegram':
    /(https?:\/\/)?(t\.me\/[a-zA-Z0-9_-]+|telegram\.me\/[a-zA-Z0-9_-]+)/i,
  'link:all':
    /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9_-]+\.(com|id|net|org|me|xyz|io|app|site|online|top|cc|link|live)\b)/i,
};

/**
 * Compile a pattern string into an executable matcher function.
 *
 * Supported formats:
 * 1. Preset URL: 'link:wa', 'link:telegram', 'link:all'
 * 2. Specific Domain: 'domain:bit.ly'
 * 3. Contains: '*slot*'
 * 4. Custom Regex: 'r:/pattern/flags'
 * 5. Exact Word (default): 'babi' (matches whole words via \b)
 *
 * @param {string} rawPattern
 * @returns {((text: string, deobfuscated: string, stripped: string) => boolean) | null}
 */
export function compilePattern(rawPattern) {
  if (!rawPattern || typeof rawPattern !== 'string') return null;
  const p = rawPattern.trim();
  const lower = p.toLowerCase();

  // 1. Preset link pattern
  if (PRESET_PATTERNS[lower]) {
    const regex = PRESET_PATTERNS[lower];
    return (text) => regex.test(text);
  }

  // 2. Domain pattern (e.g. domain:bit.ly)
  if (lower.startsWith('domain:')) {
    const domain = lower.slice(7).trim();
    if (!domain) return null;
    const regex = new RegExp(
      `(https?:\\/\\/)?([a-zA-Z0-9_-]+\\.)*${escapeRegex(domain)}(\\/[^\\s]*)?`,
      'i'
    );
    return (text) => regex.test(text);
  }

  // 3. Custom Regex (e.g. r:/08\d{8,11}/i)
  if (p.startsWith('r:/') && p.lastIndexOf('/') > 2) {
    try {
      const lastSlash = p.lastIndexOf('/');
      const patternBody = p.slice(3, lastSlash);
      const flags = p.slice(lastSlash + 1) || 'i';
      const regex = new RegExp(patternBody, flags);
      return (text, deobf) => regex.test(text) || regex.test(deobf);
    } catch {
      return null;
    }
  }

  // 4. Contains / Substring (e.g. *slot* or *judi)
  if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
    const keyword = p.slice(1, -1).toLowerCase();
    return (text, deobf, stripped) =>
      text.toLowerCase().includes(keyword) ||
      deobf.toLowerCase().includes(keyword) ||
      stripped.toLowerCase().includes(keyword);
  }

  // 5. Exact word boundary match (Default)
  const escaped = escapeRegex(lower);
  const wordRegex = new RegExp(`(^|\\W)(${escaped})($|\\W)`, 'i');

  return (text, deobf, stripped) =>
    wordRegex.test(text) || wordRegex.test(deobf) || wordRegex.test(stripped);
}

/**
 * Match a text against an array of blocked word patterns.
 *
 * @param {string} text - Raw message text to test
 * @param {string[]} patterns - Array of pattern strings
 * @returns {{ matched: boolean, pattern: string | null }}
 */
export function matchBlockedPatterns(text, patterns = []) {
  if (!text || !Array.isArray(patterns) || patterns.length === 0) {
    return { matched: false, pattern: null };
  }

  const rawLower = text.toLowerCase();
  const deobfuscated = collapseRepeats(deobfuscateLeetspeak(rawLower));
  // Stripped version removes spaces and common punctuation (e.g. 'b.a.b.i' -> 'babi')
  const stripped = deobfuscated.replace(/[\s._\-*,#@!|~+=]/g, '');

  for (const rawPattern of patterns) {
    if (!rawPattern || typeof rawPattern !== 'string') continue;
    const matcher = compilePattern(rawPattern);
    if (!matcher) continue;

    if (matcher(text, deobfuscated, stripped)) {
      return { matched: true, pattern: rawPattern };
    }
  }

  return { matched: false, pattern: null };
}

export default {
  deobfuscateLeetspeak,
  collapseRepeats,
  compilePattern,
  matchBlockedPatterns,
};
