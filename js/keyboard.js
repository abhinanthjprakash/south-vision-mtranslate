/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — Virtual Keyboard Display
 * Renders clickable on-screen keyboard layouts
 */

const KeyboardDisplay = {
    currentLayout: 'inscript',
    shiftActive: false,

    /**
     * Render the keyboard for a given layout
     * @param {string} layoutName - One of: inscript, gist, typewriter, panchari, varityper, english
     */
    render(layoutName) {
        this.currentLayout = layoutName;
        const layout = KEYBOARD_LAYOUTS[layoutName];
        if (!layout) return;

        const container = document.getElementById('keyboard-container');
        if (!container) return;

        container.innerHTML = '';

        const rows = this.shiftActive && layout.shift ? layout.shift : layout.normal;

        rows.forEach((rowKeys, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'kb-row';

            rowKeys.forEach((keyLabel) => {
                const keyEl = document.createElement('div');
                keyEl.className = 'kb-key';
                if (keyLabel === 'Bksp') keyEl.classList.add('kb-key-wide');
                if (keyLabel === 'Tab') keyEl.classList.add('kb-key-tab');
                if (keyLabel === 'Caps') keyEl.classList.add('kb-key-caps');
                if (keyLabel === 'Enter') keyEl.classList.add('kb-key-enter');
                if (keyLabel === 'Shift') keyEl.classList.add('kb-key-shift');
                if (keyLabel === 'Space') keyEl.classList.add('kb-key-space');
                if (['Ctrl', 'Win', 'Alt', 'Menu'].includes(keyLabel)) {
                    keyEl.classList.add('kb-key-mod');
                }

                keyEl.textContent = keyLabel;

                // Make Malayalam character keys clickable
                if (/[ഀ-ൿ]/.test(keyLabel)) {
                    keyEl.classList.add('kb-key-malayalam');
                    keyEl.addEventListener('click', () => {
                        this.insertChar(keyLabel);
                    });
                }

                rowDiv.appendChild(keyEl);
            });

            container.appendChild(rowDiv);
        });
    },

    /**
     * Insert a character at cursor position in the editor
     */
    insertChar(char) {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        editor.value = text.substring(0, start) + char + text.substring(end);
        editor.selectionStart = editor.selectionEnd = start + char.length;
        editor.focus();

        // Trigger input event to update counters
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * Toggle Shift state for the keyboard
     */
    toggleShift() {
        this.shiftActive = !this.shiftActive;
        this.render(this.currentLayout);
    },

    /**
     * Toggle keyboard visibility
     */
    toggle() {
        const container = document.getElementById('keyboard-container');
        const toggleBtn = document.getElementById('btn-toggle-keyboard');
        if (!container) return;

        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'block';
            if (toggleBtn) toggleBtn.classList.add('active');
            this.render(this.currentLayout);
        } else {
            container.style.display = 'none';
            if (toggleBtn) toggleBtn.classList.remove('active');
        }
    }
};
