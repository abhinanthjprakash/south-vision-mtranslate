/**
 * SOUTH VISION M-Translate — Suggestions in Malayalam Preview
 * Shows Google Input Tools candidates as clickable chips inside the preview box.
 */
(function() {
    var editor = document.getElementById('editor');
    var previewBox = document.getElementById('malayalam-preview-box');
    if (!editor || !previewBox) return;

    // Create suggestions container inside the preview box
    var sugContainer = document.createElement('div');
    sugContainer.id = 'sug-chips';
    sugContainer.style.cssText = 'margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;';
    // Insert after the unicode-preview div
    var unicodePreview = document.getElementById('unicode-preview');
    if (unicodePreview) {
        unicodePreview.parentNode.insertBefore(sugContainer, unicodePreview.nextSibling);
    } else {
        previewBox.appendChild(sugContainer);
    }

    var sugTimer = null;
    var lastFetched = '';

    function getCurrentWord(text, cursorPos) {
        var before = text.substring(0, cursorPos);
        var match = before.match(/([a-zA-Z]+)$/);
        if (!match) return { word: '', start: cursorPos };
        return { word: match[0], start: cursorPos - match[0].length };
    }

    function fetchSuggestions(engWord) {
        if (!engWord || engWord.length < 1 || engWord === lastFetched) return;
        lastFetched = engWord;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://inputtools.google.com/request?text=' +
            encodeURIComponent(engWord) + '&itc=ml-t-i0-und&num=5');
        xhr.onload = function() {
            if (xhr.status !== 200) return;
            try {
                var resp = JSON.parse(xhr.responseText);
                if (resp[0] !== 'SUCCESS') return;
                showChips(resp[1][0][1]);
            } catch(e) {}
        };
        xhr.send();
    }

    function showChips(googleCandidates) {
        // Get current word
        var text = editor.value;
        var cw = getCurrentWord(text, editor.selectionStart);
        if (!cw.word) { sugContainer.innerHTML = ''; return; }

        var ourResult = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(cw.word) : cw.word;
        var items = [];
        var seen = {};

        // Always show our engine result first
        if (!seen[ourResult]) { seen[ourResult] = true; items.push({ ml: ourResult, label: 'Engine' }); }

        // Add Google candidates
        for (var i = 0; i < googleCandidates.length; i++) {
            var gc = googleCandidates[i];
            if (!seen[gc]) { seen[gc] = true; items.push({ ml: gc, label: 'Google' }); }
        }

        var html = '';
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var bg = item.label === 'Google' ? '#fff7ed' : '#eef2ff';
            var border = item.label === 'Google' ? '#ea580c' : '#6366f1';
            var color = item.label === 'Google' ? '#9a3412' : '#3730a3';
            html += '<span class="sug-chip" data-ml="' + item.ml.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;') + '" ' +
                'style="display:inline-block;padding:4px 10px;background:' + bg + ';border:1.5px solid ' + border + ';border-radius:20px;cursor:pointer;font-size:18px;font-family:\'Noto Sans Malayalam\',sans-serif;color:' + color + ';transition:all 0.15s;" ' +
                'onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'" ' +
                '>' + item.ml + '</span>';
        }

        sugContainer.innerHTML = html;

        // Click handlers
        var chips = sugContainer.querySelectorAll('.sug-chip');
        for (var k = 0; k < chips.length; k++) {
            (function(idx, el) {
                el.addEventListener('click', function() {
                    var mlText = this.getAttribute('data-ml');
                    var cursorPos = editor.selectionStart;
                    var text2 = editor.value;
                    var cw2 = getCurrentWord(text2, cursorPos);

                    editor.value = text2.substring(0, cw2.start) + mlText + text2.substring(cursorPos);
                    editor.selectionStart = editor.selectionEnd = cw2.start + mlText.length;
                    sugContainer.innerHTML = '';
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    editor.focus();
                });
            })(k, chips[k]);
        }
    }

    // Listen for input
    editor.addEventListener('input', function() {
        var text = this.value;
        var cw = getCurrentWord(text, this.selectionStart);

        if (cw.word.length >= 1 && /[a-zA-Z]/.test(cw.word)) {
            clearTimeout(sugTimer);
            sugTimer = setTimeout(function() { fetchSuggestions(cw.word); }, 250);
        } else {
            sugContainer.innerHTML = '';
            lastFetched = '';
        }
    });
})();
