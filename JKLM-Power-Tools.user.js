// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      13.4
// @description  Advanced JKLM Power Tools - Ultimate Edition (v13.4)
// @author       Root
// @icon         https://static.wikia.nocookie.net/studio-ghibli/images/7/73/Jiji.png/revision/latest?cb=20210221161230
// @updateURL    https://raw.githubusercontent.com/rooticles/JKLM-Power-Tools/main/JKLM-Power-Tools.user.js
// @downloadURL  https://raw.githubusercontent.com/rooticles/JKLM-Power-Tools/main/JKLM-Power-Tools.user.js
// @match        *://*.jklm.fun/*
// @match        *://jklm.fun/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const SCRIPT_VERSION = '13.4';
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // --- 1. CORE STABILITY & PROTECTION ---
    const initStability = () => {
        const originalError = win.console.error;
        win.console.error = function(...args) {
            const msg = args[0] ? args[0].toString() : '';
            if (msg.includes('addEventListener') || msg.includes('milestones') || msg.includes('socket')) return;
            originalError.apply(win.console, args);
        };
        if (typeof win.chatUnreadHighlightCount === 'undefined') win.chatUnreadHighlightCount = 0;
        if (typeof win.milestones === 'undefined') win.milestones = { on: () => {}, off: () => {}, emit: () => {} };
        const resumeAudio = () => {
            const audioCtx = win.audioContext || (win.room && win.room.audioContext);
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
        };
        ['click', 'keydown', 'touchstart'].forEach(type => win.addEventListener(type, resumeAudio, { once: true, capture: true }));
        const patchGlobals = () => {
            const safeObj = { on: () => {}, off: () => {}, emit: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
            ['socket', 'room', 'game'].forEach(prop => { if (typeof win[prop] === 'undefined') win[prop] = safeObj; });
        };
        patchGlobals();
        setInterval(patchGlobals, 5000);
    };

    // --- 2. CONFIGURATION & STORAGE ---
    const Config = {
        get: (key, def) => GM_getValue(key, def),
        set: (key, val) => GM_setValue(key, val)
    };

    // --- 3. DICTIONARY ENGINE ---
    const Dictionary = {
        words: [], lowercased: [], isLoaded: false, currentLang: '',
        urls: { 'English': 'https://raw.githubusercontent.com/tt-46ben/overlay-wordlist/121bf1a601ed822553c2e68c38a4cdcd7737d352/words.txt' },
        load: async (force = false) => {
            const lang = Config.get('dictLanguage', 'English');
            if (Dictionary.isLoaded && Dictionary.currentLang === lang && !force) return;
            try {
                const url = Dictionary.urls[lang] || Dictionary.urls['English'];
                const response = await fetch(url);
                const text = await response.text();
                Dictionary.words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
                Dictionary.lowercased = Dictionary.words.map(w => w.toLowerCase());
                Dictionary.isLoaded = true; Dictionary.currentLang = lang;
                console.log(`[Power Tools] Loaded ${Dictionary.words.length} words (${lang})`);
            } catch (err) { console.error('[Power Tools] Dictionary Load Error:', err); }
        },
        findMatches: (syllable) => {
            if (!syllable) return [];
            const s = syllable.toLowerCase();
            const min = Config.get('minWordLength', 2), max = Config.get('maxWordLength', 30);
            return Dictionary.words.filter((w, i) => {
                const lw = Dictionary.lowercased[i];
                return lw.includes(s) && w.length >= min && w.length <= max;
            }).sort((a, b) => b.length - a.length).slice(0, 20);
        }
    };

    // --- 4. UI & STYLES ---
    const injectStyles = () => {
        const style = document.createElement('style');
        style.id = 'pt-styles';
        style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
            --pt-theme-color: ${Config.get('themeColor', '#8A2BE2')};
            --pt-theme-color-rgb: 138, 43, 226;
            --pt-bg-color: #1A1A2E;
            --pt-glass-border: rgba(255, 255, 255, 0.1);
            --pt-border-radius: ${Config.get('borderRadius', 16)}px;
            --pt-text-color: #E0E0E0;
            --pt-accent-gradient: linear-gradient(135deg, var(--pt-theme-color), #FF69B4);
        }
        .custom-nav-row { display: flex; align-items: center; justify-content: center; background: transparent; height: 60px; width: 100%; border-bottom: none; gap: 15px; z-index: 10001; position: relative; padding: 0 25px; box-sizing: border-box; }
        .custom-tab { cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 20px; color: #A0A0A0; transition: 0.3s; }
        .custom-tab:hover { transform: scale(1.1); color: white; }
        .custom-tab.active { color: white; text-shadow: 0 0 10px var(--pt-theme-color); }
        .pt-panel { display: none; position: fixed; top: 0; right: 0; width: 650px; height: 100vh; background: rgba(26, 26, 46, 0.95); backdrop-filter: blur(16px); color: white; padding: 25px; z-index: 9999; box-shadow: -10px 0 30px rgba(0,0,0,0.5); font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; overflow-y: auto; }
        .pt-panel.active { display: block; }
        .panel-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid var(--pt-glass-border); position: sticky; top: 0; background: inherit; z-index: 10; }
        .panel-title { font-weight: 800; font-size: 24px; letter-spacing: -1px; }
        .feature-card { background: rgba(255,255,255,0.05); border: 1px solid var(--pt-glass-border); border-radius: var(--pt-border-radius); padding: 24px; margin-bottom: 20px; transition: 0.3s; }
        .feature-card:hover { transform: translateY(-2px); border-color: var(--pt-theme-color); }
        .modern-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 14px; border-radius: 12px; outline: none; margin-bottom: 15px; font-family: inherit; font-size: 15px; box-sizing: border-box; }
        .modern-input:focus { border-color: var(--pt-theme-color); box-shadow: 0 0 10px rgba(var(--pt-theme-color-rgb), 0.3); }
        .pt-word { display: inline-block; padding: 10px 16px; margin: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.2s; font-size: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .pt-word:hover { background: var(--pt-theme-color); transform: translateY(-3px); box-shadow: 0 5px 15px rgba(var(--pt-theme-color-rgb), 0.4); color: white; }
        .custom-clock { font-family: monospace; font-size: 14px; color: var(--pt-theme-color); background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 10px; border: 1px solid rgba(var(--pt-theme-color-rgb), 0.2); }
        .modern-button { background: var(--pt-accent-gradient); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; transition: 0.3s; width: 100%; }
        .modern-button:hover { transform: scale(1.02); filter: brightness(1.1); }
        `;
        document.documentElement.appendChild(style);
    };

    // --- 5. APP LOGIC ---
    const App = {
        init: () => {
            initStability(); injectStyles();
            const nav = document.querySelector('.navigation') || document.body;
            const navRow = document.createElement('div');
            navRow.className = 'custom-nav-row';
            
            const tabs = [{id:'kb', e:'🚀', t:'Power Tools'}, {id:'dict', e:'📖', t:'Dictionary'}, {id:'admin', e:'⚙️', t:'Settings'}];
            tabs.forEach(t => {
                const btn = document.createElement('div');
                btn.className = 'custom-tab';
                btn.innerHTML = t.e; btn.title = t.t;
                btn.onclick = () => App.toggle(t.id);
                navRow.appendChild(btn);
            });

            const clock = document.createElement('div');
            clock.className = 'custom-clock';
            setInterval(() => { clock.innerText = new Date().toLocaleTimeString(); }, 1000);
            navRow.appendChild(clock);
            nav.after(navRow);

            ['kb', 'dict', 'admin'].forEach(id => {
                const p = document.createElement('div');
                p.className = 'pt-panel'; p.id = `pt-panel-${id}`;
                App.renderPanel(id, p); document.body.appendChild(p);
            });
            Dictionary.load(); App.setupEvents();
        },

        renderPanel: (id, p) => {
            const title = id === 'kb' ? 'POWER TOOLS' : id === 'dict' ? 'DICTIONARY' : 'SETTINGS';
            p.innerHTML = `
                <div class="panel-nav">
                    <div class="panel-title">${title}</div>
                    <div style="cursor:pointer; font-size:24px" onclick="this.closest('.pt-panel').classList.remove('active')">✕</div>
                </div>
                <div class="panel-content"></div>
            `;
            const content = p.querySelector('.panel-content');
            if (id === 'dict') {
                content.innerHTML = `
                    <div class="feature-card">
                        <div style="font-weight:700; margin-bottom:10px">Word Search</div>
                        <input type="text" class="modern-input" placeholder="Enter syllable..." id="dict-search">
                        <div style="font-size:12px; color:#A0A0A0; margin-bottom:15px">Top 20 matches found in current dictionary:</div>
                        <div id="dict-results" style="display:flex; flex-wrap:wrap; justify-content:center"></div>
                    </div>
                    <div class="feature-card">
                        <div style="font-weight:700; margin-bottom:10px">Word Length</div>
                        <div style="display:flex; gap:10px; align-items:center">
                            <input type="number" id="min-len" class="modern-input" value="${Config.get('minWordLength', 2)}" style="margin-bottom:0; width:80px">
                            <span>to</span>
                            <input type="number" id="max-len" class="modern-input" value="${Config.get('maxWordLength', 30)}" style="margin-bottom:0; width:80px">
                        </div>
                    </div>
                `;
                const search = content.querySelector('#dict-search'), results = content.querySelector('#dict-results');
                const minInput = content.querySelector('#min-len'), maxInput = content.querySelector('#max-len');
                
                const performSearch = () => {
                    const matches = Dictionary.findMatches(search.value);
                    results.innerHTML = matches.map(w => `<span class="pt-word">${w}</span>`).join('');
                    results.querySelectorAll('.pt-word').forEach(w => w.onclick = () => {
                        navigator.clipboard.writeText(w.innerText);
                        const orig = w.style.background; w.style.background = 'var(--pt-theme-color)';
                        setTimeout(() => w.style.background = orig, 500);
                    });
                };
                search.oninput = performSearch;
                minInput.onchange = (e) => { Config.set('minWordLength', parseInt(e.target.value)); performSearch(); };
                maxInput.onchange = (e) => { Config.set('maxWordLength', parseInt(e.target.value)); performSearch(); };
            } else if (id === 'kb') {
                content.innerHTML = `
                    <div class="feature-card">
                        <div style="font-weight:700; margin-bottom:15px">Keyboard Automations</div>
                        <div style="display:flex; flex-direction:column; gap:15px">
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer">
                                <input type="checkbox" id="set-hyphen" ${Config.get('spaceToHyphenEnabled', false)?'checked':''}>
                                <span>Space to Hyphen (Game)</span>
                            </label>
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer">
                                <input type="checkbox" id="set-chat" ${Config.get('spaceToHyphenChatEnabled', false)?'checked':''}>
                                <span>Space to Hyphen (Chat)</span>
                            </label>
                        </div>
                    </div>
                    <div class="feature-card">
                        <div style="font-weight:700; margin-bottom:10px">GG Macro</div>
                        <div style="font-size:13px; color:#A0A0A0; line-height:1.5">Press <b>F1</b> in-game to instantly type "GG" into the chat.</div>
                    </div>
                `;
                content.querySelector('#set-hyphen').onchange = (e) => Config.set('spaceToHyphenEnabled', e.target.checked);
                content.querySelector('#set-chat').onchange = (e) => Config.set('spaceToHyphenChatEnabled', e.target.checked);
            } else if (id === 'admin') {
                content.innerHTML = `
                    <div class="feature-card">
                        <div style="font-weight:700; margin-bottom:15px">Appearance</div>
                        <p style="font-size:14px; margin-bottom:8px">Accent Color:</p>
                        <input type="color" class="modern-input" value="${Config.get('themeColor', '#8A2BE2')}" id="set-color" style="height:50px; padding:5px">
                        <p style="font-size:14px; margin-top:20px; margin-bottom:8px">Border Radius: <span id="radius-val">${Config.get('borderRadius', 16)}px</span></p>
                        <input type="range" min="0" max="40" value="${Config.get('borderRadius', 16)}" id="set-radius" style="width:100%; accent-color:var(--pt-theme-color)">
                    </div>
                    <div style="text-align:center; opacity:0.3; font-size:11px; letter-spacing:1px; margin-top:40px">
                        JKLM POWER TOOLS ULTIMATE EDITION V${SCRIPT_VERSION}
                    </div>
                `;
                const cp = content.querySelector('#set-color'), rs = content.querySelector('#set-radius'), rv = content.querySelector('#radius-val');
                cp.oninput = (e) => {
                    Config.set('themeColor', e.target.value);
                    document.documentElement.style.setProperty('--pt-theme-color', e.target.value);
                };
                rs.oninput = (e) => {
                    const val = e.target.value; rv.innerText = val + 'px';
                    Config.set('borderRadius', val);
                    document.documentElement.style.setProperty('--pt-border-radius', val + 'px');
                };
            }
        },

        toggle: (id) => {
            const p = document.getElementById(`pt-panel-${id}`);
            const isActive = p.classList.contains('active');
            document.querySelectorAll('.pt-panel').forEach(p => p.classList.remove('active'));
            if (!isActive) p.classList.add('active');
        },

        setupEvents: () => {
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    const active = document.activeElement;
                    const isChat = active.closest('.chat') || active.placeholder?.toLowerCase().includes('chat');
                    const isSelfTurn = !!document.querySelector('.selfTurn');
                    if ((isChat && Config.get('spaceToHyphenChatEnabled')) || (!isChat && Config.get('spaceToHyphenEnabled') && isSelfTurn)) {
                        e.preventDefault(); const start = active.selectionStart;
                        active.value = active.value.slice(0, start) + '-' + active.value.slice(active.selectionEnd);
                        active.selectionStart = active.selectionEnd = start + 1;
                        active.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } else if (e.key === 'F1') {
                    const chatInput = document.querySelector('.chat input') || document.querySelector('input[placeholder*="chat"]');
                    if (chatInput) { chatInput.value = 'GG'; chatInput.dispatchEvent(new Event('input', { bubbles: true })); }
                }
            }, true);
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init);
    else App.init();
})();
