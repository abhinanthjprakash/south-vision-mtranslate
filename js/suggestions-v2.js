/**
 * SOUTH VISION M-Translate — Inline word suggestions
 * Shows each word's conversion in small font inside the Malayalam Preview,
 * plus Google alternatives as clickable chips for correction.
 */
(function() {
    var editor = document.getElementById('editor');
    var previewBox = document.getElementById('malayalam-preview-box');
    var unicodePreview = document.getElementById('unicode-preview');
    if (!editor || !previewBox || !unicodePreview) return;

    // Create word-suggestions container after the unicode preview
    var wordSug = document.createElement('div');
    wordSug.id = 'word-suggestions';
    wordSug.style.cssText = 'margin-top:8px;font-size:14px;color:#64748b;line-height:2;';
    unicodePreview.parentNode.insertBefore(wordSug, unicodePreview.nextSibling);

    var sugTimer = null;

    function getWords(text) {
        return text.split(/(\s+|[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_])/);
    }

    function processWords() {
        var text = editor.value;
        if (!text) { wordSug.innerHTML = ''; return; }

        var words = getWords(text);
        var html = '';
        var wordIdx = 0;

        for (var i = 0; i < words.length; i++) {
            var w = words[i];
            if (!w || /^\s+$/.test(w) || /^[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_]+$/.test(w)) {
                html += w;
            } else if (/[a-zA-Z]/.test(w) && !/[ഀ-ൿ]/.test(w)) {
                // Latin word - show its conversion
                var converted = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(w) : w;
                var escaped = w.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += '<span style="display:inline-block;margin:0 2px;" title="' + escaped + '">' +
                    '<span style="font-size:13px;color:#16a34a;font-weight:600;font-family:\'Noto Sans Malayalam\',sans-serif;cursor:pointer;padding:1px 4px;border-radius:3px;" ' +
                    'data-word="' + escaped + '" data-idx="' + wordIdx + '" ' +
                    'onmouseover="this.style.background=\'#dcfce7\'" onmouseout="this.style.background=\'transparent\'" ' +
                    '>' + converted + '</span></span>';
                wordIdx++;
            } else {
                // Already Malayalam or other - show as-is
                html += w;
            }
        }

        wordSug.innerHTML = html;
        if (wordIdx === 0) wordSug.innerHTML = '';

        // Click handlers
        var spans = wordSug.querySelectorAll('[data-word]');
        for (var k = 0; k < spans.length; k++) {
            (function(el) {
                el.addEventListener('click', function() {
                    var engWord = this.getAttribute('data-word');
                    showCorrectionPopup(engWord, this);
                });
            })(spans[k]);
        }
    }

    function showCorrectionPopup(engWord, anchorEl) {
        // Remove existing popup
        var existing = document.getElementById('correction-popup');
        if (existing) existing.remove();
        if (document.getElementById('correction-popup')) return; // double-click guard

        var popup = document.createElement('div');
        popup.id = 'correction-popup';
        popup.style.cssText = 'position:absolute;z-index:9999;background:#fff;border:1px solid #dadce0;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.15);padding:8px 0;min-width:180px;font-family:\'Noto Sans Malayalam\',sans-serif;';

        // Position near the anchor
        var rect = anchorEl.getBoundingClientRect();
        popup.style.left = rect.left + 'px';
        popup.style.top = (rect.bottom + 4) + 'px';

        // Fetch from Google
        var ourResult = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(engWord) : engWord;
        var items = [{ ml: ourResult }];
        popup.innerHTML = '<div style="padding:6px 12px;font-size:11px;color:#94a3b8;">Choose correct spelling:</div>';

        // Show our result immediately
        renderPopupItems(popup, items, engWord);

        document.body.appendChild(popup);

        // Fetch Google suggestions
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://inputtools.google.com/request?text=' +
            encodeURIComponent(engWord) + '&itc=ml-t-i0-und&num=5');
        xhr.onload = function() {
            if (xhr.status !== 200) return;
            try {
                var resp = JSON.parse(xhr.responseText);
                if (resp[0] !== 'SUCCESS') return;
                var seen = {};
                seen[ourResult] = true;
                var allItems = [{ ml: ourResult }];
                for (var i = 0; i < resp[1][0][1].length; i++) {
                    var gc = resp[1][0][1][i];
                    if (!seen[gc]) { seen[gc] = true; allItems.push({ ml: gc }); }
                }
                renderPopupItems(popup, allItems, engWord);
            } catch(e) {}
        };
        xhr.send();

        // Close on outside click
        setTimeout(function() {
            document.addEventListener('click', function closePopup(e) {
                if (!popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('click', closePopup);
                }
            });
        }, 100);
    }

    function renderPopupItems(popup, items, engWord) {
        var html = '<div style="padding:6px 12px;font-size:11px;color:#94a3b8;">Choose correct spelling:</div>';
        for (var j = 0; j < items.length; j++) {
            html += '<div class="corr-item" data-ml="' + items[j].ml.replace(/"/g, '&quot;') + '" ' +
                'style="padding:10px 16px;cursor:pointer;font-size:20px;transition:background 0.1s;" ' +
                'onmouseover="this.style.background=\'#f1f3f4\'" onmouseout="this.style.background=\'transparent\'">' +
                items[j].ml + '</div>';
        }
        popup.innerHTML = html;

        var items2 = popup.querySelectorAll('.corr-item');
        for (var k = 0; k < items2.length; k++) {
            (function(el) {
                el.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    var mlText = this.getAttribute('data-ml');
                    // Replace the English word in editor
                    var text = editor.value;
                    var regex = new RegExp('\\b' + engWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
                    editor.value = text.replace(regex, mlText);
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    editor.focus();
                    popup.remove();
                });
            })(items2[k]);
        }
    }

    // Process words on each input
    editor.addEventListener('input', function() {
        clearTimeout(sugTimer);
        sugTimer = setTimeout(processWords, 300);
    });

    // Initial
    setTimeout(processWords, 500);
})();
