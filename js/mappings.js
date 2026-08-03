/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — ISFOC Character Mapping Tables
 *
 * This is the C-DAC ISFOC encoding used by ALL FML and ML-TT Malayalam fonts.
 * Source: extracted from manglish.online's converter.js (Karthika/ISFOC map)
 * This single encoding works across ALL FML font families:
 *   FML-Sruthy, FML-Mohini, FML-Revathi, FML-Leela, FML-Nanditha,
 *   ML-TTKarthika, ML-TTRevathi, ML-TTAmbili, ML-TTNandini, etc.
 */

// =============================================================================
// UNICODE → ISFOC (FML/ML) MAPPING
// =============================================================================
// Maps Unicode Malayalam characters to ISFOC ASCII encoding
// Single-char values are ASCII characters
// Multi-char values are sequences that get reordered by the conversion algorithm
// =============================================================================

const UNICODE_TO_ISFOC = {
    // --- Signs ---
    'ം': 'w',
    'ഃ': 'x',

    // --- Independent Vowels ---
    'അ': 'A',
    'ആ': 'B',
    'ഇ': 'C',
    'ഈ': 'Cu',
    'ഉ': 'D',
    'ഊ': 'Du',
    'ഋ': 'E',
    'ഌ': 'p',
    'എ': 'F',
    'ഏ': 'G',
    'ഐ': 'sF',
    'ഒ': 'H',
    'ഓ': 'Hm',
    'ഔ': 'Hu',

    // --- Consonants ---
    'ക': 'I',
    'ഖ': 'J',
    'ഗ': 'K',
    'ഘ': 'L',
    'ങ': 'M',
    'ച': 'N',
    'ഛ': 'O',
    'ജ': 'P',
    'ഝ': 'Q',
    'ഞ': 'R',
    'ട': 'S',
    'ഠ': 'T',
    'ഡ': 'U',
    'ഢ': 'V',
    'ണ': 'W',
    'ത': 'X',
    'ഥ': 'Y',
    'ദ': 'Z',
    'ധ': '[',
    'ന': '\\',
    'പ': ']',
    'ഫ': '^',
    'ബ': '_',
    'ഭ': '`',
    'മ': 'a',
    'യ': 'b',
    'ര': 'c',
    'റ': 'd',
    'ല': 'e',
    'ള': 'f',
    'ഴ': 'g',
    'വ': 'h',
    'ശ': 'i',
    'ഷ': 'j',
    'സ': 'k',
    'ഹ': 'l',

    // --- Vowel Signs (Matras) ---
    'ാ': 'm',
    'ി': 'n',
    'ീ': 'o',
    'ു': 'p',
    'ൂ': 'q',
    'ൃ': 'r',
    'െ': 's',
    'േ': 't',
    'ൈ': 'ss',   // Multi-char: "ss"
    'ൊ': 'sm',   // Multi-char: "sm"
    'ോ': 'tm',   // Multi-char: "tm"
    'ൌ': 'su',   // Multi-char: "su"
    'ൗ': 'u',

    // --- Chandrakkala (Virama) ---
    '്': 'v',
    '്‌': 'v',

    // --- Special vowel+consonant combos ---
    '്യേ': 'ty',  // Multi-char
    '്യെ': 'sy',  // Multi-char

    // --- Conjuncts (Koottaksharangal) — Extended Latin range ---
    'ക്ക': '¡',   // ¡
    'ക്ല': '¢',   // ¢
    'ക്ഷ': '£',   // £
    'ഗ്ഗ': '¤',   // ¤
    'ഗ്ല': '¥',   // ¥
    'ങ്ക': '¦',   // ¦
    'ങ്ങ': '§',   // §
    'ച്ച': '¨',   // ¨
    'ഞ്ച': '©',   // ©
    'ഞ്ഞ': 'ª',   // ª
    'ട്ട': '«',   // «
    'ണ്‍': '¬',   // ¬
    'ണ്ട': 'ï',   // ï  (NOTE: different from chillu N)
    'ണ്ണ': '®',   // ®
    'ത്ത': '¯',   // ¯
    'ത്ഥ': '°',   // °
    'ദ്ദ': '±',   // ±
    'ദ്ധ': '²',   // ²
    'ന്‍': '³',   // ³
    'ൻ': '³',     // ³ (same as ന്‍)
    'ന്ത': '´',   // ´
    'ന്ദ': 'µ',   // µ
    'ന്ന': '¶',   // ¶
    'ന്മ': '·',   // ·
    'പ്പ': '¸',   // ¸
    'പ്ല': '¹',   // ¹
    'ബ്ബ': 'º',   // º
    'ബ്ല': '»',   // »
    'മ്പ': '¼',   // ¼
    'മ്മ': '½',   // ½
    'മ്ല': 'Ÿ',   // Ÿ
    'യ്യ': '¿',   // ¿
    'ർ‌': 'À',   // À
    'ർ‍': 'À',   // À
    'ർ': 'À',     // À
    'ര്‍': 'À',   // À
    'റ്റ': 'ä',   // ä
    'ല്‍': 'Â',   // Â
    'ൽ': 'Â',     // Â (same as ല്‍)
    'ല്ല': 'Ã',   // Ã
    'ള്‍': 'Ä',   // Ä
    'ൾ': 'Ä',     // Ä (same as ള്‍)
    'ള്ള': 'Å',   // Å
    'വ്വ': 'Æ',   // Æ
    'ശ്ല': 'Ç',   // Ç
    'ശ്ശ': 'È',   // È
    'സ്ല': 'É',   // É
    'സ്സ': 'Ê',   // Ê
    'ഹ്ല': 'Ë',   // Ë
    'സ്റ്റ': 'Ì', // Ì
    'ഡ്ഡ': 'Í',   // Í
    'ക്ട': 'Î',   // Î
    'ബ്ധ': 'Ï',   // Ï
    'ബ്ദ': 'Ð',   // Ð
    'ച്ഛ': 'Ñ',   // Ñ
    'ഹ്മ': 'Ò',   // Ò
    'ഹ്ന': 'Ó',   // Ó
    'ന്ധ': 'Ô',   // Ô
    'ത്സ': 'Õ',   // Õ
    'ജ്ജ': 'Ö',   // Ö
    'ണ്മ': '×',   // ×
    'സ്ഥ': 'Ø',   // Ø
    'ന്ഥ': 'Ù',   // Ù
    'ജ്ഞ': 'Ú',   // Ú
    'ത്ഭ': 'Û',   // Û
    'ഗ്മ': 'Ü',   // Ü
    'ശ്ച': 'Ý',   // Ý
    'ണ്ഡ': 'Þ',   // Þ
    'ത്മ': 'ß',   // ß
    'ക്ത': 'à',   // à
    'ഗ്ന': 'á',   // á
    'ന്റ': 'â',   // â
    'ഷ്ട': 'ã',   // ã

    // --- Chillus and special forms ---
    '്യ': 'y',
    '്വ': 'z',
    '്ര': '{',

    // --- Punctuation ---
    '-': 'þ',  // þ
};

