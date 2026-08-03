/**
 * SOUTH VISION M-Translate — Google-style suggestions dropdown
 */
(function() {
    var editor = document.getElementById('editor');
    if (!editor) return;

    // Create dropdown at body level (avoid overflow clipping)
    var sugBox = document.createElement('div');
    sugBox.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #dadce0;border-radius:0 0 8px 8px;max-height:220px;overflow-y:auto;display:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:\'Noto Sans Malayalam\',sans-serif;';
    document.body.appendChild(sugBox);

    var sugTimer = null;
    var lastFetched = '';

    function getCurrentWord(text, cursorPos) {
        var before = text.substring(0, cursorPos);
        var match = before.match(/([a-zA-Z]+)$/);
        if (!match) return { word: '', start: cursorPos };
        return { word: match[0], start: cursorPos - match[0].length };
    }

    function positionDropdown() {
        var rect = editor.getBoundingClientRect();
        sugBox.style.left = rect.left + 'px';
        sugBox.style.top = (rect.top + rect.height) + 'px';
        sugBox.style.width = rect.width + 'px';
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
                showDropdown(engWord, resp[1][0][1]);
            } catch(e) {}
        };
        xhr.send();
    }

    function showDropdown(engWord, googleCandidates) {
        var ourResult = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(engWord) : engWord;
        var items = [];
        var seen = {};

        // Our engine first, then Google candidates (deduped)
        if (!seen[ourResult]) { seen[ourResult] = true; items.push(ourResult); }
        for (var i = 0; i < googleCandidates.length; i++) {
            if (!seen[googleCandidates[i]]) { seen[googleCandidates[i]] = true; items.push(googleCandidates[i]); }
        }

        if (items.length === 0) { sugBox.style.display = 'none'; return; }

        var html = '';
        for (var j = 0; j < items.length; j++) {
            html += '<div class="sg-item" data-ml="' + items[j].replace(/"/g, '&quot;').replace(/&/g, '&amp;') + '" ' +
                'style="padding:10px 16px;cursor:pointer;font-size:20px;border-bottom:1px solid #f1f3f4;transition:background 0.1s;" ' +
                'onmouseover="this.style.background=\'#f1f3f4\'" onmouseout="this.style.background=\'transparent\'">' +
                items[j] + '</div>';
        }

        sugBox.innerHTML = html;
        positionDropdown();
        sugBox.style.display = 'block';

        // Click handlers
        var els = sugBox.querySelectorAll('.sg-item');
        for (var k = 0; k < els.length; k++) {
            (function(el) {
                el.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    var mlText = this.getAttribute('data-ml');
                    var cursorPos = editor.selectionStart;
                    var text = editor.value;
                    var cw = getCurrentWord(text, cursorPos);

                    editor.value = text.substring(0, cw.start) + mlText + text.substring(cursorPos);
                    editor.selectionStart = editor.selectionEnd = cw.start + mlText.length;
                    sugBox.style.display = 'none';
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    editor.focus();
                });
            })(els[k]);
        }
    }

    function hideDropdown() {
        sugBox.style.display = 'none';
        lastFetched = '';
    }

    // Input handler
    editor.addEventListener('input', function() {
        var text = this.value;
        var cw = getCurrentWord(text, this.selectionStart);
        if (cw.word.length >= 1 && /[a-zA-Z]/.test(cw.word)) {
            clearTimeout(sugTimer);
            sugTimer = setTimeout(function() { fetchSuggestions(cw.word); }, 200);
        } else {
            hideDropdown();
        }
    });

    // Blur hides
    editor.addEventListener('blur', function() { setTimeout(hideDropdown, 200); });

    // Reposition on scroll/resize
    window.addEventListener('scroll', function() { if (sugBox.style.display === 'block') positionDropdown(); }, true);
    window.addEventListener('resize', function() { if (sugBox.style.display === 'block') positionDropdown(); });
})();
