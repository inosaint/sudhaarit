// Phonetic mappings from the original JSX artifact.
// "a/b" lists alternate spellings; the first one is used for Kannada -> Latin.
export const VOWELS = [
  ["ಅ", "a"], ["ಆ", "aa"], ["ಇ", "i"], ["ಈ", "ii"],
  ["ಉ", "u"], ["ಊ", "uu"], ["ಋ", "ru~"], ["ಎ", "e"],
  ["ಏ", "ee"], ["ಐ", "ai"], ["ಒ", "o"], ["ಓ", "oo"],
  ["ಔ", "au"], ["ಅಂ", "an/am"], ["ಅ:", "ah"],
];

export const CONSONANTS = [
  ["ಕ", "ka/ca"], ["ಖ", "kha"], ["ಗ", "ga/gha"], ["ಘ", "ggha"],
  ["ಙ", "ngna/gna"],
  ["ಚ", "cha"], ["ಛ", "chha"], ["ಜ", "ja"], ["ಝ", "jha/za"],
  ["ಞ", "jna/nya"],
  ["ಟ", "ta"], ["ಠ", "tta"], ["ಡ", "dda"], ["ಢ", "ddha"],
  ["ಣ", "nna"],
  ["ತ", "tha"], ["ಥ", "thha"], ["ದ", "da"], ["ಧ", "dha"],
  ["ನ", "na"],
  ["ಪ", "pa"], ["ಫ", "pha/fa"], ["ಬ", "ba"], ["ಭ", "bha"],
  ["ಮ", "ma"], ["ಯ", "ya"], ["ರ", "ra"], ["ಲ", "la"], ["ವ", "va/wa"],
  ["ಶ", "sha"], ["ಷ", "shha"], ["ಸ", "sa"], ["ಹ", "ha"], ["ಳ", "lla"],
  ["ಕ್ಷ", "ksha/xa"],
];

const VOWEL_SIGNS = {
  a: "", aa: "ಾ", i: "ಿ", ii: "ೀ",
  u: "ು", uu: "ೂ", "ru~": "ೃ", e: "ೆ",
  ee: "ೇ", ai: "ೈ", o: "ೊ", oo: "ೋ", au: "ೌ",
};

// Whole words typed with "t" whose Sudhaarit spelling is "th" (dental ತ).
// Plain "t" stays retroflex ಟ everywhere else.
export const RESPELLINGS = Object.fromEntries([
  "tu", "tum", "tumi", "tuka", "tukaa", "tujo", "tuji", "tujem", "tujea",
  "tumchem", "tumcho", "tumchi", "taakaa", "taankaan",
].map((word) => [word, "th" + word.slice(1)]));

// Anusvara (ಂ) is written with n (or m) and only comes from the rules below,
// so ಅಂ / ಅಃ are display-only and never matched while parsing.
const PARSED_VOWELS = VOWELS.filter(([kannada]) => kannada !== "ಅಂ" && kannada !== "ಅ:");

const kannadaToLatin = new Map();
PARSED_VOWELS.forEach(([k, l]) => kannadaToLatin.set(k, l.split("/")[0]));
CONSONANTS.forEach(([k, l]) => kannadaToLatin.set(k, l.split("/")[0]));
const SORTED_KANNADA_KEYS = [...kannadaToLatin.keys()].sort((a, b) => b.length - a.length);

const CONSONANT_ROOTS = [];
CONSONANTS.forEach(([kannada, latin]) => {
  latin.split("/").forEach((variant) => {
    const root = variant.endsWith("a") ? variant.slice(0, -1) : variant;
    if (root) CONSONANT_ROOTS.push([root, kannada]);
  });
});
CONSONANT_ROOTS.sort((a, b) => b[0].length - a[0].length);

const VOWEL_MAP = new Map();
PARSED_VOWELS.forEach(([kannada, latin]) => VOWEL_MAP.set(latin, kannada));

const VOWEL_SIGN_MAP = new Map();
Object.entries(VOWEL_SIGNS).forEach(([latin, sign]) => VOWEL_SIGN_MAP.set(latin, sign));

const SORTED_VOWEL_KEYS = [...VOWEL_MAP.keys()].sort((a, b) => b.length - a.length);
// Vowels that must win over a consonant root starting with the same letter ("ru~" vs "r").
const ESCAPED_VOWEL_KEYS = SORTED_VOWEL_KEYS.filter((key) => key.includes("~"));

// "^" breaks a match (a^i -> ಅಇ, n^k -> ನ್ಕ). It leaves this marker so the
// anusvara rules skip the spot, and the marker is removed at the end.
const BREAK = "";

const VOWEL_SIGN_CHARS = "ಾಿೀುೂೃೆೇೈೊೋೌ";
const STANDALONE_VOWEL_CHARS = "ಅಆಇಈಉಊಋಎಏಐಒಓಔ";
const KANNADA_CONSONANT_CHARS = "ಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹಳ";
// A syllable that ends in a vowel: a vowel sign, a standalone vowel, or a bare consonant (inherent "a").
const VOWEL_END = `[${VOWEL_SIGN_CHARS}${STANDALONE_VOWEL_CHARS}${KANNADA_CONSONANT_CHARS}]`;
const WORD_END = "(?=[\\s.,!?;:\\-]|$)";
const N_BEFORE_CONSONANT = new RegExp(`(${VOWEL_END})ನ್(?=[${KANNADA_CONSONANT_CHARS}])`, "g");
const N_OR_M_AT_END = new RegExp(`(${VOWEL_END})[ನಮ]್${WORD_END}`, "g");

