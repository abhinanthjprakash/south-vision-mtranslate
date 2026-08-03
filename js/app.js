/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — Main Application
 * UI event handlers, toolbar actions, state management
 */

const App = {
    manglishMode: false,
    fileName: 'untitled.txt',
    undoStack: [],
    maxUndo: 50,
    recognition: null,
    isListening: false,

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.bindToolbar();
        this.bindKeyboardLayoutSelector();
        this.bindManglishToggle();
        // Manglish starts OFF — user must click to enable

        this.updateCounters();
        this.updateFMLPreview();

        // Editor input handler
        const editor = document.getElementById('editor');
        editor.addEventListener('input', () => {
            this.onEditorInput();
        });
    },

    /**
     * Bind main conversion button events
     */
    bindEvents() {
        // Copy to FML Series
        document.getElementById('btn-copy-fml').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const text = editor.value.trim();
            if (!text) {
                this.showToast('Nothing to convert! Type something first.', 'warning');
                return;
            }

            // Auto-detect: if text has English letters but no Malayalam, auto-Manglish it
            let unicodeText = text;
            const hasMalayalam = /[ഀ-ൿ]/.test(text);
            const hasEnglish = /[a-zA-Z]/.test(text);

            if (!hasMalayalam && hasEnglish) {
                // Looks like Manglish — auto-convert!
                unicodeText = Manglish.toUnicode(text);
            } else if (this.manglishMode) {
                unicodeText = Manglish.toUnicode(text);
            }

            if (unicodeText === text && !hasMalayalam) {
                this.showToast('No Malayalam found! Type in Malayalam or enable Manglish mode.', 'warning');
                return;
            }

            const fmlText = Converter.unicodeToFML(unicodeText);

            // Update preview panel so user can see the result
            document.getElementById('fml-preview').textContent = fmlText;
            document.getElementById('ml-preview').textContent = Converter.unicodeToML(unicodeText);

            this.copyToClipboard(fmlText);
            this.showToast('✅ Copied! Paste in Photoshop/Illustrator with FML font.', 'success');
        });

        // Copy to ML Series
        document.getElementById('btn-copy-ml').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const text = editor.value.trim();
            if (!text) {
                this.showToast('Nothing to convert! Type something first.', 'warning');
                return;
            }

            let unicodeText = text;
            const hasMalayalam = /[ഀ-ൿ]/.test(text);
            const hasEnglish = /[a-zA-Z]/.test(text);

            if (!hasMalayalam && hasEnglish) {
                unicodeText = Manglish.toUnicode(text);
            } else if (this.manglishMode) {
                unicodeText = Manglish.toUnicode(text);
            }

            if (unicodeText === text && !hasMalayalam) {
                this.showToast('No Malayalam found! Type in Malayalam or enable Manglish mode.', 'warning');
                return;
            }

            const mlText = Converter.unicodeToML(unicodeText);

            document.getElementById('fml-preview').textContent = Converter.unicodeToFML(unicodeText);
            document.getElementById('ml-preview').textContent = mlText;

            this.copyToClipboard(mlText);
            this.showToast('✅ Copied! Paste with ML-TT font.', 'success');
        });

        // Paste from ML/FML
        document.getElementById('btn-paste-mlfml').addEventListener('click', () => {
            navigator.clipboard.readText().then((clipText) => {
                if (!clipText) {
                    this.showToast('Clipboard is empty.', 'warning');
                    return;
                }
                const result = Converter.autoConvertToUnicode(clipText);
                if (result.detected === 'unicode') {
                    this.showToast('Pasted text appears to already be Unicode.', 'info');
                } else {
                    this.showToast('Pasted and converted from ' + result.detected.toUpperCase() + ' to Unicode!', 'success');
                }
                document.getElementById('editor').value = result.text;
                this.updateCounters();
                this.updateFMLPreview();
            }).catch(() => {
                this.showToast('Could not read clipboard. Please paste manually (Ctrl+V).', 'error');
            });
        });

        // Clear editor
        document.getElementById('btn-clear').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            if (editor.value && !confirm('Clear all text?')) return;
            this.saveUndo();
            editor.value = '';
            this.updateCounters();
            this.updateFMLPreview();
            editor.focus();
        });
    },

    /**
     * Bind toolbar button actions
     */
    bindToolbar() {
        // New File
        document.getElementById('toolbar-new').addEventListener('click', () => {
            this.saveUndo();
            const editor = document.getElementById('editor');
            editor.value = '';
            this.fileName = 'untitled.txt';
            this.updateCounters();
            this.updateFMLPreview();
            this.showToast('New file created.', 'info');
            editor.focus();
        });

        // Open File
        document.getElementById('toolbar-open').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt,.md,.fml,.ml';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                this.fileName = file.name;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.saveUndo();
                    // Check if it's legacy encoded
                    const text = ev.target.result;
                    const result = Converter.autoConvertToUnicode(text);
                    document.getElementById('editor').value = result.text;
                    this.updateCounters();
                    this.updateFMLPreview();
                    if (result.detected !== 'unicode') {
                        this.showToast('Opened and auto-converted from ' + result.detected.toUpperCase() + '.', 'info');
                    } else {
                        this.showToast('Opened: ' + file.name, 'info');
                    }
                };
                reader.readAsText(file, 'UTF-8');
            };
            input.click();
        });

        // Download Text
        document.getElementById('toolbar-download').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const text = editor.value;
            if (!text) {
                this.showToast('Nothing to download!', 'warning');
                return;
            }
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.fileName.replace(/\.\w+$/, '') + '_unicode.txt';
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Downloaded!', 'success');
        });

        // Print
        document.getElementById('toolbar-print').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const text = editor.value;
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>SOUTH VISION M-Translate (FML-CONVERTER) - Print</title>');
            printWindow.document.write('<style>body{font-family:"Noto Sans Malayalam","Manjari",sans-serif;font-size:18px;padding:40px;line-height:2;color:#292524;white-space:pre-wrap;}</style></head><body>');
            printWindow.document.write(text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 300);
        });

        // Google Keyboard Integration
        document.getElementById('toolbar-google-keyboard').addEventListener('click', () => {
            window.open('https://www.google.com/inputtools/try/', '_blank');
            this.showToast('Google Input Tools opened in new tab. Use Malayalam keyboard there and paste back.', 'info');
        });

        // Tele Prompter
        document.getElementById('toolbar-teleprompter').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const text = editor.value;
            if (!text) {
                this.showToast('Type some text first to use Tele Prompter.', 'warning');
                return;
            }
            this.openTeleprompter(text);
        });

        // Word Check
        document.getElementById('toolbar-wordcheck').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const words = editor.value.trim().split(/\s+/).filter(w => w.length > 0);
            const malayalamWords = words.filter(w => /[ഀ-ൿ]/.test(w));
            const englishWords = words.filter(w => /^[a-zA-Z]+$/.test(w));

            const msg = `Word count: ${words.length}\nMalayalam: ${malayalamWords.length}\nEnglish/Latin: ${englishWords.length}\nMixed/Other: ${words.length - malayalamWords.length - englishWords.length}`;
            alert(msg);
        });

        // OCR
        document.getElementById('toolbar-ocr').addEventListener('click', () => {
            window.open('ocr.html', 'ocrWindow', 'width=950,height=700');
            this.showToast('OCR tool opened. Upload an image to extract Malayalam text.', 'info');
        });

        // Voice Typing
        document.getElementById('toolbar-voice').addEventListener('click', () => {
            this.toggleVoiceTyping();
        });

        // Character Map
        document.getElementById('btn-charmap').addEventListener('click', () => {
            CharMap.toggle();
        });

        // Mail
        document.getElementById('toolbar-mail').addEventListener('click', () => {
            const editor = document.getElementById('editor');
            const text = editor.value;
            if (!text) {
                this.showToast('Nothing to email!', 'warning');
                return;
            }
            const subject = encodeURIComponent('Text from SOUTH VISION M-Translate (FML-CONVERTER)');
            const body = encodeURIComponent(text);
            window.open('mailto:?subject=' + subject + '&body=' + body);
        });
    },

    /**
     * Bind keyboard layout selector
     */
    bindKeyboardLayoutSelector() {
        const radios = document.querySelectorAll('input[name="kb-layout"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    KeyboardDisplay.render(radio.value);
                }
            });
        });

        // Keyboard toggle - button + header bar click
        const kbContainer = document.getElementById('keyboard-container');
        const toggleBtn = document.getElementById('btn-toggle-keyboard');

        function updateKbToggleText() {
            if (kbContainer.style.display === 'block') {
                toggleBtn.textContent = '👆 Hide Keyboard';
            } else {
                toggleBtn.textContent = '👆 Show Keyboard';
            }
        }

        toggleBtn.addEventListener('click', () => {
            KeyboardDisplay.toggle();
            updateKbToggleText();
        });

        // Click header bar to toggle too
        document.getElementById('kb-header-bar').addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL' || e.target === toggleBtn) return;
            KeyboardDisplay.toggle();
            updateKbToggleText();
        });
    },

    /**
     * Bind Manglish toggle
     */
    bindManglishToggle() {
        const btn = document.getElementById('btn-manglish');
        btn.addEventListener('click', () => {
            this.manglishMode = !this.manglishMode;
            if (this.manglishMode) {
                btn.classList.add('active');
                btn.textContent = '✓ Manglish ON';
                document.getElementById('manglish-indicator').style.display = 'inline-block';
                document.getElementById('editor').placeholder = 'Type in Manglish here... e.g., malayalam, ente, nanni, vanakkam';
                // Update editor card badge
                const badge = document.querySelector('.card-header-badge');
                if (badge) badge.textContent = 'Type here in Manglish';
                // Show the Malayalam preview
                const up = document.getElementById('unicode-preview');
                if (up && up.parentElement) (document.getElementById('malayalam-preview-box')||up.parentElement).classList.remove('hidden');
            } else {
                btn.classList.remove('active');
                btn.textContent = 'Manglish';
                document.getElementById('manglish-indicator').style.display = 'none';
                document.getElementById('editor').placeholder = 'ഇവിടെ മലയാളം ടൈപ്പ് ചെയ്യുക...';
                // Update editor card badge
                const badge = document.querySelector('.card-header-badge');
                if (badge) badge.textContent = 'Type here in Malayalam';
                // Hide the Malayalam preview
                const up = document.getElementById('unicode-preview');
                if (up && up.parentElement) (document.getElementById('malayalam-preview-box')||up.parentElement).classList.add('hidden');
            }
        });
    },

    /**
     * Handle editor input events
     */
    onEditorInput() {
        this.updateCounters();
        this.updateFMLPreview();

        // Auto-convert Manglish if enabled
        if (this.manglishMode) {
            this.convertManglishRealTime();
        }

        // Live update teleprompter if open
        const pw = this._prompterWindow;
        if (pw && !pw.closed) {
            try {
                const text = document.getElementById('editor').value;
                const display = /[a-zA-Z]/.test(text) ? Manglish.toUnicode(text) : text;
                const el = pw.document.getElementById('prompter-text');
                if (el) el.textContent = display;
            } catch(e) { this._prompterWindow = null; }
        }
    },

    /**
     * Real-time Manglish conversion
     */
    convertManglishRealTime() {
        // Don't modify the editor — keep raw Manglish input intact.
        // The preview panel shows the converted result in real-time.
        // This allows the dictionary to match complete words (e.g. "malayalam")
        // instead of processing letter-by-letter mixed text.
        this.updateFMLPreview();
    },

    /**
     * Update live word and character counters
     */
    updateCounters() {
        const editor = document.getElementById('editor');
        const text = editor.value || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;

        document.getElementById('word-count').textContent = words;
        document.getElementById('char-count').textContent = chars;
    },

    /**
     * Update FML preview area
     */
    updateFMLPreview() {
        const editor = document.getElementById('editor');
        const text = editor.value;
        if (!text) {
            document.getElementById('fml-preview').textContent = 'FML output will appear here...';
            document.getElementById('ml-preview').textContent = 'ML output will appear here...';
            const up = document.getElementById('unicode-preview');
            if (up) up.textContent = 'Type in Manglish to see Malayalam here...';
            if (this._sugChips) this._sugChips.innerHTML = '';
            return;
        }

        let unicodeText = text;
        // Auto-convert if text has English (Manglish) letters AND Manglish mode is ON
        if (this.manglishMode && /[a-zA-Z]/.test(text)) {
            unicodeText = Manglish.toUnicode(text);
        }

        // Update the Malayalam preview — only visible when Manglish is ON
        const unicodePreview = document.getElementById('unicode-preview');
        if (unicodePreview) {
            if (this.manglishMode) {
                unicodePreview.parentElement.classList.remove('hidden');
                unicodePreview.textContent = unicodeText || 'Type in Manglish to see Malayalam here...';
                // Trigger suggestions update for current word
                this.updateSuggestions();
            } else {
                unicodePreview.parentElement.classList.add('hidden');
                if (this._sugChips) this._sugChips.innerHTML = '';
            }
        }

        const fmlText = Converter.unicodeToFML(unicodeText);
        const mlText = Converter.unicodeToML(unicodeText);

        document.getElementById('fml-preview').textContent = fmlText || 'FML output will appear here...';
        document.getElementById('ml-preview').textContent = mlText || 'ML output will appear here...';
    },

    /**
     * Copy text to clipboard with fallback — shows the text in a popup if copy fails
     */
    copyToClipboard(text) {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                // Success — already showed toast from the calling function
            }).catch(() => {
                // Clipboard API failed — show text for manual copy
                this.showCopyPopup(text);
            });
        } else {
            // Older browsers — try execCommand fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand('copy');
                // Success
            } catch (e) {
                // Both methods failed — show popup
                this.showCopyPopup(text);
            }
            document.body.removeChild(ta);
        }
    },

    /**
     * Show a popup with the converted text for manual copy
     */
    showCopyPopup(text) {
        // Remove any existing popup
        const existing = document.getElementById('copy-popup');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'copy-popup';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        const box = document.createElement('div');
        box.style.cssText = 'background:white;border-radius:16px;padding:24px;max-width:550px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;';

        box.innerHTML = `
            <h3 style="margin:0 0 8px;font-size:18px;">📋 Your Converted Text</h3>
            <p style="font-size:12px;color:#64748b;margin:0 0 12px;">Click the text below to select all, then Ctrl+C to copy</p>
            <div id="copy-popup-text" style="background:#f1f5f9;border:2px dashed #6366f1;border-radius:10px;padding:16px;font-family:'JetBrains Mono',monospace;font-size:14px;word-break:break-all;text-align:left;max-height:200px;overflow-y:auto;cursor:pointer;user-select:all;" onclick="this.focus();document.execCommand('selectAll')">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            <button id="copy-popup-close" style="margin-top:14px;padding:10px 28px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Close</button>
        `;
        box.querySelector('#copy-popup-close').addEventListener('click', () => overlay.remove());
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    },

    /**
     * Open teleprompter window
     */
    openTeleprompter(text) {
        // Auto-convert Manglish to Malayalam if text has English letters
        const displayText = /[a-zA-Z]/.test(text) ? Manglish.toUnicode(text) : text;
        const win = window.open('', 'teleprompter', 'width=900,height=500');
        win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tele Prompter</title>');
        win.document.write('<style>');
        win.document.write('*{margin:0;padding:0;box-sizing:border-box;}');
        win.document.write('body{background:#1c1917;color:#f5f5f4;font-family:"Noto Sans Malayalam",sans-serif;overflow:hidden;}');
        win.document.write('.prompter{font-size:48px;line-height:1.8;padding:60px 60px 100px 60px;white-space:pre-wrap;position:absolute;left:0;right:0;}');
        win.document.write('.speed-bar{position:fixed;bottom:0;left:0;right:0;background:#44403c;padding:10px 20px;display:flex;align-items:center;gap:15px;z-index:10;}');
        win.document.write('.speed-bar button{background:#d97706;border:none;color:white;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:14px;}');
        win.document.write('.speed-bar input{flex:1;}');
        win.document.write('</style></head><body>');
        win.document.write('<div class="prompter" id="prompter-text"></div>');
        win.document.write('<div class="speed-bar">');
        win.document.write('<button onclick="window.close()">Close</button>');
        win.document.write('<span style="font-size:12px;color:#a8a29e;">Speed:</span>');
        win.document.write('<input type="range" min="1" max="50" value="25" id="speed-slider">');
        win.document.write('</div>');
        win.document.write('<script>');
        win.document.write('var el=document.getElementById("prompter-text");');
        win.document.write('var slider=document.getElementById("speed-slider");');
        win.document.write('var y=window.innerHeight;');
        win.document.write('setInterval(function(){');
        win.document.write('  var s=parseInt(slider.value)||25;');
        win.document.write('  y-=s*2;');
        win.document.write('  if(y<-el.offsetHeight-300)y=window.innerHeight+300;');
        win.document.write('  el.style.top=y+"px";');
        win.document.write('},50);');
        win.document.write('</script>');
        win.document.write('</body></html>');
        win.document.close();
        // Store reference for live updates from editor
        this._prompterWindow = win;
        this._updatePrompter(displayText);
    },

    _updatePrompter(text) {
        if (!this._prompterWindow || this._prompterWindow.closed) return;
        try {
            const el = this._prompterWindow.document.getElementById('prompter-text');
            if (el) el.textContent = text;
        } catch(e) { this._prompterWindow = null; }
    },

    /**
     * Open handwriting style preview
     */
    openHandwritingPreview(text) {
        const win = window.open('', 'handwriting', 'width=800,height=600');
        win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Handwriting Preview</title>');
        win.document.write('<style>');
        win.document.write('body{background:#fafaf9;padding:40px;font-size:24px;line-height:2.2;color:#1c1917;}');
        win.document.write('.handwrite{font-family:"Kalam","Baloo Da 2","Noto Sans Malayalam",cursive;font-size:28px;}');
        win.document.write('select{padding:8px 16px;font-size:14px;border-radius:8px;border:2px solid #d6d3d1;margin-bottom:20px;}');
        win.document.write('.preview-label{font-size:12px;color:#78716c;margin-bottom:8px;}');
        win.document.write('</style></head><body>');
        win.document.write('<div class="preview-label">Handwriting Style Preview</div>');
        win.document.write('<select onchange="document.getElementById(\'preview\').style.fontFamily=this.value">');
        win.document.write('<option value="Kalam, cursive">Kalam (Handwriting)</option>');
        win.document.write('<option value="Baloo Da 2, cursive">Baloo Da 2</option>');
        win.document.write('<option value="Noto Sans Malayalam, sans-serif">Noto Sans Malayalam</option>');
        win.document.write('<option value="Manjari, sans-serif">Manjari</option>');
        win.document.write('</select>');
        win.document.write('<div class="handwrite" id="preview">' + text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>');
        win.document.write('</body></html>');
        win.document.close();
    },

    /**
     * Save to undo stack
     */
    saveUndo() {
        const editor = document.getElementById('editor');
        this.undoStack.push(editor.value);
        if (this.undoStack.length > this.maxUndo) {
            this.undoStack.shift();
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast toast-' + type + ' show';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    /**
     * Handle keyboard shortcuts
     */
    // Suggestions state
    _sugLastWord: '',
    _sugTimer: null,
    _sugChips: null,
    _sugPending: null, // track pending XHR to cancel

    updateSuggestions() {
        if (!this.manglishMode) return;
        var editor = document.getElementById('editor');
        var unicodePreview = document.getElementById('unicode-preview');
        if (!editor || !unicodePreview) return;

        // Create chips container once
        if (!this._sugChips) {
            this._sugChips = document.createElement('div');
            this._sugChips.style.cssText = 'margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;';
            unicodePreview.parentNode.appendChild(this._sugChips);
        }

        var text = editor.value;
        var before = text.substring(0, editor.selectionStart);
        var m = before.match(/([a-zA-Z]+)$/);
        var word = m ? m[0] : '';

        if (!word || word.length < 1) { this._sugChips.innerHTML = ''; this._sugLastWord = ''; return; }

        // Don't re-render if word hasn't changed (prevents flash)
        if (word === this._sugLastWord && this._sugChips.innerHTML) return;

        this._sugLastWord = word;
        var self = this;

        // Cancel pending request
        if (this._sugPending) { this._sugPending.abort(); this._sugPending = null; }

        // Fetch Google (with debounce)
        clearTimeout(this._sugTimer);
        this._sugTimer = setTimeout(function() {
            if (!self.manglishMode || word !== self._sugLastWord) return;
            var xhr = new XMLHttpRequest();
            self._sugPending = xhr;
            xhr.open('GET', 'https://inputtools.google.com/request?text=' + encodeURIComponent(word) + '&itc=ml-t-i0-und&num=5');
            xhr.onload = function() {
                self._sugPending = null;
                if (xhr.status !== 200 || !self.manglishMode || word !== self._sugLastWord) return;
                try {
                    var r = JSON.parse(xhr.responseText);
                    if (r[0] !== 'SUCCESS') return;
                    var our = Manglish.toUnicode(word);
                    var seen = {};
                    var items = [];
                    if (!seen[our]) { seen[our] = true; items.push(our); }
                    for (var i = 0; i < r[1][0][1].length; i++) {
                        var gc = r[1][0][1][i];
                        if (!seen[gc]) { seen[gc] = true; items.push(gc); }
                    }
                    // Don't render if word changed during fetch
                    if (word === self._sugLastWord) self._renderSugChips(items);
                } catch(e) {}
            };
            xhr.onerror = function() { self._sugPending = null; };
            xhr.send();
        }, 250);
    },

    _renderSugChips(items) {
        if (!this._sugChips || !this.manglishMode) return;
        var colors = ['#eef2ff','#fff7ed','#f0fdf4','#fef2f2','#f5f3ff'];
        var borders = ['#6366f1','#ea580c','#16a34a','#dc2626','#8b5cf6'];
        var h = '';
        for (var j = 0; j < items.length; j++) {
            var ci = j % colors.length;
            h += '<span data-ml="' + items[j].replace(/"/g, '&quot;') + '" ' +
                'style="display:inline-block;padding:4px 12px;border-radius:16px;cursor:pointer;font-size:17px;' +
                'font-family:\'Noto Sans Malayalam\',sans-serif;background:' + colors[ci] + ';border:1.5px solid ' + borders[ci] + ';' +
                'color:' + borders[ci] + ';transition:all 0.15s;" ' +
                'onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
                items[j] + '</span>';
        }
        this._sugChips.innerHTML = h;
        var self = this;
        var els = this._sugChips.querySelectorAll('span');
        for (var k = 0; k < els.length; k++) {
            els[k].addEventListener('mousedown', function(e) {
                e.preventDefault();
                var ml = this.getAttribute('data-ml');
                var editor = document.getElementById('editor');
                var text = editor.value;
                var before = text.substring(0, editor.selectionStart);
                var m2 = before.match(/([a-zA-Z]+)$/);
                if (!m2) return;
                var start = before.length - m2[0].length;
                editor.value = text.substring(0, start) + ml + ' ' + text.substring(editor.selectionStart);
                editor.selectionStart = editor.selectionEnd = start + ml.length + 1;
                self._sugChips.innerHTML = '';
                self._sugLastWord = '';
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.focus();
            });
        }
    },

    handleKeyboard(e) {
        // Ctrl+S to download
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('toolbar-download').click();
        }
        // Ctrl+N for new
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('toolbar-new').click();
        }
        // Ctrl+P for print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            document.getElementById('toolbar-print').click();
        }
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z' && this.undoStack.length > 0) {
            e.preventDefault();
            const editor = document.getElementById('editor');
            editor.value = this.undoStack.pop();
            this.updateCounters();
            this.updateFMLPreview();
        }
        // Ctrl+M for voice typing toggle
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            this.toggleVoiceTyping();
        }
    },

    // =========================================================================
    // VOICE TYPING (Web Speech API)
    // =========================================================================

    /**
     * Initialize speech recognition for Malayalam
     */
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.showToast('Voice typing not supported in this browser. Try Chrome.', 'error');
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ml-IN';        // Malayalam
        recognition.interimResults = true; // Show results as user speaks
        recognition.continuous = true;     // Keep listening
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Insert final text at cursor
            if (finalTranscript) {
                const editor = document.getElementById('editor');
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                const text = editor.value;
                editor.value = text.substring(0, start) + finalTranscript + ' ' + text.substring(end);
                editor.selectionStart = editor.selectionEnd = start + finalTranscript.length + 1;
                editor.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Show interim text in the voice indicator
            const indicator = document.getElementById('voice-text');
            if (indicator) {
                indicator.textContent = interimTranscript || finalTranscript || 'Listening...';
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            const indicator = document.getElementById('voice-text');

            if (event.error === 'no-speech') {
                if (indicator) indicator.textContent = 'No speech detected. Try again...';
            } else if (event.error === 'aborted') {
                // User stopped, normal
            } else {
                this.showToast('Voice error: ' + event.error.replace(/-/g, ' '), 'warning');
                this.stopVoiceTyping();
            }
        };

        recognition.onend = () => {
            // Auto-restart if still in listening mode
            if (this.isListening) {
                try { recognition.start(); } catch(e) { /* already started */ }
            }
        };

        return recognition;
    },

    /**
     * Toggle voice typing on/off
     */
    toggleVoiceTyping() {
        if (this.isListening) {
            this.stopVoiceTyping();
        } else {
            this.startVoiceTyping();
        }
    },

    /**
     * Start voice typing
     */
    startVoiceTyping() {
        if (!this.recognition) {
            this.recognition = this.initSpeechRecognition();
        }
        if (!this.recognition) return;

        try {
            this.recognition.start();
            this.isListening = true;

            // Update UI
            const btn = document.getElementById('toolbar-voice');
            if (btn) {
                btn.classList.add('voice-active');
                btn.title = 'Stop Voice Typing (Ctrl+M)';
            }
            const indicator = document.getElementById('voice-indicator');
            if (indicator) indicator.style.display = 'flex';
            const voiceText = document.getElementById('voice-text');
            if (voiceText) voiceText.textContent = 'Listening...';

            this.showToast('🎤 Voice typing ON — Speak Malayalam...', 'success');
        } catch (e) {
            console.error('Voice start error:', e);
            this.showToast('Could not start voice. Allow microphone access.', 'error');
        }
    },

    /**
     * Stop voice typing
     */
    stopVoiceTyping() {
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e) { /* already stopped */ }
        }
        this.isListening = false;

        // Update UI
        const btn = document.getElementById('toolbar-voice');
        if (btn) {
            btn.classList.remove('voice-active');
            btn.title = 'Voice Typing (Ctrl+M)';
        }
        const indicator = document.getElementById('voice-indicator');
        if (indicator) indicator.style.display = 'none';

        this.showToast('Voice typing stopped.', 'info');
    },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Global keyboard shortcut handler
    document.addEventListener('keydown', (e) => App.handleKeyboard(e));
});
