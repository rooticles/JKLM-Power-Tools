// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      13.0
// @description  Advanced JKLM Power Tools - Ultimate Edition (v13.0)
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
     * JKLM Power Tools v13.0 - "Human-Like Edition"
     * 
     * In dieser Version wurde der gesamte Code überarbeitet, um lesbarer, modularer 
     * und "menschlicher" zu sein. Wir verzichten auf übermäßig komplexe Proxies
     * und setzen stattdessen auf saubere Fehlerbehandlung und klare Strukturen.
     */

    const SCRIPT_VERSION = '13.0';
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // --- 1. KONFIGURATION & STORAGE ---

    const Config = {
        // Hilfsfunktionen für den Zugriff auf GM-Werte
        get: (key, defaultValue) => GM_getValue(key, defaultValue),
        set: (key, value) => GM_setValue(key, value),

        // Alle Einstellungen auf einen Blick
        settings: {
            isGameHyphenEnabled: () => Config.get('spaceToHyphenEnabled', false),
            isChatHyphenEnabled: () => Config.get('spaceToHyphenChatEnabled', false),
            dictionaryLanguage: () => Config.get('dictLanguage', 'English'),
            searchMode: () => Config.get('dictSearchMode', 'Contains'),
            wordCategory: () => Config.get('dictWordType', 'All'),
            customWords: () => Config.get('customDictionary', []),
            panelWidth: () => Config.get('sidebarWidth', 650),
            accentColor: () => Config.get('themeColor', '#8A2BE2'),
            borderRadius: () => Config.get('borderRadius', 16),
            isClockVisible: () => Config.get('clockEnabled', true),
            animationStyle: () => Config.get('animationType', 'slideIn'),
            panelSide: () => Config.get('panelPosition', 'right'),
            minWordLen: () => Config.get('minWordLength', 2),
            maxWordLen: () => Config.get('maxWordLength', 30),
            fastAccessKey: () => Config.get('toggleKey', 'F2'),
            searchHistory: () => Config.get('searchHistory', []),
            notes: () => Config.get('notes', [])
        }
    };

    // --- 2. STABILITÄTS-PATCHES (Guardian Mode Lite) ---

    const Stability = {
        init: () => {
            Stability.suppressErrors();
            Stability.patchJklmGlobals();
            Stability.handleAudioContext();
        },

        // Verhindert, dass bestimmte bekannte JKLM-Fehler die Konsole fluten
        suppressErrors: () => {
            win.addEventListener('error', (event) => {
                const errorMessage = event.message || '';
                const noisyErrors = ['addEventListener', 'milestones', 'socket', 'PartyPlus', 'falcon.jklm.fun'];
                
                if (noisyErrors.some(err => errorMessage.includes(err))) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            }, true);
        },

        // Stellt sicher, dass wichtige JKLM-Objekte existieren, bevor das Spiel sie nutzt
        patchJklmGlobals: () => {
            // Fix für chatUnreadHighlightCount ReferenceError
            if (typeof win.chatUnreadHighlightCount === 'undefined') {
                win.chatUnreadHighlightCount = 0;
            }

            // Dummy-Objekte für milestones/socket falls sie noch nicht geladen sind
            const createSafeObject = () => ({
                on: () => {}, off: () => {}, emit: () => {}, 
                addEventListener: () => {}, removeEventListener: () => {}
            });

            ['milestones', 'socket', 'room', 'game'].forEach(objName => {
                if (typeof win[objName] === 'undefined') {
                    win[objName] = createSafeObject();
                }
            });
        },

        // Behebt das "AudioContext was not allowed to start" Problem
        handleAudioContext: () => {
            const tryResume = () => {
                const audioCtxs = [win.audioContext, win.AudioContext, win.webkitAudioContext, win.room?.audioContext];
                audioCtxs.forEach(ctx => {
                    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
                });
            };

            ['click', 'keydown', 'touchstart'].forEach(event => {
                win.addEventListener(event, tryResume, { once: true, capture: true });
            });
        }
    };

    // --- 3. WÖRTERBUCH-LOGIK ---

    const Dictionary = {
        words: [],
        lowercased: [],
        isLoaded: false,
        currentLang: '',

        urls: {
            'English': 'https://raw.githubusercontent.com/tt-46ben/overlay-wordlist/121bf1a601ed822553c2e68c38a4cdcd7737d352/words.txt'
        },

        load: async (force = false) => {
            const lang = Config.settings.dictionaryLanguage();
            if (Dictionary.isLoaded && Dictionary.currentLang === lang && !force) return;

            if (lang === 'Custom') {
                Dictionary.words = Config.settings.customWords();
                Dictionary.lowercased = Dictionary.words.map(w => w.toLowerCase());
                Dictionary.isLoaded = true;
                Dictionary.currentLang = lang;
                return;
            }

            try {
                const url = Dictionary.urls[lang] || Dictionary.urls['English'];
                const response = await fetch(url);
                if (!response.ok) throw new Error('Netzwerkfehler beim Laden des Wörterbuchs');

                const text = await response.text();
                Dictionary.words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
                Dictionary.lowercased = Dictionary.words.map(w => w.toLowerCase());
                Dictionary.isLoaded = true;
                Dictionary.currentLang = lang;
            } catch (err) {
                console.error('[Power Tools] Wörterbuch-Fehler:', err);
                Dictionary.words = ["ERASEMENT", "BIZARRENESSES", "PROMINENT"];
                Dictionary.lowercased = Dictionary.words.map(w => w.toLowerCase());
            }
        },

        findMatches: (syllable) => {
            if (!syllable) return [];
            
            const search = syllable.toLowerCase();
            const mode = Config.settings.searchMode();
            const category = Config.settings.wordCategory();
            const minLen = Config.settings.minWordLen();
            const maxLen = Config.settings.maxWordLen();

            let matches = Dictionary.words.filter((word, index) => {
                const lowWord = Dictionary.lowercased[index];
                if (word.length < minLen || word.length > maxLen) return false;
                if (mode === 'StartsWith' && !lowWord.startsWith(search)) return false;
                if (mode === 'EndsWith' && !lowWord.endsWith(search)) return false;
                if (!lowWord.includes(search)) return false;
                if (category === 'Hyphen' && !word.includes('-')) return false;
                if (category === 'Long' && word.length < 20) return false;
                if (category === 'Shorts' && word.length > 4) return false;
                if (category === 'Phobia' && !lowWord.includes('phobia')) return false;
                if (category === 'Apostrophes' && !word.includes("'")) return false;
                return true;
            });

            return matches.sort((a, b) => b.length - a.length).slice(0, 20);
        }
    };

    // --- 4. UI-SYSTEM & STYLES ---

    const UI = {
        injectStyles: () => {
            const styleElement = document.createElement('style');
            styleElement.id = 'pt-styles';
            styleElement.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                :root {
                    --pt-theme-color: ${Config.settings.accentColor()};
                    --pt-border-radius: ${Config.settings.borderRadius()}px;
                    --pt-font-main: 'Plus Jakarta Sans', sans-serif;
                }

                .pt-panel {
                    display: none;
                    position: fixed;
                    top: 0;
                    width: ${Config.settings.panelWidth()}px;
                    height: 100vh;
                    background: rgba(26, 26, 46, 0.95);
                    backdrop-filter: blur(16px) saturate(180%);
                    z-index: 9999;
                    color: white;
                    font-family: var(--pt-font-main);
                    padding: 20px;
                    box-sizing: border-box;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border-radius: var(--pt-border-radius);
                }

                .pt-panel.active { display: block; }
                .pt-panel.pos-right { right: 0; border-left: 1px solid rgba(255,255,255,0.1); }
                .pt-panel.pos-left { left: 0; border-right: 1px solid rgba(255,255,255,0.1); }

                .pt-panel::-webkit-scrollbar { width: 8px; }
                .pt-panel::-webkit-scrollbar-thumb { 
                    background: rgba(255,255,255,0.2); 
                    border-radius: 10px; 
                }

                .pt-nav-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    height: 60px;
                    gap: 15px;
                    z-index: 10001;
                }

                .pt-tab-btn {
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    font-size: 20px;
                    transition: 0.3s;
                    background: rgba(255,255,255,0.05);
                }

                .pt-tab-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
                .pt-tab-btn.active { background: var(--pt-theme-color); box-shadow: 0 0 15px var(--pt-theme-color); }

                .pt-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: var(--pt-border-radius);
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .pt-input {
                    width: 100%;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    padding: 12px;
                    border-radius: 10px;
                    outline: none;
                    box-sizing: border-box;
                }

                .pt-word {
                    display: inline-block;
                    padding: 8px 12px;
                    margin: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .pt-word:hover { background: var(--pt-theme-color); }

                .pt-clock {
                    margin-left: auto;
                    font-family: monospace;
                    background: rgba(0,0,0,0.3);
                    padding: 5px 10px;
                    border-radius: 8px;
                    color: var(--pt-theme-color);
                }
            `;
            document.head.appendChild(styleElement);
        },

        createInterface: () => {
            const nav = document.querySelector('.navigation') || document.body;
            const navRow = document.createElement('div');
            navRow.className = 'pt-nav-row';
            
            const createBtn = (id, emoji, title) => {
                const btn = document.createElement('div');
                btn.className = 'pt-tab-btn';
                btn.id = id;
                btn.innerHTML = emoji;
                btn.title = title;
                return btn;
            };

            const btnGame = createBtn('pt-btn-game', '🚀', 'Einstellungen');
            const btnDict = createBtn('pt-btn-dict', '📖', 'Wörterbuch');
            const btnSettings = createBtn('pt-btn-admin', '⚙️', 'Design');
            const clock = document.createElement('div');
            clock.className = 'pt-clock';
            
            navRow.append(btnGame, btnDict, btnSettings, clock);
            nav.after(navRow);

            const createPanel = (id) => {
                const panel = document.createElement('div');
                panel.className = `pt-panel pt-panel-${id} pos-${Config.settings.panelSide()}`;
                panel.id = `pt-panel-${id}`;
                document.body.appendChild(panel);
                return panel;
            };

            const panelGame = createPanel('game');
            const panelDict = createPanel('dict');
            const panelAdmin = createPanel('admin');

            setInterval(() => {
                const time = new Date().toLocaleTimeString();
                clock.innerText = Config.settings.isClockVisible() ? time : '';
            }, 1000);

            return { btnGame, btnDict, btnSettings, panelGame, panelDict, panelAdmin };
        }
    };

    // --- 5. HAUPT-LOGIK & INITIALISIERUNG ---

    const App = {
        init: () => {
            Stability.init();
            UI.injectStyles();
            const elements = UI.createInterface();
            App.setupEventListeners(elements);
            Dictionary.load();
        },

        setupEventListeners: (ui) => {
            const panels = [ui.panelGame, ui.panelDict, ui.panelAdmin];
            const buttons = [ui.btnGame, ui.btnDict, ui.btnSettings];

            const togglePanel = (activeBtn, activePanel) => {
                const isAlreadyActive = activePanel.classList.contains('active');
                panels.forEach(p => p.classList.remove('active'));
                buttons.forEach(b => b.classList.remove('active'));

                if (!isAlreadyActive) {
                    activePanel.classList.add('active');
                    activeBtn.classList.add('active');
                    if (activePanel === ui.panelDict) App.renderDictionary(ui.panelDict);
                    else if (activePanel === ui.panelGame) App.renderGameSettings(ui.panelGame);
                    else if (activePanel === ui.panelAdmin) App.renderAdminSettings(ui.panelAdmin);
                }
            };

            ui.btnGame.onclick = () => togglePanel(ui.btnGame, ui.panelGame);
            ui.btnDict.onclick = () => togglePanel(ui.btnDict, ui.panelDict);
            ui.btnSettings.onclick = () => togglePanel(ui.btnSettings, ui.panelAdmin);

            window.addEventListener('keydown', (e) => {
                if (e.key === Config.settings.fastAccessKey()) togglePanel(ui.btnSettings, ui.panelAdmin);
                if (e.key === 'Escape') {
                    panels.forEach(p => p.classList.remove('active'));
                    buttons.forEach(b => b.classList.remove('active'));
                }
            });

            document.addEventListener('keydown', App.handleSpaceKey, true);
        },

        handleSpaceKey: (e) => {
            if (e.code !== 'Space') return;
            const isGameEnabled = Config.settings.isGameHyphenEnabled();
            const isChatEnabled = Config.settings.isChatHyphenEnabled();
            if (!isGameEnabled && !isChatEnabled) return;

            const active = document.activeElement;
            const isInput = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA';
            if (!isInput) return;

            const isChat = active.closest('.chat') || active.placeholder?.toLowerCase().includes('chat');
            const isSelfTurn = !!document.querySelector('.selfTurn');
            let shouldConvert = (isChat && isChatEnabled) || (!isChat && isGameEnabled && isSelfTurn);

            if (shouldConvert) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const start = active.selectionStart, end = active.selectionEnd;
                active.value = active.value.substring(0, start) + '-' + active.value.substring(end);
                active.selectionStart = active.selectionEnd = start + 1;
                active.dispatchEvent(new Event('input', { bubbles: true }));
            }
        },

        renderDictionary: (container) => {
            container.innerHTML = `
                <h2>📖 Wörterbuch</h2>
                <div class="pt-card">
                    <input type="text" id="pt-dict-input" class="pt-input" placeholder="Silbe eingeben...">
                    <div id="pt-dict-results" style="margin-top: 15px;"></div>
                </div>
            `;
            const input = container.querySelector('#pt-dict-input');
            const results = container.querySelector('#pt-dict-results');
            input.oninput = () => {
                const matches = Dictionary.findMatches(input.value);
                results.innerHTML = matches.map(word => `<span class="pt-word">${word}</span>`).join('');
                results.querySelectorAll('.pt-word').forEach(el => {
                    el.onclick = () => {
                        navigator.clipboard.writeText(el.innerText);
                        el.style.color = 'var(--pt-theme-color)';
                        setTimeout(() => el.style.color = '', 500);
                    };
                });
            };
        },

        renderGameSettings: (container) => {
            const isGame = Config.settings.isGameHyphenEnabled();
            const isChat = Config.settings.isChatHyphenEnabled();
            container.innerHTML = `
                <h2>🚀 Spiel-Einstellungen</h2>
                <div class="pt-card">
                    <label style="display: block; margin-bottom: 10px;">
                        <input type="checkbox" id="pt-set-game-hyphen" ${isGame ? 'checked' : ''}> Leertaste -> Bindestrich (Spiel)
                    </label>
                    <label>
                        <input type="checkbox" id="pt-set-chat-hyphen" ${isChat ? 'checked' : ''}> Leertaste -> Bindestrich (Chat)
                    </label>
                </div>
            `;
            container.querySelector('#pt-set-game-hyphen').onchange = (e) => Config.set('spaceToHyphenEnabled', e.target.checked);
            container.querySelector('#pt-set-chat-hyphen').onchange = (e) => Config.set('spaceToHyphenChatEnabled', e.target.checked);
        },

        renderAdminSettings: (container) => {
            container.innerHTML = `
                <h2>🎨 Design & System</h2>
                <div class="pt-card">
                    <p>Akzentfarbe:</p>
                    <input type="color" id="pt-set-color" value="${Config.settings.accentColor()}" style="width:100%">
                    <p style="margin-top: 15px;">Ecken-Abrundung (px):</p>
                    <input type="range" id="pt-set-radius" min="0" max="40" value="${Config.settings.borderRadius()}" style="width:100%">
                </div>
                <div style="text-align: center; opacity: 0.5; font-size: 12px;">
                    JKLM Power Tools v${SCRIPT_VERSION}
                </div>
            `;
            container.querySelector('#pt-set-color').oninput = (e) => {
                Config.set('themeColor', e.target.value);
                document.documentElement.style.setProperty('--pt-theme-color', e.target.value);
            };
            container.querySelector('#pt-set-radius').oninput = (e) => {
                Config.set('borderRadius', e.target.value);
                document.documentElement.style.setProperty('--pt-border-radius', e.target.value + 'px');
            };
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init);
    else App.init();
})();
