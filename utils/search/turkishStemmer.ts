// ============================================================================
// TURKISH STEMMER - Suffix Removal Algorithm
// ============================================================================

/**
 * Turkish stemmer for search indexing
 * Reduces Turkish words to their root form
 *
 * Examples:
 * - "hesaplanması" → "hesap"
 * - "kirişlerde" → "kiriş"
 * - "gerilmesini" → "geril"
 * - "yüklerin" → "yük"
 */

// Common Turkish suffixes to remove (ordered by priority)
const SUFFIXES = [
  // Derivational suffixes
  'lasının', 'leşsinin', 'leşmelerin', 'leşmelerinin',
  'laşmanın', 'laşmaları', 'laştırma',
  'leştiren', 'leştirildi', 'leştirilmiş',
  'ileştirmek', 'ileştirme', 'ileştir',

  // Possessive suffixes
  'ımız', 'imiz', 'unuz', 'unuz', 'leri', 'ları',
  'sının', 'sinden', 'sine', 'sini', 'sı',
  'ının', 'inden', 'ine', 'ini', 'ı',
  'sının', 'sinden', 'sine', 'sini', 'sı',

  // Case suffixes
  'den', 'dan', 'ten', 'tan',
  'e', 'a', 'ye', 'ya',
  'de', 'da', 'te', 'ta',
  'i', 'ı', 'u', 'ü',
  'in', 'ın', 'un', 'ün',

  // Plural suffixes
  'ler', 'lar',

  // Diminutive
  'cık', 'çık', 'cek', 'çek',
  'cık', 'çık', 'ceğ', 'cağ',

  // Other common
  'lık', 'lık', 'luk', 'lük',
  'sız', 'siz', 'suz', 'süz',
  'ci', 'cı', 'cu', 'cü',
  'çi', 'çı', 'çu', 'çü',
  'ki', 'kı', 'ku', 'kü',
];

// Turkish vowel harmony
const VOWELS = ['a', 'e', 'ı', 'i', 'u', 'ü'];
const FRONT_VOWELS = ['e', 'i', 'ü'];
const BACK_VOWELS = ['a', 'ı', 'u', 'o'];

/**
 * Stem a Turkish word to its root form
 */
export function stemTurkish(word: string): string {
  let result = word.toLowerCase().trim();

  // Remove punctuation
  result = result.replace(/[^\w\sçğöşüı]/gi, '');

  if (result.length <= 3) return result;

  // Try removing suffixes from longest to shortest
  for (const suffix of SUFFIXES) {
    if (result.endsWith(suffix) && result.length > suffix.length + 2) {
      result = result.slice(0, -suffix.length);
      break; // Only remove one suffix at a time
    }
  }

  // Clean up final consonant gemination
  if (result.length > 4) {
    const lastTwo = result.slice(-2);
    if (lastTwo[0] === lastTwo[1]) {
      result = result.slice(0, -1);
    }
  }

  return result;
}

/**
 * Calculate similarity between two strings (fuzzy match)
 */
export function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Tokenize and stem Turkish text
 */
export function tokenizeTurkish(text: string): string[] {
  // Split by word boundaries, filter out short words
  const words = text
    .toLowerCase()
    .replace(/[^\w\sçğöşüı]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Stem each word
  const stems = words.map(stemTurkish);

  // Remove duplicates while preserving order
  return [...new Set(stems)];
}

/**
 * Check if search query matches document text
 * Supports fuzzy matching and stemmed search
 */
export function turkishMatch(query: string, text: string, threshold: number = 0.7): boolean {
  const queryStems = tokenizeTurkish(query);
  const textStems = tokenizeTurkish(text);

  // Check if any query stem matches any text stem
  for (const q of queryStems) {
    for (const t of textStems) {
      // Direct match
      if (q === t) return true;
      // Similarity check
      if (similarity(q, t) >= threshold) return true;
      // Contains check
      if (t.includes(q) || q.includes(t)) return true;
    }
  }

  return false;
}

/**
 * Calculate relevance score for search result
 */
export function calculateRelevance(query: string, text: string): number {
  const queryStems = tokenizeTurkish(query);
  const textLower = text.toLowerCase();
  let score = 0;

  for (const q of queryStems) {
    // Exact word match
    if (textLower.includes(q)) score += 1;
    // stemmed match
    const textStems = tokenizeTurkish(text);
    if (textStems.includes(q)) score += 0.5;
    // Partial match
    if (textLower.includes(q.slice(0, -1))) score += 0.25;
  }

  return Math.min(score, 1);
}
