/**
 * Purely Deterministic Indic Transliteration Engine for SatyaDrishti
 *
 * Implements rule-based phonetic conversion from Latin/English script to:
 * - Hindi (Devanagari)
 * - Kannada
 * - Tamil
 *
 * NO LLM OR REMOTE API IS USED.
 */

import { SupportedLanguage } from '../types/compliance';

// Common English words that should not be syllabically converted into garbled Indic letters
const COMMON_ENGLISH_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'was', 'were', 'on', 'in', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'my', 'me', 'we', 'us',
  'says', 'said', 'shop', 'store', 'charged', 'invoice', 'also', 'sticker', 'overprinted',
  'printed', 'product', 'item', 'box', 'bottle', 'price', 'paid', 'buying', 'got', 'has', 'have'
]);

// Common domain vocabulary mappings across scripts
const HINDI_WORD_MAP: Record<string, string> = {
  packet: 'पैकेट',
  pack: 'पैक',
  par: 'पर',
  me: 'में',
  mein: 'में',
  se: 'से',
  pe: 'पे',
  hai: 'है',
  hain: 'हैं',
  nahi: 'नहीं',
  nahin: 'नहीं',
  na: 'न',
  likha: 'लिखा',
  likhi: 'लिखी',
  dama: 'दाम',
  dam: 'दाम',
  kimat: 'कीमत',
  keemat: 'कीमत',
  zyada: 'ज्यादा',
  jyada: 'ज्यादा',
  adhik: 'अधिक',
  kam: 'कम',
  vajan: 'वजन',
  samagri: 'सामग्री',
  dukaan: 'दुकान',
  dukan: 'दुकान',
  bill: 'बिल',
  rupaye: 'रुपये',
  rs: 'रु',
  mrp: 'MRP',
  fssai: 'FSSAI',
  bis: 'BIS',
};

const KANNADA_WORD_MAP: Record<string, string> = {
  packet: 'ಪ್ಯಾಕೆಟ್',
  pack: 'ಪ್ಯಾಕ್',
  alli: 'ನಲ್ಲಿ',
  nalli: 'ನಲ್ಲಿ',
  mele: 'ಮೇಲೆ',
  ginta: 'ಗಿಂತ',
  illa: 'ಇಲ್ಲ',
  namodisilla: 'ನಮೂದಿಸಿಲ್ಲ',
  bardilla: 'ಬರೆದಿಲ್ಲ',
  kammi: 'ಕಡಿಮೆ',
  kadime: 'ಕಡಿಮೆ',
  hechu: 'ಹೆಚ್ಚು',
  jaasthi: 'ಜಾಸ್ತಿ',
  jasthi: 'ಜಾಸ್ತಿ',
  tooka: 'ತೂಕ',
  bele: 'ಬೆಲೆ',
  duddu: 'ದುಡ್ಡು',
  hana: 'ಹಣ',
  angadi: 'ಅಂಗಡಿ',
  billu: 'ಬಿಲ್ಲು',
  bill: 'ಬಿಲ್',
  mrp: 'MRP',
  fssai: 'FSSAI',
};

const TAMIL_WORD_MAP: Record<string, string> = {
  packet: 'பாக்கெட்',
  pack: 'பேக்',
  il: 'இல்',
  ilay: 'இல்',
  la: 'இல்',
  mela: 'மேல்',
  vida: 'விட',
  illai: 'இல்லை',
  illaiy: 'இல்லை',
  kuripidavillai: 'குறிப்பிடப்படவில்லை',
  kammi: 'குறைவு',
  kuraivaga: 'குறைவாக',
  adhiga: 'அதிக',
  jasthee: 'கூடுதல்',
  edai: 'எடை',
  vilai: 'விலை',
  panam: 'பணம்',
  kadai: 'கடை',
  bill: 'பில்',
  mrp: 'MRP',
  fssai: 'FSSAI',
};

