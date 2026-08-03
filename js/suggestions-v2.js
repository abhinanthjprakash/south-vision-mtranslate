/**
 * Word-by-word suggestions in the yellow Malayalam Preview box.
 * Each word's conversion is shown as a clickable item.
 * Click a word to see Google alternatives and correct it.
 * Only active when Manglish mode is ON.
 */
(function() {
    var editor = document.getElementById('editor');
    var unicodePreview = document.getElementById('unicode-preview');
    if (!editor || !unicodePreview) return;

    var wordSug = document.createElement('div');
    wordSug.id = 'word-suggestions';
    wordSug.style.cssText = 'margin-top:10px;padding-top:8px;border-top:1px dashed #e2e8f0;font-size:13px;color:#64748b;line-height:2.2;';
    unicodePreview.parentNode.insertBefore(wordSug, unicodePreview.nextSibling);

    var sugTimer = null;

    function isManglishOn() {
        return (typeof App !== 'undefined' && App.manglishMode);
    }

    function updateSuggestions() {
        if (!isManglishOn()) { wordSug.innerHTML = ''; return; }

        var text = editor.value;
        if (!text.trim()) { wordSug.innerHTML = ''; return; }

        var parts = text.split(/(\s+|[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_])/);
        var html = '';
        var engWords = [];

        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (p && /[a-zA-Z]/.test(p) && !/^\s+$/.test(p) && !/^[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=|~`\-_]+$/.test(p)) {
                var converted = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(p) : p;
                var idx = engWords.length;
                engWords.push({ eng: p, ml: converted });
                html += '<span class="ws-word" data-idx="' + idx + '" data-eng="' + p.replace(/"/g, '&quot;') + '" ' +
                    'style="display:inline-block;cursor:pointer;padding:1px 5px;margin:1px;border-radius:4px;font-family:\'Noto Sans Malayalam\',sans-serif;font-size:16px;color:#1e293b;border-bottom:1.5px dashed #cbd5e1;transition:all 0.15s;" ' +
                    'onmouseover="this.style.background=\'#fef3c7\';this.style.borderColor=\'#eab308\'" ' +
                    'onmouseout="this.style.background=\'transparent\';this.style.borderColor=\'#cbd5e1\'" ' +
                    'title="Click to see alternatives for &quot;' + p + '&quot;">' +
                    converted + '</span>';
            } else if (p) {
                html += '<span style="font-family:\'Noto Sans Malayalam\',sans-serif;font-size:16px;">' + p + '</span>';
            }
        }

        wordSug.innerHTML = html;

        // Store engWords for popup use
        wordSug._engWords = engWords;

        // Click handlers
        var spans = wordSug.querySelectorAll('.ws-word');
        for (var k = 0; k < spans.length; k++) {
            (function(el) {
                el.addEventListener('click', function(e) {
                    var engWord = this.getAttribute('data-eng');
                    showPopup(engWord, this);
                    e.stopPropagation();
                });
            })(spans[k]);
        }
    }

    function showPopup(engWord, anchorEl) {
        var existing = document.getElementById('corr-pop');
        if (existing) existing.remove();

        var popup = document.createElement('div');
        popup.id = 'corr-pop';
        popup.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #dadce0;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.15);padding:4px 0;min-width:150px;max-height:220px;overflow-y:auto;font-family:\'Noto Sans Malayalam\',sans-serif;';

        var rect = anchorEl.getBoundingClientRect();
        popup.style.left = rect.left + 'px';
        popup.style.top = (rect.bottom + 4) + 'px';

        var ourResult = Manglish.toUnicode(engWord);
        var items = [ourResult];
        renderPopup(popup, items, engWord);
        document.body.appendChild(popup);

        // Fetch Google alternatives
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://inputtools.google.com/request?text=' + encodeURIComponent(engWord) + '&itc=ml-t-i0-und&num=5');
        xhr.onload = function() {
            if (xhr.status !== 200) return;
            try {
                var resp = JSON.parse(xhr.responseText);
                if (resp[0] !== 'SUCCESS') return;
                var seen = {}; seen[ourResult] = true;
                var all = [ourResult];
                for (var i = 0; i < resp[1][0][1].length; i++) {
                    if (!seen[resp[1][0][1][i]]) { seen[resp[1][0][1][i]] = true; all.push(resp[1][0][1][i]); }
                }
                renderPopup(popup, all, engWord);
            } catch(e) {}
        };
        xhr.send();

        setTimeout(function() {
            document.addEventListener('click', function close(e) {
                if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', close); }
            });
        }, 100);
    }

    function renderPopup(popup, items, engWord) {
        var html = '';
        for (var j = 0; j < items.length; j++) {
            html += '<div style="padding:10px 16px;cursor:pointer;font-size:20px;" ' +
                'data-ml="' + items[j].replace(/"/g, '&quot;') + '" ' +
                'onmouseover="this.style.background=\'#f1f3f4\'" onmouseout="this.style.background=\'transparent\'">' +
                items[j] + '</div>';
        }
        popup.innerHTML = html;

        var els = popup.querySelectorAll('div[data-ml]');
        for (var k = 0; k < els.length; k++) {
            els[k].addEventListener('mousedown', function(e) {
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
        }
    }

    // Listen for input
    editor.addEventListener('input', function() {
        clearTimeout(sugTimer);
        sugTimer = setTimeout(updateSuggestions, 300);
    });

    // Initial
    setTimeout(updateSuggestions, 500);
})();
