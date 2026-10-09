import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TEST_WORDS,
  kannadaToLatinTransliterate as toKannadaLatin,
  latinToKannadaTransliterate as toKannada,
} from "./transliteration.js";

test("native-speaker test words", () => {
  for (const { latin, expectedKannada } of TEST_WORDS) {
    assert.equal(toKannada(latin), expectedKannada, latin);
  }
});

const cases = {
  "word-final n and m become anusvara": [["thun", "ತುಂ"], ["borem", "ಬೊರೆಂ"], ["kam", "ಕಂ"], ["jevan", "ಜೆವಂ"]],
  "n before a consonant after an inherent a": [["manko", "ಮಂಕೊ"]],
  "r after a consonant is ರ, ru~ is ೃ": [["krist", "ಕ್ರಿಸ್ಟ್"], ["kru~pa", "ಕೃಪ"], ["ru~", "ಋ"], ["rosu", "ರೊಸು"]],
  "am at the start of a word is not ಅಂ": [["ami", "ಅಮಿ"], ["amo", "ಅಮೊ"]],
  "gh gives ಗ, ggh gives ಘ": [["ghelim", "ಗೆಲಿಂ"], ["gghar", "ಘರ್"]],
  "^ breaks a match": [["a^i", "ಅಇ"], ["n^ko", "ನ್ಕೊ"]],
  "extra letters": [["woran", "ವೊರಂ"], ["cat", "ಕಟ್"], ["fest", "ಫೆಸ್ಟ್"], ["xetr", "ಕ್ಷೆಟ್ರ್"], ["shenbor", "ಶೆಂಬೊರ್"], ["shhashhtt", "ಷಷ್ಠ್"]],
  "pronouns typed with t use ತ": [["tujo", "ತುಜೊ"], ["tum", "ತುಂ"], ["Tukaa", "ತುಕಾ"], ["taplo", "ಟಪ್ಲೊ"]],
};
for (const [name, pairs] of Object.entries(cases)) {
  test(name, () => {
    for (const [latin, kannada] of pairs) assert.equal(toKannada(latin), kannada, latin);
  });
}

test("Kannada to Latin writes anusvara as n", () => {
  for (const [kannada, latin] of [["ತುಂ", "thun"], ["ಹಾಂವ್", "haanv"], ["ಬೊರೆಂ", "boren"], ["ಝರ್", "jhar"], ["ಶೆಂಬೊರ್", "shenbor"]]) {
    assert.equal(toKannadaLatin(kannada), latin, kannada);
  }
});
