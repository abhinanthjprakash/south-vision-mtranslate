/**
 * SOUTH VISION M-Translate — Suggestions Dropdown
 * Fetches candidates from Google Input Tools API as the user types
 * and shows them in a clickable dropdown below the editor.
 */
(function() {
    var editor = document.getElementById('editor');
    if (!editor) return;

    // Create dropdown at body level to avoid overflow:hidden clipping
    var sugBox = document.createElement('div');
    sugBox.className = 'sug-dropdown';
    sugBox.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:2px solid #6366f1;border-top:none;border-radius:0 0 8px 8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 24px rgba(0,0,0,0.12);';
    document.body.appendChild(sugBox);

    var sugTimer = null;
    var activeIdx = -1;

    function positionDropdown() {
        var rect = editor.getBoundingClientRect();
        sugBox.style.left = rect.left + 'px';
        sugBox.style.top = (rect.top + rect.height) + 'px';
        sugBox.style.width = rect.width + 'px';
        sugBox.style.minWidth = '300px';
    }

    function getCurrentWord(text, cursorPos) {
        var before = text.substring(0, cursorPos);
        var match = before.match(/([a-zA-Z]+)$/);
        if (!match) return { word: '', start: cursorPos };
        return { word: match[0], start: cursorPos - match[0].length };
    }

    function fetchSuggestions(engWord) {
        if (!engWord || engWord.length < 1) { hideSuggestions(); return; }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://inputtools.google.com/request?text=' +
            encodeURIComponent(engWord) + '&itc=ml-t-i0-und&num=5');
        xhr.onload = function() {
            if (xhr.status !== 200) return;
            try {
                var resp = JSON.parse(xhr.responseText);
                if (resp[0] !== 'SUCCESS') return;
                var candidates = resp[1][0][1];
                showSuggestions(engWord, candidates);
            } catch(e) { hideSuggestions(); }
        };
        xhr.onerror = function() { hideSuggestions(); };
        xhr.send();
    }

    function showSuggestions(engWord, googleCandidates) {
        var ourResult = (typeof Manglish !== 'undefined') ? Manglish.toUnicode(engWord) : engWord;
        var allItems = [{ ml: ourResult, source: 'local', label: 'Our Engine' }];

        for (var i = 0; i < googleCandidates.length; i++) {
            if (googleCandidates[i] !== ourResult) {
                allItems.push({ ml: googleCandidates[i], source: 'google', label: 'Google' });
            }
        }

        if (allItems.length === 0) { hideSuggestions(); return; }

        var html = '';
        for (var j = 0; j < allItems.length; j++) {
            var item = allItems[j];
            html += '<div class="sug-item" data-idx="' + j + '" data-ml="' +
                item.ml.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;') + '">' +
                '<span class="ml">' + item.ml + '</span>' +
                '<span class="badge ' + item.source + '">' + item.label + '</span>' +
                '</div>';
        }

        sugBox.innerHTML = html;
        positionDropdown();
        sugBox.classList.add('show');
        activeIdx = -1;

        var items = sugBox.querySelectorAll('.sug-item');
        for (var k = 0; k < items.length; k++) {
            (function(idx, el) {
                el.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    selectSuggestion(idx);
                });
            })(k, items[k]);
        }
    }

    function hideSuggestions() {
        sugBox.classList.remove('show');
        sugBox.innerHTML = '';
        activeIdx = -1;
    }

    function selectSuggestion(idx) {
        var items = sugBox.querySelectorAll('.sug-item');
        if (idx < 0 || idx >= items.length) return;
        var mlText = items[idx].getAttribute('data-ml');

        var cursorPos = editor.selectionStart;
        var text = editor.value;
        var cw = getCurrentWord(text, cursorPos);

        var before = text.substring(0, cw.start);
        var after = text.substring(cursorPos);
        editor.value = before + mlText + after;

        var newPos = cw.start + mlText.length;
        editor.selectionStart = editor.selectionEnd = newPos;

        hideSuggestions();
        // Trigger input event so Manglish/app counters update
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.focus();
    }

    function updateActive() {
        var items = sugBox.querySelectorAll('.sug-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('active', i === activeIdx);
        }
        if (activeIdx >= 0 && items[activeIdx]) {
            items[activeIdx].scrollIntoView({ block: 'nearest' });
        }
    }

    // Listen for input on the editor
    editor.addEventListener('input', function() {
        var text = this.value;
        var cw = getCurrentWord(text, this.selectionStart);

        if (cw.word.length >= 1) {
            clearTimeout(sugTimer);
            sugTimer = setTimeout(function() { fetchSuggestions(cw.word); }, 200);
        } else {
            hideSuggestions();
        }
    });

    // Keyboard navigation
    editor.addEventListener('keydown', function(e) {
        if (!sugBox.classList.contains('show')) return;

        var items = sugBox.querySelectorAll('.sug-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIdx = Math.min(activeIdx + 1, items.length - 1);
            updateActive();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIdx = Math.max(activeIdx - 1, -1);
            updateActive();
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            selectSuggestion(activeIdx);
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Hide on blur
    editor.addEventListener('blur', function() {
        setTimeout(hideSuggestions, 200);
    });
})();
