/**
 * SOUTH VISION M-Translate (FML-CONVERTER) — Character Map
 * Inline panel with all Malayalam Unicode characters organized by category
 */

const CharMap = {
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

    render() {
        const container = document.getElementById('charmap-container');
        if (!container) return;
        container.innerHTML = '';

        this.categories.forEach(cat => {
            const hdr = document.createElement('div');
            hdr.style.cssText = 'font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin:10px 0 5px;padding-bottom:4px;border-bottom:1px solid #f1f5f9';
            hdr.textContent = cat.name;
            container.appendChild(hdr);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px';

            cat.chars.forEach(ch => {
                const btn = document.createElement('button');
                btn.textContent = ch;
                btn.title = ch;
                Object.assign(btn.style, {
                    width:'40px',height:'40px',fontSize:'19px',fontFamily:"'Noto Sans Malayalam',sans-serif",
                    border:'1.5px solid #e2e8f0',borderRadius:'8px',background:'white',
                    cursor:'pointer',color:'#1a1a2e',padding:'0',
                    display:'flex',alignItems:'center',justifyContent:'center'
                });
                btn.addEventListener('mouseenter',()=>{btn.style.background='#6366f1';btn.style.color='white';btn.style.transform='scale(1.1)'});
                btn.addEventListener('mouseleave',()=>{btn.style.background='white';btn.style.color='#1a1a2e';btn.style.transform='scale(1)'});
                btn.addEventListener('click',()=>{
                    const ed = document.getElementById('editor');
                    if(!ed)return;
                    const s=ed.selectionStart;
                    ed.value=ed.value.substring(0,s)+ch+ed.value.substring(ed.selectionEnd);
                    ed.selectionStart=ed.selectionEnd=s+ch.length;
                    ed.focus();
                    ed.dispatchEvent(new Event('input',{bubbles:true}));
                });
                grid.appendChild(btn);
            });
            container.appendChild(grid);
        });
    },

    toggle() {
        const panel = document.getElementById('charmap-panel');
        if (!panel) return;
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'block';
            this.render();
        } else {
            panel.style.display = 'none';
        }
    }
};
