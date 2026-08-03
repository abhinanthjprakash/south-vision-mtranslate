/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — ISFOC Conversion Engine
 *
 * Converts Unicode Malayalam ↔ ISFOC (FML/ML) encoding
 * Based on the proven algorithm from manglish.online
 *
 * ISFOC encoding rules:
 * - Each Malayalam character maps to 1-2 ASCII/Latin-1 characters
 * - Pre-base vowel signs (െ, േ, ്ര) go BEFORE their consonant in ASCII output
 * - Two-part vowel signs (ോ, ൊ, ൌ) split around their consonant
 * - AI sign (ൈ) and YA-vowel combos use special two-part placement
 * - Repha (്ര) triggers reordering of subsequent vowel signs
 * - All FML/ML-TT fonts share this same encoding
 */

const Converter = {

    /**
     * Convert Unicode Malayalam to ISFOC/FML encoding
     * Uses the same proven algorithm as manglish.online
     *
     * @param {string} unicodeText - Malayalam text in Unicode
     * @returns {string} ISFOC-encoded text (FML/ML compatible)
     */
    unicodeToISFOC(unicodeText) {
        if (!unicodeText) return '';

        let ascii_text = '';
        let bRepham = 0;  // Tracks whether ര്‍ (repha) has been processed
        let index = 0;

        while (index < unicodeText.length) {
            let matched = false;

            // Try longest match first (3 chars → 1 char)
            for (let lenChar = 3; lenChar > 0; lenChar--) {
                const chUnicode = unicodeText.substring(index, index + lenChar);
                const chAscii = UNICODE_TO_ISFOC[chUnicode];

                if (chAscii) {
                    // === Handle special multi-character placements ===

                    if (chUnicode === 'ൈ') {
                        // AI vowel sign (ss): insert BEFORE the last consonant
                        if (bRepham === 1) {
                            bRepham = 0;
                            // Remove last 2 chars, insert ss + those 2 chars
                            ascii_text = ascii_text.substring(0, ascii_text.length - 2)
                                + chAscii + ascii_text[ascii_text.length - 2]
                                + ascii_text[ascii_text.length - 1];
                        } else {
                            ascii_text = ascii_text.substring(0, ascii_text.length - 1)
                                + chAscii + ascii_text[ascii_text.length - 1];
                        }

                    } else if (chUnicode === 'ോ' || chUnicode === 'ൊ' || chUnicode === 'ൌ') {
                        // Two-part vowel signs: split around the consonant
                        // "sm" → s before, m after; "tm" → t before, m after; "su" → s before, u after
                        if (bRepham === 1) {
                            bRepham = 0;
                            ascii_text = ascii_text.substring(0, ascii_text.length - 2)
                                + chAscii[0]
                                + ascii_text[ascii_text.length - 2]
                                + ascii_text[ascii_text.length - 1]
                                + chAscii[1];
                        } else {
                            ascii_text = ascii_text.substring(0, ascii_text.length - 1)
                                + chAscii[0]
                                + ascii_text[ascii_text.length - 1]
                                + chAscii[1];
                        }

                    } else if (chUnicode === '്യേ' || chUnicode === '്യെ') {
                        // YA+E/EE combos: two-part placement
                        bRepham = 0;
                        ascii_text = ascii_text.substring(0, ascii_text.length - 1)
                            + chAscii[0]
                            + ascii_text[ascii_text.length - 1]
                            + chAscii[1];

                    } else if (chUnicode === 'െ' || chUnicode === 'േ' || chUnicode === '്ര') {
                        // Pre-base signs: insert BEFORE the last character
                        if (bRepham === 1) {
                            ascii_text = ascii_text.substring(0, ascii_text.length - 2)
                                + chAscii[0]
                                + ascii_text[ascii_text.length - 2]
                                + ascii_text[ascii_text.length - 1];
                            bRepham = 0;
                        } else {
                            ascii_text = ascii_text.substring(0, ascii_text.length - 1)
                                + chAscii[0]
                                + ascii_text[ascii_text.length - 1];
                        }
                        // Set repha flag
                        if (chUnicode === '്ര') {
                            bRepham = 1;
                        }

                    } else {
                        // Normal character: just append
                        bRepham = 0;
                        ascii_text = ascii_text + chAscii;
                    }

                    index += lenChar;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // Pass through unmapped characters (spaces, punctuation, etc.)
                ascii_text += unicodeText[index];
                index++;
                bRepham = 0;
            }
        }

        return ascii_text;
    },

    /**
     * Convert ISFOC/FML encoded text back to Unicode Malayalam
     * Reverses the multi-character ISFOC sequences
     *
     * @param {string} isfocText - ISFOC-encoded text
     * @returns {string} Unicode Malayalam text
     */
    isfocToUnicode(isfocText) {
        if (!isfocText) return '';

        let result = '';
        let i = 0;

        while (i < isfocText.length) {
            let matched = false;

            // Try matching multi-character ISFOC sequences first (up to 3 chars)
            for (let len = 3; len >= 1; len--) {
                if (i + len <= isfocText.length) {
                    const chunk = isfocText.substring(i, i + len);
                    if (ISFOC_SEQUENCE_TO_UNICODE[chunk]) {
                        result += ISFOC_SEQUENCE_TO_UNICODE[chunk];
                        i += len;
                        matched = true;
                        break;
                    }
                }
            }

            if (!matched) {
                const char = isfocText[i];
                if (ISFOC_TO_UNICODE[char]) {
                    result += ISFOC_TO_UNICODE[char];
                } else {
                    result += char;  // Pass through unmapped
                }
                i++;
            }
        }

        return result;
    },

    /**
     * Auto-detect and convert from ISFOC/FML/ML to Unicode
     * @param {string} text - Input text
     * @returns {object} { text, detected }
     */
    autoConvertToUnicode(text) {
        if (!text) return { text: '', detected: 'unicode' };

        // If already contains Malayalam Unicode, return as-is
        if (/[ഀ-ൿ]/.test(text)) {
            return { text: text, detected: 'unicode' };
        }

        // Check if it looks like ISFOC-encoded text
        let matchCount = 0;
        let totalCount = 0;
        for (let i = 0; i < Math.min(text.length, 200); i++) {
            const code = text.charCodeAt(i);
            if (code >= 32 && code <= 255) {
                totalCount++;
                if (ISFOC_TO_UNICODE[text[i]]) matchCount++;
            }
        }

        if (totalCount > 0 && matchCount / totalCount > 0.05) {
            return { text: this.isfocToUnicode(text), detected: 'isfoc' };
        }

        return { text: text, detected: 'unicode' };
    },

    // Keep backward compatibility aliases
    unicodeToFML(text) { return this.unicodeToISFOC(text); },
    unicodeToML(text) { return this.unicodeToISFOC(text); },
    fmlToUnicode(text) { return this.isfocToUnicode(text); },
    mlToUnicode(text) { return this.isfocToUnicode(text); },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Converter;
}
