/**
 * Simple Google suggestions below the Malayalam preview text.
 * Only active when Manglish is ON.
 */
(function() {
    var editor = document.getElementById('editor');
    var unicodePreview = document.getElementById('unicode-preview');
    if (!editor || !unicodePreview) return;

    var chips = document.createElement('div');
    chips.id = 'google-chips';
    chips.style.cssText = 'margin-top:6px;display:flex;flex-wrap:wrap;gap:5px;';
    unicodePreview.parentNode.insertBefore(chips, unicodePreview.nextSibling);

    var timer = null, lastWord = '';

    function isOn() { return typeof App !== 'undefined' && App.manglishMode; }

    function getCurrentWord() {
        var before = editor.value.substring(0, editor.selectionStart);
        var m = before.match(/([a-zA-Z]+)$/);
        return m ? m[0] : '';
    }

    function fetchGoogle(word) {
        if (!word || word === lastWord || word.length < 1) return;
        lastWord = word;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://inputtools.google.com/request?text=' + encodeURIComponent(word) + '&itc=ml-t-i0-und&num=4');
        xhr.onload = function() {
            if (xhr.status !== 200 || !isOn()) return;
            try {
                var r = JSON.parse(xhr.responseText);
                if (r[0] !== 'SUCCESS') return;
                var our = Manglish.toUnicode(word);
                showChips(word, our, r[1][0][1]);
            } catch(e) {}
        };
        xhr.send();
    }

    function showChips(word, ourResult, googleList) {
        if (!isOn()) { chips.innerHTML = ''; return; }
        var seen = {}, items = [];
        if (!seen[ourResult]) { seen[ourResult] = true; items.push(ourResult); }
        for (var i = 0; i < googleList.length; i++) {
            if (!seen[googleList[i]]) { seen[googleList[i]] = true; items.push(googleList[i]); }
        }
        var h = '';
        for (var j = 0; j < items.length; j++) {
            h += '<span data-ml="' + items[j].replace(/"/g, '&quot;') + '" ' +
                'style="display:inline-block;padding:3px 10px;background:#fff;border:1px solid #d4d4d8;border-radius:14px;cursor:pointer;font-size:17px;font-family:\'Noto Sans Malayalam\',sans-serif;' +
                (j === 0 ? 'border-color:#6366f1;background:#eef2ff;' : '') + '" ' +
                'onmouseover="this.style.borderColor=\'#6366f1\'" onmouseout="this.style.borderColor=\'' + (j === 0 ? '#6366f1' : '#d4d4d8') + '\'">' +
                items[j] + '</span>';
        }
        chips.innerHTML = h;
        var els = chips.querySelectorAll('span');
        for (var k = 0; k < els.length; k++) {
            els[k].addEventListener('mousedown', function(e) {
                e.preventDefault();
                var ml = this.getAttribute('data-ml');
                var before = editor.value.substring(0, editor.selectionStart);
                var m = before.match(/([a-zA-Z]+)$/);
                if (!m) return;
                var start = before.length - m[0].length;
                editor.value = editor.value.substring(0, start) + ml + editor.value.substring(editor.selectionStart);
                editor.selectionStart = editor.selectionEnd = start + ml.length;
                chips.innerHTML = ''; lastWord = '';
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.focus();
            });
        }
    }

    editor.addEventListener('input', function() {
        if (!isOn()) { chips.innerHTML = ''; return; }
        clearTimeout(timer);
        var w = getCurrentWord();
        timer = setTimeout(function() {
            if (w && /[a-zA-Z]/.test(w)) fetchGoogle(w); else { chips.innerHTML = ''; lastWord = ''; }
        }, 300);
    });

    // Watch for Manglish toggle via the button
    var manglishBtn = document.getElementById('btn-manglish');
    if (manglishBtn) {
        manglishBtn.addEventListener('click', function() {
            setTimeout(function() { if (!isOn()) chips.innerHTML = ''; }, 50);
        });
    }
})();
