# SOUTH VISION M-Translate (FML-CONVERTER)

**Unicode ↔ FML ↔ ML Malayalam Converter**

A free, browser-based tool for converting between Unicode Malayalam and legacy font encodings (FML & ML). Built for designers, typographers, and anyone working with Malayalam text in Photoshop, Illustrator, Figma, and other design software.

## Features

| Feature | Description |
|---------|-------------|
| 🔤 **Unicode → FML** | Convert Malayalam to FML (Fixed Malayalam) encoding for design software |
| 📝 **Unicode → ML** | Convert Malayalam to ML encoding |
| 📥 **FML/ML → Unicode** | Paste legacy-encoded text and auto-convert back to Unicode |
| ✏️ **Manglish Typing** | Type Malayalam using English phonetics (e.g., "ente peru" → "എന്റെ പേര്") |
| 🎹 **Keyboard Layouts** | Visual keyboard: Inscript, GIST, Typewriter, Panchari, Varityper, English |
| 📺 **Tele Prompter** | Scrolling text display for presentations/recording |
| ✍️ **Handwriting Preview** | Preview text in handwriting-style fonts |
| 💾 **Download** | Save text as .txt file |
| 🖨️ **Print** | Print your Malayalam text |
| 📄 **Open File** | Open .txt, .md files with auto-detection of FML/ML encoding |
| ✅ **Word Check** | Count Malayalam/English words |
| 📊 **Live Counters** | Real-time word and character count |

## Why FML?

Unicode Malayalam often renders broken in design software (Photoshop, Illustrator, Figma) because these apps don't fully support complex OpenType shaping. **FML fonts** (developed by C-DAC) solve this by using pre-composed glyphs — each character form is a single glyph that renders correctly without a shaping engine.

## How to Use

### Quick Start
1. Open `index.html` in any browser
2. Type or paste Malayalam text in the editor
3. Click **"Copy to FML Series"** to get FML-encoded text
4. Paste into Photoshop/Illustrator with an FML font installed

### Manglish Mode
1. Click **"Manglish"** to toggle phonetic typing
2. Type in English: `ente peru`
3. It auto-converts to: `എന്റെ പേര്`

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Download text |
| `Ctrl+N` | New file |
| `Ctrl+P` | Print |
| `Ctrl+Z` | Undo |

## Where to Get FML Fonts

Free FML fonts are available from:
- [Saikatham.com](https://www.saikatham.com/download-malayalam-fml-fonts-free/) — Largest free collection
- [OnlineWebFonts.com](https://www.onlinewebfonts.com/fonts/Swasam_Malayalam_fml) — C-DAC fonts
- C-DAC official FML font packages

Popular FML fonts: FML-Sruthy, FML-Mohini, FML-Revathi, FML-Leela, FML-Nanditha

## Project Structure

```
south-voice-fml-converter/
├── index.html              # Main application
├── css/
│   └── style.css           # Complete stylesheet
├── js/
│   ├── mappings.js         # Unicode ↔ FML ↔ ML mapping tables
│   ├── converter.js        # Conversion engine
│   ├── manglish.js         # Manglish transliteration engine
│   ├── keyboard.js         # Virtual keyboard display
│   └── app.js              # UI logic and event handlers
└── README.md               # This file
```

## Technical Notes

- **FML Encoding**: 8-bit ASCII-based encoding (C-DAC ISFOC standard). Each Malayalam glyph maps to a position in the 0-255 byte range.
- **ML Encoding**: Similar legacy encoding with different code point assignments.
- **Manglish**: Phonetic transliteration that converts English keystrokes to Malayalam Unicode using a state machine.

## Browser Support

Works in all modern browsers: Chrome, Firefox, Edge, Safari. No server required — just open `index.html`.

## License

Free for personal and commercial use. FML fonts are subject to their respective licenses (typically free for non-commercial use by C-DAC).

---

**SOUTH VISION M-Translate (FML-CONVERTER)** — Made for the Malayalam design community ❤️