export function latinToKannadaTransliterate(text) {
  if (!text) return "";
  let result = "";
  const lower = text.toLowerCase().replace(/[a-z]+/g, (word) => RESPELLINGS[word] ?? word);
  let i = 0;

  while (i < lower.length) {
    if (lower[i] === "^") {
      result += BREAK;
      i++;
      continue;
    }
    const escapedVowel = ESCAPED_VOWEL_KEYS.find((key) => lower.startsWith(key, i));
    if (escapedVowel) {
      result += VOWEL_MAP.get(escapedVowel);
      i += escapedVowel.length;
      continue;
    }
    let matched = false;
    let consonantMatch = null;
    for (const [root, kannada] of CONSONANT_ROOTS) {
      if (lower.startsWith(root, i)) {
        consonantMatch = [root, kannada];
        break;
      }
    }
    if (consonantMatch) {
      const [root, kanBase] = consonantMatch;
      i += root.length;
      let vowelMatched = false;
      for (const vKey of SORTED_VOWEL_KEYS) {
        if (lower.startsWith(vKey, i)) {
          result += kanBase + VOWEL_SIGN_MAP.get(vKey);
          i += vKey.length;
          vowelMatched = true;
          break;
        }
      }
      if (!vowelMatched) {
        result += kanBase + "್";
      }
      matched = true;
    }
    if (!matched) {
      let vowelFound = false;
      for (const vKey of SORTED_VOWEL_KEYS) {
        if (lower.startsWith(vKey, i)) {
          result += VOWEL_MAP.get(vKey);
          i += vKey.length;
          vowelFound = true;
          break;
        }
      }
      if (!vowelFound) {
        result += lower[i];
        i++;
      }
    }
  }

  result = result.replace(N_BEFORE_CONSONANT, "$1ಂ");
  result = result.replace(N_OR_M_AT_END, "$1ಂ");

  return result.replaceAll(BREAK, "");
}

export function kannadaToLatinTransliterate(text) {
  if (!text) return "";
  let result = "";
  let i = 0;

  while (i < text.length) {
    if (text[i] === "ಂ") { result += "n"; i++; continue; }
    if (text[i] === "ಃ") { result += "h"; i++; continue; }
    if (text[i] === "್") {
      if (result.endsWith("a")) result = result.slice(0, -1);
      i++;
      continue;
    }

    let isMatra = false;
    for (const [latin, sign] of Object.entries(VOWEL_SIGNS)) {
      if (sign && text[i] === sign) {
        if (result.endsWith("a")) result = result.slice(0, -1);
        result += latin;
        i++;
        isMatra = true;
        break;
      }
    }
    if (isMatra) continue;

    let matched = false;
    for (const key of SORTED_KANNADA_KEYS) {
      if (text.startsWith(key, i)) {
        result += kannadaToLatin.get(key);
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) { result += text[i]; i++; }
  }
  return result;
}

export const TEST_WORDS = [
  { id: 1, latin: "haanv", expectedKannada: "ಹಾಂವ್", meaning: "I / me", category: "pronoun" },
  { id: 2, latin: "thun", expectedKannada: "ತುಂ", meaning: "you", category: "pronoun" },
  { id: 3, latin: "aang", expectedKannada: "ಆಂಗ್", meaning: "body", category: "noun" },
  { id: 4, latin: "deev", expectedKannada: "ದೇವ್", meaning: "God", category: "noun" },
  { id: 5, latin: "borem", expectedKannada: "ಬೊರೆಂ", meaning: "good (neuter)", category: "adjective" },
  { id: 6, latin: "ghelim", expectedKannada: "ಗೆಲಿಂ", meaning: "I went (f.)", category: "verb" },
  { id: 7, latin: "jevann", expectedKannada: "ಜೆವಣ್", meaning: "food / meal", category: "noun" },
  { id: 8, latin: "udak", expectedKannada: "ಉದಕ್", meaning: "water", category: "noun" },
  { id: 9, latin: "mhann", expectedKannada: "ಮ್ಹಣ್", meaning: "say", category: "verb" },
  { id: 10, latin: "karunk", expectedKannada: "ಕರುಂಕ್", meaning: "to do", category: "verb" },
  { id: 11, latin: "aamchem", expectedKannada: "ಆಮ್ಚೆಂ", meaning: "ours", category: "pronoun" },
  { id: 12, latin: "diis", expectedKannada: "ದೀಸ್", meaning: "day", category: "noun" },
  { id: 13, latin: "aami", expectedKannada: "ಆಮಿ", meaning: "we", category: "pronoun" },
  { id: 14, latin: "thumi", expectedKannada: "ತುಮಿ", meaning: "you (pl.)", category: "pronoun" },
  { id: 15, latin: "aamcho", expectedKannada: "ಆಮ್ಚೊ", meaning: "our (m.)", category: "pronoun" },
  { id: 16, latin: "maakaa", expectedKannada: "ಮಾಕಾ", meaning: "to me", category: "pronoun" },
  { id: 17, latin: "taankaan", expectedKannada: "ತಾಂಕಾಂ", meaning: "to them", category: "pronoun" },
  { id: 18, latin: "thukaa", expectedKannada: "ತುಕಾ", meaning: "to you", category: "pronoun" },
  { id: 19, latin: "tujo", expectedKannada: "ತುಜೊ", meaning: "your (m.)", category: "pronoun" },
];
