/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — Character Map
 * Modal popup with all Malayalam Unicode characters organized by category
 */

const CharMap = {
    overlay: null,
    modal: null,
    initialized: false,

    categories: [
        {
            name: 'Vowels (സ്വരങ്ങൾ)',
            chars: ['അ','ആ','ഇ','ഈ','ഉ','ഊ','ഋ','എ','ഏ','ഐ','ഒ','ഓ','ഔ']
        },
        {
            name: 'Consonants — ka-varga (ക-വർഗം)',
            chars: ['ക','ഖ','ഗ','ഘ','ങ']
        },
        {
            name: 'Consonants — cha-varga (ച-വർഗം)',
            chars: ['ച','ഛ','ജ','ഝ','ഞ']
        },
        {
            name: 'Consonants — ta-varga (ട-വർഗം)',
            chars: ['ട','ഠ','ഡ','ഢ','ണ']
        },
        {
            name: 'Consonants — tha-varga (ത-വർഗം)',
            chars: ['ത','ഥ','ദ','ധ','ന']
        },
        {
            name: 'Consonants — pa-varga (പ-വർഗം)',
            chars: ['പ','ഫ','ബ','ഭ','മ']
        },
        {
            name: 'Consonants — ya to ha (യ-ഹ)',
            chars: ['യ','ര','റ','ല','ള','ഴ','വ','ശ','ഷ','സ','ഹ']
        },
        {
            name: 'Vowel Signs (സ്വരചിഹ്നങ്ങൾ)',
            chars: ['ാ','ി','ീ','ു','ൂ','ൃ','െ','േ','ൈ','ൊ','ോ','ൌ','ൗ']
        },
        {
            name: 'Signs & Chandrakkala (ചിഹ്നങ്ങൾ)',
            chars: ['ം','ഃ','്']
        },
        {
            name: 'Chillu Letters (ചില്ലുകൾ)',
            chars: ['ൺ','ൻ','ർ','ൽ','ൾ','ൿ']
        },
        {
            name: 'Common Conjuncts (കൂട്ടക്ഷരങ്ങൾ)',
            chars: [
                'ക്ക','ങ്ങ','ഞ്ഞ','ട്ട','ണ്ട','ണ്ണ','ത്ത','ദ്ദ','ന്ത',
                'ന്ന','ന്റ','മ്പ','മ്മ','യ്യ','ല്ല','ള്ള','വ്വ','ശ്ശ',
                'സ്സ','റ്റ','ക്ഷ','ക്ര','ത്ര','പ്ര','സ്ര','ഗ്ര','ബ്ര',
                'ഞ്ച','ങ്ക','സ്ഥ','ഷ്ട','ജ്ഞ','ച്ഛ','ണ്മ','ന്മ'
            ]
        },
        {
            name: 'Malayalam Digits (അക്കങ്ങൾ)',
            chars: ['൦','൧','൨','൩','൪','൫','൬','൭','൮','൯']
        },
        {
            name: 'Punctuation & Special',
            chars: ['ഽ','।','॥']
        }
    ],

    /**
     * Create the modal overlay once
     */
    _ensureModal() {
        if (this.initialized) return;

        // Overlay — dark backdrop, right-aligned
        this.overlay = document.createElement('div');
        this.overlay.className = 'charmap-overlay';
        this.overlay.id = 'charmap-overlay';
        Object.assign(this.overlay.style, {
            display: 'none', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            background: 'rgba(0,0,0,0.3)', zIndex: '9000',
            justifyContent: 'flex-end', alignItems: 'stretch'
        });
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Modal — slides in from right, doesn't cover editor
        this.modal = document.createElement('div');
        this.modal.className = 'charmap-modal';
        Object.assign(this.modal.style, {
            background: 'white', width: '100%', maxWidth: '400px', maxHeight: '100vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '-8px 0 50px rgba(0,0,0,0.25)'
        });

        // Header
        const header = document.createElement('div');
        header.className = 'charmap-modal-header';
        header.innerHTML = '<div class="charmap-modal-title">📋 Malayalam Character Map</div>';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'charmap-modal-close';
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close (Esc)';
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);

        // Body
        const body = document.createElement('div');
        body.className = 'charmap-modal-body';
        body.id = 'charmap-modal-body';

        // Footer
        const footer = document.createElement('div');
        footer.className = 'charmap-modal-footer';
        footer.textContent = 'Click any character to insert at cursor • Press Esc or click outside to close';

        this.modal.appendChild(header);
        this.modal.appendChild(body);
        this.modal.appendChild(footer);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Esc key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
                this.close();
            }
        });

        this.initialized = true;
    },

    /**
     * Render the character grid into the modal body
     */
    _render() {
        const container = document.getElementById('charmap-modal-body');
        if (!container) return;
        container.innerHTML = '';

        this.categories.forEach(cat => {
            const header = document.createElement('div');
            header.className = 'charmap-cat-header';
            header.textContent = cat.name;
            container.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'charmap-grid';

            cat.chars.forEach(char => {
                const cell = document.createElement('button');
                cell.className = 'charmap-char';
                cell.textContent = char;
                cell.title = char;
                cell.addEventListener('click', () => {
                    this._insertChar(char);
                });
                grid.appendChild(cell);
            });

            container.appendChild(grid);
        });
    },

    /**
     * Insert character at cursor in the editor
     */
    _insertChar(char) {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        editor.value = text.substring(0, start) + char + text.substring(end);
        editor.selectionStart = editor.selectionEnd = start + char.length;
        editor.focus();
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * Open the character map modal
     */
    open() {
        this._ensureModal();
        this._render();
        this.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';

        const btn = document.getElementById('btn-charmap');
        if (btn) btn.classList.add('active');
    },

    /**
     * Close the character map modal
     */
    close() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }
        document.body.style.overflow = '';

        const btn = document.getElementById('btn-charmap');
        if (btn) btn.classList.remove('active');
    },

    /**
     * Toggle open/close
     */
    toggle() {
        this._ensureModal();
        if (this.overlay.classList.contains('show')) {
            this.close();
        } else {
            this.open();
        }
    }
};