// =============================================================================
// REVERSE MAPPING: ISFOC → UNICODE
// =============================================================================

const ISFOC_TO_UNICODE = {};
for (const [unicode, isfoc] of Object.entries(UNICODE_TO_ISFOC)) {
    // For single-char ISFOC codes only (skip multi-char sequences for reverse lookup)
    if (isfoc.length === 1) {
        if (!ISFOC_TO_UNICODE[isfoc]) {
            ISFOC_TO_UNICODE[isfoc] = unicode;
        }
    }
}

// Add multi-char entries manually (store the full ISFOC sequence as key)
const ISFOC_SEQUENCE_TO_UNICODE = {};
for (const [unicode, isfoc] of Object.entries(UNICODE_TO_ISFOC)) {
    ISFOC_SEQUENCE_TO_UNICODE[isfoc] = unicode;
}

// =============================================================================
// MANGlish (Phonetic) to Unicode Mapping
// =============================================================================

const MANGLISH_TO_UNICODE = {
    // Independent vowels (word-start)
    'a': 'അ', 'aa': 'ആ', 'i': 'ഇ', 'ee': 'ഈ', 'u': 'ഉ', 'oo': 'ഊ',
    'ru': 'ഋ', 'e': 'എ', 'ae': 'ഏ', 'ai': 'ഐ', 'o': 'ഒ', 'oa': 'ഓ', 'au': 'ഔ',

    // Consonants with inherent 'a'
    'ka': 'ക', 'kha': 'ഖ', 'ga': 'ഗ', 'gha': 'ഘ', 'nga': 'ങ',
    'cha': 'ച', 'chha': 'ഛ', 'ja': 'ജ', 'jha': 'ഝ', 'nja': 'ഞ',
    'ta': 'ട', 'tta': 'ഠ', 'da': 'ഡ', 'dda': 'ഢ', 'nna': 'ണ',
    'tha': 'ത', 'thha': 'ഥ', 'dha': 'ദ', 'dhha': 'ധ', 'na': 'ന',
    'pa': 'പ', 'pha': 'ഫ', 'ba': 'ബ', 'bha': 'ഭ', 'ma': 'മ',
    'ya': 'യ', 'ra': 'ര', 'rra': 'റ', 'la': 'ല', 'lla': 'ള',
    'zha': 'ഴ', 'va': 'വ', 'sha': 'ശ', 'ssa': 'ഷ', 'sa': 'സ', 'ha': 'ഹ',

    // Short consonant forms
    'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
    'ch': 'ച', 'chh': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'nj': 'ഞ',
    't': 'റ', 'th': 'ത', 'd': 'ഡ', 'dh': 'ധ',
    'n': 'ന', 'nn': 'ണ', 'p': 'പ', 'ph': 'ഫ', 'f': 'ഫ',
    'b': 'ബ', 'bh': 'ഭ', 'm': 'മ', 'y': 'യ', 'r': 'ര', 'rr': 'റ',
    'l': 'ല', 'll': 'ള', 'zh': 'ഴ', 'v': 'വ', 'w': 'വ',
    'sh': 'ശ', 's': 'സ', 'ss': 'ഷ', 'h': 'ഹ',

    // Digits
    '0': '൦', '1': '൧', '2': '൨', '3': '൩', '4': '൪',
    '5': '൫', '6': '൬', '7': '൭', '8': '൮', '9': '൯',
};

