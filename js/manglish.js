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

    // Word dictionary — common words whose spelling doesn't follow letter-by-letter rules.
    // Lowercase keys only; checked before character-by-character conversion.
    _dictionary: {
        // Long vowels spelled with single letters
        'malayalam': 'മലയാളം',
        'malayalathil': 'മലയാളത്തിൽ',
        'malayalikal': 'മലയാളികൾ',
        'keralam': 'കേരളം',
        'keralathil': 'കേരളത്തിൽ',
        'keralathinte': 'കേരളത്തിന്റെ',
        'tamizh': 'തമിഴ്',
        'tamil': 'തമിഴ്',
        'manushyan': 'മനുഷ്യൻ',
        'manushyar': 'മനുഷ്യർ',
        'marichu': 'മരിച്ചു',
        'hello': 'ഹലോ', 'are': 'ആർ', 'you': 'യു',
        // Common consonant-cluster words
        'buddhi': 'ബുദ്ധി',
        'yuddham': 'യുദ്ധം',
        'shuddham': 'ശുദ്ധം',
        'buddhiman': 'ബുദ്ധിമാൻ',
        'madhyamam': 'മധ്യമം',
        'mandhabudhi': 'മന്ദബുദ്ധಿ',
        'mandatharam': 'മണ്ടത്തരം',
        'kandahar': 'കാണ്ഡഹാർ',
        'kanddirunno': 'കണ്ടിരുന്നോ',
        'kadinam': 'കഠിനം',
        // Place/person names
        'thiruvananthapuram': 'തിരുവനന്തപുരം',
        'kozhikode': 'കോഴിക്കോട്',
        'kochi': 'കൊച്ചി',
        'ernakulam': 'എറണാകുളം',
        'thrissur': 'തൃശൂർ',
        'kollam': 'കൊല്ലം',
        'kannur': 'കണ്ണൂർ',
        'palakkad': 'പാലക്കാട്',
        'alappuzha': 'ആലപ്പുഴ',
        'kottayam': 'കോട്ടയം',
        'idukki': 'ഇടുക്കി',
        'pathanamthitta': 'പത്തനംതിട്ട',
        'wayanad': 'വയനാട്',
        'kasaragod': 'കാസർഗോഡ്',
        // Everyday words
        'poyo': 'പോയോ',
        'varunnu': 'വരുന്നു',
        'paranju': 'പറഞ്ഞു',
        'cheythu': 'ചെയ്തു',
        'kittiyo': 'കിട്ടിയോ',
        'ariyilla': 'അറിയില്ല',
        'ariyam': 'അറിയാം',
        'venam': 'വേണം',
        'venda': 'വേണ്ട',
        'ille': 'ഇല്ല',
        'undu': 'ഉണ്ട്',
        'undayirunnu': 'ഉണ്ടായിരുന്നു',
        'enikku': 'എനിക്ക്',
        'ninakku': 'നിനക്ക്',
        'avalkku': 'അവൾക്ക്',
        'nammal': 'നമ്മൾ',
        'nammude': 'നമ്മുടെ',
        'ennodu': 'എന്നോട്',
        'ninne': 'നിന്നെ',
        'avan': 'അവൻ',
        'aval': 'അവൾ',
        'avar': 'അവർ',
        'athu': 'അത്',
        'ithu': 'ഇത്',
        'ethu': 'ഏത്',
        'evide': 'എവിടെ',
        'ivide': 'ഇവിടെ',
        'avide': 'അവിടെ',
        'ennu': 'എന്ന്',
        'innu': 'ഇന്ന്',
        'naley': 'നാളെ',
        'innale': 'ഇന്നലെ',
        'pakshe': 'പക്ഷേ',
        'ennal': 'എന്നാൽ',
        'athukondu': 'അതുകൊണ്ട്',
        'ennalum': 'എന്നാലും',
        'karanam': 'കാരണം',
        'sahayam': 'സഹായം',
        'santhosham': 'സന്തോഷം',
        'nanni': 'നന്ദി',
        'nannayi': 'നന്നായി',
        'swagatham': 'സ്വാഗതം',
        'subharathri': 'ശുഭരാത്രി',
        'shubhadinam': 'ശുഭദിനം',
        'ente': 'എന്റെ',
        'ninte': 'നിന്റെ',
        'avante': 'അവന്റെ',
        'avalude': 'അവളുടെ',
        'pattilla': 'പറ്റില്ല',
        'cheyyan': 'ചെയ്യാൻ',
        'cheyyam': 'ചെയ്യാം',
        'cheyyunnu': 'ചെയ്യുന്നു',
        'parayunnu': 'പറയുന്നു',
        'parayam': 'പറയാം',
        'irikku': 'ഇരിക്ക്',
        'irunnu': 'ഇരുന്നു',
        'kittum': 'കിട്ടും',
        'kandu': 'കണ്ടു',
        'kando': 'കണ്ടോ',
        'kandilla': 'കണ്ടില്ല',
        'kettu': 'കേട്ടു',
        'ketto': 'കേട്ടോ',
        'nokku': 'നോക്ക്',
        'vannu': 'വന്നു',
        'vanno': 'വന്നോ',
        'poi': 'പോയി',
        'eduthu': 'എടുത്തു',
        'thinnu': 'തിന്നു',
        'kudichu': 'കുടിച്ചു',
        'urakkam': 'ഉറക്കം',
        'kazhinju': 'കഴിഞ്ഞു',
        'theernnu': 'തീർന്നു',
        'mathi': 'മതി',
        'valare': 'വളരെ',
        'alpam': 'അൽപം',
        'kurachu': 'കുറച്ച്',
        'ellam': 'എല്ലാം',
        'pinne': 'പിന്നെ',
        'pinneyum': 'പിന്നെയും',
        'nallathu': 'നല്ലത്',
        'mosham': 'മോശം',
        'puthiya': 'പുതിയ',
        'pazhaya': 'പഴയ',
        'cheriya': 'ചെറിയ',
        'valiya': 'വലിയ',
        'nalla': 'നല്ല',
        'enthu': 'എന്ത്',
        'enthina': 'എന്തിനാ',
        'enthukondu': 'എന്തുകൊണ്ട്',
        'engane': 'എങ്ങനെ',
        'ethra': 'എത്ര',
        'aaranu': 'ആരാണ്',
        'aarkku': 'ആർക്ക്',
        'randu': 'രണ്ട്',
        'moonu': 'മൂന്ന്',
        'naalu': 'നാല്',
        'anchu': 'അഞ്ച്',
        'aaru': 'ആറ്',
        'ezhu': 'ഏഴ്',
        'ettu': 'എട്ട്',
        'onpathu': 'ഒൻപത്',
        'pathu': 'പത്ത്',
    },

    // Consonant map — what to emit for each consonant letter (with inherent 'a')
    // Uses English-phonetic convention: single & 'h'-variants both produce dental
    // ('t'/'th' → ത, 'd'/'dh' → ദ), double letters produce retroflex ('tt' → ട, 'dd' → ഡ)
    _consonantMap: {
        'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
        'ch': 'ച', 'chh': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'nj': 'ഞ',
        't': 'ത', 'tt': 'ട', 'th': 'ത', 'thh': 'ഥ',
        'd': 'ദ', 'dd': 'ഡ', 'dh': 'ദ', 'dhh': 'ധ',
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
        'au': 'ഔ', 'ow': 'ഔ',
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
        'au': 'ൌ', 'ow': 'ൌ',
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
        'nmm': 'ണ്മ',
        'ttt': 'ട്ട',
        'nnn': 'ന്ന',
        'mm': 'മ്മ', 'mp': 'മ്പ',
        'yy': 'യ്യ',
        'll': 'ല്ല', 'lll': 'ള്ള',
        'vv': 'വ്വ',
        'ssh': 'ശ്ശ', 'sss': 'ഷ്ശ',
        'sth': 'സ്ഥ', 'sthr': 'സ്ത്ര', 'thr': 'ത്ര',
        'kr': 'ക്ര', 'gr': 'ഗ്ര', 'pr': 'പ്ര', 'tr': 'ത്ര', 'sr': 'സ്ര', 'br': 'ബ്ര',
        'nma': 'ന്മ',
        'zh': 'ഴ',
    },

    /**
     * Convert Manglish text to Malayalam Unicode
     * @param {string} input - English text in Manglish
     * @returns {string} - Unicode Malayalam
     */
    toUnicode(input, options = {}) {
        if (!input) return '';

        const final = options.final !== false; // default true (add word-final chandrakkala)

        const words = input.split(/(\s+|[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_])/);
        let result = '';

        for (const word of words) {
            if (!word || /^\s+$/.test(word) || /^[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_]+$/.test(word)) {
                result += word;
                continue;
            }
            result += this._processWord(word, final);
        }

        return result;
    },

    /**
     * Process a single word in Manglish
     * @private
     */
    _processWord(word, final = true) {
        if (!/[a-zA-Z]/.test(word)) return word;

        // Check dictionary first for common words with non-obvious spellings
        const lowerKey = word.toLowerCase();
        if (this._dictionary[lowerKey]) {
            // Run through cleanup to ensure atomic chillus etc.
            return this._cleanup(this._dictionary[lowerKey]);
        }

        // Handle digits (Malayalam numerals)
        if (/^\d+$/.test(word)) {
            return word.replace(/\d/g, d => '൦൧൨൩൪൫൬൭൮൯'[parseInt(d)] || d);
        }

        const lower = lowerKey;
        let result = '';
        let i = 0;
        let endsWithBareConsonant = false; // true when last output is a consonant with no vowel

        while (i < lower.length) {
            let matched = false;

            // --- TRY LONGEST MATCH FIRST ---

            // Special multi-consonant conjunct patterns (check up to 5 chars ahead)
            for (let len = 5; len >= 2; len--) {
                if (i + len <= lower.length) {
                    const chunk = lower.substring(i, i + len);
                    if (this._conjunctOverrides[chunk]) {
                        // For 2-char overrides (e.g. "nd"→ണ്ട, "nt"→ന്റ):
                        // if another consonant follows immediately, skip the override.
                        // e.g. "ndh" → let n+d form naturally (ന്ദ), then dh→ദ
                        //      "nda" → use override (ണ്ട) since a vowel follows
                        if (len === 2 && i + len < lower.length) {
                            const nextChar = lower[i + len];
                            if (this._isConsonantStart(lower, i + len) &&
                                !this._vowelChars.has(nextChar)) {
                                // Consonant follows — skip override, form naturally
                                // (don't set matched, fall through to consonant-by-consonant)
                            } else {
                                // Vowel or word-end follows — use override
                                result += this._conjunctOverrides[chunk];
                                i += len;
                                matched = true;
                                endsWithBareConsonant = false;
                                break;
                            }
                        } else {
                            // Longer overrides (len>=3) or word-end: always apply
                            result += this._conjunctOverrides[chunk];
                            i += len;
                            matched = true;
                            endsWithBareConsonant = false;
                            break;
                        }
                    }
                }
            }
            if (matched) {
                // After conjunct match (came from the non-skip path), check for vowel sign
                if (i < lower.length) {
                    for (let mlen = 3; mlen >= 1; mlen--) {
                        if (i + mlen <= lower.length) {
                            const mChunk = lower.substring(i, i + mlen).toLowerCase();
                            if (this._matraMap[mChunk] !== undefined) {
                                if (mlen >= 2) {
                                    const lastChar = i + mlen - 1;
                                    if (this._isConsonantStart(lower, lastChar) &&
                                        (i + mlen < lower.length)) {
                                        continue;
                                    }
                                }
                                result += this._matraMap[mChunk];
                                i += mlen;
                                break;
                            }
                        }
                    }
                }
                continue;
            }

            // Independent vowel (at word start or after a non-consonant).
            // Only match if the chunk does NOT start with a potential consonant letter
            // (prevents "ru" from matching as independent vowel ഋ instead of r+u).
            for (let len = 2; len >= 1; len--) {
                if (i + len <= lower.length) {
                    const chunk = lower.substring(i, i + len);
                    const isWordStart = (result.length === 0);
                    const lastCharIsNotConsonant = result.length === 0 ||
                        !this._isConsonant(result[result.length - 1]);

                    if (this._independentVowels[chunk] && (isWordStart || lastCharIsNotConsonant)) {
                        // Don't consume "ru", "ra", "ri" etc as independent vowels —
                        // those start with consonant letters and should be consonant+vowel instead
                        if (len === 1 || !this._isConsonantStart(lower, i)) {
                            result += this._independentVowels[chunk];
                            i += len;
                            matched = true;
                            endsWithBareConsonant = false;
                            break;
                        }
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
                        let matraFound = false;

                        if (i < lower.length) {
                            // Try to match vowel sign (longest first)
                            for (let mlen = 3; mlen >= 1; mlen--) {
                                if (i + mlen <= lower.length) {
                                    const mChunk = lower.substring(i, i + mlen).toLowerCase();
                                    if (this._matraMap[mChunk] !== undefined) {
                                        // If a multi-char matra consumes a character that could
                                        // start a consonant AND there's more text after it, prefer
                                        // the shorter matra (e.g. "am" → "a"+consonant, not anusvara).
                                        // If this is the end of the word, "am" → "ം" is correct.
                                        if (mlen >= 2) {
                                            const lastCharOfMatch = i + mlen - 1;
                                            const couldBeConsonant = this._isConsonantStart(lower, lastCharOfMatch);
                                            const hasTextAfter = (i + mlen < lower.length);
                                            if (couldBeConsonant && hasTextAfter) {
                                                continue; // skip, try shorter match
                                            }
                                        }
                                        matra = this._matraMap[mChunk];
                                        matraFound = true;
                                        i += mlen;
                                        break;
                                    }
                                }
                            }

                            // If NO matra was found and next char starts a consonant,
                            // insert chandrakkala to form a conjunct
                            if (!matraFound && i < lower.length && this._isConsonantStart(lower, i) &&
                                !this._vowelChars.has(lower[i])) {
                                matra = '്';
                            }
                        }

                        result += consonant + matra;

                        if (!matraFound && matra !== '്') {
                            // No matra, no chandrakkala inserted → bare consonant at word end
                            endsWithBareConsonant = true;
                        } else {
                            endsWithBareConsonant = false;
                        }

                        matched = true;
                        break;
                    }
                }
            }
            if (matched) continue;

            // Single-character fallback
            const single = lower[i];
            if (this._independentVowels[single] && result.length === 0) {
                result += this._independentVowels[single];
                i++;
                endsWithBareConsonant = false;
            } else if (this._matraMap[single] !== undefined && result.length > 0) {
                result += this._matraMap[single];
                i++;
                endsWithBareConsonant = false;
            } else {
                // Pass through unmatched characters
                result += word[i];
                i++;
            }
        }

        // Handle word-final consonant — add chandrakkala only if the last
        // consonant wasn't followed by a vowel (inherent or explicit).
        // Skip during real-time typing (final=false).
        // Skip for single-char results (user just typed one letter).
        if (final && endsWithBareConsonant && result.length > 0 &&
            result.length > 1 &&
            this._isConsonant(result[result.length - 1])) {
            result += '്';
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

        // Fix: remove chandrakkala before vowel signs (chandrakkala should not precede matras)
        text = text.replace(/്([ാ-ൌ])/g, '$1');

        // Convert consonant+chandrakkala → atomic chillu at word boundaries.
        // This ensures correct rendering on all fonts (some fonts show ന+് as ന്
        // instead of the fused chillu ൻ).
        // Only at end-of-string or before whitespace — NOT before consonants
        // (where the chandrakkala forms a legitimate conjunct like ന്ത).
        text = text.replace(/ണ്(?=$|\s|[.,!?;:'")\]}\-])/g, 'ൺ');
        text = text.replace(/ന്(?=$|\s|[.,!?;:'")\]}\-])/g, 'ൻ');
        text = text.replace(/ര്(?=$|\s|[.,!?;:'")\]}\-])/g, 'ർ');
        text = text.replace(/ല്(?=$|\s|[.,!?;:'")\]}\-])/g, 'ൽ');
        text = text.replace(/ള്(?=$|\s|[.,!?;:'")\]}\-])/g, 'ൾ');
        // Also remove redundant chandrakkala from pre-existing atomic chillus
        text = text.replace(/ൻ്/g, 'ൻ');
        text = text.replace(/ർ്/g, 'ർ');
        text = text.replace(/ൽ്/g, 'ൽ');
        text = text.replace(/ൾ്/g, 'ൾ');
        text = text.replace(/ൺ്/g, 'ൺ');
        text = text.replace(/ൿ്/g, 'ൿ');

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
