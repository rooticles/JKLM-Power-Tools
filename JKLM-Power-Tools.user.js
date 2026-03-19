// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  Advanced JKLM Power Tools - Ultimate Edition (v9.0)
// @author       Root
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

    // --- Global Patch for JKLM & Overlay Bugs ---
    const patchGlobalBugs = () => {
        try {
            const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            
            // --- Global Error Suppressor (Unbreakable Mode) ---
            win.addEventListener('error', (event) => {
                const msg = event.message || '';
                const ignoredErrors = [
                    'addEventListener', 'milestones', 'socket', 'undefined', 'null',
                    'PartyPlus', 'overlay.js', 'falcon.jklm.fun'
                ];
                if (ignoredErrors.some(err => msg.includes(err))) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            }, true);

            // Fix JKLM 'chatUnreadHighlightCount' ReferenceError
            if (typeof win.chatUnreadHighlightCount === 'undefined') {
                win.chatUnreadHighlightCount = 0;
            }

            // --- Audio Autoplay Resilience ---
            // Fixes "AudioContext was not allowed to start" error
            const resumeAudio = () => {
                const contexts = [win.AudioContext, win.webkitAudioContext];
                contexts.forEach(Ctx => {
                    if (Ctx && Ctx.prototype) {
                        const originalResume = Ctx.prototype.resume;
                        // We don't necessarily need to wrap it, but we can proactively try to resume
                    }
                });

                const triggerResume = () => {
                    const audioCtxs = [win.audioContext, win.AudioContext, win.webkitAudioContext, win.room?.audioContext];
                    audioCtxs.forEach(ctx => {
                        if (ctx && typeof ctx === 'object' && ctx.state === 'suspended') {
                            ctx.resume().catch(() => {});
                        }
                    });
                };

                // Resume on first user interaction
                ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => {
                    win.addEventListener(evt, triggerResume, { once: true, capture: true });
                });
            };
            resumeAudio();

            // --- Network Resilience Patch (Guardian Edition v8.0) ---
            const injectFallbackCSS = () => {
                if (document.getElementById('jklm-power-tools-resilience')) return;

                const fallbackStyles = `
                    /* Ultimate Edition: Comprehensive UI Fallback (v8.0) */
                    body.resilience-active:not(:has(link[href*="base.css"])) {
                        background: #1B1F3B !important;
                        color: #eee !important;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                        margin: 0; padding: 0; height: 100vh; display: flex; flex-direction: column;
                    }
                    .page.resilience-active:not(:has(link[href*="bombparty.css"])) {
                        display: flex; flex-direction: column; flex: 1; height: 100vh;
                        background: radial-gradient(circle at center, #2a2d45 0%, #1b1f3b 100%) !important;
                        position: relative; overflow: hidden;
                    }

                    .top.resilience-active:not(:has(link[href*="bombparty.css"])) {
                        height: 60px; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.1);
                    }

                    .middle.resilience-active:not(:has(link[href*="bombparty.css"])) {
                        flex: 1; display: flex; flex-direction: column; position: relative; align-items: center; justify-content: center;
                    }
                    .bottom.resilience-active:not(:has(link[href*="bombparty.css"])) {
                        height: 100px; background: rgba(0,0,0,0.5); border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: center; align-items: center;
                    }

                    .chat.resilience-active:not(:has(link[href*="base.css"])) {
                        position: fixed; right: 0; bottom: 100px; top: 60px; width: 320px;
                        background: rgba(0,0,0,0.7) !important; border-left: 1px solid rgba(255,255,255,0.1) !important;
                        display: flex; flex-direction: column; backdrop-filter: blur(15px); z-index: 1000;
                    }

                    .navigation.resilience-active:not(:has(link[href*="base.css"])) {
                        position: fixed; top: 0; left: 0; right: 0; height: 60px;
                        background: rgba(0,0,0,0.6) !important; display: flex; align-items: center; padding: 0 20px;
                        border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 1001;
                    }

                    .canvasArea.resilience-active:not(:has(link[href*="bombparty.css"])) {
                        flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; position: relative;
                    }
                    .round.resilience-active:not(:has(link[href*="bombparty.css"])) {
                        font-size: 2em; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0,0,0,0.5);
                    }

                    button.resilience-active:not(.modern-button) {
                        background: #26aa36 !important; color: #fff !important; border: none !important;
                        padding: 12px 24px !important; border-radius: 30px !important; font-weight: 800 !important;
                        cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    }
                    
                    /* Guardian Pulse Animation */
                    @keyframes guardian-pulse {
                        0% { transform: scale(1); filter: drop-shadow(0 0 0px #ff4444); }
                        50% { transform: scale(1.1); filter: drop-shadow(0 0 10px #ff4444); }
                        100% { transform: scale(1); filter: drop-shadow(0 0 0px #ff4444); }
                    }
                    .guardian-icon { display: inline-block; animation: guardian-pulse 2s infinite ease-in-out; }
                    
                    /* Fix Power Tools Panel Position in Fallback */
                    .resilience-active .custom-kb-page, .resilience-active .custom-dict-page, .resilience-active .custom-admin-page {
                        z-index: 999999 !important;
                        bottom: 10px !important;
                    }
                `;
                const style = document.createElement('style');
                style.id = 'jklm-power-tools-resilience';
                style.textContent = fallbackStyles;
                document.documentElement.appendChild(style);
                
                // Add class to body to activate fallbacks
                document.body.classList.add('resilience-active');
                
                // UI Notification with Auto-Recovery Status
                const notify = document.createElement('div');
                notify.id = 'jklm-resilience-notice';
                notify.style = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 12px 40px 12px 24px; border-radius: 12px; font-weight: 900; z-index: 1000000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: sans-serif; display: flex; align-items: center; gap: 10px; transition: 0.5s;';
                notify.innerHTML = `
                    <span id="resilience-text"><span class="guardian-icon">🛡️</span> Guardian Active: Emergency UI Patch Applied.</span>
                    <span id="close-resilience-notice" style="position: absolute; right: 12px; cursor: pointer; font-size: 18px; opacity: 0.8; hover: opacity: 1;">✕</span>
                `;
                document.body.appendChild(notify);
                
                document.getElementById('close-resilience-notice').onclick = () => {
                    notify.style.opacity = '0';
                    setTimeout(() => notify.remove(), 500);
                };

                // Auto-remove after 1 second (Stealth Mode)
                setTimeout(() => {
                    if (document.getElementById('jklm-resilience-notice')) {
                        notify.style.opacity = '0';
                        setTimeout(() => notify.remove(), 500);
                    }
                }, 1000);
            };

            const removeFallbackCSS = () => {
                const style = document.getElementById('jklm-power-tools-resilience');
                if (style) style.remove();
                document.body.classList.remove('resilience-active');
                
                const notify = document.getElementById('jklm-resilience-notice');
                if (notify) {
                    const text = document.getElementById('resilience-text');
                    if (text) text.innerHTML = '✅ JKLM Servers Recovered! UI Restored.';
                    notify.style.background = '#26aa36';
                    setTimeout(() => {
                        notify.style.opacity = '0';
                        setTimeout(() => notify.remove(), 500);
                    }, 5000);
                }
            };

            // Auto-Recovery Polling (Every 15s)
            const checkStyles = () => {
                const criticalStyles = ['base.css', 'game.css', 'bombparty.css'];
                const loadedStyles = Array.from(document.styleSheets).map(s => s.href || '');
                const missingCount = criticalStyles.filter(cs => !loadedStyles.some(ls => ls.includes(cs))).length;
                
                if (missingCount >= 2) {
                    injectFallbackCSS();
                } else if (document.body.classList.contains('resilience-active')) {
                    removeFallbackCSS();
                }
                
                // Recursive poll
                setTimeout(checkStyles, 15000);
            };
            
            // Initial check with delay
            setTimeout(checkStyles, 3000);

            // --- Ultra Stability Patch (v5 - Ultimate Edition) ---
            // This is the absolute final fix for "Cannot read properties of undefined (reading 'addEventListener')"
            
            const createRecursiveProxy = (name = 'root') => {
                const noop = () => {};
                const handler = {
                    get: (target, prop) => {
                        if (prop === 'then') return undefined;
                        if (prop === 'toJSON') return () => ({});
                        if (typeof prop === 'symbol') return undefined;
                        
                        const methods = [
                            'addEventListener', 'removeEventListener', 'on', 'off', 'emit', 
                            'dispatchEvent', 'setMilestone', 'trigger', 'dispatch', 'join', 
                            'leave', 'send', 'connect', 'disconnect'
                        ];
                        if (methods.includes(prop)) return noop;
                        
                        return createRecursiveProxy(`${name}.${prop.toString()}`);
                    },
                    apply: (target, thisArg, args) => {
                        return createRecursiveProxy(`${name}()`);
                    }
                };
                return new Proxy(noop, handler);
            };

            // The "Nuclear Option": Ensure 'milestones' property exists on EVERY object in the JS environment
            if (win.Object && typeof win.Object.prototype.milestones === 'undefined') {
                let _globalMilestones = win.milestones || createRecursiveProxy('milestones');
                Object.defineProperty(win.Object.prototype, 'milestones', {
                    get: function() { return _globalMilestones; },
                    set: function(val) { 
                        if (this === win) _globalMilestones = val;
                        else this._milestones = val; 
                    },
                    configurable: true
                });
            }

            const safeProxy = (name) => {
                let _val = win[name] || createRecursiveProxy(name);
                Object.defineProperty(win, name, {
                    get: () => _val,
                    set: (val) => { 
                        if (val && typeof val === 'object') {
                            ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone'].forEach(m => {
                                if (typeof val[m] === 'undefined') val[m] = () => {};
                            });
                            _val = val; 
                        }
                    },
                    configurable: true
                });
            };

            // Patch global objects
            ['milestones', 'game', 'socket', 'room', 'client', 'roomProxy'].forEach(safeProxy);

            // Continously monitor for Socket/Emitter definitions to patch prototypes
            const patchPrototypes = () => {
                ['Socket', 'Emitter', 'EventEmitter', 'Room', 'Client'].forEach(objName => {
                    const Proto = win[objName] && win[objName].prototype;
                    if (Proto) {
                        ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone', 'trigger'].forEach(m => {
                            if (typeof Proto[m] === 'undefined') Proto[m] = () => {};
                        });
                    }
                });
            };
            
            patchPrototypes();
            setTimeout(patchPrototypes, 500);
            setTimeout(patchPrototypes, 2000);
            setTimeout(patchPrototypes, 5000);

        } catch (e) {
            console.warn('[JKLM Power Tools] Stability patch failed:', e);
        }
    };
    patchGlobalBugs();

    const SCRIPT_VERSION = '9.0';

    // --- Performance Helpers ---
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // --- Storage Helpers ---
    const getEnabled = () => GM_getValue('spaceToHyphenEnabled', false);
    const setEnabled = (val) => GM_setValue('spaceToHyphenEnabled', val);
    const getChatEnabled = () => GM_getValue('spaceToHyphenChatEnabled', false);
    const setChatEnabled = (val) => GM_setValue('spaceToHyphenChatEnabled', val);

    const getDictLanguage = () => GM_getValue('dictLanguage', 'English');
    const setDictLanguage = (val) => GM_setValue('dictLanguage', val);
    const getSearchMode = () => GM_getValue('dictSearchMode', 'Contains');
    const setSearchMode = (val) => GM_setValue('dictSearchMode', val);
    const getWordType = () => GM_getValue('dictWordType', 'All');
    const setWordType = (val) => GM_setValue('dictWordType', val);
    const getCustomDictionary = () => GM_getValue('customDictionary', []);
    const setCustomDictionary = (val) => GM_setValue('customDictionary', val);
    const getSidebarWidth = () => GM_getValue('sidebarWidth', 650);
    const setSidebarWidth = (val) => GM_setValue('sidebarWidth', val);
    const getThemeColor = () => GM_getValue('themeColor', '#00d2ff');
    const setThemeColor = (val) => GM_setValue('themeColor', val);
    const getBgColor = () => GM_getValue('bgColor', '#1B1F3B');
    const setBgColor = (val) => GM_setValue('bgColor', val);

    const getLanguage = () => 'English';

    const getGlassOpacity = () => GM_getValue('glassOpacity', 0.7);
    const setGlassOpacity = (val) => GM_setValue('glassOpacity', val);
    const getBorderRadius = () => GM_getValue('borderRadius', 16);
    const setBorderRadius = (val) => GM_setValue('borderRadius', val);
    const getClockEnabled = () => GM_getValue('clockEnabled', true);
    const setClockEnabled = (val) => GM_setValue('clockEnabled', val);
    const getBgImageUrl = () => GM_getValue('bgImageUrl', '');
    const setBgImageUrl = (val) => GM_setValue('bgImageUrl', val);
    const getAnimationType = () => GM_getValue('animationType', 'slideIn');
    const setAnimationType = (val) => GM_setValue('animationType', val);

    const getThemeAnimEnabled = () => GM_getValue('themeAnimEnabled', true);
    const setThemeAnimEnabled = (val) => GM_setValue('themeAnimEnabled', val);

    const getSearchHistory = () => GM_getValue('searchHistory', []);
    const setSearchHistory = (val) => GM_setValue('searchHistory', val);

    const getMiniMode = () => GM_getValue('miniModeEnabled', false);
    const setMiniMode = (val) => GM_setValue('miniModeEnabled', val);
    const getCustomFont = () => GM_getValue('customFont', 'inherit');
    const setCustomFont = (val) => GM_setValue('customFont', val);

    const getCurrentThemeName = () => GM_getValue('currentThemeName', 'Classic');
    const setCurrentThemeName = (val) => GM_setValue('currentThemeName', val);

    // --- New Features Storage ---
    const getNotes = () => GM_getValue('notes', []);
    const setNotes = (val) => GM_setValue('notes', val);
    const getToggleKey = () => GM_getValue('toggleKey', 'F2');
    const setToggleKey = (val) => GM_setValue('toggleKey', val);
    const getPanelPosition = () => GM_getValue('panelPosition', 'right');
    const setPanelPosition = (val) => GM_setValue('panelPosition', val);
    const getMinWordLength = () => GM_getValue('minWordLength', 2);
    const setMinWordLength = (val) => GM_setValue('minWordLength', val);
    const getMaxWordLength = () => GM_getValue('maxWordLength', 30);
    const setMaxWordLength = (val) => GM_setValue('maxWordLength', val);

    const getAnimatedTheme = () => GM_getValue('animatedTheme', 'none');
    const setAnimatedTheme = (val) => GM_setValue('animatedTheme', val);

    // --- Chat & Macro Helpers ---
    const sendToChat = (msg) => {
        const chatInput = document.querySelector('.chat input, .chat textarea, .chatInput');
        if (chatInput) {
            chatInput.value = msg;
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            chatInput.focus();
            setTimeout(() => {
                chatInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            }, 50);
        }
    };

    // --- Translations ---
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
            adminMiniModeLabel: 'Compact Mode',
            adminFontLabel: 'Font:',
            adminThemeLabel: 'Accent Color:',
            adminBgLabel: 'Background Color:',
            adminPresetsLabel: '🎨 Design Presets:',
            adminCppHeader: '🖼️ Custom Profile Picture',
            adminCppDesc: 'Upload an image (local):',
            adminCppBtn: 'Apply Profile Picture',
            adminCppError: 'File too large (>10Kb).',
            adminCppSuccess: 'Applied successfully.',
            adminSidebarWidthLabel: 'Panel Width (pixels):',
            adminMinLabel: 'Minimum: 180.',
            adminLoginHeader: '🛡️ Admin Area',
            adminUserPlaceholder: 'Username...',
            adminPassPlaceholder: 'Password...',
            adminLoginBtn: 'Login',
            adminLogoutBtn: 'Logout',
            adminLoginError: 'Invalid credentials!',
            adminGlassLabel: 'Transparency:',
            adminRadiusLabel: 'Corner Softness:',
            adminClockLabel: 'System Clock',
            adminThemeAnimLabel: 'Animated Accents',
            adminBgImageLabel: 'Background Image (URL):',
            adminAnimLabel: 'Open Animation:',
            dictCustomUpload: 'Custom Dictionary',
            dictUploadDesc: 'Upload a .txt file or paste words manually:',
            dictUploadBtn: 'Save Words',
            dictPlaceholder: 'Word 1\nWord 2\nWord 3...',
            dictFoundWords: '{count} words found:',
            dictNoResultsShort: 'No results.',
            english: 'English',
            // Features
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

    // --- Dictionary Logic ---
    let dictionary = [];
    let lowercasedDictionary = [];
    let dictionaryLoaded = false;
    let currentDictLang = '';

    // --- Local Music Player ---
    const dictionaryUrls = {
        'English': 'https://raw.githubusercontent.com/tt-46ben/overlay-wordlist/121bf1a601ed822553c2e68c38a4cdcd7737d352/words.txt'
    };

    const loadDictionary = async (force = false) => {
        const lang = getDictLanguage();
        if (dictionaryLoaded && currentDictLang === lang && !force) return;

        if (lang === 'Custom') {
            dictionary = getCustomDictionary();
            lowercasedDictionary = dictionary.map(w => w.toLowerCase());
            dictionaryLoaded = true;
            currentDictLang = lang;
            return;
        }

        try {
            const url = dictionaryUrls[lang] || dictionaryUrls['English'];
            const response = await fetch(url);
            if (!response.ok) throw new Error('Could not load dictionary');

            const text = await response.text();
            dictionary = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
            lowercasedDictionary = dictionary.map(w => w.toLowerCase());

            dictionaryLoaded = true;
            currentDictLang = lang;
        } catch (err) {
            console.error('Dictionary load error:', err);
            dictionary = ["ERASEMENT", "BIZARRENESSES", "PROMINENT"];
            lowercasedDictionary = dictionary.map(w => w.toLowerCase());
            dictionaryLoaded = true;
            currentDictLang = lang;
        }
    };

    const findWords = (syllable) => {
        if (!syllable) return [];
        const search = syllable.toLowerCase();
        const results = [];
        for (let i = 0; i < lowercasedDictionary.length; i++) {
            if (lowercasedDictionary[i].includes(search)) {
                results.push(dictionary[i]);
            }
        }
        return results;
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // --- Base64 & Profile Picture Helpers ---
    function uint6ToB64(nUint6) {
        return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43 : nUint6 === 63 ? 47 : 65;
    }

    function base64EncArr(aBytes) {
        let nMod3 = 2;
        let sB64Enc = "";
        const nLen = aBytes.length;
        let nUint24 = 0;
        for (let nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
            if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                sB64Enc += String.fromCodePoint(
                    uint6ToB64((nUint24 >>> 18) & 63),
                    uint6ToB64((nUint24 >>> 12) & 63),
                    uint6ToB64((nUint24 >>> 6) & 63),
                    uint6ToB64(nUint24 & 63)
                );
                nUint24 = 0;
            }
        }
        return (sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? "" : nMod3 === 1 ? "=" : "=="));
    }

    // --- CSS Styles ---
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
            --theme-color: #8A2BE2; /* Blue Violet */
            --theme-color-rgb: 138, 43, 226;
            --bg-color: #1A1A2E; /* Dark Blue */
            --bg-rgb: 26, 26, 46;
            --glass-bg: rgba(26, 26, 46, 0.75);
            --glass-border: rgba(255, 255, 255, 0.1);
            --card-bg: rgba(255, 255, 255, 0.05);
            --card-border: rgba(255, 255, 255, 0.1);
            --border-radius: 16px;
            --text-color: #E0E0E0; /* Light Gray */
            --text-muted: #A0A0A0; /* Gray */
            --panel-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            --transition: 0.3s ease;
            --font-main: 'Inter', sans-serif;
            --font-mono: 'Fira Code', monospace;
            --accent-gradient: linear-gradient(135deg, var(--theme-color), #FF69B4); /* Hot Pink */
            --glow-effect: 0 0 20px rgba(var(--theme-color-rgb), 0.4);
        }

        /* Glassmorphism Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 10px; 
            border: 2px solid transparent;
            background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(var(--theme-color-rgb), 0.5); }

        .custom-nav-row {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(27, 31, 59, 0.4);
            height: 60px;
            width: 100%;
            border-bottom: 1px solid var(--glass-border);
            position: relative;
            z-index: 10001;
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            gap: 15px;
            padding: 0 25px;
            box-sizing: border-box;
        }

        .panel-nav {
            display: flex;
            align-items: center;
            height: 80px;
            margin: -20px -20px 20px -20px;
            padding: 0 24px;
            width: calc(100% + 40px);
            box-sizing: border-box;
            position: sticky;
            top: -20px;
            z-index: 100;
            background: rgba(27, 31, 59, 0.4);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--glass-border);
        }

        .panel-title {
            font-weight: 700;
            font-size: 22px;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 20px;
            flex: 1;
            letter-spacing: -0.02em;
        }

        .custom-tab-group {
            display: flex;
            background: rgba(255, 255, 255, 0.05);
            padding: 5px;
            border-radius: 14px;
            border: 1px solid var(--glass-border);
            gap: 5px;
        }

        .custom-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            font-size: 18px;
            transition: var(--transition);
            color: var(--text-muted);
            position: relative;
        }

        .custom-tab:hover {
            color: var(--text-color);
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
            box-shadow: var(--glow-effect);
        }

        .custom-tab.active {
            color: white;
            background: var(--theme-color);
            box-shadow: 0 0 20px rgba(var(--theme-color-rgb), 0.5);
            transform: scale(1.1);
        }

        .custom-kb-page, .custom-dict-page, .custom-admin-page {
            display: none;
            padding: 20px;
            color: var(--text-color);
            background: var(--glass-bg);
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            height: 100vh;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            width: 650px;
            box-shadow: var(--panel-shadow);
            position: fixed;
            top: 0;
            z-index: 9999;
            font-family: var(--font-main);
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: var(--border-radius);
            will-change: transform, opacity;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9); /* Text shadow for high readability */
        }

        .custom-kb-page.pos-left, .custom-dict-page.pos-left, .custom-admin-page.pos-left {
            left: 0;
            border-right: 1px solid var(--glass-border);
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .custom-kb-page.pos-right, .custom-dict-page.pos-right, .custom-admin-page.pos-right {
            right: 0;
            border-left: 1px solid var(--glass-border);
            border-right: none;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        .custom-kb-page.active, .custom-dict-page.active, .custom-admin-page.active {
            display: block;
            animation: fadeInGlass 0.5s ease-out;
        }

        @keyframes fadeInGlass {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(16px); }
        }

        .custom-close-x {
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            color: var(--text-muted);
            transition: var(--transition);
            margin-left: 15px;
        }

        .custom-close-x:hover {
            color: #ffffff;
            background: rgba(239, 68, 68, 0.5);
            border-color: rgba(239, 68, 68, 0.8);
            transform: rotate(90deg) scale(1.1);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        /* Frosted Glass Cards */
        .feature-card {
            background: rgba(0, 0, 0, 0.45) !important; /* Darker for high readability */
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--border-radius);
            padding: 24px;
            margin-bottom: 20px;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(12px); /* Stronger blur for text isolation */
        }

        .feature-card:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(var(--theme-color-rgb), 0.4);
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), var(--glow-effect);
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--accent-gradient);
            opacity: 0.3;
        }

        .feature-header {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 14px;
            color: var(--text-color);
        }

        .feature-icon {
            width: 38px;
            height: 38px;
            background: rgba(var(--theme-color-rgb), 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--theme-color);
            font-size: 20px;
            box-shadow: inset 0 0 10px rgba(var(--theme-color-rgb), 0.2);
        }

        /* Glass Inputs */
        .modern-input {
            width: 100%;
            background: rgba(0, 0, 0, 0.6) !important; /* Darker for readability */
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff !important;
            padding: 14px 20px;
            border-radius: var(--border-radius);
            font-size: 15px;
            font-family: var(--font-main);
            transition: var(--transition);
            outline: none;
            box-sizing: border-box;
            backdrop-filter: blur(4px);
            text-shadow: none; /* No shadow inside inputs for crisp typing */
        }

        .modern-input option {
            background-color: #000000 !important; /* Deep black for all browsers */
            color: #ffffff !important; /* White text for contrast */
            padding: 12px;
            font-weight: 500;
        }

        .modern-input:focus {
            border-color: var(--theme-color);
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 4px rgba(var(--theme-color-rgb), 0.1), var(--glow-effect);
            transform: scale(1.02);
        }

        .modern-button {
            background: var(--accent-gradient);
            color: #1B1F3B;
            border: none;
            padding: 14px 28px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-weight: 700;
            font-size: 15px;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 8px 16px rgba(var(--theme-color-rgb), 0.3);
        }

        .modern-button:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 12px 24px rgba(var(--theme-color-rgb), 0.5), var(--glow-effect);
            filter: brightness(1.1);
        }

        .settings-row {
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: var(--border-radius-sm);
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: var(--transition);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .settings-row:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            transform: translateX(4px);
        }

        .toggle-switch {
            width: 50px;
            height: 28px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50px;
            position: relative;
            cursor: pointer;
            transition: var(--transition);
            border: 1px solid var(--glass-border);
        }

        .toggle-switch.on {
            background: var(--theme-color);
            box-shadow: var(--glow-effect);
        }

        .toggle-knob {
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: var(--transition);
        }

        .toggle-switch.on .toggle-knob {
            left: 24px;
        }

        .clickable-word {
            display: inline-block;
            padding: 8px 16px;
            margin: 4px;
            background: rgba(0, 0, 0, 0.6) !important; /* Darker background */
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            cursor: pointer;
            transition: var(--transition);
            font-weight: 700; /* Bolder */
            font-size: 14px;
            color: #ffffff !important;
            backdrop-filter: blur(4px);
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .clickable-word:hover {
            background: var(--theme-color);
            color: #1B1F3B;
            transform: translateY(-3px) scale(1.1);
            box-shadow: var(--glow-effect);
        }

        .custom-clock {
            font-family: var(--font-mono);
            font-size: 14px;
            font-weight: 600;
            color: var(--theme-color);
            background: rgba(var(--theme-color-rgb), 0.1);
            padding: 6px 14px;
            border-radius: 10px;
            border: 1px solid rgba(var(--theme-color-rgb), 0.2);
            box-shadow: var(--glow-effect);
        }

        .note-item {
            background: rgba(0, 0, 0, 0.5) !important; /* Darker for readability */
            border: 1px solid var(--glass-border);
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin-bottom: 16px;
            transition: var(--transition);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            backdrop-filter: blur(5px);
        }

        .note-item:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(var(--theme-color-rgb), 0.4);
            transform: translateX(10px) translateY(-2px);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
        }

        .word-tooltip {
            position: fixed;
            background: rgba(var(--bg-rgb), 0.96);
            backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid var(--theme-color);
            padding: 20px;
            border-radius: 22px;
            z-index: 10002;
            max-width: 320px;
            font-size: 14px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.7);
            pointer-events: none;
            display: none;
            color: var(--text-color);
            line-height: 1.6;
            animation: tooltipFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes tooltipFade { 
            from { opacity: 0; transform: translateY(15px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }

        .note-delete {
            width: 36px;
            height: 36px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 12px;
            color: #ef4444;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
            font-size: 16px;
        }

        .note-delete:hover {
            background: #ef4444;
            color: white;
            transform: scale(1.15) rotate(90deg);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        /* Responsive Animations */
        @keyframes slideInPanelRight {
            from { transform: translateX(100%) scale(0.96); opacity: 0; filter: blur(10px); }
            to { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
        }

        @keyframes slideInPanelLeft {
            from { transform: translateX(-100%) scale(0.96); opacity: 0; filter: blur(10px); }
            to { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
        }

        /* Lobby Filters */
        .lobby-filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin: 20px auto;
            padding: 15px;
            background: rgba(0,0,0,0.3);
            border-radius: 20px;
            max-width: 900px;
            border: 1px solid rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
        }
        .lobby-filter-btn {
            padding: 10px 20px;
            background: #26aa36;
            color: white;
            border: none;
            border-radius: 30px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 12px rgba(38, 170, 54, 0.2);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .lobby-filter-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 20px rgba(38, 170, 54, 0.4);
            filter: brightness(1.1);
        }
        .lobby-filter-btn.active {
            background: #fff;
            color: #26aa36;
            box-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        /* Animated Themes */
        .animated-mesh {
            background: linear-gradient(45deg, #1B1F3B, #2a1f4d, #1b3b3b, #1B1F3B);
            background-size: 400% 400%;
            animation: meshGradient 15s ease infinite;
        }
        @keyframes meshGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .animated-matrix {
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,210,255,0.05) 50%, rgba(0,0,0,0) 100%);
            background-size: 100% 200%;
            animation: matrixFlow 4s linear infinite;
        }
        @keyframes matrixFlow {
            from { background-position: 0% -100%; }
            to { background-position: 0% 100%; }
        }
    `;
    document.head.appendChild(style);

    const updateThemeStyles = () => {
        const themeColor = getThemeColor();
        const font = getCustomFont();
        const borderRadius = getBorderRadius();
        const clockEnabled = getClockEnabled();
        const animationType = getAnimationType();
        const panelPosition = getPanelPosition();

        const themeRgb = themeColor.match(/[A-Za-z0-9]{2}/g).map(x => parseInt(x, 16)).join(',');

        document.documentElement.style.setProperty('--theme-color', themeColor);
        document.documentElement.style.setProperty('--theme-color-rgb', themeRgb);
        document.documentElement.style.setProperty('--bg-color', 'rgba(0,0,0,0.15)');
        document.documentElement.style.setProperty('--bg-rgb', '0,0,0');
        document.documentElement.style.setProperty('--glass-bg', 'rgba(0,0,0,0.15)');
        document.documentElement.style.setProperty('--border-radius', `${borderRadius}px`);
        document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${themeColor}, #FF69B4)`);
        document.documentElement.style.setProperty('--glow-effect', `0 0 20px rgba(${themeRgb}, 0.4)`);

        const textColor = '#ffffff';
        const textMuted = '#A0A0A0';
        const glassBorder = 'rgba(255, 255, 255, 0.1)';

        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--text-muted', textMuted);
        document.documentElement.style.setProperty('--glass-border', glassBorder);

        document.querySelectorAll('.custom-kb-page, .custom-dict-page, .custom-admin-page').forEach(p => {
            p.classList.remove('pos-left', 'pos-right', 'animated-mesh', 'animated-matrix');
            p.classList.add(`pos-${panelPosition}`);
            
            const animName = animationType === 'slideIn' ? `slideInPanel${panelPosition.charAt(0).toUpperCase() + panelPosition.slice(1)}` : animationType;
            p.style.animation = `${animName} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
            
            p.style.backgroundImage = 'none';
            p.style.background = 'transparent';
            p.style.backdropFilter = 'none';
            p.style.webkitBackdropFilter = 'none';
        });
    };
    updateThemeStyles();

    let currentLobbyFilter = 'All';
    const setupLobbyFilters = () => {
        const playerCountEl = document.querySelector('.home .playerCount');
        if (!playerCountEl || document.getElementById('lobby-filter-container')) return;

        const container = document.createElement('div');
        container.id = 'lobby-filter-container';
        container.className = 'lobby-filter-container';

        const filters = [
            'All', 'English', 'French', 'Spanish', 'Brazilian Portuguese', 
            'German', 'Breton', 'Nahuatl', 'Basque', 'Bombparty', 'Popsauce'
        ];

        filters.forEach(filter => {
            const btn = document.createElement('button');
            btn.className = 'lobby-filter-btn';
            if (filter === currentLobbyFilter) btn.classList.add('active');
            btn.innerText = filter;
            btn.onclick = () => {
                currentLobbyFilter = filter;
                document.querySelectorAll('.lobby-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterLobbies();
            };
            container.appendChild(btn);
        });

        playerCountEl.after(container);
    };

    const filterLobbies = () => {
        const rooms = document.querySelectorAll('.lobbies .room');
        if (rooms.length === 0) return;

        rooms.forEach(room => {
            if (currentLobbyFilter === 'All') {
                room.style.display = '';
                return;
            }

            const text = room.innerText.toLowerCase();
            const filterLower = currentLobbyFilter.toLowerCase();
            
            // Special handling for Bombparty/Popsauce to avoid partial matches if needed, 
            // but innerText should contain the full game name.
            if (text.includes(filterLower)) {
                room.style.display = '';
            } else {
                room.style.display = 'none';
            }
        });
    };

    let lastDetectedSyllable = '';
    let isGameRunning = false;

    let isInitialized = false;
    const init = () => {
        if (isInitialized) return;
        try {
            const nav = document.querySelector('.navigation') || document.querySelector('.tabs') || document.querySelector('.room .bottom') || document.querySelector('.room .navigation');
            if (!nav) return;

            isInitialized = true;
            console.log(`[JKLM Power Tools] v${SCRIPT_VERSION} Initialized successfully.`);
            if (checkInit) checkInit.disconnect();

            let customRow = document.getElementById('custom-nav-row');
            if (!customRow) {
                customRow = document.createElement('div');
                customRow.id = 'custom-nav-row';
                customRow.className = 'custom-nav-row';
                nav.after(customRow);
            }

            if (document.getElementById('cat-btn')) return;

            const createTab = (id, icon) => {
                const t = document.createElement('div');
                t.className = 'custom-tab';
                t.id = id;
                t.innerHTML = `<span>${icon}</span>`;
                return t;
            };

            const catTab = createTab('cat-btn', '🚀');
            const dictTab = createTab('dict-btn', '📖');
            const adminTab = createTab('admin-btn', '⚙️');

            [catTab, dictTab, adminTab].forEach(t => {
                customRow.appendChild(t);
            });

            const clock = document.createElement('div');
            clock.id = 'custom-clock';
            clock.className = 'custom-clock';
            clock.style.marginLeft = 'auto';
            customRow.appendChild(clock);

            const updateClock = () => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                if (clock) clock.innerText = timeStr;
                document.querySelectorAll('.panel-clock').forEach(el => {
                    el.innerText = timeStr;
                });
            };
            setInterval(updateClock, 1000);
            updateClock();

            const kbPage = document.createElement('div');
            kbPage.className = 'custom-kb-page';
            const dictPage = document.createElement('div');
            dictPage.className = 'custom-dict-page';
            const adminPage = document.createElement('div');
            adminPage.className = 'custom-admin-page';

            const allCustomPages = [kbPage, dictPage, adminPage];

            const getPanelNav = (activeTabId, title) => {
                const t = translations[getLanguage()] || translations['English'];
                const clockEnabled = getClockEnabled();
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return `
                <div class="panel-nav">
                    <div class="panel-title">
                        <span style="background: linear-gradient(to right, var(--theme-color), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(var(--theme-color-rgb), 0.3));">${title}</span>
                        <div class="custom-tab-group">
                            <div class="custom-tab ${activeTabId === 'cat-btn' ? 'active' : ''}" data-target="cat-btn">🚀</div>
                            <div class="custom-tab ${activeTabId === 'dict-btn' ? 'active' : ''}" data-target="dict-btn">📖</div>
                            <div class="custom-tab ${activeTabId === 'admin-btn' ? 'active' : ''}" data-target="admin-btn">⚙️</div>
                        </div>
                    </div>
                    ${clockEnabled ? `<div class="custom-clock panel-clock">${timeStr}</div>` : ''}
                    <div class="custom-close-x panel-close">✕</div>
                </div>
                `;
            };

            const updateKbContent = () => {
                const isEnabled = getEnabled();
                const isChatEnabled = getChatEnabled();
                const t = translations[getLanguage()] || translations['English'];
                catTab.title = t.kbHeader;

                kbPage.innerHTML = `
                ${getPanelNav('cat-btn', t.kbHeader)}
                <div class="custom-page-content">
                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon">⌨️</div>
                            <span>${t.kbHeader}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div class="settings-row" id="toggle-space-hyphen">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 16px;">${t.toggleLabel}</span>
                                    <span style="color: var(--text-muted); font-size: 13px; line-height: 1.4;">${isEnabled ? t.onDesc : t.offDesc}</span>
                                </div>
                                <div class="toggle-switch ${isEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div class="settings-row" id="toggle-chat-hyphen">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 16px;">${t.chatToggleLabel}</span>
                                    <span style="color: var(--text-muted); font-size: 13px; line-height: 1.4;">${isChatEnabled ? t.chatDesc : t.chatOffDesc}</span>
                                </div>
                                <div class="toggle-switch ${isChatEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px; opacity: 0.9; transition: 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">
                                <div style="width: 32px; height: 32px; border-radius: 10px; border: 2px solid var(--theme-color); overflow: hidden; background: rgba(var(--theme-color-rgb), 0.1); box-shadow: var(--glow-effect); display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--theme-color); font-size: 14px;">
                                    <img src="https://media.discordapp.net/attachments/1362588131966062736/1484245858982564163/download.jfif?ex=69bd872c&is=69bc35ac&hm=c8fb790d9047f95f9158952dec974f5ad608d504c98c959901e41b6421c14923&=&format=webp&width=32&height=32" style="width: 100%; height: 100%; object-fit: cover;" id="kb-idea-author-img" onerror="this.style.display='none'; this.parentElement.innerText='M'">
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">${t.ideaBy}</span>
                                    <span style="font-size: 13px; font-weight: 800; color: #fff; text-shadow: 0 0 10px rgba(var(--theme-color-rgb), 0.5);">meow meow</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card" style="background: rgba(var(--theme-color-rgb), 0.05); border-color: rgba(var(--theme-color-rgb), 0.2);">
                        <div class="feature-header" style="color: var(--theme-color);">
                            <div class="feature-icon" style="background: rgba(var(--theme-color-rgb), 0.15); box-shadow: var(--glow-effect);">💡</div>
                            <span>Tip</span>
                        </div>
                        <div style="color: var(--text-color); opacity: 0.8; font-size: 14px; line-height: 1.7;">
                            ${t.closeInfo}
                        </div>
                    </div>
                </div>
            `;
            };

            const updateDictContent = () => {
                const dictLang = getDictLanguage();
                const searchMode = getSearchMode();
                const wordType = getWordType();
                const history = getSearchHistory();
                const t = translations[getLanguage()] || translations['English'];
                dictTab.title = t.dictHeader;

                const notes = getNotes();

                let options = '';
                for (const l in dictionaryUrls) {
                    options += `<option value="${l}" ${dictLang === l ? 'selected' : ''}>${t[l.toLowerCase()] || l}</option>`;
                }

                const historyHtml = history.length > 0 ? `
                <div style="margin-top: 15px; padding: 20px; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(4px);">
                    <div style="font-size: 12px; font-weight: 800; color: var(--text-muted); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1.5px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📜 Recent</span>
                        <span id="clear-history" style="cursor: pointer; color: #ff4444; font-size: 10px; background: rgba(255, 68, 68, 0.1); padding: 5px 10px; border-radius: 8px; transition: 0.3s; font-weight: 700; border: 1px solid rgba(255,68,68,0.2);">CLEAR</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${history.map(h => `<span class="history-chip" style="padding: 6px 12px; background: rgba(var(--theme-color-rgb), 0.08); border-radius: 10px; font-size: 12px; cursor: pointer; border: 1px solid rgba(var(--theme-color-rgb), 0.15); font-weight: 700; transition: 0.3s; color: var(--text-color);">${h}</span>`).join('')}
                    </div>
                </div>
            ` : '';

                const notesHtml = notes.length > 0 ? notes.map((note, index) => `
                    <div class="note-item">
                        <div style="flex: 1;">
                            <div class="note-content" style="font-size: 14px; line-height: 1.5; color: var(--text-color); font-weight: 500;">${note.content}</div>
                            <div class="note-timestamp" style="font-size: 11px; opacity: 0.5; margin-top: 8px; font-weight: 600;">${new Date(note.timestamp).toLocaleString()}</div>
                        </div>
                        <button class="note-delete" data-index="${index}">✕</button>
                    </div>
                `).join('') : `<div style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 14px; font-weight: 600;">${t.noNotes}</div>`;

                const minLen = getMinWordLength();
                const maxLen = getMaxWordLength();

                dictPage.innerHTML = `
                ${getPanelNav('dict-btn', t.dictHeader)}
                <div class="custom-page-content">
                    ${historyHtml}

                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon">🔍</div>
                            <span>${t.dictHeader}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="position: relative;">
                                <input type="text" class="modern-input" id="dict-msg-input" placeholder="${t.msgPlaceholder}" style="padding-right: 60px; font-weight: 700; font-size: 18px;">
                                <div style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); font-size: 20px; opacity: 0.6;">⚡</div>
                            </div>

                            <div style="display: flex; gap: 12px;">
                                <select class="modern-input" id="dict-search-mode" style="flex: 1; padding: 14px 20px; font-weight: 700; appearance: none; cursor: pointer;">
                                    <option value="Contains" ${searchMode === 'Contains' ? 'selected' : ''}>Contains</option>
                                    <option value="StartsWith" ${searchMode === 'StartsWith' ? 'selected' : ''}>Starts With</option>
                                    <option value="EndsWith" ${searchMode === 'EndsWith' ? 'selected' : ''}>Ends With</option>
                                    <option value="SyllableChain" ${searchMode === 'SyllableChain' ? 'selected' : ''}>Syllable Chain</option>
                                </select>
                                <select class="modern-input" id="dict-word-type" style="flex: 1; padding: 14px 20px; font-weight: 700; appearance: none; cursor: pointer;">
                                    <option value="All" ${wordType === 'All' ? 'selected' : ''}>All Words</option>
                                    <option value="Hyphen" ${wordType === 'Hyphen' ? 'selected' : ''}>Hyphen Only</option>
                                    <option value="Long" ${wordType === 'Long' ? 'selected' : ''}>Long Words</option>
                                    <option value="Casual" ${wordType === 'Casual' ? 'selected' : ''}>Casual</option>
                                    <option value="Shorts" ${wordType === 'Shorts' ? 'selected' : ''}>Shorts</option>
                                    <option value="Phobia" ${wordType === 'Phobia' ? 'selected' : ''}>Phobia</option>
                                    <option value="Apostrophes" ${wordType === 'Apostrophes' ? 'selected' : ''}>Apostrophes</option>
                                </select>
                            </div>

                            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; border: 1px solid var(--glass-border);">
                                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 1px;">
                                    <span>Word Length</span>
                                    <span style="color: var(--theme-color);"><span id="val-dict-min-len">${minLen}</span> - <span id="val-dict-max-len">${maxLen}</span> chars</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <input type="range" id="dict-min-len" min="2" max="30" value="${minLen}" style="flex: 1; accent-color: var(--theme-color); cursor: pointer;">
                                    <input type="range" id="dict-max-len" min="2" max="30" value="${maxLen}" style="flex: 1; accent-color: var(--theme-color); cursor: pointer;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card" id="dict-results-container" style="background: rgba(0,0,0,0.3); border-color: var(--glass-border); padding: 28px;">
                        <div class="custom-dict-result-header" id="dict-result-header" style="font-size: 16px; font-weight: 800; color: var(--theme-color); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;"></div>
                        <div class="custom-dict-result-list" id="dict-result-list" style="display: flex; flex-wrap: wrap; gap: 10px;"></div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon">🌍</div>
                            <span>${t.dictSelectLabel}</span>
                        </div>
                        <select class="modern-input" id="dict-lang-select" style="font-weight: 700; appearance: none; cursor: pointer;">
                            ${options}
                            <option value="Custom" ${dictLang === 'Custom' ? 'selected' : ''}>${t.dictCustomUpload}</option>
                        </select>
                    </div>

                    <div id="custom-dict-upload-area" style="display: ${dictLang === 'Custom' ? 'block' : 'none'}; margin-bottom: 24px; padding: 28px; background: rgba(var(--theme-color-rgb), 0.08); border-radius: 24px; border: 2px dashed rgba(var(--theme-color-rgb), 0.3); backdrop-filter: blur(10px);">
                        <div style="font-size: 15px; color: var(--text-color); font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                            <span>📁</span> ${t.dictUploadDesc}
                        </div>
                        <input type="file" id="dict-file-upload" class="modern-input" accept=".txt" style="margin-bottom: 16px; border-style: solid;">
                        <textarea id="dict-manual-input" class="modern-input" style="min-height: 150px; font-size: 14px; margin-bottom: 16px; font-family: var(--font-mono); line-height: 1.6;" placeholder="${t.dictPlaceholder}">${(getCustomDictionary() || []).join('\n')}</textarea>
                        <button class="modern-button" id="dict-file-confirm" style="width: 100%;">
                            <span>💾</span> ${t.dictUploadBtn}
                        </button>
                    </div>

                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon">📌</div>
                            <span>${t.notesHeader}</span>
                        </div>
                        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                            <input type="text" id="new-note-input" class="modern-input" placeholder="${t.notePlaceholder}" style="flex: 1;">
                            <button class="modern-button" id="add-note-btn" style="min-width: 60px; padding: 0;">+</button>
                        </div>
                        <div id="notes-list" style="display: flex; flex-direction: column;">
                            ${notesHtml}
                        </div>
                    </div>

                    <div class="feature-card" style="background: rgba(var(--theme-color-rgb), 0.05); border-color: rgba(var(--theme-color-rgb), 0.2);">
                        <div class="feature-header" style="color: var(--theme-color);">
                            <div class="feature-icon" style="background: rgba(var(--theme-color-rgb), 0.15); box-shadow: var(--glow-effect);">💡</div>
                            <span>Pro-Tip</span>
                        </div>
                        <div style="color: var(--text-color); opacity: 0.8; font-size: 14px; line-height: 1.7;">
                            Click on any word to copy it instantly. Use the filters to find the best words for your round!
                        </div>
                    </div>
                </div>
            `;
            };

            const updateAdminContent = () => {
                const t = translations[getLanguage()] || translations['English'];
                const themeColor = getThemeColor();
                const bgColor = getBgColor();
                const glassOpacity = getGlassOpacity();
                const borderRadius = getBorderRadius();
                const clockEnabled = getClockEnabled();
                const bgImageUrl = getBgImageUrl();
                const panelPosition = getPanelPosition();
                const animatedTheme = getAnimatedTheme();
                adminTab.title = t.adminHeader;

                adminPage.innerHTML = `
                ${getPanelNav('admin-btn', t.adminHeader)}
                <div class="custom-page-content">
                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon">🎨</div>
                            <span>${t.adminVisualHeader}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            <div style="display: flex; gap: 15px;">
                                <div style="flex: 1; padding: 20px; background: rgba(255,255,255,0.04); border-radius: 20px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; gap: 12px; transition: 0.3s;" class="color-picker-container">
                                    <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase;">ACCENT COLOR</span>
                                    <input type="color" class="custom-theme-picker" id="admin-theme-picker" value="${themeColor}" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(255,255,255,0.1); cursor: pointer;">
                                </div>
                            </div>

                            <div class="settings-row" id="toggle-panel-pos" style="padding: 16px 20px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 15px;">Panel Side</span>
                                    <span style="color: var(--text-muted); font-size: 12px; font-weight: 600;">Currently on the ${panelPosition.toUpperCase()} side</span>
                                </div>
                                <div style="display: flex; background: rgba(0,0,0,0.3); border-radius: 14px; padding: 5px; border: 1px solid var(--glass-border);">
                                    <div id="pos-left-btn" style="padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 800; transition: 0.3s; ${panelPosition === 'left' ? 'background: var(--theme-color); color: white; box-shadow: 0 4px 12px rgba(var(--theme-color-rgb), 0.3);' : 'color: var(--text-muted);'}">LEFT</div>
                                    <div id="pos-right-btn" style="padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 800; transition: 0.3s; ${panelPosition === 'right' ? 'background: var(--theme-color); color: white; box-shadow: 0 4px 12px rgba(var(--theme-color-rgb), 0.3);' : 'color: var(--text-muted);'}">RIGHT</div>
                                </div>
                            </div>

                            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; border: 1px solid var(--glass-border);">
                                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 1px;">
                                    <span>${t.adminRadiusLabel}</span>
                                    <span style="color: var(--theme-color);"><span id="val-admin-border-radius">${borderRadius}</span>px</span>
                                </div>
                                <input type="range" id="admin-border-radius" min="0" max="40" step="1" value="${borderRadius}" style="width: 100%; accent-color: var(--theme-color); cursor: pointer;">
                            </div>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon">️</div>
                            <span>System & Interface</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div class="settings-row" id="toggle-clock">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 15px;">System Clock</span>
                                    <span style="color: var(--text-muted); font-size: 12px; font-weight: 600;">Displays the current time in the navigation bar.</span>
                                </div>
                                <div class="toggle-switch ${clockEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div class="settings-row" style="cursor: default;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 15px;">Fast-Access Key</span>
                                    <span style="color: var(--text-muted); font-size: 12px; font-weight: 600;">Key to quickly open/close the panel.</span>
                                </div>
                                <input type="text" id="admin-toggle-key" class="modern-input" value="${getToggleKey()}" style="width: 80px; text-align: center; font-weight: 900; padding: 10px; border-radius: 12px; background: rgba(var(--theme-color-rgb), 0.1); color: var(--theme-color); border-color: rgba(var(--theme-color-rgb), 0.2);">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px; gap: 15px;">
                        <div style="font-size: 11px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; color: var(--theme-color); opacity: 0.8; text-shadow: 0 0 15px rgba(var(--theme-color-rgb), 0.4);">
                            JKLM POWER TOOLS
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="padding: 5px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 10px; font-weight: 800; color: var(--text-muted); border: 1px solid var(--glass-border);">VERSION ${SCRIPT_VERSION}</span>
                            <span style="padding: 5px 12px; background: rgba(var(--theme-color-rgb), 0.1); border-radius: 8px; font-size: 10px; font-weight: 800; color: var(--theme-color); border: 1px solid rgba(var(--theme-color-rgb), 0.2);">ROOT EDITION</span>
                        </div>
                    </div>
                </div>
            `;
            };

            updateKbContent();
            updateDictContent();
            updateAdminContent();

            const updateSidebarWidths = (width) => {
                allCustomPages.forEach(p => p.style.width = `${width}px`);
            };
            updateSidebarWidths(getSidebarWidth());

            const pages = document.querySelector('.pages') || main;
            if (pages && pages !== document.body) pages.style.backgroundColor = '#1a1a1a';
            allCustomPages.forEach(p => document.body.appendChild(p));

            window.closeCustomTabs = () => {
                [catTab, dictTab, adminTab].forEach(t => t.classList.remove('active'));
                allCustomPages.forEach(p => p.classList.remove('active'));
                if (customRow) customRow.style.display = 'flex';
                const home = nav.querySelector('[data-tab="home"]') || nav.querySelector('.tab') || nav.querySelector('.custom-tab');
                if (home && ![catTab, dictTab, adminTab].includes(home)) home.click();
            };

            const toggleTab = (tab, page) => {
                const isActive = tab.classList.contains('active');
                if (isActive) {
                    window.closeCustomTabs();
                    return;
                }
                // Ensure width is at least 650px if it was the old default
                let currentWidth = getSidebarWidth();
                if (currentWidth < 650) {
                    currentWidth = 650;
                    setSidebarWidth(650);
                    updateSidebarWidths(650);
                }

                document.querySelectorAll('.page, .tab, .custom-tab').forEach(el => el.classList.remove('active'));
                allCustomPages.forEach(p => {
                    p.classList.remove('active');
                    p.classList.remove('selective-hidden');
                });
                tab.classList.add('active');
                page.classList.add('active');
                if (customRow) customRow.style.display = 'none';
                if (page === dictPage) {
                    updateDictContent();
                    loadDictionary();
                }
            };

            catTab.addEventListener('click', (e) => { e.preventDefault(); toggleTab(catTab, kbPage); });
            dictTab.addEventListener('click', (e) => { e.preventDefault(); toggleTab(dictTab, dictPage); });
            adminTab.addEventListener('click', (e) => {
                e.preventDefault();
                updateAdminContent();
                toggleTab(adminTab, adminPage);
            });

            nav.addEventListener('click', (e) => {
                const clicked = e.target.closest('.tab') || e.target.closest('.custom-tab');
                if (clicked && ![catTab, dictTab, adminTab].includes(clicked)) {
                    allCustomPages.forEach(p => p.classList.remove('active'));
                    [catTab, dictTab, adminTab].forEach(t => t.classList.remove('active'));
                }
            });

            allCustomPages.forEach(p => {
                p.addEventListener('click', (e) => {
                    const closeBtn = e.target.closest('.panel-close');
                    if (closeBtn) {
                        window.closeCustomTabs();
                        return;
                    }

                    const tabBtn = e.target.closest('.panel-nav .custom-tab');
                    if (tabBtn) {
                        const targetId = tabBtn.getAttribute('data-target');
                        if (targetId === 'cat-btn') toggleTab(catTab, kbPage);
                        if (targetId === 'dict-btn') toggleTab(dictTab, dictPage);
                        if (targetId === 'admin-btn') {
                            updateAdminContent();
                            toggleTab(adminTab, adminPage);
                        }
                    }
                });
            });

            kbPage.addEventListener('click', (e) => {
                const row = e.target.closest('.settings-row');
                if (!row) return;

                if (row.id === 'toggle-space-hyphen') setEnabled(!getEnabled());
                if (row.id === 'toggle-chat-hyphen') setChatEnabled(!getChatEnabled());
                updateKbContent();
            });

            const updateSuggestions = () => {
                const input = document.getElementById('dict-msg-input');
                const resultsContainer = document.getElementById('dict-results-container');
                const resultHeader = document.getElementById('dict-result-header');
                const resultList = document.getElementById('dict-result-list');
                if (!input) return;

                const syllable = input.value.trim().toLowerCase();
                const searchMode = getSearchMode();
                const wordType = getWordType();
                const t = translations[getLanguage()] || translations['English'];

                if (!syllable && wordType === 'All') {
                    resultsContainer.classList.remove('active');
                    return;
                }

                if (syllable && syllable.length >= 2) {
                    let history = getSearchHistory();
                    if (!history.includes(syllable.toUpperCase())) {
                        history.unshift(syllable.toUpperCase());
                        history = history.slice(0, 10);
                        setSearchHistory(history);
                        // Don't call updateDictContent here to avoid re-rendering while typing
                    }
                }

                const ensureDictionary = async () => {
                    await loadDictionary();
                };

                ensureDictionary().then(() => {
                    let words = [...dictionary];
                    
                    const minLen = getMinWordLength();
                    const maxLen = getMaxWordLength();

                    // Apply word length filter first
                    words = words.filter(w => w.length >= minLen && w.length <= maxLen);

                    if (syllable) {
                        if (searchMode === 'StartsWith') {
                            words = words.filter(w => w.toLowerCase().startsWith(syllable));
                        } else if (searchMode === 'EndsWith') {
                            words = words.filter(w => w.toLowerCase().endsWith(syllable));
                        } else if (searchMode === 'SyllableChain') {
                            // Example: If last word was "APPLE", syllable is "E" or "LE"
                            words = words.filter(w => w.toLowerCase().startsWith(syllable));
                        } else {
                            words = words.filter(w => w.toLowerCase().includes(syllable));
                        }
                    }

                    if (wordType === 'Hyphen') {
                        words = words.filter(w => w.includes('-'));
                    } else if (wordType === 'Long') {
                        words = words.filter(w => w.includes('-'));
                    } else if (wordType === 'Long') {
                        words = words.filter(w => w.length >= 20);
                    } else if (wordType === 'Shorts') {
                        words = words.filter(w => w.length >= 2 && w.length <= 4);
                    } else if (wordType === 'Phobia') {
                        words = words.filter(w => { const low = w.toLowerCase(); return low.includes('phobia') || low.includes('phobias') || low.includes('phobic'); });
                    } else if (wordType === 'Apostrophes') {
                        words = words.filter(w => w.includes("'"));
                    } else if (wordType === 'Casual') {
                        const rareChars = ['x', 'q', 'z', 'j'];
                        words = words.filter(w => {
                            const low = w.toLowerCase();
                            return w.length >= 4 && w.length <= 8 && !rareChars.some(c => low.includes(c));
                        });
                    }

                    if (words.length > 0) {
                        resultsContainer.classList.add('active');
                        const sorted = [...words].sort((a, b) => b.length - a.length).slice(0, 20);
                        let header = t.dictResultPrefix.replace('{count}', words.length);
                        resultHeader.innerText = header;
                        resultList.innerHTML = sorted.map(w => {
                            return `<span class="clickable-word" title="Click to copy" data-word="${w.toUpperCase()}">${w.toUpperCase()}</span>`;
                        }).join(' – ');
                    } else {
                        resultHeader.innerText = t.dictNoResults;
                        resultList.innerHTML = '';
                    }
                });
            };

            dictPage.addEventListener('click', (e) => {
                if (e.target.id === 'add-note-btn') {
                    const input = document.getElementById('new-note-input');
                    const content = input.value.trim();
                    if (content) {
                        const notes = getNotes();
                        notes.unshift({ content: content, timestamp: Date.now() });
                        setNotes(notes);
                        input.value = '';
                        updateDictContent();
                    }
                }
                if (e.target.classList.contains('note-delete')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    const notes = getNotes();
                    notes.splice(index, 1);
                    setNotes(notes);
                    updateDictContent();
                }

                if (e.target.id === 'dict-file-confirm') {
                    const fileEl = document.getElementById('dict-file-upload');
                    const manualInput = document.getElementById('dict-manual-input');
                    const file = fileEl.files[0];
                    const processWords = (text) => {
                        const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
                        setCustomDictionary(words);
                        dictionary = words;
                        dictionaryLoaded = true;
                        currentDictLang = 'Custom';
                        alert(`Saved ${words.length} words!`);
                        updateSuggestions();
                        if (manualInput) manualInput.value = words.join('\n');
                    };
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => processWords(event.target.result);
                        reader.readAsText(file);
                    } else if (manualInput && manualInput.value.trim()) {
                        processWords(manualInput.value);
                    }
                }
                if (e.target.id === 'clear-history') {
                    setSearchHistory([]);
                    updateDictContent();
                }
                if (e.target.classList.contains('history-chip')) {
                    const input = document.getElementById('dict-msg-input');
                    if (input) {
                        input.value = e.target.innerText;
                        updateSuggestions();
                    }
                }
                if (e.target.id === 'dict-msg-send') {
                    updateSuggestions();
                }

                const filterItem = e.target.closest('.custom-filter-item');
                if (filterItem) {
                    const filterKey = filterItem.getAttribute('data-filter');
                    let currentFilters = getActiveFilters();
                    if (currentFilters.includes(filterKey)) {
                        currentFilters = currentFilters.filter(f => f !== filterKey);
                    } else {
                        currentFilters.push(filterKey);
                    }
                    setActiveFilters(currentFilters);
                    updateDictContent();
                    updateSuggestions();
                }

                if (e.target.classList.contains('clickable-word')) {
                    const word = e.target.innerText;
                    
                    navigator.clipboard.writeText(word).then(() => {
                        const originalColor = e.target.style.color;
                        e.target.style.color = 'var(--theme-color)';
                        setTimeout(() => e.target.style.color = originalColor, 500);
                    });
                }
            });
            dictPage.addEventListener('change', (e) => {
                if (e.target.id === 'dict-lang-select') {
                    const val = e.target.value;
                    setDictLanguage(val);
                    const uploadArea = document.getElementById('custom-dict-upload-area');
                    if (uploadArea) uploadArea.style.display = (val === 'Custom' ? 'block' : 'none');
                    dictionaryLoaded = false;
                    loadDictionary(true).then(() => {
                        updateDictContent();
                        updateSuggestions();
                    });
                } else if (e.target.id === 'dict-search-mode') {
                    setSearchMode(e.target.value);
                    updateSuggestions();
                } else if (e.target.id === 'dict-word-type') {
                    setWordType(e.target.value);
                    updateSuggestions();
                }
            });
            const debouncedUpdateSuggestions = debounce(() => {
                updateSuggestions();
            }, 150);

            dictPage.addEventListener('input', (e) => {
                if (e.target.id === 'dict-msg-input') {
                    debouncedUpdateSuggestions();
                }
                if (e.target.id === 'dict-min-len') {
                    const val = parseInt(e.target.value);
                    setMinWordLength(val);
                    const span = document.getElementById('val-dict-min-len');
                    if (span) span.innerText = val;
                    debouncedUpdateSuggestions();
                }
                if (e.target.id === 'dict-max-len') {
                    const val = parseInt(e.target.value);
                    setMaxWordLength(val);
                    const span = document.getElementById('val-dict-max-len');
                    if (span) span.innerText = val;
                    debouncedUpdateSuggestions();
                }
            });
            dictPage.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.id === 'dict-msg-input') {
                    e.preventDefault();
                    updateSuggestions();
                }
            });

            adminPage.addEventListener('click', (e) => {
                if (e.target.id === 'pos-left-btn') {
                    setPanelPosition('left');
                    updateThemeStyles();
                    updateAdminContent();
                }
                if (e.target.id === 'pos-right-btn') {
                    setPanelPosition('right');
                    updateThemeStyles();
                    updateAdminContent();
                }

                const row = e.target.closest('.settings-row');
                if (row) {
                    if (row.id === 'toggle-clock') {
                        setClockEnabled(!getClockEnabled());
                        updateThemeStyles();
                    }
                    updateAdminContent();
                }
            });

            adminPage.addEventListener('change', (e) => {
                if (e.target.id === 'admin-animation-type') {
                    setAnimationType(e.target.value);
                    updateThemeStyles();
                }
            });

            adminPage.addEventListener('input', (e) => {
                if (e.target.id === 'admin-theme-picker') {
                    setThemeColor(e.target.value);
                    updateThemeStyles();
                }
                if (e.target.id === 'admin-border-radius') {
                    const val = parseInt(e.target.value, 10);
                    setBorderRadius(val);
                    const span = document.getElementById('val-admin-border-radius');
                    if (span) span.innerText = val;
                    updateThemeStyles();
                }
            });

            adminPage.addEventListener('keydown', (e) => {
                if (e.target.id === 'admin-toggle-key') {
                    e.preventDefault();
                    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
                    e.target.value = key;
                    setToggleKey(key);
                }
            });

            const gameObserver = new MutationObserver(() => {
                const sylEl = document.querySelector('.syllable');
                if (sylEl) {
                    const currentSyl = sylEl.innerText.trim().toLowerCase();
                    if (currentSyl !== lastDetectedSyllable) {
                        lastDetectedSyllable = currentSyl;
                        const dictInput = document.getElementById('dict-msg-input');
                        if (dictInput && document.getElementById('dict-btn').classList.contains('active')) {
                            dictInput.value = currentSyl.toUpperCase();
                            updateSuggestions();
                        }
                    }
                }

                // Update lobby filters on mutation
                setupLobbyFilters();
                filterLobbies();

                const isSelfTurn = !!document.querySelector('.selfTurn');
                window.lastTurnState = isSelfTurn;

                const gameVisible = !!document.querySelector('.canvasArea') || !!document.querySelector('.syllable');
                if (gameVisible && !isGameRunning) {
                    isGameRunning = true;
                } else if (!gameVisible && isGameRunning) {
                    isGameRunning = false;
                }
            });
            gameObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

            GM_addValueChangeListener('spaceToHyphenEnabled', () => updateKbContent());
            GM_addValueChangeListener('spaceToHyphenChatEnabled', () => updateKbContent());
            GM_addValueChangeListener('dictLanguage', () => { dictionaryLoaded = false; loadDictionary(true).then(() => updateDictContent()); });
            GM_addValueChangeListener('sidebarWidth', (n, o, nv) => updateSidebarWidths(nv));
            GM_addValueChangeListener('themeColor', () => updateThemeStyles());
            GM_addValueChangeListener('bgColor', () => updateThemeStyles());

            window.addEventListener('keydown', (e) => {
                if (e.key === getToggleKey()) {
                    const isPanelVisible = allCustomPages.some(p => p.classList.contains('active'));
                    if (isPanelVisible) {
                        // Toggle visibility of ALL panels instead of closing
                        allCustomPages.forEach(p => {
                            p.classList.toggle('selective-hidden');
                        });
                    } else {
                        toggleTab(adminTab, adminPage);
                    }
                }

                if (e.key === 'Escape' && [catTab, dictTab, adminTab].some(t => t.classList.contains('active'))) {
                    window.closeCustomTabs();
                }
            });
        } catch (err) {
            console.error('[JKLM Power Tools] Initialization error:', err);
            isInitialized = false;
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F1') {
            e.preventDefault();
            sendToChat('GG');
            return;
        }

        const enabled = getEnabled();
        const chatEnabled = getChatEnabled();
        if (!enabled && !chatEnabled) return;

        if (e.code === 'Space' || e.key === ' ') {
            const active = document.activeElement;
            if (!active || !(active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
            const isChatContext = active.closest('.chat') ||
                active.placeholder?.toLowerCase().includes('chat') ||
                active.classList.contains('chatInput') ||
                active.id === 'dict-msg-input';
            const isSelfTurn = !!document.querySelector('.selfTurn');

            let shouldConvert = false;
            if (isChatContext) {
                if (chatEnabled) shouldConvert = true;
            } else {
                if (enabled && isSelfTurn) shouldConvert = true;
            }
            if (shouldConvert) {
                e.preventDefault();
                e.stopImmediatePropagation();
                try { if (!document.execCommand('insertText', false, '-')) throw new Error(); } catch (err) {
                    const start = active.selectionStart, end = active.selectionEnd;
                    active.value = active.value.substring(0, start) + '-' + active.value.substring(end);
                    active.selectionStart = active.selectionEnd = start + 1;
                    active.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }, true);

            const checkInit = new MutationObserver(() => {
                const nav = document.querySelector('.navigation, .tabs, .room .bottom, .room .navigation');
                if (nav) init();
            });
    checkInit.observe(document.documentElement, { childList: true, subtree: true });

    // Initial check
    init();
    // Fallbacks
    setTimeout(init, 1000);
    setTimeout(init, 3000);
    setTimeout(init, 6000);
})();