// =============================================================================
// Keyboard Layout Maps
// =============================================================================

const KEYBOARD_LAYOUTS = {
    inscript: {
        name: 'Inscript',
        normal: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
            ['Tab', 'ൌ', 'ൈ', 'ാ', 'ീ', 'ൂ', 'ൃ', 'ക', 'ഹ', 'ഗ', 'ജ', 'ഡ', 'ണ', '\\'],
            ['Caps', 'ോ', 'േ', '്', 'ി', 'ു', 'പ', 'ര', 'ക്', 'ത', 'ച', 'ട', '', 'Enter'],
            ['Shift', 'ആ', 'ോ', 'മ', 'ന', 'വ', 'ല', 'സ', ',', '.', 'യ', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ],
        shift: [
            ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'Bksp'],
            ['Tab', 'ഔ', 'ഐ', 'ആ', 'ഈ', 'ഊ', 'ഋ', 'ഖ', 'ങ', 'ഘ', 'ഝ', 'ഢ', 'ണ്', '\\'],
            ['Caps', 'ഓ', 'ഏ', 'അ', 'ഇ', 'ഉ', 'ഫ', 'റ', 'ര്', 'ഥ', 'ഛ', 'ഠ', '', 'Enter'],
            ['Shift', 'ഋ', '', 'ഭ', 'ധ', 'ഴ', 'ള', 'ഷ', '', '', 'ഞ', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ]
    },
    gist: {
        name: 'GIST',
        normal: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
            ['Tab', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ'],
            ['Caps', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'Enter'],
            ['Shift', 'യ', 'ര', 'റ', 'ല', 'ള', 'ഴ', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ]
    },
    typewriter: {
        name: 'Typewriter',
        normal: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
            ['Tab', 'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ'],
            ['Caps', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'Enter'],
            ['Shift', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ]
    },
    panchari: {
        name: 'Panchari',
        normal: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
            ['Tab', 'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ'],
            ['Caps', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'Enter'],
            ['Shift', 'ക്ഷ', 'ത്ര', 'ജ്ഞ', 'ശ്ര', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ]
    },
    varityper: {
        name: 'Varityper',
        normal: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
            ['Tab', 'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ'],
            ['Caps', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'Enter'],
            ['Shift', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ]
    },
    english: {
        name: 'English',
        normal: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
            ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
            ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
            ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
        ]
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UNICODE_TO_ISFOC, ISFOC_TO_UNICODE, ISFOC_SEQUENCE_TO_UNICODE,
        MANGLISH_TO_UNICODE, KEYBOARD_LAYOUTS
    };
}