// Hindi Devanagari character mappings
const HI_VOWELS: Record<string, string> = {
  aa: 'आ',
  a: 'अ',
  ee: 'ई',
  ii: 'ई',
  i: 'इ',
  oo: 'ऊ',
  uu: 'ऊ',
  u: 'उ',
  ai: 'ऐ',
  au: 'औ',
  e: 'ए',
  o: 'ओ',
};

const HI_MATRAS: Record<string, string> = {
  aa: 'ा',
  ee: 'ी',
  ii: 'ी',
  i: 'ि',
  oo: 'ू',
  uu: 'ू',
  u: 'ु',
  ai: 'ै',
  au: 'ौ',
  e: 'े',
  o: 'ो',
};

const HI_CONSONANTS: Record<string, string> = {
  kh: 'ख',
  gh: 'घ',
  ch: 'च',
  chh: 'छ',
  jh: 'झ',
  th: 'थ',
  dh: 'ध',
  ph: 'फ',
  bh: 'भ',
  sh: 'श',
  k: 'क',
  g: 'ग',
  j: 'ज',
  t: 'त',
  d: 'द',
  n: 'न',
  p: 'प',
  f: 'फ',
  b: 'ब',
  m: 'म',
  y: 'य',
  r: 'र',
  l: 'ल',
  v: 'व',
  w: 'व',
  s: 'स',
  h: 'ह',
};

// Kannada character mappings
const KN_VOWELS: Record<string, string> = {
  aa: 'ಆ',
  a: 'ಅ',
  ee: 'ಈ',
  ii: 'ಈ',
  i: 'ಇ',
  oo: 'ಊ',
  uu: 'ಊ',
  u: 'ಉ',
  ai: 'ಐ',
  au: 'ಔ',
  e: 'ಎ',
  o: 'ಒ',
};

const KN_MATRAS: Record<string, string> = {
  aa: 'ಾ',
  ee: 'ೀ',
  ii: 'ೀ',
  i: 'ಿ',
  oo: 'ೂ',
  uu: 'ೂ',
  u: 'ು',
  ai: 'ೈ',
  au: 'ೌ',
  e: 'ೆ',
  o: 'ೊ',
};

const KN_CONSONANTS: Record<string, string> = {
  kh: 'ಖ',
  gh: 'ಘ',
  ch: 'ಚ',
  chh: 'ಛ',
  jh: 'ಝ',
  th: 'ಥ',
  dh: 'ಧ',
  ph: 'ಫ',
  bh: 'ಭ',
  sh: 'ಶ',
  k: 'ಕ',
  g: 'ಗ',
  j: 'ಜ',
  t: 'ತ',
  d: 'ದ',
  n: 'ನ',
  p: 'ಪ',
  f: 'ಫ',
  b: 'ಬ',
  m: 'ಮ',
  y: 'ಯ',
  r: 'ರ',
  l: 'ಲ',
  v: 'ವ',
  w: 'ವ',
  s: 'ಸ',
  h: 'ಹ',
};

// Tamil character mappings
const TA_VOWELS: Record<string, string> = {
  aa: 'ஆ',
  a: 'அ',
  ee: 'ஈ',
  ii: 'ஈ',
  i: 'இ',
  oo: 'ஊ',
  uu: 'ஊ',
  u: 'உ',
  ai: 'ஐ',
  au: 'ஔ',
  e: 'எ',
  o: 'ஒ',
};

const TA_MATRAS: Record<string, string> = {
  aa: 'ா',
  ee: 'ீ',
  ii: 'ீ',
  i: 'ி',
  oo: 'ூ',
  uu: 'ூ',
  u: 'ு',
  ai: 'ை',
  au: 'ௌ',
  e: 'ெ',
  o: 'ொ',
};

const TA_CONSONANTS: Record<string, string> = {
  kh: 'க',
  gh: 'க',
  ch: 'ச',
  chh: 'ச',
  jh: 'ஜ',
  th: 'த',
  dh: 'த',
  ph: 'ப',
  bh: 'ப',
  sh: 'ஷ',
  k: 'க',
  g: 'க',
  j: 'ஜ',
  t: 'த',
  d: 'ட',
  n: 'ந',
  p: 'ப',
  f: 'ப',
  b: 'ப',
  m: 'ம',
  y: 'ய',
  r: 'ர',
  l: 'ல',
  v: 'வ',
  w: 'வ',
  s: 'ஸ',
  h: 'ஹ',
};

