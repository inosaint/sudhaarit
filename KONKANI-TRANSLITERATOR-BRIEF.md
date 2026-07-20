# Konkani (Kannada Script) Transliterator — Project Brief

## What this is
A bidirectional transliterator between Latin script and Kannada script for **Konkani** (specifically the **Mangalorean Catholic dialect**). Based on the **Sudhaarit** phonetic system — a published character mapping from the Chandrem monthly publication.

The current working prototype is a React artifact (single JSX file). It needs to be built into a proper app.

## Current state
- Working React component: `konkani-transliterator.jsx`
- Two tabs: Transliterate + Test & Feedback
- Light/dark mode, copy button, phonetic chart reference
- WCAG AA compliant color scheme
- Basic Latin→Kannada and Kannada→Latin engines

## Core phonetic mapping (Sudhaarit system)

### Key rules that differ from standard Kannada transliteration:
1. **t = ಟ (retroflex), th = ತ (dental)** — follows the Sudhaarit chart, NOT standard convention
2. **d = ದ, dd = ಡ** — double-d for retroflex
3. **z = ಝ** — added for Konkani usage (not in original chart)
4. **gh = NOT ಘ** — "gh" is freed up for regular Konkani use where "h" acts as a separator, not aspiration. ಘ is mapped to "ggha" instead.

### Anusvara (ಂ) rules specific to Konkani:
- **"n" before a consonant** → anusvara (e.g., haanv → ಹಾಂವ್, karunk → ಕರುಂಕ್, aang → ಆಂಗ್)
- **"m" at end of word** → anusvara (e.g., borem → ಬೊರೆಂ, ghelim → ಗೆಲಿಂ, tum → ತುಂ)
- Mid-word "m" stays as ಮ, end-of-word "n" stays as ನ್

### Known open questions (need native speaker feedback):
- **"h" as separator pattern**: In Mangalorean Konkani Latin, "gh", "dh", "bh" etc. are commonly used where "h" is NOT aspiration — it's just a spelling convention. Currently only "gh" has been remapped (ಘ → ggha). Need to decide which other aspirated consonants (kh, dh, bh, ph, jh, chh) should be similarly remapped. Users need to test and provide feedback.
- **"ghelim" problem**: Currently "gh" produces ಗ್ಹ (g+halant+h conjunct) which is not ideal. Need a smarter parsing rule.

## Full character mapping

### Vowels
| Kannada | Latin |
|---------|-------|
| ಅ | a |
| ಆ | aa |
| ಇ | i |
| ಈ | ii |
| ಉ | u |
| ಊ | uu |
| ಋ | r |
| ಎ | e |
| ಏ | ee |
| ಐ | ai |
| ಒ | o |
| ಓ | oo |
| ಔ | au |
| ಅಂ | am |
| ಅ: | ah |

### Consonants
| Kannada | Latin | Notes |
|---------|-------|-------|
| ಕ | ka | |
| ಖ | kha | |
| ಗ | ga | |
| ಘ | ggha | Remapped from "gha" to free "gh" |
| ಙ | ngna/gna | |
| ಚ | cha | |
| ಛ | chha | |
| ಜ | ja | |
| ಝ | jha/za | "z" added for Konkani |
| ಞ | jna/nya | |
| ಟ | ta | Retroflex — note: NOT dental |
| ಠ | tta | |
| ಡ | dda | |
| ಢ | ddha | |
| ಣ | nna | |
| ತ | tha | Dental — note: uses "th" |
| ಥ | thha | |
| ದ | da | |
| ಧ | dha | May need remapping like gh |
| ನ | na | |
| ಪ | pa | |
| ಫ | pha | May need remapping |
| ಬ | ba | |
| ಭ | bha | May need remapping |
| ಮ | ma | |
| ಯ | ya | |
| ರ | ra | |
| ಲ | la | |
| ವ | va | |
| ಷ | shha/sha | |
| ಸ | sa | |
| ಹ | ha | |
| ಳ | lla | |

