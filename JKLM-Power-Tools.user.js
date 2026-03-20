// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      12.7
// @description  Advanced JKLM Power Tools - Ultimate Edition (v12.7)
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

    /**
     * JKLM Power Tools - Ultimate Edition (v12.5)
     * Created by Root
     */

    const SCRIPT_VERSION = '12.7';
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // --- 1. CORE STABILITY & PROTECTION ---

    const initStability = () => {
        // Suppress specific JKLM errors
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
            } catch (err) { console.error(err); }
        }
    };

    // --- 4. UI & STYLES ---

    const injectStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
        :root { --theme-color: #8A2BE2; --bg-color: #1A1A2E; --text-color: #E0E0E0; }
        .custom-nav-row { display: flex; align-items: center; justify-content: center; background: transparent; height: 60px; width: 100%; border-bottom: none; gap: 15px; }
        .custom-tab { cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 18px; color: #A0A0A0; }
        .custom-tab.active { color: white; }
        .custom-kb-page, .custom-dict-page, .custom-admin-page { display: none; position: fixed; top: 0; right: 0; width: 650px; height: 100vh; background: rgba(26, 26, 46, 0.95); backdrop-filter: blur(16px); color: white; padding: 20px; z-index: 9999; }
        .custom-kb-page.active, .custom-dict-page.active, .custom-admin-page.active { display: block; }
        `;
        document.documentElement.appendChild(style);
    };

    const App = {
        init: () => {
            initStability(); injectStyles();
            const nav = document.querySelector('.navigation') || document.body;
            const navRow = document.createElement('div');
            navRow.className = 'custom-nav-row';
            ['🚀', '📖', '⚙️'].forEach((emoji, i) => {
                const btn = document.createElement('div');
                btn.className = 'custom-tab';
                btn.innerHTML = emoji;
                btn.onclick = () => {
                    document.querySelectorAll('.custom-kb-page, .custom-dict-page, .custom-admin-page').forEach(p => p.classList.remove('active'));
                    const pages = ['.custom-kb-page', '.custom-dict-page', '.custom-admin-page'];
                    document.querySelector(pages[i]).classList.add('active');
                };
                navRow.appendChild(btn);
            });
            nav.after(navRow);

            ['kb', 'dict', 'admin'].forEach(type => {
                const p = document.createElement('div');
                p.className = `custom-${type}-page`;
                p.innerHTML = `<h2>${type.toUpperCase()} Panel</h2><button onclick="this.parentElement.classList.remove('active')">Close</button>`;
                document.body.appendChild(p);
            });

            Dictionary.load();
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init);
    else App.init();
})();
