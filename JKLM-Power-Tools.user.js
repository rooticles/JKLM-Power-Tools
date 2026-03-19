// ==UserScript==
// @name         JKLM-Power-Tools
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Advanced JKLM Power Tools with Dictionary, Notes and UI Customization
// @author       Root
// @updateURL    https://raw.githubusercontent.com/Natalie/JKLM-Power-Tools/main/JKLM-Power-Tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Natalie/JKLM-Power-Tools/main/JKLM-Power-Tools.user.js
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
    const getThemeColor = () => GM_getValue('themeColor', '#4caf50');
    const setThemeColor = (val) => GM_setValue('themeColor', val);
    const getBgColor = () => GM_getValue('bgColor', '#1a1a1a');
    const setBgColor = (val) => GM_setValue('bgColor', val);

    const getLanguage = () => GM_getValue('language', 'English');
    const setLanguage = (val) => GM_setValue('language', val);

    const getGlassOpacity = () => GM_getValue('glassOpacity', 0.85);
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
            kbHeader: '🐱 Keyboard Settings',
            toggleLabel: 'Spacebar to hyphen in Game On/Off',
            chatToggleLabel: 'Spacebar to Hyphen in Chat On/Off',
            onDesc: 'On = Pressing spacebar during a round will result in a hyphen instead',
            offDesc: 'Off = Pressing spacebar during a round will result in a space',
            chatDesc: 'On = Spacebar in chat becomes a hyphen',
            chatOffDesc: 'Off = Spacebar in chat remains a spacebar',
            closeInfo: 'This script enhances your JKLM experience. <br><br>You can close this menu with the <strong>ESC</strong> key.',
            dictHeader: '📚 Dictionary Words',
            msgLabel: 'Write a message',
            msgPlaceholder: 'Your message...',
            msgSend: 'Send',
            dictResultPrefix: 'There are {count} words that match:',
            dictNoResults: 'No words found.',
            dictSearchModeLabel: 'Search Mode:',
            dictWordTypeLabel: 'Word Type:',
            dictSelectLabel: 'Select Dictionary:',
            historyHeader: '📜 History',
            historyEmpty: 'No words in this round yet.',
            adminHeader: '✨ UI & Settings',
            adminVisualHeader: '🎨 UI & Visual Aids',
            adminMiniModeLabel: 'Mini-Mode UI',
            adminFontLabel: 'Custom Font:',
            adminThemeLabel: 'Theme Color:',
            adminBgLabel: 'Background Color:',
            adminPresetsLabel: '🎨 Theme Presets:',
            adminCppHeader: '🖼️ Custom Profile Pictures',
            adminCppDesc: 'Try the file uploader below:',
            adminCppBtn: 'Use as profile picture',
            adminCppError: 'Sorry. This file is too large. (>10Kb)',
            adminCppSuccess: 'Success.',
            adminSidebarWidthLabel: 'Sidebar Width (pixels):',
            adminMinLabel: 'Minimal width: 180.',
            adminLoginHeader: '🛡️ Admin Login',
            adminUserPlaceholder: 'Username...',
            adminPassPlaceholder: 'Password...',
            adminLoginBtn: 'Login',
            adminLogoutBtn: 'Logout',
            adminLoginError: 'Invalid credentials!',
            adminGlassLabel: 'Glass Opacity:',
            adminRadiusLabel: 'Corner Radius:',
            adminClockLabel: 'Digital Clock',
            adminThemeAnimLabel: 'Animate Theme Colors',
            adminBgImageLabel: 'Background Image (URL):',
            adminAnimLabel: 'Open Animation:',
            dictCustomUpload: 'Custom Dictionary',
            dictUploadDesc: 'Upload a file or paste words (one per line):',
            dictUploadBtn: 'Save Wordlist',
            dictPlaceholder: 'Paste your words here...',
            dictFoundWords: 'Found {count} words:',
            dictNoResultsShort: 'No results.',
            german: 'German',
            english: 'English',
            // Features
            notesHeader: '📝 Notes',
            notesDesc: 'Keep track of your thoughts and strategies',
            addNote: 'Add Note',
            notePlaceholder: 'Write your note here...',
            saveNote: 'Save Note',
            noNotes: 'No notes yet. Start writing!',
            toggleKeyLabel: 'Panel Toggle Hotkey'
        },
        'German': {
            kbHeader: '🐱 Tastatur-Einstellungen',
            toggleLabel: 'Leertaste zu Bindestrich im Spiel',
            chatToggleLabel: 'Leertaste zu Bindestrich im Chat',
            onDesc: 'An = Leertaste während einer Runde wird zum Bindestrich',
            offDesc: 'Aus = Leertaste während einer Runde bleibt ein Leerzeichen',
            chatDesc: 'An = Leertaste im Chat wird zum Bindestrich',
            chatOffDesc: 'Aus = Leertaste im Chat bleibt ein Leerzeichen',
            closeInfo: 'Dieses Skript verbessert dein JKLM-Erlebnis. <br><br>Menü schließen mit <strong>ESC</strong>.',
            dictHeader: '📚 Wörterbuch',
            msgLabel: 'Nachricht schreiben',
            msgPlaceholder: 'Deine Nachricht...',
            msgSend: 'Senden',
            dictResultPrefix: 'Es gibt {count} passende Wörter:',
            dictNoResults: 'Keine Wörter gefunden.',
            dictSearchModeLabel: 'Suchmodus:',
            dictWordTypeLabel: 'Worttyp:',
            dictSelectLabel: 'Wörterbuch wählen:',
            historyHeader: '📜 Verlauf',
            historyEmpty: 'Noch keine Wörter in dieser Runde.',
            adminHeader: '✨ UI & Einstellungen',
            adminVisualHeader: '🎨 UI & Design',
            adminMiniModeLabel: 'Mini-Modus UI',
            adminFontLabel: 'Schriftart:',
            adminThemeLabel: 'Themenfarbe:',
            adminBgLabel: 'Hintergrundfarbe:',
            adminPresetsLabel: '🎨 Themen-Vorlagen:',
            adminCppHeader: '🖼️ Eigenes Profilbild',
            adminCppDesc: 'Datei-Uploader nutzen:',
            adminCppBtn: 'Als Profilbild nutzen',
            adminCppError: 'Datei zu groß (>10Kb).',
            adminCppSuccess: 'Erfolgreich.',
            adminSidebarWidthLabel: 'Sidebar Breite (Pixel):',
            adminMinLabel: 'Minimale Breite: 180.',
            adminLoginHeader: '🛡️ Admin Login',
            adminUserPlaceholder: 'Benutzername...',
            adminPassPlaceholder: 'Password...',
            adminLoginBtn: 'Login',
            adminLogoutBtn: 'Logout',
            adminLoginError: 'Ungültige Daten!',
            adminGlassLabel: 'Glas-Transparenz:',
            adminRadiusLabel: 'Ecken-Radius:',
            adminClockLabel: 'Digitale Uhr',
            adminThemeAnimLabel: 'Themen-Farben animieren',
            adminBgImageLabel: 'Hintergrundbild (URL):',
            adminAnimLabel: 'Öffnen-Animation:',
            dictCustomUpload: 'Eigenes Wörterbuch',
            dictUploadDesc: 'Datei hochladen oder Wörter einfügen (eins pro Zeile):',
            dictUploadBtn: 'Wortliste speichern',
            dictPlaceholder: 'Wörter hier einfügen...',
            dictFoundWords: '{count} Wörter gefunden:',
            dictNoResultsShort: 'Keine Ergebnisse.',
            german: 'Deutsch',
            english: 'Englisch',
            notesHeader: '📝 Notizen',
            notesDesc: 'Halte deine Gedanken und Strategien fest',
            addNote: 'Notiz hinzufügen',
            notePlaceholder: 'Notiz schreiben...',
            saveNote: 'Speichern',
            noNotes: 'Noch keine Notizen.',
            toggleKeyLabel: 'Panel Hotkey'
        }
    };

    // --- Dictionary Logic ---
    let dictionary = [];
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

            dictionaryLoaded = true;
            currentDictLang = lang;
        } catch (err) {
            console.error('Dictionary load error:', err);
            dictionary = ["ERASEMENT", "BIZARRENESSES", "PROMINENT"];
            dictionaryLoaded = true;
            currentDictLang = lang;
        }
    };

    const findWords = (syllable) => {
        if (!syllable) return [];
        const search = syllable.toLowerCase();
        return dictionary.filter(word => word.toLowerCase().includes(search));
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
            --theme-color: #4caf50;
            --theme-color-rgb: 76, 175, 80;
            --bg-color: #0f1115;
            --bg-rgb: 15, 17, 21;
            --glass-bg: rgba(15, 17, 21, 0.85);
            --glass-border: rgba(255, 255, 255, 0.08);
            --border-radius: 20px;
            --text-color: #ffffff;
            --text-muted: #8e9196;
            --panel-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.8);
            --transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            --font-main: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
            background: rgba(255, 255, 255, 0.05); 
            border-radius: 10px; 
        }
        ::-webkit-scrollbar-thumb:hover { background: var(--theme-color); }

        .custom-nav-row {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.4);
            height: 44px;
            width: 100%;
            border-bottom: 1px solid var(--glass-border);
            position: relative;
            z-index: 10001;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        .panel-nav {
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.2);
            height: 70px;
            border-bottom: 1px solid var(--glass-border);
            margin: -20px -20px 25px -20px;
            padding: 0 28px;
            width: calc(100% + 40px);
            box-sizing: border-box;
            backdrop-filter: blur(20px);
            position: relative;
        }

        .panel-clock-inner {
            position: absolute;
            top: 10px;
            right: 20px;
            font-size: 10px;
            font-weight: 800;
            color: var(--theme-color);
            letter-spacing: 1px;
            opacity: 0.6;
        }

        .panel-title {
            font-weight: 800;
            font-size: 18px;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 24px;
            flex: 1;
            letter-spacing: -0.5px;
        }

        .custom-clock {
            margin-left: auto;
            margin-right: 12px;
            font-family: var(--font-main);
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 40px;
            border: 1px solid var(--glass-border);
            letter-spacing: 0.8px;
        }

        .custom-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0 20px;
            height: 100%;
            font-size: 22px;
            transition: var(--transition);
            position: relative;
            background: transparent;
            color: var(--text-muted);
            opacity: 0.5;
            filter: grayscale(1);
        }

        .custom-tab:hover {
            opacity: 1;
            filter: grayscale(0.5);
            background: rgba(255, 255, 255, 0.03);
            transform: translateY(-1px);
        }

        .custom-tab.active {
            opacity: 1;
            filter: grayscale(0);
            color: var(--theme-color);
        }

        .custom-tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 15%;
            width: 70%;
            height: 4px;
            background: var(--theme-color);
            box-shadow: 0 -2px 15px var(--theme-color), 0 0 30px var(--theme-color);
            border-radius: 10px 10px 0 0;
        }

        .custom-kb-page, .custom-lang-page, .custom-dict-page, .custom-dash-page, .custom-admin-page {
            display: none;
            padding: 20px;
            color: var(--text-color);
            background: var(--glass-bg);
            backdrop-filter: blur(40px) saturate(180%);
            -webkit-backdrop-filter: blur(40px) saturate(180%);
            height: 100vh;
            overflow-y: auto;
            box-sizing: border-box;
            width: 650px;
            border-left: 1px solid var(--glass-border);
            border-right: 1px solid var(--glass-border);
            box-shadow: var(--panel-shadow);
            position: fixed;
            top: 0;
            z-index: 9999;
            font-family: var(--font-main);
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), left 0.5s ease, right 0.5s ease;
        }

        .custom-kb-page.pos-right, .custom-lang-page.pos-right, .custom-dict-page.pos-right, .custom-dash-page.pos-right, .custom-admin-page.pos-right {
            right: 0;
            left: auto;
            border-right: none;
            animation: slideInPanelRight 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-kb-page.pos-left, .custom-lang-page.pos-left, .custom-dict-page.pos-left, .custom-dash-page.pos-left, .custom-admin-page.pos-left {
            left: 0;
            right: auto;
            border-left: none;
            animation: slideInPanelLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInPanelRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInPanelLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .custom-kb-page.active, .custom-lang-page.active, .custom-dict-page.active, .custom-dash-page.active, .custom-admin-page.active {
            display: block;
        }

        .custom-close-x {
            cursor: pointer;
            font-size: 14px;
            color: var(--text-muted);
            transition: var(--transition);
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
        }

        .custom-close-x:hover {
            color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
            border-color: rgba(255, 68, 68, 0.2);
            transform: rotate(90deg) scale(1.1);
        }

        .settings-row {
            padding: 18px 24px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: var(--border-radius);
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: var(--transition);
            border: 1px solid var(--glass-border);
            position: relative;
            overflow: hidden;
        }

        .settings-row:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(var(--theme-color-rgb), 0.4);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
        }

        .toggle-switch {
            width: 48px;
            height: 26px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 30px;
            position: relative;
            cursor: pointer;
            transition: var(--transition);
            border: 1px solid rgba(255,255,255,0.05);
        }

        .toggle-switch.on {
            background: var(--theme-color);
            box-shadow: 0 0 20px rgba(var(--theme-color-rgb), 0.5);
            border-color: rgba(var(--theme-color-rgb), 0.5);
        }

        .toggle-knob {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: var(--transition);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .toggle-switch.on .toggle-knob {
            left: 24px;
            transform: scale(1.1);
        }

        .custom-msg-input, .custom-dict-select {
            width: 100%;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--glass-border);
            color: var(--text-color);
            padding: 14px 18px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 500;
            transition: var(--transition);
            box-sizing: border-box;
            outline: none;
        }

        .custom-msg-input:focus, .custom-dict-select:focus {
            border-color: var(--theme-color);
            box-shadow: 0 0 0 4px rgba(var(--theme-color-rgb), 0.15);
            background: rgba(0, 0, 0, 0.3);
        }

        .custom-msg-send, .custom-macro-btn {
            background: linear-gradient(135deg, var(--theme-color), rgba(var(--theme-color-rgb), 0.8));
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 14px;
            cursor: pointer;
            font-weight: 800;
            font-size: 14px;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 8px 25px -5px rgba(var(--theme-color-rgb), 0.4);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .custom-msg-send:hover, .custom-macro-btn:hover {
            transform: translateY(-3px);
            filter: brightness(1.1);
            box-shadow: 0 12px 30px -5px rgba(var(--theme-color-rgb), 0.6);
        }

        .custom-dict-results {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.15);
            border-radius: var(--border-radius);
            border: 1px solid var(--glass-border);
            display: none;
        }

        .custom-dict-results.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .custom-dict-result-header {
            color: var(--theme-color);
            font-weight: 700;
            margin-bottom: 12px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .custom-dict-result-list {
            color: #ddd;
            line-height: 1.6;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .clickable-word {
            display: inline-block;
            padding: 2px 6px;
            margin: 2px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
        }

        .clickable-word:hover {
            background: var(--theme-color);
            color: white;
            transform: scale(1.1);
        }

        .custom-preset-btn {
            flex: 1 1 calc(33.33% - 10px);
            min-width: 70px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            border-radius: var(--border-radius);
            padding: 8px;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        }

        .custom-preset-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .custom-preset-btn.active {
            border-color: var(--theme-color);
            background: rgba(var(--theme-color-rgb), 0.1);
        }

        .preset-preview {
            width: 100%;
            height: 30px;
            border-radius: calc(var(--border-radius) / 2);
        }

        .custom-theme-picker {
            width: 40px;
            height: 40px;
            padding: 0;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            overflow: hidden;
            background: none;
        }

        .custom-theme-picker::-webkit-color-swatch-wrapper { padding: 0; }
        .custom-theme-picker::-webkit-color-swatch { border: 2px solid white; border-radius: 50%; }

        .mini-mode-active .custom-nav-row { height: 40px; }
        .mini-mode-active .tab { font-size: 18px; padding: 0 12px; }
        .mini-mode-active .custom-kb-page,
        .mini-mode-active .custom-dict-page,
        .mini-mode-active .custom-admin-page { padding: 12px; width: 220px; }
        .mini-mode-active .settings-row { padding: 8px 10px; margin-bottom: 8px; font-size: 12px; }
        .mini-mode-active .custom-kb-header { font-size: 15px; margin-bottom: 12px; }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(var(--theme-color-rgb), 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(var(--theme-color-rgb), 0); }
            100% { box-shadow: 0 0 0 0 rgba(var(--theme-color-rgb), 0); }
        }

        .feature-section {
            background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);
        }

        .feature-header {
            font-weight: 800;
            color: var(--text-color);
            margin-bottom: 20px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            letter-spacing: -0.2px;
        }

        .feature-header span:first-child {
            width: 32px;
            height: 32px;
            background: rgba(var(--theme-color-rgb), 0.15);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--theme-color);
            font-size: 16px;
        }

        .note-item {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 18px;
            margin-bottom: 12px;
            transition: var(--transition);
        }

        .note-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--theme-color);
            transform: translateX(5px);
        }

        .custom-dict-results {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 20px;
            border: 1px solid var(--glass-border);
            padding: 20px;
            margin-top: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .clickable-word {
            display: inline-block;
            padding: 6px 14px;
            margin: 4px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            cursor: pointer;
            transition: var(--transition);
            font-weight: 600;
            font-size: 13px;
        }

        .clickable-word:hover {
            background: var(--theme-color);
            color: white;
            border-color: var(--theme-color);
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(var(--theme-color-rgb), 0.4);
        }

        .word-tooltip {
            position: fixed;
            background: var(--glass-bg);
            backdrop-filter: blur(15px);
            border: 1px solid var(--theme-color);
            padding: 12px;
            border-radius: 12px;
            z-index: 10002;
            max-width: 250px;
            font-size: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            pointer-events: none;
            display: none;
            color: var(--text-color);
            line-height: 1.4;
        }

        .selective-hidden {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            pointer-events: none !important;
            transition: none !important;
        }

        .selective-hidden * {
            visibility: hidden !important;
            opacity: 0 !important;
            transition: none !important;
        }

        .selective-hidden img {
            visibility: visible !important;
            opacity: 0.8 !important;
            filter: drop-shadow(0 0 10px var(--theme-color)) !important;
            pointer-events: auto !important;
            transition: 0.3s;
        }

        .selective-hidden img:hover {
            opacity: 1 !important;
            transform: scale(1.2) !important;
        }

        .note-delete {
            width: 28px;
            height: 28px;
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid rgba(255, 68, 68, 0.2);
            border-radius: 8px;
            color: #ff4444;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: var(--transition);
        }

        .note-delete:hover {
            background: #ff4444;
            color: white;
            transform: scale(1.1);
        }

        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);

    const updateThemeStyles = () => {
        const themeColor = getThemeColor();
        const bgColor = getBgColor();
        const font = getCustomFont();
        const glassOpacity = getGlassOpacity();
        const borderRadius = getBorderRadius();
        const clockEnabled = getClockEnabled();
        const themeAnimEnabled = getThemeAnimEnabled();
        const bgImageUrl = getBgImageUrl();
        const animationType = getAnimationType();
        const panelPosition = getPanelPosition();

        const themeRgb = themeColor.match(/\w\w/g).map(x => parseInt(x, 16)).join(',');
        const bgRgb = bgColor.match(/\w\w/g).map(x => parseInt(x, 16)).join(',');

        document.documentElement.style.setProperty('--theme-color', themeColor);
        document.documentElement.style.setProperty('--theme-color-rgb', themeRgb);
        document.documentElement.style.setProperty('--bg-color', bgColor);
        document.documentElement.style.setProperty('--bg-rgb', bgRgb);
        document.documentElement.style.setProperty('--glass-bg', `rgba(${bgRgb}, ${glassOpacity})`);
        document.documentElement.style.setProperty('--border-radius', `${borderRadius}px`);

        const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const luminance = getLuminance(bgColor);
        const textColor = luminance > 128 ? '#000000' : '#ffffff';
        const textMuted = luminance > 128 ? '#444444' : '#a0a0a0';
        const glassBorder = luminance > 128 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)';

        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--text-muted', textMuted);
        document.documentElement.style.setProperty('--glass-border', glassBorder);

        document.querySelectorAll('.custom-kb-page, .custom-lang-page, .custom-dict-page, .custom-dash-page, .custom-admin-page').forEach(p => {
            p.classList.remove('pos-left', 'pos-right');
            p.classList.add(`pos-${panelPosition}`);
            p.style.animation = `${animationType}${panelPosition === 'left' ? 'Left' : 'Right'} 0.5s cubic-bezier(0.16, 1, 0.3, 1)`;
            p.style.backgroundImage = bgImageUrl ? `linear-gradient(rgba(${bgRgb}, ${glassOpacity}), rgba(${bgRgb}, ${glassOpacity})), url(${bgImageUrl})` : 'none';
            p.style.backgroundSize = 'cover';
            p.style.backgroundPosition = 'center';
        });
    };
    updateThemeStyles();

    let lastDetectedSyllable = '';
    let isGameRunning = false;

    let isInitialized = false;
    const init = () => {
        if (isInitialized) return;
        try {
            console.log('[JKLM Power Tools] Initializing...');
            const nav = document.querySelector('.navigation') || document.querySelector('.tabs') || document.querySelector('.room .bottom');
            const main = document.querySelector('main') || document.body;
            if (!nav) {
                console.warn('[JKLM Power Tools] Navigation not found, retrying...');
                return;
            }

            isInitialized = true;
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
                t.innerHTML = `<span style="transform: translateY(1px); pointer-events: none;">${icon}</span>`;
                return t;
            };

            const catTab = createTab('cat-btn', '🐱');
            const dictTab = createTab('dict-btn', '📚');
            const adminTab = createTab('admin-btn', '✨');

            [catTab, dictTab, adminTab].forEach(t => {
                customRow.appendChild(t);
            });

            const clock = document.createElement('div');
            clock.id = 'custom-clock';
            clock.className = 'custom-clock';
            customRow.appendChild(clock);

            const updateClock = () => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                if (clock) clock.innerText = timeStr;
                const pClock = document.getElementById('panel-clock');
                if (pClock) pClock.innerText = timeStr;
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
                        <span style="background: linear-gradient(to right, var(--theme-color), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${title}</span>
                        <div style="display: flex; gap: 5px; margin-left: 10px;">
                            <div class="custom-tab ${activeTabId === 'cat-btn' ? 'active' : ''}" data-target="cat-btn" style="font-size: 16px;">🐱</div>
                            <div class="custom-tab ${activeTabId === 'dict-btn' ? 'active' : ''}" data-target="dict-btn" style="font-size: 16px;">📚</div>
                            <div class="custom-tab ${activeTabId === 'admin-btn' ? 'active' : ''}" data-target="admin-btn" style="font-size: 16px;">✨</div>
                        </div>
                    </div>
                    ${clockEnabled ? `<div class="custom-clock" id="panel-clock">${timeStr}</div>` : ''}
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
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div class="settings-row" id="toggle-space-hyphen">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span style="font-weight: 700; font-size: 15px;">${t.toggleLabel}</span>
                                <span style="color: var(--text-muted); font-size: 12px; line-height: 1.4;">${isEnabled ? t.onDesc : t.offDesc}</span>
                            </div>
                            <div class="toggle-switch ${isEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                        </div>

                        <div class="settings-row" id="toggle-chat-hyphen">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span style="font-weight: 700; font-size: 15px;">${t.chatToggleLabel}</span>
                                <span style="color: var(--text-muted); font-size: 12px; line-height: 1.4;">${isChatEnabled ? t.chatDesc : t.chatOffDesc}</span>
                            </div>
                            <div class="toggle-switch ${isChatEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                        </div>
                    </div>

                    <div style="margin-top: 30px; padding: 20px; background: linear-gradient(to bottom right, rgba(var(--theme-color-rgb), 0.1), rgba(0,0,0,0.2)); border-radius: 16px; border: 1px solid rgba(var(--theme-color-rgb), 0.2); color: var(--text-muted); font-size: 13px; line-height: 1.6; position: relative; overflow: hidden;">
                        <div style="position: absolute; right: -10px; bottom: -10px; font-size: 60px; opacity: 0.05; transform: rotate(-15deg);">💡</div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: var(--theme-color); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                            <span>💡</span> Info
                        </div>
                        ${t.closeInfo}
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
                <div style="margin-top: 15px; padding: 16px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid var(--glass-border);">
                    <div style="font-size: 12px; font-weight: 800; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Recent</span>
                        <span id="clear-history" style="cursor: pointer; color: #ff4444; font-size: 10px; background: rgba(255, 68, 68, 0.1); padding: 4px 8px; border-radius: 6px; transition: 0.2s;">CLEAR</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${history.map(h => `<span class="history-chip" style="padding: 6px 12px; background: rgba(var(--theme-color-rgb), 0.1); border-radius: 10px; font-size: 12px; cursor: pointer; border: 1px solid rgba(var(--theme-color-rgb), 0.2); font-weight: 600; transition: 0.2s;">${h}</span>`).join('')}
                    </div>
                </div>
            ` : '';

                const notesHtml = notes.length > 0 ? notes.slice(0, 5).map((note, index) => `
                    <div class="note-item">
                        <button class="note-delete" data-index="${index}">✕</button>
                        <div class="note-content" style="font-size: 13px; line-height: 1.4; margin-bottom: 5px;">${note.content}</div>
                        <div class="note-timestamp" style="font-size: 10px; opacity: 0.6;">${new Date(note.timestamp).toLocaleString()}</div>
                    </div>
                `).join('') : `<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">${t.noNotes}</div>`;

                const minLen = getMinWordLength();
                const maxLen = getMaxWordLength();

                dictPage.innerHTML = `
                ${getPanelNav('dict-btn', t.dictHeader)}
                <div class="custom-page-content">
                    <div class="feature-section">
                        <div class="feature-header">
                            <span>📝</span> ${t.notesHeader}
                        </div>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <input type="text" id="new-note-input" class="custom-msg-input" placeholder="${t.notePlaceholder}" style="margin-top: 0;">
                            <button class="custom-msg-send" id="add-note-btn" style="min-width: 50px;">+</button>
                        </div>
                        <div id="notes-list" style="display: flex; flex-direction: column; gap: 8px;">
                            ${notesHtml}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                        <div style="position: relative;">
                            <input type="text" class="custom-msg-input" id="dict-msg-input" placeholder="Type letters..." style="padding-right: 45px; height: 50px; font-size: 16px; font-weight: 600;">
                            <div style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 18px; opacity: 0.5;">🔍</div>
                        </div>

                        <div style="display: flex; gap: 10px;">
                            <select class="custom-dict-select" id="dict-search-mode" style="flex: 1; height: 45px; font-weight: 600;">
                                <option value="Contains" ${searchMode === 'Contains' ? 'selected' : ''}>Contains</option>
                                <option value="StartsWith" ${searchMode === 'StartsWith' ? 'selected' : ''}>Starts With</option>
                                <option value="EndsWith" ${searchMode === 'EndsWith' ? 'selected' : ''}>Ends With</option>
                                <option value="SyllableChain" ${searchMode === 'SyllableChain' ? 'selected' : ''}>Syllable Chain</option>
                            </select>
                            <select class="custom-dict-select" id="dict-word-type" style="flex: 1; height: 45px; font-weight: 600;">
                                <option value="All" ${wordType === 'All' ? 'selected' : ''}>All Words</option>
                                <option value="Hyphen" ${wordType === 'Hyphen' ? 'selected' : ''}>Hyphen Only</option>
                                <option value="Long" ${wordType === 'Long' ? 'selected' : ''}>Long Words Only</option>
                                <option value="Casual" ${wordType === 'Casual' ? 'selected' : ''}>Casual Words</option>
                                <option value="Shorts" ${wordType === 'Shorts' ? 'selected' : ''}>Shorts</option>
                                <option value="Phobia" ${wordType === 'Phobia' ? 'selected' : ''}>Phobia</option>
                                <option value="Apostrophes" ${wordType === 'Apostrophes' ? 'selected' : ''}>Apostrophes</option>
                            </select>
                        </div>

                        <div class="feature-section" style="padding: 15px; margin-bottom: 0;">
                            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">
                                <span>Word Length</span>
                                <span>${minLen} - ${maxLen}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="range" id="dict-min-len" min="2" max="30" value="${minLen}" style="flex: 1; accent-color: var(--theme-color);">
                                <input type="range" id="dict-max-len" min="2" max="30" value="${maxLen}" style="flex: 1; accent-color: var(--theme-color);">
                            </div>
                        </div>
                    </div>

                    ${historyHtml}

                    <div class="feature-section" style="margin-top: 20px;">
                        <div class="feature-header">
                            <span>📖</span> ${t.dictSelectLabel}
                        </div>
                        <select class="custom-dict-select" id="dict-lang-select">
                            ${options}
                            <option value="Custom" ${dictLang === 'Custom' ? 'selected' : ''}>${t.dictCustomUpload}</option>
                        </select>
                    </div>

                    <div id="custom-dict-upload-area" style="display: ${dictLang === 'Custom' ? 'block' : 'none'}; margin-bottom: 20px; padding: 20px; background: rgba(var(--theme-color-rgb), 0.05); border-radius: 16px; border: 2px dashed rgba(var(--theme-color-rgb), 0.3);">
                        <div style="font-size: 13px; color: var(--text-color); font-weight: 700; margin-bottom: 12px;">${t.dictUploadDesc}</div>
                        <input type="file" id="dict-file-upload" class="custom-msg-input" accept=".txt" style="margin-bottom: 12px; border-style: solid;">
                        <textarea id="dict-manual-input" class="custom-msg-input" style="min-height: 120px; font-size: 13px; margin-bottom: 12px; font-family: monospace;" placeholder="${t.dictPlaceholder}">${(getCustomDictionary() || []).join('\n')}</textarea>
                        <button class="custom-msg-send" id="dict-file-confirm" style="width: 100%;">
                            <span>💾</span> ${t.dictUploadBtn}
                        </button>
                    </div>

                    <div class="custom-dict-results" id="dict-results-container" style="border-radius: 16px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 20px;">
                        <div class="custom-dict-result-header" id="dict-result-header" style="font-size: 14px; font-weight: 800; color: var(--theme-color); margin-bottom: 15px;"></div>
                        <div class="custom-dict-result-list" id="dict-result-list" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                    </div>

                    <div style="margin-top: 30px; padding: 20px; background: linear-gradient(to bottom right, rgba(var(--theme-color-rgb), 0.1), rgba(0,0,0,0.2)); border-radius: 16px; border: 1px solid rgba(var(--theme-color-rgb), 0.2); color: var(--text-muted); font-size: 13px; line-height: 1.6; position: relative; overflow: hidden;">
                        <div style="position: absolute; right: -10px; bottom: -10px; font-size: 60px; opacity: 0.05; transform: rotate(-15deg);">💡</div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: var(--theme-color); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                            <span>💡</span> Tip
                        </div>
                        Click on a word to copy it to your clipboard.
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
                adminTab.title = t.adminHeader;

                adminPage.innerHTML = `
                ${getPanelNav('admin-btn', t.adminHeader)}
                <div class="custom-page-content">
                    <div class="feature-section">
                        <div class="feature-header"><span>🎨</span> Appearance</div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="display: flex; gap: 10px;">
                                <div style="flex: 1; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                    <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 1px;">THEME</span>
                                    <input type="color" class="custom-theme-picker" id="admin-theme-picker" value="${themeColor}">
                                </div>
                                <div style="flex: 1; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                    <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 1px;">BACKGROUND</span>
                                    <input type="color" class="custom-theme-picker" id="admin-bg-picker" value="${bgColor}">
                                </div>
                            </div>

                            <div class="settings-row" id="toggle-panel-pos">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700;">Panel Position</span>
                                    <span style="color: var(--text-muted); font-size: 12px;">Currently: ${panelPosition.toUpperCase()}</span>
                                </div>
                                <div style="display: flex; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 4px;">
                                    <div id="pos-left-btn" style="padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 800; ${panelPosition === 'left' ? 'background: var(--theme-color); color: white;' : 'color: var(--text-muted);'}">LEFT</div>
                                    <div id="pos-right-btn" style="padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 800; ${panelPosition === 'right' ? 'background: var(--theme-color); color: white;' : 'color: var(--text-muted);'}">RIGHT</div>
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                                    <span>Glass Blur</span>
                                    <span>${Math.round(glassOpacity * 100)}%</span>
                                </div>
                                <input type="range" id="admin-glass-opacity" min="0" max="1" step="0.05" value="${glassOpacity}" style="accent-color: var(--theme-color);">
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                                    <span>Corners</span>
                                    <span>${borderRadius}px</span>
                                </div>
                                <input type="range" id="admin-border-radius" min="0" max="40" step="1" value="${borderRadius}" style="accent-color: var(--theme-color);">
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="font-size: 13px; font-weight: 700;">Custom Wallpaper URL</div>
                                <input type="text" id="admin-bg-image-url" class="custom-msg-input" value="${bgImageUrl}" placeholder="https://...">
                            </div>
                        </div>
                    </div>

                    <div class="feature-section">
                        <div class="feature-header"><span>📱</span> Interface</div>
                        <div class="settings-row" id="toggle-language">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span style="font-weight: 700;">Language / Sprache</span>
                                <span style="color: var(--text-muted); font-size: 12px;">Currently: ${getLanguage()}</span>
                            </div>
                            <select id="admin-language-select" class="custom-dict-select" style="width: 120px; height: 36px; padding: 4px 10px; margin-top: 0; font-size: 12px; font-weight: 800;">
                                <option value="English" ${getLanguage() === 'English' ? 'selected' : ''}>English</option>
                                <option value="German" ${getLanguage() === 'German' ? 'selected' : ''}>Deutsch</option>
                            </select>
                        </div>
                        <div class="settings-row" id="toggle-clock">
                            <span style="font-weight: 700;">Show System Clock</span>
                            <div class="toggle-switch ${clockEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                        </div>
                        <div class="settings-row">
                            <span style="font-weight: 700;">${t.toggleKeyLabel}</span>
                            <input type="text" id="admin-toggle-key" class="custom-msg-input" value="${getToggleKey()}" style="width: 100px; text-align: center; font-weight: 800; margin-top: 0;">
                        </div>
                    </div>

                    <div style="text-align: center; padding: 30px; opacity: 0.3; font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--text-color);">
                        JKLM POWER TOOLS v2.0
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

            // Tooltip Element
            const tooltip = document.createElement('div');
            tooltip.id = 'word-definition-tooltip';
            tooltip.className = 'word-tooltip';
            document.body.appendChild(tooltip);

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

                loadDictionary().then(() => {
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

                        // Re-attach tooltip listeners
                        const tooltip = document.getElementById('word-definition-tooltip');
                        document.querySelectorAll('.clickable-word').forEach(el => {
                            el.addEventListener('mouseenter', async (e) => {
                                const word = e.target.getAttribute('data-word');
                                tooltip.style.display = 'block';
                                tooltip.innerHTML = `<strong>${word}</strong><br><span style="opacity: 0.7;">Fetching definition...</span>`;
                                
                                try {
                                    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
                                    const data = await response.json();
                                    if (data && data[0] && data[0].meanings[0]) {
                                        const def = data[0].meanings[0].definitions[0].definition;
                                        tooltip.innerHTML = `<strong>${word}</strong><br>${def}`;
                                    } else {
                                        tooltip.innerHTML = `<strong>${word}</strong><br>No definition found.`;
                                    }
                                } catch (err) {
                                    tooltip.innerHTML = `<strong>${word}</strong><br>Could not load definition.`;
                                }
                            });
                            el.addEventListener('mousemove', (e) => {
                                tooltip.style.left = (e.clientX + 15) + 'px';
                                tooltip.style.top = (e.clientY + 15) + 'px';
                            });
                            el.addEventListener('mouseleave', () => {
                                tooltip.style.display = 'none';
                            });
                        });
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
            dictPage.addEventListener('input', (e) => {
                if (e.target.id === 'dict-msg-input') {
                    updateSuggestions();
                }
                if (e.target.id === 'dict-min-len') {
                    setMinWordLength(parseInt(e.target.value));
                    updateDictContent();
                    updateSuggestions();
                }
                if (e.target.id === 'dict-max-len') {
                    setMaxWordLength(parseInt(e.target.value));
                    updateDictContent();
                    updateSuggestions();
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
                if (e.target.id === 'admin-language-select') {
                    setLanguage(e.target.value);
                    updateKbContent();
                    updateDictContent();
                    updateAdminContent();
                }
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
                if (e.target.id === 'admin-bg-picker') {
                    setBgColor(e.target.value);
                    updateThemeStyles();
                }
                if (e.target.id === 'admin-glass-opacity') {
                    setGlassOpacity(parseFloat(e.target.value));
                    updateThemeStyles();
                    updateAdminContent();
                }
                if (e.target.id === 'admin-border-radius') {
                    setBorderRadius(parseInt(e.target.value, 10));
                    updateThemeStyles();
                    updateAdminContent();
                }
                if (e.target.id === 'admin-bg-image-url') {
                    setBgImageUrl(e.target.value.trim());
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
                const nav = document.querySelector('.navigation, .tabs, .room .bottom');
                if (nav) {
                    init();
                }
            });
    checkInit.observe(document.body, { childList: true, subtree: true });

    // Fallback: Try to init after 2 seconds regardless of observer
    setTimeout(init, 2000);
    // Extra Fallback for slower connections
    setTimeout(init, 5000);
})();
