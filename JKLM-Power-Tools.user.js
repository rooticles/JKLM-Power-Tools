// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      14.3
// @description  Advanced JKLM Power Tools - Ultimate Edition (v14.3)
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

(function () {
    'use strict';

    const SCRIPT_VERSION = '14.3';
    let activeFilter = 'All';

    // --- 1. Global Stability Patches ---
    const patchGlobalBugs = () => {
        try {
            const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            
            win.addEventListener('error', (event) => {
                const msg = event.message || '';
                const ignoredErrors = ['addEventListener', 'milestones', 'socket', 'undefined', 'null', 'PartyPlus', 'overlay.js', 'falcon.jklm.fun'];
                if (ignoredErrors.some(err => msg.includes(err))) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            }, true);

            if (win.navigator.serviceWorker) {
                win.navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                win.navigator.serviceWorker.register = () => new Promise(() => {});
            }

            if (typeof win.chatUnreadHighlightCount === 'undefined') win.chatUnreadHighlightCount = 0;

            const resumeAudio = () => {
                const triggerResume = () => {
                    const audioCtxs = [win.audioContext, win.AudioContext, win.webkitAudioContext, win.room?.audioContext];
                    audioCtxs.forEach(ctx => { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); });
                };
                ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => win.addEventListener(evt, triggerResume, { once: true, capture: true }));
            };
            resumeAudio();

            const createRecursiveProxy = (name = 'root') => {
                const noop = () => {};
                const handler = {
                    get: (target, prop) => {
                        if (prop === 'then' || prop === 'toJSON' || typeof prop === 'symbol') return undefined;
                        const methods = ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'dispatchEvent', 'setMilestone', 'trigger', 'dispatch', 'join', 'leave', 'send', 'connect', 'disconnect'];
                        return methods.includes(prop) ? noop : createRecursiveProxy(`${name}.${prop.toString()}`);
                    },
                    apply: () => createRecursiveProxy(`${name}()`)
                };
                return new Proxy(noop, handler);
            };

            if (win.Object && typeof win.Object.prototype.milestones === 'undefined') {
                let _globalMilestones = win.milestones || createRecursiveProxy('milestones');
                Object.defineProperty(win.Object.prototype, 'milestones', {
                    get: function() { return _globalMilestones; },
                    set: function(val) { if (this === win) _globalMilestones = val; else this._milestones = val; },
                    configurable: true
                });
            }

            const safeProxy = (name) => {
                let _val = win[name] || createRecursiveProxy(name);
                Object.defineProperty(win, name, {
                    get: () => _val,
                    set: (val) => { 
                        if (val && typeof val === 'object') {
                            ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone'].forEach(m => { if (typeof val[m] === 'undefined') val[m] = () => {}; });
                            _val = val; 
                        }
                    },
                    configurable: true
                });
            };
            ['milestones', 'game', 'socket', 'room', 'client', 'roomProxy'].forEach(safeProxy);

            const patchPrototypes = () => {
                ['Socket', 'Emitter', 'EventEmitter', 'Room', 'Client'].forEach(objName => {
                    const Proto = win[objName] && win[objName].prototype;
                    if (Proto) ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone', 'trigger'].forEach(m => { if (typeof Proto[m] === 'undefined') Proto[m] = () => {}; });
                });
            };
            patchPrototypes();
            setTimeout(patchPrototypes, 500);
            setTimeout(patchPrototypes, 5000);
        } catch (e) { console.warn('[JKLM Power Tools] Stability patch failed:', e); }
    };

    // --- 2. Storage & Configuration ---
    const Config = {
        get: (key, def) => GM_getValue(key, def),
        set: (key, val) => GM_setValue(key, val),
        getEnabled: () => GM_getValue('spaceToHyphenEnabled', false),
        setEnabled: (val) => GM_setValue('spaceToHyphenEnabled', val),
        getChatEnabled: () => GM_getValue('spaceToHyphenChatEnabled', false),
        setChatEnabled: (val) => GM_setValue('spaceToHyphenChatEnabled', val),
        getDictLanguage: () => GM_getValue('dictLanguage', 'English'),
        setDictLanguage: (val) => GM_setValue('dictLanguage', val),
        getSearchMode: () => GM_getValue('dictSearchMode', 'Contains'),
        setSearchMode: (val) => GM_setValue('dictSearchMode', val),
        getWordType: () => GM_getValue('dictWordType', 'All'),
        setWordType: (val) => GM_setValue('dictWordType', val),
        getCustomDictionary: () => GM_getValue('customDictionary', []),
        setCustomDictionary: (val) => GM_setValue('customDictionary', val),
        getSidebarWidth: () => GM_getValue('sidebarWidth', 650),
        setSidebarWidth: (val) => GM_setValue('sidebarWidth', val),
        getThemeColor: () => GM_getValue('themeColor', '#00d2ff'),
        setThemeColor: (val) => GM_setValue('themeColor', val),
        getBorderRadius: () => GM_getValue('borderRadius', 16),
        setBorderRadius: (val) => GM_setValue('borderRadius', val),
        getClockEnabled: () => GM_getValue('clockEnabled', true),
        setClockEnabled: (val) => GM_setValue('clockEnabled', val),
        getAnimationType: () => GM_getValue('animationType', 'slideIn'),
        setAnimationType: (val) => GM_setValue('animationType', val),
        getSearchHistory: () => GM_getValue('searchHistory', []),
        setSearchHistory: (val) => GM_setValue('searchHistory', val),
        getNotes: () => GM_getValue('notes', []),
        setNotes: (val) => GM_setValue('notes', val),
        getToggleKey: () => GM_getValue('toggleKey', 'F2'),
        setToggleKey: (val) => GM_setValue('toggleKey', val),
        getPanelPosition: () => GM_getValue('panelPosition', 'right'),
        setPanelPosition: (val) => GM_setValue('panelPosition', val),
        getMinWordLength: () => GM_getValue('minWordLength', 2),
        setMinWordLength: (val) => GM_setValue('minWordLength', val),
        getMaxWordLength: () => GM_getValue('maxWordLength', 30),
        setMaxWordLength: (val) => GM_setValue('maxWordLength', val)
    };

    const translations = {
        'English': {
            kbHeader: '🚀 Keyboard Settings',
            toggleLabel: 'Spacebar to Hyphen (Game)',
            chatToggleLabel: 'Spacebar to Hyphen (Chat)',
            onDesc: 'Enabled: Spacebar will automatically be converted to a hyphen during rounds.',
            offDesc: 'Disabled: Spacebar functions normally.',
            chatDesc: 'Enabled: Your spacebar in chat sends a hyphen instead.',
            chatOffDesc: 'Disabled: Chat behaves as usual.',
            closeInfo: 'This script optimizes your JKLM experience. <br><br>You can close this menu at any time with the <strong>ESC key</strong>.',
            dictHeader: '📖 Word Search & Dictionary',
            msgLabel: 'Write message',
            msgPlaceholder: 'Type letters...',
            msgSend: 'Send',
            dictResultPrefix: 'Found {count} matching words:',
            dictNoResults: 'No words found.',
            dictSearchModeLabel: 'Search Mode:',
            dictWordTypeLabel: 'Word Category:',
            dictSelectLabel: 'Language Selection:',
            historyHeader: '📜 History',
            historyEmpty: 'No words searched in this round yet.',
            adminHeader: '⚙️ Design & System',
            adminVisualHeader: '🎨 Visual Design',
            adminThemeLabel: 'Accent Color:',
            adminSidebarWidthLabel: 'Panel Width (pixels):',
            adminMinLabel: 'Minimum: 180.',
            adminGlassLabel: 'Transparency:',
            adminRadiusLabel: 'Corner Softness:',
            adminClockLabel: 'System Clock',
            adminAnimLabel: 'Open Animation:',
            dictCustomUpload: 'Custom Dictionary',
            dictUploadDesc: 'Upload a .txt file or paste words manually:',
            dictUploadBtn: 'Save Words',
            dictPlaceholder: 'Word 1\nWord 2\nWord 3...',
            dictFoundWords: '{count} words found:',
            dictNoResultsShort: 'No results.',
            english: 'English',
            notesHeader: '📌 Strategy Notes',
            notesDesc: 'Manage your thoughts and strategies.',
            addNote: 'Add Note',
            notePlaceholder: 'Your note here...',
            saveNote: 'Save',
            noNotes: 'No notes available yet.',
            toggleKeyLabel: 'Panel Fast-Access (Key)',
            ideaBy: 'Idea by'
        }
    };

    // --- 3. Dictionary & Lobby Logic ---
    let dictionary = [];
    let lowercasedDictionary = [];
    let dictionaryLoaded = false;
    let currentDictLang = '';
    const dictionaryUrls = { 'English': 'https://raw.githubusercontent.com/tt-46ben/overlay-wordlist/121bf1a601ed822553c2e68c38a4cdcd7737d352/words.txt' };

    const loadDictionary = async (force = false) => {
        const lang = Config.getDictLanguage();
        if (dictionaryLoaded && currentDictLang === lang && !force) return;
        if (lang === 'Custom') {
            dictionary = Config.getCustomDictionary();
            lowercasedDictionary = dictionary.map(w => w.toLowerCase());
            dictionaryLoaded = true; currentDictLang = lang; return;
        }
        try {
            const res = await fetch(dictionaryUrls[lang] || dictionaryUrls['English']);
            if (!res.ok) throw new Error();
            const text = await res.text();
            dictionary = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
            lowercasedDictionary = dictionary.map(w => w.toLowerCase());
            dictionaryLoaded = true; currentDictLang = lang;
        } catch (e) {
            dictionary = ["ERASEMENT", "BIZARRENESSES", "PROMINENT"];
            lowercasedDictionary = dictionary.map(w => w.toLowerCase());
            dictionaryLoaded = true; currentDictLang = lang;
        }
    };

    const filterLobbies = (filter) => {
        activeFilter = filter;
        const rooms = document.querySelectorAll('.publicRooms .entry');
        if (!rooms.length) return;
        
        rooms.forEach(room => {
            if (activeFilter === 'All') { 
                room.style.display = 'flex'; 
                return; 
            }
            
            // Search in room text for language (e.g., "(English)") or game type
            const text = room.innerText.toLowerCase();
            const filterLower = activeFilter.toLowerCase();
            
            // Special handling for English/EN, German/DE etc.
            const matches = text.includes(`(${filterLower})`) || text.includes(`[${filterLower}]`) || text.includes(filterLower);
            
            room.style.display = matches ? 'flex' : 'none';
        });
    };

    const initHomepageFilters = () => {
        const publicRooms = document.querySelector('.publicRooms');
        if (!publicRooms) return;
        
        // Always re-apply current filter to rooms
        filterLobbies(activeFilter);

        if (document.getElementById('pt-filter-row')) return;
        
        const filterRow = document.createElement('div');
        filterRow.id = 'pt-filter-row'; filterRow.className = 'pt-filter-row';
        ['All', 'French', 'English', 'Spanish', 'German', 'Italian', 'Portuguese', 'Bombparty', 'Popsauce'].forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'pt-filter-btn' + (f === activeFilter ? ' active' : '');
            btn.innerText = f;
            btn.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.pt-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active'); 
                filterLobbies(f);
            };
            filterRow.appendChild(btn);
        });
        publicRooms.before(filterRow);
    };

    // --- 4. CSS Styles ---
    const injectStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            :root {
                --pt-theme-color: #8A2BE2; --pt-theme-color-rgb: 138, 43, 226;
                --pt-bg-color: #1A1A2E; --pt-bg-rgb: 26, 26, 46;
                --pt-glass-bg: rgba(26, 26, 46, 0.75); --pt-glass-border: rgba(255, 255, 255, 0.1);
                --pt-card-bg: rgba(255, 255, 255, 0.05); --pt-card-border: rgba(255, 255, 255, 0.1);
                --pt-border-radius: 16px; --pt-text-color: #E0E0E0; --pt-text-muted: #A0A0A0;
                --pt-panel-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); --pt-transition: 0.3s ease;
                --pt-font-main: 'Inter', sans-serif; --pt-font-mono: 'Fira Code', monospace;
                --pt-accent-gradient: linear-gradient(135deg, var(--pt-theme-color), #FF69B4);
                --pt-glow-effect: 0 0 20px rgba(var(--pt-theme-color-rgb), 0.4);
            }
            .custom-kb-page::-webkit-scrollbar, .custom-dict-page::-webkit-scrollbar, .custom-admin-page::-webkit-scrollbar { width: 8px; }
            .custom-kb-page::-webkit-scrollbar-thumb, .custom-dict-page::-webkit-scrollbar-thumb, .custom-admin-page::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            .custom-nav-row { display: flex; align-items: center; justify-content: flex-end; background: transparent; height: 40px; width: 100%; position: relative; z-index: 10001; gap: 15px; padding: 0 25px; box-sizing: border-box; margin-top: -5px; }
            .panel-nav { display: flex; align-items: center; height: 80px; margin: -20px -20px 20px -20px; padding: 0 24px; width: calc(100% + 40px); position: sticky; top: -20px; z-index: 100; background: rgba(27, 31, 59, 0.4); backdrop-filter: blur(16px); border-bottom: 1px solid var(--pt-glass-border); }
            .panel-title { font-weight: 700; font-size: 22px; color: var(--pt-text-color); display: flex; align-items: center; gap: 20px; flex: 1; }
            .custom-tab-group { display: flex; background: rgba(255, 255, 255, 0.05); padding: 5px; border-radius: 14px; border: 1px solid var(--pt-glass-border); gap: 5px; }
            .custom-tab { display: flex; align-items: center; justify-content: center; cursor: pointer; width: 40px; height: 40px; border-radius: 10px; font-size: 18px; transition: var(--pt-transition); color: var(--pt-text-muted); }
            .custom-tab.active { color: white; background: var(--pt-theme-color); box-shadow: 0 0 20px rgba(var(--pt-theme-color-rgb), 0.5); transform: scale(1.1); }
            .custom-kb-page, .custom-dict-page, .custom-admin-page { display: none; padding: 20px; background: rgba(26, 26, 46, 0.95); backdrop-filter: blur(16px); height: 100vh; width: 650px; position: fixed; top: 0; z-index: 9999; font-family: var(--pt-font-main); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); border-radius: var(--pt-border-radius); text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9); }
            .custom-kb-page.pos-left, .custom-dict-page.pos-left, .custom-admin-page.pos-left { left: 0; }
            .custom-kb-page.pos-right, .custom-dict-page.pos-right, .custom-admin-page.pos-right { right: 0; }
            .custom-kb-page.active, .custom-dict-page.active, .custom-admin-page.active { display: block; animation: fadeInGlass 0.5s ease-out; }
            .feature-card { background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--pt-border-radius); padding: 24px; margin-bottom: 20px; transition: var(--pt-transition); position: relative; overflow: hidden; }
            .feature-header { font-weight: 700; font-size: 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px; }
            .feature-icon { width: 38px; height: 38px; background: rgba(var(--pt-theme-color-rgb), 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--pt-theme-color); }
            .modern-input { width: 100%; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; padding: 14px 20px; border-radius: var(--pt-border-radius); outline: none; transition: var(--pt-transition); }
            .modern-button { background: var(--pt-accent-gradient); color: #1B1F3B; border: none; padding: 14px 28px; border-radius: var(--pt-border-radius); cursor: pointer; font-weight: 700; transition: var(--pt-transition); display: flex; align-items: center; justify-content: center; gap: 10px; }
            .settings-row { padding: 16px 20px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: var(--pt-transition); }
            .toggle-switch { width: 50px; height: 28px; background: rgba(255, 255, 255, 0.1); border-radius: 50px; position: relative; transition: var(--pt-transition); }
            .toggle-switch.on { background: var(--pt-theme-color); }
            .toggle-knob { width: 22px; height: 22px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: var(--pt-transition); }
            .toggle-switch.on .toggle-knob { left: 24px; }
            .clickable-word { display: inline-block; padding: 8px 16px; margin: 4px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; cursor: pointer; font-weight: 700; transition: var(--pt-transition); }
            .custom-clock { font-family: var(--pt-font-mono); font-size: 14px; font-weight: 600; color: var(--pt-theme-color); background: rgba(var(--pt-theme-color-rgb), 0.1); padding: 6px 14px; border-radius: 10px; }
            .note-item { background: rgba(0, 0, 0, 0.5); border-radius: 12px; padding: 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
            .pt-filter-row { 
                display: flex !important; 
                flex-wrap: wrap !important; 
                gap: 5px !important; 
                margin: 20px auto !important; 
                padding: 10px !important; 
                justify-content: flex-start !important; 
                max-width: 1400px !important; 
                background: transparent !important; 
                border: none !important;
                box-shadow: none !important;
            }
            .pt-filter-btn { 
                background-color: #26aa36 !important; 
                color: #ffffff !important; 
                border: none !important; 
                padding: 6px 16px !important; 
                border-radius: 20px !important; 
                font-weight: 700 !important; 
                font-size: 14px !important;
                cursor: pointer !important; 
                text-transform: capitalize !important;
                white-space: nowrap !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                appearance: none !important;
                outline: none !important;
                box-shadow: none !important;
            }
            .pt-filter-btn.active { 
                background-color: #ffffff !important; 
                color: #26aa36 !important; 
                border: 2px solid #26aa36 !important;
            }
            /* Fix JKLM lobby container flow */
            .publicRooms {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                gap: 15px !important;
                width: 100% !important;
                max-width: 1400px !important;
                margin: 0 auto !important;
            }
            .publicRooms .entry {
                margin: 0 !important; /* Remove JKLM default margins to prevent gaps */
                flex: 0 1 auto !important;
            }
            @keyframes fadeInGlass { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInPanelRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            @keyframes slideInPanelLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(style);
    };

    const updateThemeStyles = () => {
        const themeColor = Config.getThemeColor();
        const themeRgb = themeColor.match(/[A-Za-z0-9]{2}/g).map(x => parseInt(x, 16)).join(',');
        const pos = Config.getPanelPosition();
        const anim = Config.getAnimationType();

        document.documentElement.style.setProperty('--pt-theme-color', themeColor);
        document.documentElement.style.setProperty('--pt-theme-color-rgb', themeRgb);
        document.documentElement.style.setProperty('--pt-border-radius', `${Config.getBorderRadius()}px`);

        document.querySelectorAll('.custom-kb-page, .custom-dict-page, .custom-admin-page').forEach(p => {
            p.classList.remove('pos-left', 'pos-right'); p.classList.add(`pos-${pos}`);
            const animName = anim === 'slideIn' ? `slideInPanel${pos.charAt(0).toUpperCase() + pos.slice(1)}` : anim;
            p.style.animation = `${animName} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
        });
    };

    // --- 5. UI Components & Initialization ---
    let isInitialized = false, lastSyllable = '', isGameRunning = false;

    const init = () => {
        initHomepageFilters();
        if (isInitialized) return;
        const nav = document.querySelector('.navigation, .tabs, .room .bottom, .room .navigation');
        if (!nav) return;
        isInitialized = true; patchGlobalBugs(); injectStyles();

        let customRow = document.getElementById('custom-nav-row') || document.createElement('div');
        customRow.id = 'custom-nav-row'; customRow.className = 'custom-nav-row'; nav.after(customRow);

        const createTab = (id, icon) => { const t = document.createElement('div'); t.className = 'custom-tab'; t.id = id; t.innerHTML = icon; return t; };
        const catTab = createTab('cat-btn', '🚀'), dictTab = createTab('dict-btn', '📖'), adminTab = createTab('admin-btn', '⚙️');
        [catTab, dictTab, adminTab].forEach(t => customRow.appendChild(t));

        const clock = document.createElement('div'); clock.id = 'custom-clock'; clock.className = 'custom-clock'; customRow.appendChild(clock);
        const updateClock = () => {
            const now = new Date(), time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            clock.innerText = Config.getClockEnabled() ? time : '';
            document.querySelectorAll('.panel-clock').forEach(el => el.innerText = time);
        };
        setInterval(updateClock, 1000); updateClock();

        const kbPage = document.createElement('div'), dictPage = document.createElement('div'), adminPage = document.createElement('div');
        kbPage.className = 'custom-kb-page'; dictPage.className = 'custom-dict-page'; adminPage.className = 'custom-admin-page';
        [kbPage, dictPage, adminPage].forEach(p => document.body.appendChild(p));

        const getPanelNav = (activeId, title) => `
            <div class="panel-nav">
                <div class="panel-title">
                    <span>${title}</span>
                    <div class="custom-tab-group">
                        <div class="custom-tab ${activeId === 'cat-btn' ? 'active' : ''}" data-target="cat-btn">🚀</div>
                        <div class="custom-tab ${activeId === 'dict-btn' ? 'active' : ''}" data-target="dict-btn">📖</div>
                        <div class="custom-tab ${activeId === 'admin-btn' ? 'active' : ''}" data-target="admin-btn">⚙️</div>
                    </div>
                </div>
                <div class="custom-clock panel-clock"></div>
                <div class="custom-close-x panel-close" style="cursor:pointer; margin-left:15px;">✕</div>
            </div>`;

        const updateKb = () => {
            const t = translations['English'], enabled = Config.getEnabled(), chat = Config.getChatEnabled();
            kbPage.innerHTML = `${getPanelNav('cat-btn', t.kbHeader)}
                <div class="feature-card">
                    <div class="feature-header"><span>${t.kbHeader}</span></div>
                    <div class="settings-row" id="toggle-space-hyphen"><div><span>${t.toggleLabel}</span></div><div class="toggle-switch ${enabled ? 'on' : ''}"><div class="toggle-knob"></div></div></div>
                    <div class="settings-row" id="toggle-chat-hyphen"><div><span>${t.chatToggleLabel}</span></div><div class="toggle-switch ${chat ? 'on' : ''}"><div class="toggle-knob"></div></div></div>
                </div>`;
        };

        const updateDict = () => {
            const t = translations['English'], history = Config.getSearchHistory(), notes = Config.getNotes();
            dictPage.innerHTML = `${getPanelNav('dict-btn', t.dictHeader)}
                <div style="padding:15px;">
                    <div class="feature-card">
                        <input type="text" class="modern-input" id="dict-input" placeholder="${t.msgPlaceholder}">
                        <div id="dict-results" style="margin-top:15px;"></div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-header"><span>${t.notesHeader}</span></div>
                        <div style="display:flex; gap:10px;"><input type="text" id="note-input" class="modern-input"><button id="add-note" class="modern-button">+</button></div>
                        <div id="notes-list" style="margin-top:15px;">${notes.map((n, i) => `<div class="note-item"><span>${n.content}</span><button class="del-note" data-idx="${i}">✕</button></div>`).join('')}</div>
                    </div>
                </div>`;
        };

        const updateAdmin = () => {
            const t = translations['English'], color = Config.getThemeColor(), pos = Config.getPanelPosition();
            adminPage.innerHTML = `${getPanelNav('admin-btn', t.adminHeader)}
                <div class="feature-card">
                    <div class="settings-row"><span>Accent Color</span><input type="color" id="theme-picker" value="${color}"></div>
                    <div class="settings-row"><span>Panel Position</span><select id="pos-select" class="modern-input"><option value="left" ${pos === 'left' ? 'selected' : ''}>Left</option><option value="right" ${pos === 'right' ? 'selected' : ''}>Right</option></select></div>
                </div>`;
        };

        [updateKb, updateDict, updateAdmin].forEach(u => u()); updateThemeStyles();

        const togglePage = (tab, page) => {
            const active = page.classList.contains('active');
            [catTab, dictTab, adminTab].forEach(t => t.classList.remove('active'));
            [kbPage, dictPage, adminPage].forEach(p => p.classList.remove('active'));
            if (!active) { tab.classList.add('active'); page.classList.add('active'); }
        };

        catTab.onclick = (e) => { e.stopPropagation(); togglePage(catTab, kbPage); };
        dictTab.onclick = (e) => { e.stopPropagation(); togglePage(dictTab, dictPage); loadDictionary(); };
        adminTab.onclick = (e) => { e.stopPropagation(); togglePage(adminTab, adminPage); };

        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.panel-close')) { 
                e.stopPropagation();
                [catTab, dictTab, adminTab].forEach(t => t.classList.remove('active')); 
                [kbPage, dictPage, adminPage].forEach(p => p.classList.remove('active')); 
                return;
            }
            
            const tabInNav = e.target.closest('.custom-tab[data-target]');
            if (tabInNav) {
                const targetId = tabInNav.getAttribute('data-target');
                if (targetId === 'cat-btn') catTab.click();
                if (targetId === 'dict-btn') dictTab.click();
                if (targetId === 'admin-btn') adminTab.click();
                return;
            }

            if (e.target.closest('#toggle-space-hyphen')) { 
                Config.setEnabled(!Config.getEnabled()); 
                updateKb(); 
            }
            if (e.target.closest('#toggle-chat-hyphen')) { 
                Config.setChatEnabled(!Config.getChatEnabled()); 
                updateKb(); 
            }
            if (e.target.closest('#add-note')) { 
                const inp = document.getElementById('note-input'), n = Config.getNotes(); 
                if (inp.value) { n.unshift({ content: inp.value }); Config.setNotes(n); inp.value = ''; updateDict(); } 
            }
            if (e.target.classList.contains('del-note')) { 
                const n = Config.getNotes(); 
                n.splice(e.target.dataset.idx, 1); 
                Config.setNotes(n); 
                updateDict(); 
            }
        }, true);

        document.body.oninput = (e) => {
            if (e.target.id === 'theme-picker') { Config.setThemeColor(e.target.value); updateThemeStyles(); }
            if (e.target.id === 'pos-select') { Config.setPanelPosition(e.target.value); updateThemeStyles(); }
            if (e.target.id === 'dict-input') {
                const syl = e.target.value.toLowerCase(), res = document.getElementById('dict-results');
                if (syl.length < 2) { res.innerHTML = ''; return; }
                const words = dictionary.filter(w => w.toLowerCase().includes(syl)).slice(0, 20);
                res.innerHTML = words.map(w => `<span class="clickable-word" onclick="navigator.clipboard.writeText('${w}')">${w}</span>`).join('');
            }
        };

        const observer = new MutationObserver((mutations) => {
            initHomepageFilters();
            
            // Check if rooms were added/updated and re-apply filter
            const roomsUpdated = mutations.some(m => m.target.classList?.contains('publicRooms') || m.target.closest?.('.publicRooms'));
            if (roomsUpdated) {
                filterLobbies(activeFilter);
            }

            const syl = document.querySelector('.syllable')?.innerText.trim().toLowerCase();
            if (syl && syl !== lastSyllable) {
                lastSyllable = syl;
                if (dictPage.classList.contains('active')) { document.getElementById('dict-input').value = syl; document.getElementById('dict-input').dispatchEvent(new Event('input')); }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === Config.getToggleKey()) {
            const p = document.querySelector('.custom-admin-page');
            if (p) p.classList.contains('active') ? p.classList.remove('active') : p.classList.add('active');
        }
        if (e.code === 'Space' && (Config.getEnabled() || Config.getChatEnabled())) {
            const el = document.activeElement;
            if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                const isChat = el.closest('.chat') || el.id === 'dict-input';
                if ((isChat && Config.getChatEnabled()) || (!isChat && Config.getEnabled() && document.querySelector('.selfTurn'))) {
                    e.preventDefault(); document.execCommand('insertText', false, '-');
                }
            }
        }
    }, true);

    const checkInit = new MutationObserver(() => { if (document.querySelector('.navigation, .publicRooms')) init(); });
    checkInit.observe(document.documentElement, { childList: true, subtree: true });
    init(); setTimeout(init, 1000); setTimeout(init, 3000);
})();
