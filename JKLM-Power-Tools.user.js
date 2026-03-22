// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      17.9
// @description  Advanced JKLM Power Tools - Ultimate Edition (v17.9)
// @author       Root
// @icon         https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTJbeFZgV0zcGPsl6DlZo3cGrxKIEsWPIcJw&s
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

    const patchGlobalBugs = () => {
        try {
            const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            const ignoreError = (msg) => ['addEventListener', 'milestones', 'socket', 'undefined', 'null', 'PartyPlus', 'overlay.js', 'falcon.jklm.fun', 'setMilestone'].some(err => msg.includes(err));
            win.addEventListener('error', (event) => { if (ignoreError(event.message || '')) { event.stopImmediatePropagation(); event.preventDefault(); } }, true);
            win.addEventListener('unhandledrejection', (event) => { if (ignoreError(event.reason?.message || event.reason?.toString() || '')) { event.stopImmediatePropagation(); event.preventDefault(); } }, true);
            if (win.navigator.serviceWorker) { win.navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())); win.navigator.serviceWorker.register = () => new Promise(() => {}); }
            if (typeof win.chatUnreadHighlightCount === 'undefined') win.chatUnreadHighlightCount = 0;
            const resumeAudio = () => {
                const tr = () => [win.audioContext, win.AudioContext, win.webkitAudioContext, win.room?.audioContext].forEach(c => { if (c && c.state === 'suspended') c.resume().catch(() => {}); });
                ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => win.addEventListener(evt, tr, { once: true, capture: true }));
            };
            resumeAudio();
            const createProxy = (n = 'root') => new Proxy(() => {}, { get: (t, p) => (p === 'then' || p === 'toJSON' || typeof p === 'symbol') ? undefined : ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'dispatchEvent', 'setMilestone', 'trigger', 'dispatch', 'join', 'leave', 'send', 'connect', 'disconnect'].includes(p) ? () => {} : createProxy(`${n}.${p.toString()}`), apply: () => createProxy(`${n}()`) });
            if (win.Object && typeof win.Object.prototype.milestones === 'undefined') {
                let _m = win.milestones || createProxy('milestones');
                Object.defineProperty(win.Object.prototype, 'milestones', { get: function() { return _m; }, set: function(v) { if (this === win) _m = v; else this._m = v; }, configurable: true });
            }
            const sp = (n) => {
                let _v = win[n] || createProxy(n);
                Object.defineProperty(win, n, { get: () => _v, set: (v) => { if (v && typeof v === 'object') { ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone'].forEach(m => { if (typeof v[m] === 'undefined') v[m] = () => {}; }); _v = v; } }, configurable: true });
            };
            ['milestones', 'game', 'socket', 'room', 'client', 'roomProxy'].forEach(sp);
            const pp = () => ['Socket', 'Emitter', 'EventEmitter', 'Room', 'Client'].forEach(on => { const Pr = win[on] && win[on].prototype; if (Pr) { ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone', 'trigger'].forEach(m => { if (!Pr[m]) Pr[m] = function() { return this; }; }); const os = Pr.setMilestone; Pr.setMilestone = function(...a) { try { if (os) return os.apply(this, a); } catch (e) {} return this; }; } });
            pp(); setTimeout(pp, 500); setTimeout(pp, 2000); setTimeout(pp, 5000);
        } catch (e) {}
    };
    patchGlobalBugs();

    const SCRIPT_VERSION = '17.9';
    const FISH_KEYWORDS = ['fish', 'shark', 'trout', 'salmon', 'bass', 'tuna', 'mackerel', 'cod', 'eel', 'carp', 'pike', 'perch', 'snapper', 'grouper', 'marlin', 'swordfish', 'stingray', 'ray', 'flounder', 'halibut', 'sole', 'mullet', 'sardine', 'anchovy', 'herring', 'barracuda', 'piranha', 'tilapia', 'catfish', 'guppy', 'goldfish', 'clownfish', 'angelfish', 'betta', 'tetra', 'molly', 'platy', 'danio', 'loach', 'discus', 'gourami', 'oscar', 'cichlid', 'sturgeon', 'gar', 'bowfin', 'lungfish', 'lamprey', 'hagfish', 'coelacanth', 'mahimahi', 'wahoo', 'walleye', 'muskellunge', 'bluegill', 'crappie', 'sunfish', 'shad', 'minnow', 'dace', 'roach', 'tench', 'bream', 'chub', 'barbel', 'grayling', 'char', 'whitefish', 'smelt', 'capelin', 'hake', 'pollock', 'haddock', 'whiting', 'ling', 'burbot', 'angler', 'monkfish', 'batfish', 'frogfish', 'needlefish', 'flyingfish', 'seahorse', 'pipefish', 'stickleback', 'sculpin', 'lionfish', 'rockfish', 'tilefish', 'remora', 'jack', 'pompano', 'dorado', 'porgy', 'drum', 'croaker', 'surmullet', 'goatfish', 'archerfish', 'leaffish', 'snakehead', 'turbot', 'plaice', 'dab', 'puffer', 'boxfish', 'triggerfish', 'filefish', 'albacore', 'alewife', 'alfonsino', 'amberjack', 'anemonefish', 'arapaima', 'arowana', 'ayu', 'bangus', 'barracudina', 'barramundi', 'bichir', 'bitterling', 'bleak', 'blenny', 'blobfish', 'blowfish', 'boga', 'bonefish', 'bonito', 'bonytail', 'brill', 'brotula', 'candiru', 'catalufa', 'catla', 'cisco', 'cobia', 'coley', 'cornetfish', 'cusk', 'damselfish', 'dartfish', 'dealfish', 'dhufish', 'dory', 'dottyback', 'dragonet', 'driftfish', 'escolar', 'eulachon', 'fangtooth', 'fierasfer', 'flier', 'garibaldi', 'goldeye', 'grunion', 'grunt', 'grunter', 'gudgeon', 'halosaur', 'hamlet', 'hoki', 'huchen', 'hussar', 'icefish', 'ide', 'ilish', 'inanga', 'inconnu', 'kahawai', 'kaluga', 'kokanee', 'kokopu', 'ladyfish', 'lenok', 'limia', 'louvar', 'luderick', 'lumpsucker', 'mahseer', 'medaka', 'menhaden', 'mojarra', 'mola', 'monchong', 'mooneye', 'moonfish', 'mora', 'morwong', 'mrigal', 'mummichog', 'nase', 'notothen', 'oarfish', 'oldwife', 'opah', 'opaleye', 'orfe', 'panga', 'parore', 'peamouth', 'pearleye', 'pleco', 'poacher', 'pomfret', 'powen', 'quillback', 'quillfish', 'rasbora', 'rohu', 'ronquil', 'roosterfish', 'ruffe', 'sabertooth', 'sablefish', 'scat', 'scup', 'shiner', 'sillago', 'skate', 'skilfish', 'sleeper', 'slickhead', 'slimehead', 'snook', 'sprat', 'squeaker', 'stargazer', 'steelhead', 'stonecat', 'sucker', 'tailor', 'taimen', 'tang', 'tarpon', 'tarwhine', 'tenpounder', 'thornfish', 'threadfin', 'tope', 'torpedo', 'trahira', 'treefish', 'tripletail', 'trumpeter', 'trunkfish', 'uaru', 'vanjaram', 'vendace', 'vimba', 'walu', 'warmouth', 'whiff', 'wobbegong', 'wrasse', 'zander', 'zingel', "humuhumunukunukuapua'a"];

    const matchCategory = (w, ks) => { const l = w.toLowerCase(); return ks.some(k => l === k || l === k + 's' || l === k + 'es' || (k.endsWith('y') && l === k.slice(0, -1) + 'ies')); };
    const isWordFish = (w) => matchCategory(w, FISH_KEYWORDS);
    const debounce = (f, w) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f.apply(this, a), w); }; };

    const getEnabled = () => GM_getValue('s2hEnabled', false);
    const setEnabled = (v) => GM_setValue('s2hEnabled', v);
    const getChatEnabled = () => GM_getValue('s2hChatEnabled', false);
    const setChatEnabled = (v) => GM_setValue('s2hChatEnabled', v);
    const getSearchMode = () => GM_getValue('dSearchMode', 'Contains');
    const setSearchMode = (v) => GM_setValue('dSearchMode', v);
    const getWordType = () => GM_getValue('dWordType', 'All');
    const setWordType = (v) => GM_setValue('dWordType', v);
    const getThemeColor = () => GM_getValue('themeColor', '#8A2BE2');
    const setThemeColor = (v) => GM_setValue('themeColor', v);
    const getBorderRadius = () => GM_getValue('borderRadius', 16);
    const setBorderRadius = (v) => GM_setValue('borderRadius', v);
    const getClockEnabled = () => GM_getValue('clockEnabled', true);
    const setClockEnabled = (v) => GM_setValue('clockEnabled', v);
    const getSearchHistory = () => GM_getValue('searchHistory', []);
    const setSearchHistory = (v) => GM_setValue('searchHistory', v);
    const getNotes = () => GM_getValue('notes', []);
    const setNotes = (v) => GM_setValue('notes', v);
    const getToggleKey = () => GM_getValue('toggleKey', 'F2');
    const setToggleKey = (v) => GM_setValue('toggleKey', v);
    const getPanelPosition = () => GM_getValue('panelPos', 'right');
    const setPanelPosition = (v) => GM_setValue('panelPos', v);
    const getTabHotkeys = () => GM_getValue('tabHotkeys', false);
    const setTabHotkeys = (v) => GM_setValue('tabHotkeys', v);
    const getOpacityToggleKey = () => GM_getValue('opacityKey', 'Control');
    const setOpacityToggleKey = (v) => GM_setValue('opacityKey', v);
    const getFavorites = () => GM_getValue('favorites', []);
    const setFavorites = (v) => GM_setValue('favorites', v);
    const getOpacity = () => GM_getValue('panelOpacity', 95);
    const setOpacity = (v) => GM_setValue('panelOpacity', v);
    const getCompactMode = () => GM_getValue('compactMode', false);
    const setCompactMode = (v) => GM_setValue('compactMode', v);
    const getFont = () => GM_getValue('panelFont', 'Plus Jakarta Sans');
    const setFont = (v) => GM_setValue('panelFont', v);

    const sendToChat = (m) => { const i = document.querySelector('.chat input, .chat textarea, .chatInput'); if (i) { i.value = m; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); setTimeout(() => i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })), 50); } };

    let dictionary = [], lowerDict = [], dictLoaded = false;
    const loadDictionary = async () => {
        if (dictLoaded) return;
        try {
            const r = await fetch('https://raw.githubusercontent.com/tt-46ben/overlay-wordlist/121bf1a601ed822553c2e68c38a4cdcd7737d352/words.txt');
            if (!r.ok) throw 0;
            const t = await r.text();
            dictionary = t.split('\n').map(w => w.trim()).filter(w => w.length > 0);
            lowerDict = dictionary.map(w => w.toLowerCase());
            dictLoaded = true;
        } catch (e) { dictionary = ["ERASEMENT", "BIZARRENESSES", "PROMINENT"]; lowerDict = dictionary.map(w => w.toLowerCase()); dictLoaded = true; }
    };

    const style = document.createElement('style');
    style.id = 'pt-styles';
    document.head.appendChild(style);

    const updateThemeStyles = () => {
        const c = getThemeColor(), r = getBorderRadius(), op = getOpacity(), cp = getCompactMode(), f = getFont();
        const rgb = c.match(/[A-Za-z0-9]{2}/g).map(x => parseInt(x, 16)).join(',');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Outfit:wght@400;700;800&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;700;800&display=swap');
            :root {
                --pt-theme-color: ${c}; --pt-theme-color-rgb: ${rgb};
                --pt-border-radius: ${r}px; --pt-font-main: '${f}', sans-serif;
                --pt-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .custom-kb-page, .custom-dict-page, .custom-admin-page {
                position: fixed; top: 0; height: 100vh; width: ${cp ? '350px' : '650px'};
                background: rgba(26, 26, 46, ${isOpacityReduced ? 0.2 : op / 100});
                backdrop-filter: blur(${isOpacityReduced ? '2px' : '16px'});
                z-index: 20000; font-family: var(--pt-font-main); color: white;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s ease, background 0.2s ease;
                display: none; padding: 20px; box-sizing: border-box; overflow-y: auto;
            }
            .custom-kb-page.active, .custom-dict-page.active, .custom-admin-page.active { display: block; }
            .pos-right { right: 0; border-left: 1px solid rgba(255,255,255,0.1); }
            .pos-left { left: 0; border-right: 1px solid rgba(255,255,255,0.1); }
            .feature-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--pt-border-radius); padding: 20px; margin-bottom: 15px; transition: var(--pt-transition); }
            .feature-card:hover { transform: translateY(-2px); border-color: var(--pt-theme-color); box-shadow: 0 5px 15px rgba(var(--pt-theme-color-rgb), 0.2); }
            .modern-input { width: 100%; background: #000; border: 2px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 15px; border-radius: 50px; outline: none; transition: 0.2s; font-weight: 700; }
            .modern-input:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.2); }
            .modern-button { background: linear-gradient(135deg, var(--pt-theme-color), #FF69B4); border: none; padding: 10px 20px; border-radius: var(--pt-border-radius); color: #000; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .modern-button:hover { transform: scale(1.05); filter: brightness(1.1); }
            .clickable-word { display: inline-block; padding: 6px 12px; margin: 3px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; }
            .clickable-word:hover { background: var(--pt-theme-color); color: #000; }
            .toggle-switch { width: 44px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 20px; position: relative; cursor: pointer; transition: 0.2s; }
            .toggle-switch.on { background: var(--pt-theme-color); }
            .toggle-knob { width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.2s; }
            .toggle-switch.on .toggle-knob { left: 23px; }
            .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: 10px; cursor: pointer; }
            .settings-row:hover { background: rgba(255,255,255,0.05); }
            .fav-star { cursor: pointer; color: #555; transition: 0.2s; font-size: 16px; margin-left: 5px; }
            .fav-star.active { color: #ffcc00; }
            .panel-nav { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .panel-title { font-weight: 800; font-size: 18px; flex: 1; }
            .custom-tab { cursor: pointer; opacity: 0.5; transition: 0.2s; font-size: 20px; }
            .custom-tab.active { opacity: 1; transform: scale(1.2); }
            .custom-clock { font-size: 12px; font-weight: 800; color: var(--pt-theme-color); }
            .drag-handle { cursor: move; padding: 5px; opacity: 0.5; }
        `;
    };

    let isOpacityReduced = false;
    updateThemeStyles();

    let isInitialized = false;
    const init = () => {
        if (isInitialized) return;
        const nav = document.querySelector('.navigation, .tabs, .room .bottom');
        if (!nav) return;
        isInitialized = true;

        let row = document.createElement('div');
        row.style = 'display: flex; gap: 15px; justify-content: flex-end; padding: 5px 20px; pointer-events: none;';
        nav.after(row);

        const createBtn = (id, icon) => { const b = document.createElement('div'); b.id = id; b.style = 'cursor: pointer; font-size: 20px; pointer-events: auto;'; b.innerHTML = icon; return b; };
        const catBtn = createBtn('cat-btn', '🚀'), dictBtn = createBtn('dict-btn', '📖'), adminBtn = createBtn('admin-btn', '⚙️');
        [catBtn, dictBtn, adminBtn].forEach(b => row.appendChild(b));

        const kbPage = document.createElement('div'), dictPage = document.createElement('div'), adminPage = document.createElement('div');
        kbPage.className = 'custom-kb-page'; dictPage.className = 'custom-dict-page'; adminPage.className = 'custom-admin-page';
        [kbPage, dictPage, adminPage].forEach(p => document.body.appendChild(p));

        const updatePages = () => {
            const pos = getPanelPosition();
            [kbPage, dictPage, adminPage].forEach(p => { p.classList.remove('pos-left', 'pos-right'); p.classList.add(`pos-${pos}`); });
            
            const isEnabled = getEnabled(), isChatEnabled = getChatEnabled(), hotkeys = getTabHotkeys();
            kbPage.innerHTML = `
                <div class="panel-nav"><div class="panel-title">Keyboard</div><div class="panel-close" style="cursor:pointer">✕</div></div>
                <div class="feature-card">
                    <div class="settings-row" onclick="this.querySelector('.toggle-switch').click()"><span>Game Hyphen</span><div class="toggle-switch ${isEnabled?'on':''}" onclick="event.stopPropagation(); window.ptSetEnabled()"><div class="toggle-knob"></div></div></div>
                    <div class="settings-row" onclick="this.querySelector('.toggle-switch').click()"><span>Chat Hyphen</span><div class="toggle-switch ${isChatEnabled?'on':''}" onclick="event.stopPropagation(); window.ptSetChatEnabled()"><div class="toggle-knob"></div></div></div>
                    <div class="settings-row" onclick="this.querySelector('.toggle-switch').click()"><span>Tab Hotkeys</span><div class="toggle-switch ${hotkeys?'on':''}" onclick="event.stopPropagation(); window.ptSetHotkeys()"><div class="toggle-knob"></div></div></div>
                </div>
            `;

            const sm = getSearchMode(), wt = getWordType(), favs = getFavorites();
            dictPage.innerHTML = `
                <div class="panel-nav"><div class="panel-title">Dictionary</div><div class="panel-close" style="cursor:pointer">✕</div></div>
                <div class="feature-card">
                    <input type="text" class="modern-input" id="d-input" placeholder="Search...">
                    <div style="display:flex; gap:10px; margin-top:10px">
                        <select class="modern-input" id="d-sm"><option value="Contains" ${sm==='Contains'?'selected':''}>Contains</option><option value="StartsWith" ${sm==='StartsWith'?'selected':''}>Starts With</option></select>
                        <select class="modern-input" id="d-wt"><option value="All" ${wt==='All'?'selected':''}>All</option><option value="Fish" ${wt==='Fish'?'selected':''}>Fish</option></select>
                    </div>
                </div>
                <div class="feature-card" id="d-results" style="display:none">
                    <div style="font-size:12px; color:var(--pt-theme-color); margin-bottom:10px; font-weight:800">Results</div>
                    <div id="d-list"></div>
                </div>
                <div class="feature-card">
                    <div style="font-size:12px; color:var(--pt-theme-color); margin-bottom:10px; font-weight:800">Favorites</div>
                    <div id="d-favs">${favs.map(f => `<span class="clickable-word">${f}<span class="fav-star active" onclick="window.ptRemFav('${f}')">★</span></span>`).join('')}</div>
                </div>
            `;

            const color = getThemeColor(), radius = getBorderRadius(), op = getOpacity(), cp = getCompactMode(), font = getFont();
            adminPage.innerHTML = `
                <div class="panel-nav"><div class="panel-title">System</div><div class="panel-close" style="cursor:pointer">✕</div></div>
                <div class="feature-card">
                    <div class="settings-row"><span>Color</span><input type="color" id="a-color" value="${color}"></div>
                    <div class="settings-row"><span>Radius</span><input type="range" id="a-radius" min="0" max="30" value="${radius}"></div>
                    <div class="settings-row"><span>Opacity</span><input type="range" id="a-opacity" min="10" max="100" value="${op}"></div>
                    <div class="settings-row"><span>Font</span><select class="modern-input" id="a-font"><option ${font==='Plus Jakarta Sans'?'selected':''}>Plus Jakarta Sans</option><option ${font==='Outfit'?'selected':''}>Outfit</option><option ${font==='Inter'?'selected':''}>Inter</option></select></div>
                    <div class="settings-row" onclick="window.ptSetCompact()"><span>Compact Mode</span><div class="toggle-switch ${cp?'on':''}"><div class="toggle-knob"></div></div></div>
                </div>
            `;
        };

        window.ptSetEnabled = () => { setEnabled(!getEnabled()); updatePages(); };
        window.ptSetChatEnabled = () => { setChatEnabled(!getChatEnabled()); updatePages(); };
        window.ptSetHotkeys = () => { setTabHotkeys(!getTabHotkeys()); updatePages(); };
        window.ptSetCompact = () => { setCompactMode(!getCompactMode()); updateThemeStyles(); updatePages(); };
        window.ptAddFav = (w) => { const f = getFavorites(); if (!f.includes(w)) { f.push(w); setFavorites(f); updatePages(); } };
        window.ptRemFav = (w) => { setFavorites(getFavorites().filter(x => x !== w)); updatePages(); };

        const toggle = (p) => { const active = p.classList.contains('active'); [kbPage, dictPage, adminPage].forEach(x => x.classList.remove('active')); if (!active) p.classList.add('active'); if (p === dictPage) loadDictionary(); };
        catBtn.onclick = () => toggle(kbPage); dictBtn.onclick = () => toggle(dictPage); adminBtn.onclick = () => toggle(adminPage);

        document.addEventListener('click', e => { if (e.target.closest('.panel-close')) [kbPage, dictPage, adminPage].forEach(p => p.classList.remove('active')); });
        
        adminPage.oninput = e => {
            if (e.target.id === 'a-color') { setThemeColor(e.target.value); updateThemeStyles(); }
            if (e.target.id === 'a-radius') { setBorderRadius(e.target.value); updateThemeStyles(); }
            if (e.target.id === 'a-opacity') { setOpacity(e.target.value); updateThemeStyles(); }
        };
        adminPage.onchange = e => { if (e.target.id === 'a-font') { setFont(e.target.value); updateThemeStyles(); } };

        const updateResults = () => {
            const val = document.getElementById('d-input').value.toLowerCase(), sm = getSearchMode(), wt = getWordType(), favs = getFavorites();
            if (!val && wt === 'All') { document.getElementById('d-results').style.display = 'none'; return; }
            let words = wt === 'Fish' ? dictionary.filter(isWordFish) : dictionary;
            if (val) words = words.filter(w => sm === 'StartsWith' ? w.toLowerCase().startsWith(val) : w.toLowerCase().includes(val));
            const list = words.slice(0, 15).map(w => `<span class="clickable-word">${w}<span class="fav-star ${favs.includes(w)?'active':''}" onclick="window.ptAddFav('${w}')">★</span></span>`).join('');
            document.getElementById('d-results').style.display = 'block';
            document.getElementById('d-list').innerHTML = list || 'No words found.';
        };

        dictPage.oninput = e => { if (e.target.id === 'd-input') updateResults(); };
        dictPage.onchange = e => { if (e.target.id === 'd-sm') { setSearchMode(e.target.value); updateResults(); } if (e.target.id === 'd-wt') { setWordType(e.target.value); updateResults(); } };
        
        updatePages();
    };

    window.addEventListener('keydown', e => {
        if (e.key === getToggleKey()) [kbPage, dictPage, adminPage].some(p => p.classList.contains('active')) ? [kbPage, dictPage, adminPage].forEach(p => p.classList.remove('active')) : adminBtn.click();
        if (e.key === getOpacityToggleKey()) { isOpacityReduced = !isOpacityReduced; updateThemeStyles(); }
        if (getTabHotkeys()) { if (e.key === 'F1') catBtn.click(); if (e.key === 'F2') dictBtn.click(); if (e.key === 'F3') adminBtn.click(); }
        if (e.key === 'Escape') [kbPage, dictPage, adminPage].forEach(p => p.classList.remove('active'));
    });

    document.addEventListener('keydown', e => {
        if ((e.code === 'Space' || e.key === ' ') && (getEnabled() || getChatEnabled())) {
            const a = document.activeElement;
            if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) {
                const isChat = a.closest('.chat') || a.id === 'd-input';
                if ((isChat && getChatEnabled()) || (!isChat && getEnabled() && document.querySelector('.selfTurn'))) {
                    e.preventDefault();
                    try { document.execCommand('insertText', false, '-'); } catch (err) { const s = a.selectionStart; a.value = a.value.substring(0, s) + '-' + a.value.substring(a.selectionEnd); a.selectionStart = a.selectionEnd = s + 1; a.dispatchEvent(new Event('input', { bubbles: true })); }
                }
            }
        }
    }, true);

    const check = new MutationObserver(() => { if (document.querySelector('.navigation, .tabs, .room .bottom')) init(); });
    check.observe(document.documentElement, { childList: true, subtree: true });
    init(); setTimeout(init, 1000);
})();
