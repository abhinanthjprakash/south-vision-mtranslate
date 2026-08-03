/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — Character Map Popup
 * Modal with character grid + live text box to see & edit before converting
 */

const CharMap = {
    overlay: null, modal: null, initialized: false,
    typedText: '',  // tracks what user types in the popup

    categories: [
        { name: 'Vowels', chars: ['അ','ആ','ഇ','ഈ','ഉ','ഊ','ഋ','എ','ഏ','ഐ','ഒ','ഓ','ഔ'] },
        { name: 'ka-varga', chars: ['ക','ഖ','ഗ','ഘ','ങ'] },
        { name: 'cha-varga', chars: ['ച','ഛ','ജ','ഝ','ഞ'] },
        { name: 'ta-varga', chars: ['ട','ഠ','ഡ','ഢ','ണ'] },
        { name: 'tha-varga', chars: ['ത','ഥ','ദ','ധ','ന'] },
        { name: 'pa-varga', chars: ['പ','ഫ','ബ','ഭ','മ'] },
        { name: 'ya-ha', chars: ['യ','ര','റ','ല','ള','ഴ','വ','ശ','ഷ','സ','ഹ'] },
        { name: 'Vowel Signs', chars: ['ാ','ി','ീ','ു','ൂ','ൃ','െ','േ','ൈ','ൊ','ോ','ൌ','ൗ'] },
        { name: 'Signs', chars: ['ം','ഃ','്'] },
        { name: 'Chillus', chars: ['ൺ','ൻ','ർ','ൽ','ൾ','ൿ'] },
        { name: 'Conjuncts', chars: ['ക്ക','ങ്ങ','ഞ്ഞ','ട്ട','ണ്ട','ണ്ണ','ത്ത','ദ്ദ','ന്ത','ന്ന','ന്റ','മ്പ','മ്മ','യ്യ','ല്ല','ള്ള','വ്വ','ശ്ശ','സ്സ','റ്റ','ക്ഷ','ക്ര','ത്ര','പ്ര','സ്ര','ഗ്ര','ബ്ര','ഞ്ച','ങ്ക','സ്ഥ','ഷ്ട','ജ്ഞ'] },
        { name: 'Digits', chars: ['൦','൧','൨','൩','൪','൫','൬','൭','൮','൯'] },
        { name: 'Punctuation', chars: ['ഽ','।','॥'] },
    ],

    _create() {
        if (this.initialized) return;

        // Overlay
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            display:'none', position:'fixed', top:'0', left:'0', right:'0', bottom:'0',
            background:'rgba(0,0,0,0.5)', zIndex:'9999',
            justifyContent:'center', alignItems:'center', padding:'20px'
        });
        this.overlay.addEventListener('click', e => { if (e.target === this.overlay) this.close(); });
        document.body.appendChild(this.overlay);

        // Modal
        this.modal = document.createElement('div');
        Object.assign(this.modal.style, {
            background:'white', borderRadius:'16px', width:'100%', maxWidth:'700px',
            maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden',
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
        });
        this.overlay.appendChild(this.modal);

        // Header
        const hdr = document.createElement('div');
        hdr.style.cssText = 'padding:14px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0';
        hdr.innerHTML = '<span style="font-size:15px;font-weight:700">📋 Malayalam Character Map</span>';
        const cls = document.createElement('button');
        cls.textContent = '✕'; cls.title = 'Close (Esc)';
        Object.assign(cls.style, { width:'32px',height:'32px',borderRadius:'50%',border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:'16px' });
        cls.addEventListener('click', () => this.close());
        hdr.appendChild(cls);
        this.modal.appendChild(hdr);

        // === LIVE TEXT BOX ===
        const textArea = document.createElement('textarea');
        textArea.id = 'charmap-textbox';
        textArea.placeholder = 'Your text will appear here as you click characters...';
        Object.assign(textArea.style, {
            width:'100%', height:'60px', border:'none', borderBottom:'2px solid #6366f1',
            padding:'12px 18px', fontSize:'20px', fontFamily:"'Noto Sans Malayalam',sans-serif",
            lineHeight:'1.8', resize:'none', outline:'none', background:'#fafbfc',
            flexShrink:'0'
        });
        textArea.addEventListener('input', () => { this.typedText = textArea.value; });
        this.modal.appendChild(textArea);
        // =======================

        // Character grid container
        const body = document.createElement('div');
        body.id = 'charmap-body';
        body.style.cssText = 'padding:14px 18px;overflow-y:auto;flex:1';
        this.modal.appendChild(body);

        // Footer with action buttons
        const ft = document.createElement('div');
        ft.style.cssText = 'padding:10px 18px;border-top:1px solid #e2e8f0;display:flex;gap:8px;justify-content:center;flex-shrink:0;flex-wrap:wrap';
        const btnInsert = document.createElement('button');
        btnInsert.textContent = '📥 Insert into Editor';
        Object.assign(btnInsert.style, { padding:'10px 20px',background:'#6366f1',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer' });
        btnInsert.addEventListener('click', () => this._insertToEditor());
        const btnFML = document.createElement('button');
        btnFML.textContent = '📋 Copy as FML';
        Object.assign(btnFML.style, { padding:'10px 20px',background:'#f59e0b',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer' });
        btnFML.addEventListener('click', () => this._copyAsFML());
        const btnClear = document.createElement('button');
        btnClear.textContent = '🗑️ Clear';
        Object.assign(btnClear.style, { padding:'10px 20px',background:'#e2e8f0',color:'#1a1a2e',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer' });
        btnClear.addEventListener('click', () => { document.getElementById('charmap-textbox').value = ''; this.typedText = ''; });
        ft.appendChild(btnInsert);
        ft.appendChild(btnFML);
        ft.appendChild(btnClear);
        this.modal.appendChild(ft);

        // Esc key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.overlay.style.display === 'flex') this.close();
        });

        this.initialized = true;
    },

    _render() {
        const container = document.getElementById('charmap-body');
        if (!container) return;
        container.innerHTML = '';
        this.categories.forEach(cat => {
            const hdr = document.createElement('div');
            hdr.style.cssText = 'font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin:8px 0 4px;padding-bottom:3px;border-bottom:1px solid #f1f5f9';
            hdr.textContent = cat.name;
            container.appendChild(hdr);
            const grid = document.createElement('div');
            grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px';
            cat.chars.forEach(ch => {
                const btn = document.createElement('button');
                btn.textContent = ch;
                Object.assign(btn.style, {
                    width:'42px',height:'42px',fontSize:'20px',fontFamily:"'Noto Sans Malayalam',sans-serif",
                    border:'1.5px solid #e2e8f0',borderRadius:'8px',background:'white',
                    cursor:'pointer',color:'#1a1a2e',padding:'0',
                    display:'flex',alignItems:'center',justifyContent:'center'
                });
                btn.addEventListener('mouseenter', ()=>{btn.style.background='#6366f1';btn.style.color='white';btn.style.transform='scale(1.1)'});
                btn.addEventListener('mouseleave', ()=>{btn.style.background='white';btn.style.color='#1a1a2e';btn.style.transform='scale(1)'});
                btn.addEventListener('click', () => {
                    const tb = document.getElementById('charmap-textbox');
                    if (!tb) return;
                    const s = tb.selectionStart;
                    tb.value = tb.value.substring(0, s) + ch + tb.value.substring(tb.selectionEnd);
                    tb.selectionStart = tb.selectionEnd = s + ch.length;
                    this.typedText = tb.value;
                    tb.focus();
                });
                grid.appendChild(btn);
            });
            container.appendChild(grid);
        });
    },

    _insertToEditor() {
        const text = document.getElementById('charmap-textbox')?.value || this.typedText;
        if (!text) return;
        const editor = document.getElementById('editor');
        if (!editor) return;
        const s = editor.selectionStart;
        editor.value = editor.value.substring(0, s) + text + editor.value.substring(editor.selectionEnd);
        editor.selectionStart = editor.selectionEnd = s + text.length;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.focus();
        this.close();
    },

    _copyAsFML() {
        const text = document.getElementById('charmap-textbox')?.value || this.typedText;
        if (!text) return;
        const fml = Converter.unicodeToFML(text);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fml).then(() => {
                alert('✅ FML text copied!\n\n' + fml + '\n\nPaste into Photoshop with FML font.');
            });
        } else {
            alert('📋 Your FML text:\n\n' + fml + '\n\nSelect & copy manually.');
        }
    },

    open() {
        this._create();
        this._render();
        // Pre-fill textbox with current editor content
        const editorText = document.getElementById('editor')?.value || '';
        const tb = document.getElementById('charmap-textbox');
        if (tb) { tb.value = editorText; this.typedText = editorText; }
        this.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => { if (tb) tb.focus(); }, 100);
    },

    close() {
        if (this.overlay) this.overlay.style.display = 'none';
        document.body.style.overflow = '';
    },

    toggle() {
        this._create();
        if (this.overlay.style.display === 'flex') this.close();
        else this.open();
    }
};
