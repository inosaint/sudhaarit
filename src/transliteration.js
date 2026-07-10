// Phonetic mappings from the original JSX artifact.
export const VOWELS = [
  ["ಅ", "a"], ["ಆ", "aa"], ["ಇ", "i"], ["ಈ", "ii"],
  ["ಉ", "u"], ["ಊ", "uu"], ["ಋ", "r"], ["ಎ", "e"],
  ["ಏ", "ee"], ["ಐ", "ai"], ["ಒ", "o"], ["ಓ", "oo"],
  ["ಔ", "au"], ["ಅಂ", "am"], ["ಅ:", "ah"],
];

export const CONSONANTS = [
  ["ಕ", "ka"], ["ಖ", "kha"], ["ಗ", "ga"], ["ಘ", "ggha"],
  ["ಙ", "ngna/gna"],
  ["ಚ", "cha"], ["ಛ", "chha"], ["ಜ", "ja"], ["ಝ", "jha/za"],
  ["ಞ", "jna/nya"],
  ["ಟ", "ta"], ["ಠ", "tta"], ["ಡ", "dda"], ["ಢ", "ddha"],
  ["ಣ", "nna"],
  ["ತ", "tha"], ["ಥ", "thha"], ["ದ", "da"], ["ಧ", "dha"],
  ["ನ", "na"],
  ["ಪ", "pa"], ["ಫ", "pha"], ["ಬ", "ba"], ["ಭ", "bha"],
  ["ಮ", "ma"], ["ಯ", "ya"], ["ರ", "ra"], ["ಲ", "la"], ["ವ", "va"],
  ["ಷ", "shha/sha"], ["ಸ", "sa"], ["ಹ", "ha"], ["ಳ", "lla"],
];

const VOWEL_SIGNS = {
  a: "", aa: "ಾ", i: "ಿ", ii: "ೀ",
  u: "ು", uu: "ೂ", r: "ೃ", e: "ೆ",
  ee: "ೇ", ai: "ೈ", o: "ೊ", oo: "ೋ", au: "ೌ",
};

const kannadaToLatin = new Map();
VOWELS.forEach(([k, l]) => kannadaToLatin.set(k, l));
CONSONANTS.forEach(([k, l]) => kannadaToLatin.set(k, l));

const CONSONANT_ROOTS = [];
CONSONANTS.forEach(([kannada, latin]) => {
  latin.split("/").forEach((variant) => {
    const root = variant.endsWith("a") ? variant.slice(0, -1) : variant;
    if (root) CONSONANT_ROOTS.push([root, kannada]);
  });
});
CONSONANT_ROOTS.sort((a, b) => b[0].length - a[0].length);

const VOWEL_MAP = new Map();
VOWELS.forEach(([kannada, latin]) => VOWEL_MAP.set(latin, kannada));

const VOWEL_SIGN_MAP = new Map();
Object.entries(VOWEL_SIGNS).forEach(([latin, sign]) => VOWEL_SIGN_MAP.set(latin, sign));

const SORTED_VOWEL_KEYS = [...VOWEL_MAP.keys()].sort((a, b) => b.length - a.length);

export function latinToKannadaTransliterate(text) {
  if (!text) return "";
  let result = "";
  const lower = text.toLowerCase();
  let i = 0;

  while (i < lower.length) {
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
          const sign = VOWEL_SIGN_MAP.get(vKey);
          if (sign !== undefined) {
            result += kanBase + sign;
          } else {
            result += kanBase + VOWEL_MAP.get(vKey);
          }
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

  const vowelSigns = "ಾಿೀುೂೃೆೇೈೊೋೌ";
  const standAloneVowels = "ಅಆಇಈಉಊಋಎಏಐಒಓಔ";
  const kannadaConsonants = "ಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಷಸಹಳ";
  const nBeforeConsonant = new RegExp(`([${vowelSigns}${standAloneVowels}])ನ್([${kannadaConsonants}])`, "g");
  result = result.replace(nBeforeConsonant, "$1ಂ$2");
  const mAtEnd = new RegExp(`([${vowelSigns}${standAloneVowels}])ಮ್(?=[\\s.,!?;:\\-]|$)`, "g");
  result = result.replace(mAtEnd, "$1ಂ");

  return result;
}

export function kannadaToLatinTransliterate(text) {
  if (!text) return "";
  let result = "";
  let i = 0;
  const sortedKeys = [...kannadaToLatin.keys()].sort((a, b) => b.length - a.length);

  while (i < text.length) {
    if (text[i] === "ಂ") { result += "m"; i++; continue; }
    if (text[i] === "ಃ") { result += "h"; i++; continue; }
    if (text[i] === "್") { i++; continue; }

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
    for (const key of sortedKeys) {
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
  { id: 2, latin: "thum", expectedKannada: "ತುಂ", meaning: "you", category: "pronoun" },
  { id: 3, latin: "aang", expectedKannada: "ಆಂಗ್", meaning: "body", category: "noun" },
  { id: 4, latin: "deev", expectedKannada: "ದೇವ್", meaning: "God", category: "noun" },
  { id: 5, latin: "borem", expectedKannada: "ಬೊರೆಂ", meaning: "good (neuter)", category: "adjective" },
  { id: 6, latin: "ghelim", expectedKannada: "?", meaning: "I went (f.)", category: "verb", needsReview: true },
  { id: 7, latin: "jevan", expectedKannada: "ಜೆವನ್", meaning: "food / meal", category: "noun" },
  { id: 8, latin: "udak", expectedKannada: "ಉದಕ್", meaning: "water", category: "noun" },
  { id: 9, latin: "mhann", expectedKannada: "ಮ್ಹಣ್", meaning: "say", category: "verb" },
  { id: 10, latin: "karunk", expectedKannada: "ಕರುಂಕ್", meaning: "to do", category: "verb" },
  { id: 11, latin: "aamchem", expectedKannada: "ಆಮ್ಚೆಂ", meaning: "ours", category: "pronoun" },
  { id: 12, latin: "diis", expectedKannada: "ದೀಸ್", meaning: "day", category: "noun" },
];