function transliterateWord(word: string, lang: SupportedLanguage): string {
  if (!word || lang === 'en') return word;

  // Preserve uppercase acronyms, numbers, symbols
  if (/^[A-Z0-9\W]+$/.test(word) || /^(mrp|fssai|bis|rs|inr|kg|g|l|ml)$/i.test(word)) {
    return word.toUpperCase();
  }

  const cleanWord = word.toLowerCase();

  // 1. Explicit Dictionary lookup check (Highest priority)
  if (lang === 'hi' && HINDI_WORD_MAP[cleanWord]) return HINDI_WORD_MAP[cleanWord];
  if (lang === 'kn' && KANNADA_WORD_MAP[cleanWord]) return KANNADA_WORD_MAP[cleanWord];
  if (lang === 'ta' && TAMIL_WORD_MAP[cleanWord]) return TAMIL_WORD_MAP[cleanWord];

  // 2. Preserve common English words instead of forced syllabic conversion
  if (COMMON_ENGLISH_WORDS.has(cleanWord)) {
    return word;
  }

  // 3. Character / syllabic phonetic transliteration fallback for Indic words
  const consonants = lang === 'hi' ? HI_CONSONANTS : lang === 'kn' ? KN_CONSONANTS : TA_CONSONANTS;
  const vowels = lang === 'hi' ? HI_VOWELS : lang === 'kn' ? KN_VOWELS : TA_VOWELS;
  const matras = lang === 'hi' ? HI_MATRAS : lang === 'kn' ? KN_MATRAS : TA_MATRAS;

  let result = '';
  let i = 0;
  let isPrevConsonant = false;

  while (i < cleanWord.length) {
    let matched = false;

    // Try 2-char consonant / vowel
    const twoChar = cleanWord.substring(i, i + 2);
    const oneChar = cleanWord.substring(i, i + 1);

    if (consonants[twoChar]) {
      result += consonants[twoChar];
      i += 2;
      isPrevConsonant = true;
      matched = true;
    } else if (consonants[oneChar]) {
      result += consonants[oneChar];
      i += 1;
      isPrevConsonant = true;
      matched = true;
    } else if (isPrevConsonant && matras[twoChar]) {
      result += matras[twoChar];
      i += 2;
      isPrevConsonant = false;
      matched = true;
    } else if (isPrevConsonant && matras[oneChar]) {
      result += matras[oneChar];
      i += 1;
      isPrevConsonant = false;
      matched = true;
    } else if (vowels[twoChar]) {
      result += vowels[twoChar];
      i += 2;
      isPrevConsonant = false;
      matched = true;
    } else if (vowels[oneChar]) {
      result += vowels[oneChar];
      i += 1;
      isPrevConsonant = false;
      matched = true;
    }

    if (!matched) {
      result += cleanWord[i];
      i++;
      isPrevConsonant = false;
    }
  }

  return result;
}

/**
 * Transliterates input text phonetically into target language script.
 * Preserves punctuation, numbers, existing Indic script characters, and common English words.
 */
export function transliterateText(text: string, targetLang: SupportedLanguage): string {
  if (!text || targetLang === 'en') return text;

  // Split into tokens preserving whitespace and punctuation
  const tokens = text.split(/(\s+|[.,!?;:()"'₹\-\/])/);

  return tokens
    .map((token) => {
      // If token is whitespace or punctuation or already native script, leave as is
      if (!token || /^\s+$/.test(token) || /^[.,!?;:()"'₹\-\/]+$/.test(token)) {
        return token;
      }
      // If already contains Devanagari, Kannada, or Tamil script, preserve
      if (/[\u0900-\u097F\u0C80-\u0CFF\u0B80-\u0BFF]/.test(token)) {
        return token;
      }
      return transliterateWord(token, targetLang);
    })
    .join('');
}
