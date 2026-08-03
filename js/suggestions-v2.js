/**
 * Auto-suggestions while typing - shows Google candidates as colored chips.
 * Appears automatically as you type each word. No click needed.
 * Only active when Manglish is ON.
 */
(function() {
    var editor = document.getElementById('editor');
    var unicodePreview = document.getElementById('unicode-preview');
    if (!editor || !unicodePreview) return;

    var chips = document.createElement('div');
    chips.id = 'google-chips';
    chips.style.cssText = 'margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;';
    // Append to the preview box, not after unicode-preview (in case nextSibling is null)
    var previewBox = document.getElementById('malayalam-preview-box');
    (previewBox || unicodePreview.parentNode).appendChild(chips);

    var timer = null, lastWord = '';
    var COLORS = ['#eef2ff','#fff7ed','#f0fdf4','#fef2f2','#f5f3ff'];
    var BORDER = ['#6366f1','#ea580c','#16a34a','#dc2626','#8b5cf6'];

    function isOn() {
        return typeof App !== 'undefined' && App.manglishMode;
    }

    function update() {
        if (!isOn()) { chips.innerHTML = ''; lastWord = ''; return; }

        var text = editor.value;
        var cursorPos = editor.selectionStart;
        var before = text.substring(0, cursorPos);
        var m = before.match(/([a-zA-Z]+)$/);
        var word = m ? m[0] : '';

        if (!word || word.length < 1) {
            chips.innerHTML = '';
            lastWord = '';
            return;
        }

        // Always show our engine result immediately
        var ourResult = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(word) : word;
        var items = [ourResult];
        renderChips(items);

        // Then fetch Google (debounced)
        if (word !== lastWord) {
            lastWord = word;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fetchGoogle(word, ourResult);
            }, 200);
        }
    }

    function fetchGoogle(word, ourResult) {
        if (!isOn()) return;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://inputtools.google.com/request?text=' +
            encodeURIComponent(word) + '&itc=ml-t-i0-und&num=5');
        xhr.onload = function() {
            if (xhr.status !== 200 || !isOn()) return;
            try {
                var r = JSON.parse(xhr.responseText);
                if (r[0] !== 'SUCCESS') return;
                var seen = {}; seen[ourResult] = true;
                var items = [ourResult];
                for (var i = 0; i < r[1][0][1].length; i++) {
                    if (!seen[r[1][0][1][i]]) {
                        seen[r[1][0][1][i]] = true;
                        items.push(r[1][0][1][i]);
                    }
                }
                renderChips(items);
            } catch(e) {}
        };
        xhr.send();
    }

    function renderChips(items) {
        var h = '';
        for (var j = 0; j < items.length; j++) {
            var ci = j % COLORS.length;
            h += '<span data-ml="' + items[j].replace(/"/g, '&quot;') + '" ' +
                'style="display:inline-block;padding:4px 12px;border-radius:16px;cursor:pointer;font-size:17px;' +
                'font-family:\'Noto Sans Malayalam\',sans-serif;background:' + COLORS[ci] + ';border:1.5px solid ' + BORDER[ci] + ';' +
                'color:' + BORDER[ci] + ';transition:all 0.15s;" ' +
                'onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
                items[j] + '</span>';
        }
        chips.innerHTML = h;

        var els = chips.querySelectorAll('span');
        for (var k = 0; k < els.length; k++) {
            els[k].addEventListener('mousedown', function(e) {
                e.preventDefault();
                var ml = this.getAttribute('data-ml');
                var text = editor.value;
                var before = text.substring(0, editor.selectionStart);
                var m2 = before.match(/([a-zA-Z]+)$/);
                if (!m2) return;
                var start = before.length - m2[0].length;
                editor.value = text.substring(0, start) + ml + text.substring(editor.selectionStart);
                var np = start + ml.length;
                editor.selectionStart = editor.selectionEnd = np;
                chips.innerHTML = ''; lastWord = '';
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.focus();
            });
        }
    }

    editor.addEventListener('input', update);
    editor.addEventListener('keyup', update);
    editor.addEventListener('click', function() { lastWord = ''; update(); });

    // Show on focus too (in case user clicks into editor)
    editor.addEventListener('focus', function() {
        lastWord = '';
        update();
    });

    // Hide when Manglish toggled off
    var mb = document.getElementById('btn-manglish');
    if (mb) mb.addEventListener('click', function() { setTimeout(function() { if (!isOn()) chips.innerHTML = ''; }, 100); });
})();
