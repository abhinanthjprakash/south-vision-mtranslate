/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — Manglish Transliteration Engine
 * Converts English phonetic typing (Manglish) to Malayalam Unicode
 *
 * How Manglish works:
 * - Each consonant inherently carries the vowel 'a' (e.g., "ka" → ക)
 * - Vowel signs (matras) modify the inherent vowel of the preceding consonant
 * - Consecutive consonants form conjuncts using chandrakkala
 * - At word start or after a space, vowels use their independent forms
 */

const Manglish = {

    // Character type classification
    _vowelChars: new Set(['a', 'e', 'i', 'o', 'u']),

    // Consonant map — what to emit for each consonant letter (with inherent 'a')
    _consonantMap: {
        'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
        'ch': 'ച', 'chh': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'nj': 'ഞ',
        't': 'റ', 'tt': 'ട', 'th': 'ത', 'thh': 'ഥ',
        'd': 'ഡ', 'dd': 'ഢ', 'dh': 'ധ', 'dhh': 'ഢ',
        'n': 'ന', 'nn': 'ണ',
        'p': 'പ', 'ph': 'ഫ', 'f': 'ഫ',
        'b': 'ബ', 'bh': 'ഭ',
        'm': 'മ',
        'y': 'യ',
        'r': 'ര', 'rr': 'റ',
        'l': 'ല', 'll': 'ള',
        'zh': 'ഴ',
        'v': 'വ', 'w': 'വ',
        'sh': 'ശ', 's': 'സ', 'ss': 'ഷ',
        'h': 'ഹ',
    },

    // Independent vowel map (used at word start or after a vowel)
    _independentVowels: {
        'a': 'അ', 'aa': 'ആ',
        'i': 'ഇ', 'ee': 'ഈ',
        'u': 'ഉ', 'oo': 'ഊ',
        'ru': 'ഋ',
        'e': 'എ', 'ae': 'ഏ',
        'ai': 'ഐ',
        'o': 'ഒ', 'oa': 'ഓ',
        'au': 'ഔ',
    },

    // Vowel sign / matra map (used after a consonant)
    _matraMap: {
        '': '',        // inherent 'a' — no matra needed
        'a': '',       // inherent 'a' — no matra needed
        'aa': 'ാ',
        'i': 'ി',
        'ee': 'ീ',
        'u': 'ു',
        'oo': 'ൂ',
        'ru': 'ൃ',
        'e': 'െ',
        'ae': 'േ',
        'ai': 'ൈ',
        'o': 'ൊ',
        'oa': 'ോ',
        'au': 'ൌ',
        'au_length': 'ൗ',
        'am': 'ം',
        'ah': 'ഃ',
        '~': '്',  // Explicit chandrakkala
    },

    // Special conjunct overrides (consonant sequences that form specific conjuncts)
    _conjunctOverrides: {
        'kk': 'ക്ക', 'ksh': 'ക്ഷ', 'ngk': 'ങ്ക',
        'nch': 'ഞ്ച', 'nj': 'ഞ്ഞ',
        'nt': 'ന്റ', 'nth': 'ന്ത', 'nthh': 'ന്ഥ',
        'nd': 'ണ്ട', 'ndd': 'ണ്ഡ',
        'nnn': 'ണ്ണ', 'nmm': 'ണ്മ',
        'ttt': 'ട്ട',
        'nth': 'ന്ത',
        'nnn': 'ന്ന',
        'mm': 'മ്മ', 'mp': 'മ്പ',
        'yy': 'യ്യ',
        'll': 'ല്ല', 'lll': 'ള്ള',
        'vv': 'വ്വ',
        'ssh': 'ശ്ശ', 'sss': 'ഷ്ശ',
        'sth': 'സ്ഥ',
        'kr': 'ക്ര', 'gr': 'ഗ്ര', 'pr': 'പ്ര', 'tr': 'ത്ര', 'sr': 'സ്ര', 'br': 'ബ്ര',
        'nma': 'ന്മ',
        'zh': 'ഴ',
    },

    /**
     * Convert Manglish text to Malayalam Unicode
     * @param {string} input - English text in Manglish
     * @returns {string} - Unicode Malayalam
     */
    toUnicode(input) {
        if (!input) return '';

        const words = input.split(/(\s+|[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_])/);
        let result = '';

        for (const word of words) {
            if (!word || /^\s+$/.test(word) || /^[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_]+$/.test(word)) {
                result += word;
                continue;
            }
            result += this._processWord(word);
        }

        return result;
    },

    /**
     * Process a single word in Manglish
     * @private
     */
    _processWord(word) {
        if (!/[a-zA-Z]/.test(word)) return word;

        // Handle digits (Malayalam numerals)
        if (/^\d+$/.test(word)) {
            return word.replace(/\d/g, d => '൦൧൨൩൪൫൬൭൮൯'[parseInt(d)] || d);
        }

        const lower = word.toLowerCase();
        let result = '';
        let i = 0;

        while (i < lower.length) {
            // Check for independent vowel at word start or after a previous vowel/space
            let matched = false;

            // --- TRY LONGEST MATCH FIRST ---

            // Special multi-consonant conjunct patterns (check up to 5 chars ahead)
            for (let len = 5; len >= 2; len--) {
                if (i + len <= lower.length) {
                    const chunk = lower.substring(i, i + len);
                    if (this._conjunctOverrides[chunk]) {
                        // If this is the first thing in result, or last char was a consonant with inherent 'a',
                        // replace the inherent vowel before adding the conjunct
                        result += this._conjunctOverrides[chunk];
                        i += len;
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) continue;

            // Independent vowel (at word start or after non-consonant in result)
            for (let len = 2; len >= 1; len--) {
                if (i + len <= lower.length) {
                    const chunk = lower.substring(i, i + len);
                    const isWordStart = (result.length === 0);
                    const lastCharIsNotMalayalamConsonant = result.length === 0 ||
                        !this._isConsonant(result[result.length - 1]);

                    if (this._independentVowels[chunk] && (isWordStart || lastCharIsNotMalayalamConsonant)) {
                        result += this._independentVowels[chunk];
                        i += len;
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) continue;

            // Consonant + possible vowel sign
            for (let clen = 3; clen >= 1; clen--) {
                if (i + clen <= lower.length) {
                    const cChunk = lower.substring(i, i + clen);
                    if (this._consonantMap[cChunk]) {
                        const consonant = this._consonantMap[cChunk];
                        i += clen;

                        // Look for vowel sign after consonant
                        let matra = '';
                        if (i < lower.length) {
                            // Try to match vowel sign (longest first)
                            for (let mlen = 3; mlen >= 1; mlen--) {
                                if (i + mlen <= lower.length) {
                                    const mChunk = lower.substring(i, i + mlen).toLowerCase();
                                    if (this._matraMap[mChunk] !== undefined) {
                                        matra = this._matraMap[mChunk];
                                        i += mlen;
                                        break;
                                    }
                                }
                            }

                            // If no explicit matra and next char is a consonant, add chandrakkala
                            if (matra === '' && i < lower.length && this._isConsonantStart(lower, i) &&
                                !this._vowelChars.has(lower[i])) {
                                matra = '്';
                            }
                        }

                        result += consonant + matra;
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) continue;

            // Single-character matches
            const single = lower[i];
            if (this._independentVowels[single] && result.length === 0) {
                result += this._independentVowels[single];
                i++;
            } else if (this._matraMap[single] !== undefined && result.length > 0) {
                result += this._matraMap[single];
                i++;
            } else {
                // Pass through unmatched
                result += word[i];
                i++;
            }
        }

        // Post-process: clean up duplicate chandrakkalas and fix common patterns
        return this._cleanup(result);
    },

    /**
     * Check if a character is a Malayalam consonant
     * @private
     */
    _isConsonant(char) {
        const code = char.charCodeAt(0);
        // Malayalam consonants are in range U+0D15 to U+0D39
        return code >= 0x0D15 && code <= 0x0D39;
    },

    /**
     * Check if position i in string starts a consonant
     * @private
     */
    _isConsonantStart(str, i) {
        if (i >= str.length) return false;
        const char = str[i].toLowerCase();
        return char in {k:1, g:1, c:1, j:1, t:1, d:1, n:1, p:1, b:1, m:1, y:1, r:1, l:1, v:1, s:1, h:1, f:1, w:1};
    },

    /**
     * Post-process cleanup
     * @private
     */
    _cleanup(text) {
        // Remove duplicate chandrakkalas
        text = text.replace(/്്+/g, '്');

        // Fix: remove chandrakkala before vowel signs
        text = text.replace(/്([ാ-ൌ])/g, '$1');

        // Common pattern fixes
        text = text.replace(/റ്റ്/g, 'റ്റ');
        text = text.replace(/ന്റ്/g, 'ന്റ');

        return text;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Manglish;
}
