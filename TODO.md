# Future Logic Review

The website pass intentionally preserves the current transliteration behavior. These logic findings should be reviewed separately before changing language rules:

- Decide how `am` should behave after consonants. Today `kam` becomes `ಕಅಂ`, because standalone vowel mappings are considered after consonant roots.
- Decide how standalone `r` should be disambiguated. Today it is matched as the consonant root `ರ್` before it can become the vowel `ಋ`.
- Improve Kannada-to-Latin handling for virama/conjuncts. Current examples include `ಮ್ಹಣ್ -> mahanna`, `ಹಾಂವ್ -> haamva`, and `ಕರುಂಕ್ -> karumka`.
- Confirm the expected spelling for `ghelim`, which is currently marked as unknown in the feedback list.
- Add unit tests around any accepted rule changes so the community feedback examples stay stable.