### Vowel signs (matras)
Used when a vowel follows a consonant in a syllable:
| Vowel | Sign | Example |
|-------|------|---------|
| a | (inherent, no sign) | ka → ಕ |
| aa | ಾ | kaa → ಕಾ |
| i | ಿ | ki → ಕಿ |
| ii | ೀ | kii → ಕೀ |
| u | ು | ku → ಕು |
| uu | ೂ | kuu → ಕೂ |
| e | ೆ | ke → ಕೆ |
| ee | ೇ | kee → ಕೇ |
| ai | ೈ | kai → ಕೈ |
| o | ೊ | ko → ಕೊ |
| oo | ೋ | koo → ಕೋ |
| au | ೌ | kau → ಕೌ |

## Test cases (verified by native speaker)

### Should work correctly:
| Latin | Expected Kannada | Meaning |
|-------|-----------------|---------|
| haanv | ಹಾಂವ್ | I / me |
| karunk | ಕರುಂಕ್ | to do |
| borem | ಬೊರೆಂ | good (neuter) |
| deev | ದೇವ್ | God |
| diis | ದೀಸ್ | day |
| mhann | ಮ್ಹಣ್ | say |
| udak | ಉದಕ್ | water |
| jevan | ಜೆವನ್ | food/meal |
| aang | ಆಂಗ್ | body |
| aamchem | ಆಮ್ಚೆಂ | ours |
| kaso asai | ಕಸೊ ಅಸೈ | how are you |
| boro dis | ಬೊರೊ ದಿಸ್ | good day |

### Known failures needing fixes:
| Latin | Currently produces | Should produce | Issue |
|-------|-------------------|----------------|-------|
| thum | ✅ ತುಂ | ತುಂ | Works with "th" |
| tum | ❌ ಟುಂ | ತುಂ | User types "t" expecting ತ |
| ghelim | ❌ ಗ್ಹೆಲಿಂ | ಗೆಲಿಂ | "gh" produces conjunct |
| mankod | ❌ ಮನ್ಕೊದ್ | ಮಂಕೊಡ್ | Anusvara + retroflex issues |

## Architecture notes

### How the Latin→Kannada engine works:
1. Parse input left-to-right with greedy matching (longest consonant root first)
2. Consonant roots are derived by stripping trailing "a" from chart mappings (e.g., "ka" → root "k")
3. After matching a consonant root, look for a following vowel to form a syllable
4. If no vowel follows, add halant (್) to suppress inherent vowel
5. Post-process: apply anusvara rules (n-before-consonant, m-at-word-end)

### How the Kannada→Latin engine works:
1. Parse Kannada left-to-right matching full characters
2. Handle anusvara (ಂ) → "m", visarga (ಃ) → "h", halant (್) → skip
3. Handle vowel signs (matras) by replacing trailing "a" with the vowel

## Design specs
- Monospace typography (Courier New)
- Dark mode: #0a0a0f bg, gold accent (#f4c430, #daa520, #b8860b)
- Light mode: #faf8f2 bg, darker gold (#7a5506, #6b4a05, #5c3f04)
- All text colors pass WCAG AA
- Subtle grid background pattern
- Footer: "Based on Sudhaarit · Kanara (Kannada) Konkani Phonetic System · Mangalorean Catholic Dialect"

## What needs to happen next
1. **Collect user feedback** via the Test & Feedback tab — publish and share with Konkani speakers
2. **Resolve the "h as separator" question** — which consonants (dh, bh, ph, etc.) need remapping like gh→ggha
3. **Fix the "gh" parsing** — when "gh" appears before a vowel, it should produce ಗ + vowel sign, not ಗ್ಹ + vowel sign
4. **Consider swapping t/d defaults** — many users will instinctively type "t" for ತ (dental), not "th". Could offer a "casual mode" vs "strict Sudhaarit mode"
5. **Persist feedback data** — currently in-memory only, could use localStorage or a backend
6. **Add more test words** based on community input
7. **Handle conjunct consonants** (e.g., "ntr", "nk", "str") more intelligently
8. **Consider adding "mh" as a recognized cluster** — common in Konkani (mhann, mhaka, etc.)

## Source material
- Sudhaarit chart from CHANDREM.pdf (Chandrem Monthly publication)
- Contact: chandremmonthly@gmail.com, 9483868390
- For free copies, register WhatsApp with 9741540085
