
// ==UserScript==
// @name         JKLM Root
// @namespace    http://tampermonkey.net/
// @version      18.3
// @description  Advanced JKLM Power Tools - Ultimate Edition (v17.4)
// @author       Root
// @icon         https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTJbeFZgV0zcGPsl6DlZo3cGrxKIEsWPIcJw&s
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

    const patchGlobalBugs = () => {
        try {
            const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            
            const ignoreError = (msg) => {
                const ignoredErrors = [
                    'addEventListener', 'milestones', 'socket', 'undefined', 'null',
                    'PartyPlus', 'overlay.js', 'falcon.jklm.fun', 'setMilestone'
                ];
                return ignoredErrors.some(err => msg.includes(err));
            };

            win.addEventListener('error', (event) => {
                if (ignoreError(event.message || '')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            }, true);

            win.addEventListener('unhandledrejection', (event) => {
                const reason = event.reason?.message || event.reason?.toString() || '';
                if (ignoreError(reason)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            }, true);

            if (win.navigator.serviceWorker) {
                win.navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
                win.navigator.serviceWorker.register = () => {
                    return new Promise(() => {});
                };
            }

            if (typeof win.chatUnreadHighlightCount === 'undefined') {
                win.chatUnreadHighlightCount = 0;
            }

            const resumeAudio = () => {
                const contexts = [win.AudioContext, win.webkitAudioContext];
                contexts.forEach(Ctx => {
                    if (Ctx && Ctx.prototype) {
                        const originalResume = Ctx.prototype.resume;
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

                ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => {
                    win.addEventListener(evt, triggerResume, { once: true, capture: true });
                });
            };
            resumeAudio();

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

            ['milestones', 'game', 'socket', 'room', 'client', 'roomProxy'].forEach(safeProxy);

            const patchPrototypes = () => {
                ['Socket', 'Emitter', 'EventEmitter', 'Room', 'Client'].forEach(objName => {
                    const Proto = win[objName] && win[objName].prototype;
                    if (Proto) {
                        ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'setMilestone', 'trigger'].forEach(m => {
                            if (typeof Proto[m] === 'undefined' || Proto[m] === null) {
                                Proto[m] = function() { return this; };
                            }
                        });
                        
                        const originalSetMilestone = Proto.setMilestone;
                        Proto.setMilestone = function(...args) {
                            try {
                                if (originalSetMilestone) return originalSetMilestone.apply(this, args);
                            } catch (e) {
                                return this;
                            }
                            return this;
                        };
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

    const SCRIPT_VERSION = '17.4';

    const FISH_KEYWORDS = [
        'fish', 'shark', 'trout', 'salmon', 'bass', 'tuna', 'mackerel', 'cod', 'eel', 'carp', 
        'pike', 'perch', 'snapper', 'grouper', 'marlin', 'swordfish', 'stingray', 'ray', 
        'flounder', 'halibut', 'sole', 'mullet', 'sardine', 'anchovy', 'herring', 'barracuda', 
        'piranha', 'tilapia', 'catfish', 'guppy', 'goldfish', 'clownfish', 'angelfish', 
        'betta', 'tetra', 'molly', 'platy', 'danio', 'loach', 'discus', 'gourami', 'oscar', 
        'cichlid', 'sturgeon', 'gar', 'bowfin', 'lungfish', 'lamprey', 'hagfish', 'coelacanth',
        'mahimahi', 'wahoo', 'walleye', 'muskellunge', 'bluegill', 'crappie', 'sunfish', 'shad', 
        'minnow', 'dace', 'roach', 'tench', 'bream', 'chub', 'barbel', 'grayling', 'char', 
        'whitefish', 'smelt', 'capelin', 'hake', 'pollock', 'haddock', 'whiting', 'ling', 
        'burbot', 'angler', 'monkfish', 'batfish', 'frogfish', 'needlefish', 'flyingfish', 
        'seahorse', 'pipefish', 'stickleback', 'sculpin', 'lionfish', 'rockfish', 'tilefish', 
        'remora', 'jack', 'pompano', 'dorado', 'porgy', 'drum', 'croaker', 'surmullet', 
        'goatfish', 'archerfish', 'leaffish', 'snakehead', 'turbot', 'plaice', 'dab', 'puffer', 
        'boxfish', 'triggerfish', 'filefish', 'albacore', 'alewife', 'alfonsino', 'amberjack', 
        'anemonefish', 'arapaima', 'arowana', 'ayu', 'bangus', 'barracudina', 'barramundi', 
        'bichir', 'bitterling', 'bleak', 'blenny', 'blobfish', 'blowfish', 'boga', 'bonefish', 
        'bonito', 'bonytail', 'brill', 'brotula', 'candiru', 'catalufa', 'catla', 'cisco', 
        'cobia', 'coley', 'cornetfish', 'cusk', 'damselfish', 'dartfish', 'dealfish', 'dhufish', 
        'dory', 'dottyback', 'dragonet', 'driftfish', 'escolar', 'eulachon', 'fangtooth', 
        'fierasfer', 'flier', 'garibaldi', 'goldeye', 'grunion', 'grunt', 'grunter', 'gudgeon', 
        'halosaur', 'hamlet', 'hoki', 'huchen', 'hussar', 'icefish', 'ide', 'ilish', 'inanga', 
        'inconnu', 'kahawai', 'kaluga', 'kokanee', 'kokopu', 'ladyfish', 'lenok', 'limia', 
        'louvar', 'luderick', 'lumpsucker', 'mahseer', 'medaka', 'menhaden', 'mojarra', 'mola', 
        'monchong', 'mooneye', 'moonfish', 'mora', 'morwong', 'mrigal', 'mummichog', 'nase', 
        'notothen', 'oarfish', 'oldwife', 'opah', 'opaleye', 'orfe', 'panga', 'parore', 
        'peamouth', 'pearleye', 'pleco', 'poacher', 'pomfret', 'powen', 'quillback', 'quillfish', 
        'rasbora', 'rohu', 'ronquil', 'roosterfish', 'ruffe', 'sabertooth', 'sablefish', 'scat', 
        'scup', 'shiner', 'sillago', 'skate', 'skilfish', 'sleeper', 'slickhead', 'slimehead', 
        'snook', 'sprat', 'squeaker', 'stargazer', 'steelhead', 'stonecat', 'sucker', 'tailor', 
        'taimen', 'tang', 'tarpon', 'tarwhine', 'tenpounder', 'thornfish', 'threadfin', 'tope', 
        'torpedo', 'trahira', 'treefish', 'tripletail', 'trumpeter', 'trunkfish', 'uaru', 
        'vanjaram', 'vendace', 'vimba', 'walu', 'warmouth', 'whiff', 'wobbegong', 'wrasse', 
        'zander', 'zingel', 'humuhumunukunukuapua\'a'
    ];

    const PLANT_KEYWORDS = [
        'flower', 'plant', 'tree', 'orchid', 'dandelion', 'mahogany', 'rose', 'tulip', 'daisy', 'lily',
        'sunflower', 'oak', 'pine', 'maple', 'birch', 'willow', 'cactus', 'fern', 'moss', 'grass',
        'bamboo', 'palm', 'ivy', 'clover', 'lavender', 'mint', 'basil', 'thyme', 'sage', 'rosemary',
        'cedar', 'sequoia', 'redwood', 'spruce', 'fir', 'larch', 'juniper', 'cypress', 'yew'
    ];

    const SPACE_KEYWORDS = [
        'space', 'universe', 'supernova', 'galaxy', 'asteroid', 'jupiter', 'mars', 'venus', 'saturn',
        'neptune', 'uranus', 'pluto', 'mercury', 'earth', 'moon', 'star', 'planet', 'comet', 'meteor',
        'nebula', 'cosmos', 'orbit', 'gravity', 'rocket', 'shuttle', 'astronaut', 'telescope', 'void'
    ];

    const ELEMENT_KEYWORDS = [
        'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine',
        'neon', 'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon',
        'potassium', 'calcium', 'scandium', 'titanium', 'vanadium', 'chromium', 'manganese', 'iron',
        'cobalt', 'nickel', 'copper', 'zinc', 'gallium', 'germanium', 'arsenic', 'selenium', 'bromine',
        'krypton', 'rubidium', 'strontium', 'yttrium', 'zirconium', 'niobium', 'molybdenum', 'technetium',
        'ruthenium', 'rhodium', 'palladium', 'silver', 'cadmium', 'indium', 'tin', 'antimony', 'tellurium',
        'iodine', 'xenon', 'cesium', 'barium', 'lanthanum', 'cerium', 'praseodymium', 'neodymium',
        'promethium', 'samarium', 'europium', 'gadolinium', 'terbium', 'dysprosium', 'holmium', 'erbium',
        'thulium', 'ytterbium', 'lutetium', 'hafnium', 'tantalum', 'tungsten', 'rhenium', 'osmium',
        'iridium', 'platinum', 'gold', 'mercury', 'thallium', 'lead', 'bismuth', 'polonium', 'astatine',
        'radon', 'francium', 'radium', 'actinium', 'thorium', 'protactinium', 'uranium', 'neptunium',
        'plutonium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium', 'fermium',
        'mendelevium', 'nobelium', 'lawrencium', 'rutherfordium', 'dubnium', 'seaborgium', 'bohrium',
        'hassium', 'meitnerium', 'darmstadtium', 'roentgenium', 'copernicium', 'nihonium', 'flerovium',
        'moscovium', 'livermorium', 'tennessine', 'oganesson'
    ];

    const GEM_KEYWORDS = [
        'emerald', 'sapphire', 'quartz', 'diamond', 'ruby', 'pearl', 'opal', 'topaz', 'amethyst',
        'garnet', 'aquamarine', 'peridot', 'citrine', 'turquoise', 'jade', 'amber', 'onyx', 'crystal',
        'gem', 'jewel', 'mineral', 'stone'
    ];

    const MYTH_KEYWORDS = [
        'centaur', 'aphrodite', 'valkyrie', 'zeus', 'hera', 'poseidon', 'demeter', 'athena', 'apollo',
        'artemis', 'ares', 'hephaestus', 'hermes', 'dionysus', 'hades', 'odin', 'thor', 'loki', 'freya',
        'dragon', 'phoenix', 'griffin', 'mermaid', 'unicorn', 'titan', 'god', 'goddess', 'hero', 'myth'
    ];

    const INSTRUMENT_KEYWORDS = [
        'saxophone', 'harpsichord', 'synthesizer', 'piano', 'guitar', 'violin', 'cello', 'flute',
        'clarinet', 'trumpet', 'trombone', 'tuba', 'drum', 'harp', 'banjo', 'mandolin', 'organ',
        'keyboard', 'bass', 'cello', 'viola', 'oboe', 'bassoon', 'recorder', 'xylophone', 'marimba'
    ];

    const TECH_KEYWORDS = [
        'javascript', 'algorithm', 'mainframe', 'code', 'program', 'software', 'hardware', 'server',
        'database', 'network', 'internet', 'web', 'app', 'binary', 'logic', 'compiler', 'hacker',
        'cyber', 'pixel', 'data', 'cloud', 'security', 'python', 'java', 'html', 'css', 'script'
    ];

    const FOOD_KEYWORDS = [
        'pomegranate', 'zucchini', 'artichoke', 'apple', 'banana', 'orange', 'grape', 'strawberry',
        'potato', 'tomato', 'carrot', 'onion', 'garlic', 'pepper', 'salt', 'spice', 'herb', 'fruit',
        'vegetable', 'berry', 'cherry', 'lemon', 'lime', 'melon', 'mango', 'peach', 'pear', 'plum'
    ];

    const SPICE_KEYWORDS = [
        'coriander', 'turmeric', 'rosemary', 'cinnamon', 'ginger', 'pepper', 'basil', 'thyme', 'sage',
        'cumin', 'paprika', 'clove', 'nutmeg', 'oregano', 'parsley', 'dill', 'mint', 'chili', 'vanilla'
    ];

    const matchCategory = (w, keywords) => {
        const low = w.toLowerCase();
        return keywords.some(k => {
            if (low === k) return true;
            if (low === k + 's') return true;
            if (low === k + 'es') return true;
            if (k.endsWith('y') && low === k.slice(0, -1) + 'ies') return true;
            return false;
        });
    };

    const isWordFish = (w) => matchCategory(w, FISH_KEYWORDS);
    const isWordPlant = (w) => matchCategory(w, PLANT_KEYWORDS);
    const isWordSpace = (w) => matchCategory(w, SPACE_KEYWORDS);
    const isWordElement = (w) => matchCategory(w, ELEMENT_KEYWORDS);
    const isWordGem = (w) => matchCategory(w, GEM_KEYWORDS);
    const isWordMyth = (w) => matchCategory(w, MYTH_KEYWORDS);
    const isWordInstrument = (w) => matchCategory(w, INSTRUMENT_KEYWORDS);
    const isWordTech = (w) => matchCategory(w, TECH_KEYWORDS);
    const isWordFood = (w) => matchCategory(w, FOOD_KEYWORDS);
    const isWordSpice = (w) => matchCategory(w, SPICE_KEYWORDS);

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

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

    const getLanguage = () => 'English';

    const getBorderRadius = () => GM_getValue('borderRadius', 16);
    const setBorderRadius = (val) => GM_setValue('borderRadius', val);
    const getClockEnabled = () => GM_getValue('clockEnabled', true);
    const setClockEnabled = (val) => GM_setValue('clockEnabled', val);

    const getSearchHistory = () => GM_getValue('searchHistory', []);
    const setSearchHistory = (val) => GM_setValue('searchHistory', val);

    const getNotes = () => GM_getValue('notes', []);
    const setNotes = (val) => GM_setValue('notes', val);
    const getToggleKey = () => GM_getValue('toggleKey', 'F2');
    const setToggleKey = (val) => GM_setValue('toggleKey', val);
    const getPanelPosition = () => GM_getValue('panelPosition', 'right');
    const setPanelPosition = (val) => GM_setValue('panelPosition', val);

    const getTabHotkeys = () => GM_getValue('tabHotkeys', false);
    const setTabHotkeys = (val) => GM_setValue('tabHotkeys', val);
    const getOpacityToggleKey = () => GM_getValue('opacityToggleKey', 'Control');
    const setOpacityToggleKey = (val) => GM_setValue('opacityToggleKey', val);

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
            tabHotkeysLabel: 'Panel Tab Hotkeys (F1-F3)',
            tabHotkeysDesc: 'Quickly switch panels using F1, F2, and F3.',
            opacityKeyLabel: 'Panel Opacity Toggle (Key)',
            ideaBy: 'Idea by'
        }
    };

    let dictionary = [];
    let lowercasedDictionary = [];
    let dictionaryLoaded = false;
    let currentDictLang = '';

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

    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
            --pt-theme-color: #8A2BE2; /* Blue Violet */
            --pt-theme-color-rgb: 138, 43, 226;
            --pt-bg-color: #1A1A2E; /* Dark Blue */
            --pt-bg-rgb: 26, 26, 46;
            --pt-glass-bg: rgba(26, 26, 46, 0.75);
            --pt-glass-border: rgba(255, 255, 255, 0.1);
            --pt-card-bg: rgba(255, 255, 255, 0.05);
            --pt-card-border: rgba(255, 255, 255, 0.1);
            --pt-border-radius: 16px;
            --pt-text-color: #E0E0E0; /* Light Gray */
            --pt-text-muted: #A0A0A0; /* Gray */
            --pt-panel-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            --pt-transition: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            --pt-font-main: 'Inter', sans-serif;
            --pt-font-mono: 'Fira Code', monospace;
            --pt-accent-gradient: linear-gradient(135deg, var(--pt-theme-color), #FF69B4); /* Hot Pink */
            --pt-glow-effect: 0 0 20px rgba(var(--pt-theme-color-rgb), 0.4);
        }

        /* Panel only */
        .custom-kb-page::-webkit-scrollbar, .custom-dict-page::-webkit-scrollbar, .custom-admin-page::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-kb-page::-webkit-scrollbar-track, .custom-dict-page::-webkit-scrollbar-track, .custom-admin-page::-webkit-scrollbar-track { background: transparent; }
        .custom-kb-page::-webkit-scrollbar-thumb, .custom-dict-page::-webkit-scrollbar-thumb, .custom-admin-page::-webkit-scrollbar-thumb { 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 10px; 
            border: 2px solid transparent;
            background-clip: content-box;
        }
        .custom-kb-page::-webkit-scrollbar-thumb:hover, .custom-dict-page::-webkit-scrollbar-thumb:hover, .custom-admin-page::-webkit-scrollbar-thumb:hover { background: rgba(var(--pt-theme-color-rgb), 0.5); }

        .custom-nav-row {
            display: flex;
            align-items: center;
            justify-content: flex-end; /* Align to the right under the chat icon */
            background: transparent;
            height: 40px;
            width: 100%;
            border-bottom: none;
            position: relative;
            z-index: 19999;
            gap: 15px;
            padding: 0 25px;
            box-sizing: border-box;
            margin-top: -5px;
            pointer-events: none;
        }

        .custom-nav-row > * {
            pointer-events: auto !important;
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
            border-bottom: 1px solid var(--pt-glass-border);
            pointer-events: auto !important;
        }

        .panel-title {
            font-weight: 700;
            font-size: 22px;
            color: var(--pt-text-color);
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
            border: 1px solid var(--pt-glass-border);
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
            transition: var(--pt-transition);
            color: var(--pt-text-muted);
            position: relative;
            pointer-events: auto !important;
        }

        .custom-tab span {
            pointer-events: none !important;
        }

        .custom-tab:hover {
            color: var(--pt-text-color);
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
            box-shadow: var(--pt-glow-effect);
        }

        .custom-tab.active {
            color: white;
            background: var(--pt-theme-color);
            box-shadow: 0 0 20px rgba(var(--pt-theme-color-rgb), 0.5);
            transform: scale(1.1);
        }

        .custom-kb-page, .custom-dict-page, .custom-admin-page {
            display: none;
            padding: 20px;
            color: var(--pt-text-color);
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            height: 100vh;
            overflow-y: auto !important;
            overflow-x: hidden;
            box-sizing: border-box;
            width: 650px;
            box-shadow: var(--pt-panel-shadow);
            position: fixed;
            top: 0;
            z-index: 20000 !important;
            font-family: var(--pt-font-main);
            transition: transform 0.25s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.2s ease;
            border-radius: var(--pt-border-radius);
            will-change: transform, opacity;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            contain: content;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
            pointer-events: auto !important;
        }

        .custom-kb-page.pos-left, .custom-dict-page.pos-left, .custom-admin-page.pos-left {
            left: 0;
            border-right: 1px solid var(--pt-glass-border);
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .custom-kb-page.pos-right, .custom-dict-page.pos-right, .custom-admin-page.pos-right {
            right: 0;
            border-left: 1px solid var(--pt-glass-border);
            border-right: none;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        .custom-kb-page.active, .custom-dict-page.active, .custom-admin-page.active {
            display: block;
            animation: fadeInGlass 0.2s ease-out;
        }

        .custom-page-content {
            position: relative;
            z-index: 5;
            pointer-events: auto !important;
            height: calc(100% - 100px);
            overflow-y: auto;
        }

        @keyframes fadeInGlass {
            from { opacity: 0; }
            to { opacity: 1; }
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
            border: 1px solid var(--pt-glass-border);
            color: var(--pt-text-muted);
            transition: var(--pt-transition);
            margin-left: 15px;
        }

        .custom-close-x:hover {
            color: #ffffff;
            background: rgba(239, 68, 68, 0.5);
            border-color: rgba(239, 68, 68, 0.8);
            transform: rotate(90deg) scale(1.1);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        .feature-card {
            background: rgba(0, 0, 0, 0.45) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--pt-border-radius);
            padding: 24px;
            margin-bottom: 20px;
            transition: var(--pt-transition);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(12px);
            transform: translate3d(0, 0, 0);
            will-change: transform, box-shadow;
            pointer-events: auto !important;
        }

        .feature-card * {
            pointer-events: auto !important;
        }

        .feature-card:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(var(--pt-theme-color-rgb), 0.4);
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), var(--pt-glow-effect);
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--pt-accent-gradient);
            opacity: 0.3;
        }

        .feature-header {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 14px;
            color: var(--pt-text-color);
        }

        .feature-icon {
            width: 38px;
            height: 38px;
            background: rgba(var(--pt-theme-color-rgb), 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--pt-theme-color);
            font-size: 20px;
            box-shadow: inset 0 0 10px rgba(var(--pt-theme-color-rgb), 0.2);
        }

        .modern-input {
            width: 100%;
            background: #000000 !important;
            border: 2px solid rgba(255, 255, 255, 0.1);
            color: #ffffff !important;
            padding: 12px 20px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 800;
            font-family: var(--pt-font-main);
            transition: var(--pt-transition);
            outline: none;
            box-sizing: border-box;
            text-shadow: none;
        }

        select.modern-input {
            cursor: pointer;
            appearance: none !important;
            -webkit-appearance: none !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 15px center !important;
            background-size: 14px !important;
            padding-right: 40px !important;
        }

        .modern-input option {
            background-color: #000000 !important;
            color: #ffffff !important;
            padding: 12px;
            font-weight: 700;
        }

        .modern-input:focus {
            border-color: #007bff;
            background: #000000;
            box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2);
        }

        .modern-button {
            background: var(--pt-accent-gradient);
            color: #1B1F3B;
            border: none;
            padding: 14px 28px;
            border-radius: var(--pt-border-radius);
            cursor: pointer;
            font-weight: 700;
            font-size: 15px;
            transition: var(--pt-transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 8px 16px rgba(var(--pt-theme-color-rgb), 0.3);
        }

        .modern-button:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 12px 24px rgba(var(--pt-theme-color-rgb), 0.5), var(--pt-glow-effect);
            filter: brightness(1.1);
        }

        .settings-row {
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: var(--pt-transition);
            border: 1px solid rgba(255, 255, 255, 0.05);
            user-select: none;
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
            transition: var(--pt-transition);
            border: 1px solid var(--pt-glass-border);
        }

        .toggle-switch.on {
            background: var(--pt-theme-color);
            box-shadow: var(--pt-glow-effect);
        }

        .toggle-knob {
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: var(--pt-transition);
        }

        .toggle-switch.on .toggle-knob {
            left: 24px;
        }

        .clickable-word {
            display: inline-block;
            padding: 8px 16px;
            margin: 4px;
            background: rgba(0, 0, 0, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            cursor: pointer;
            transition: var(--pt-transition);
            font-weight: 700;
            font-size: 14px;
            color: #ffffff !important;
            backdrop-filter: blur(4px);
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .clickable-word:hover {
            background: var(--pt-theme-color);
            color: #1B1F3B;
            transform: translateY(-3px) scale(1.1);
            box-shadow: var(--pt-glow-effect);
        }

        .clickable-word strong {
            color: var(--pt-theme-color);
            text-decoration: underline;
            font-weight: 800;
        }

        .clickable-word:hover strong {
            color: #1B1F3B;
        }

        .custom-clock {
            font-family: var(--pt-font-mono);
            font-size: 14px;
            font-weight: 600;
            color: var(--pt-theme-color);
            background: rgba(var(--pt-theme-color-rgb), 0.1);
            padding: 6px 14px;
            border-radius: 10px;
            border: 1px solid rgba(var(--pt-theme-color-rgb), 0.2);
            box-shadow: var(--pt-glow-effect);
        }

        .note-item {
            background: rgba(0, 0, 0, 0.5) !important;
            border: 1px solid var(--pt-glass-border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
            transition: var(--pt-transition);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            backdrop-filter: blur(5px);
        }

        .note-item:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(var(--pt-theme-color-rgb), 0.4);
            transform: translateX(10px) translateY(-2px);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
        }

        .word-tooltip {
            position: fixed;
            background: rgba(var(--pt-bg-rgb), 0.96);
            backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid var(--pt-theme-color);
            padding: 20px;
            border-radius: 22px;
            z-index: 10002;
            max-width: 320px;
            font-size: 14px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.7);
            pointer-events: none;
            display: none;
            color: var(--pt-text-color);
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
            transition: var(--pt-transition);
            font-size: 16px;
        }

        .note-delete:hover {
            background: #ef4444;
            color: white;
            transform: scale(1.15) rotate(90deg);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        @keyframes slideInPanelRight {
            from { transform: translate3d(100%, 0, 0); opacity: 0; }
            to { transform: translate3d(0, 0, 0); opacity: 1; }
        }

        @keyframes slideInPanelLeft {
            from { transform: translate3d(-100%, 0, 0); opacity: 0; }
            to { transform: translate3d(0, 0, 0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    let isOpacityReduced = false;
    const updateThemeStyles = () => {
        const themeColor = getThemeColor();
        const borderRadius = getBorderRadius();
        const panelPosition = getPanelPosition();

        const themeRgb = themeColor.match(/[A-Za-z0-9]{2}/g).map(x => parseInt(x, 16)).join(',');

        document.documentElement.style.setProperty('--pt-theme-color', themeColor);
        document.documentElement.style.setProperty('--pt-theme-color-rgb', themeRgb);
        document.documentElement.style.setProperty('--pt-bg-color', '#1A1A2E');
        document.documentElement.style.setProperty('--pt-bg-rgb', '26, 26, 46');
        document.documentElement.style.setProperty('--pt-glass-bg', 'rgba(26, 26, 46, 0.75)');
        document.documentElement.style.setProperty('--pt-border-radius', `${borderRadius}px`);
        document.documentElement.style.setProperty('--pt-accent-gradient', `linear-gradient(135deg, ${themeColor}, #FF69B4)`);
        document.documentElement.style.setProperty('--pt-glow-effect', `0 0 20px rgba(${themeRgb}, 0.4)`);

        const textColor = '#ffffff';
        const textMuted = '#A0A0A0';
        const glassBorder = 'rgba(255, 255, 255, 0.1)';

        document.documentElement.style.setProperty('--pt-text-color', textColor);
        document.documentElement.style.setProperty('--pt-text-muted', textMuted);
        document.documentElement.style.setProperty('--pt-glass-border', glassBorder);

        document.querySelectorAll('.custom-kb-page, .custom-dict-page, .custom-admin-page').forEach(p => {
            p.classList.remove('pos-left', 'pos-right');
            p.classList.add(`pos-${panelPosition}`);
            
            p.style.animation = `slideInPanel${panelPosition.charAt(0).toUpperCase() + panelPosition.slice(1)} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
            p.style.background = isOpacityReduced ? 'rgba(26, 26, 46, 0.2)' : 'rgba(26, 26, 46, 0.95)';
            p.style.backdropFilter = isOpacityReduced ? 'blur(2px)' : 'blur(16px)';
        });
    };
    updateThemeStyles();

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
                t.setAttribute('data-custom-tab', id);
                t.innerHTML = `<span style="pointer-events: none; display: flex; align-items: center; justify-content: center;">${icon}</span>`;
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
            clock.style.display = 'flex';
            clock.style.alignItems = 'center';
            clock.style.gap = '8px';
            customRow.appendChild(clock);

            const updateClock = () => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const clockEnabled = getClockEnabled();
                
                if (clockEnabled) {
                    if (clock.innerText !== timeStr) {
                        clock.innerText = timeStr;
                    }
                    clock.style.display = 'flex';
                } else {
                    clock.style.display = 'none';
                }

                document.querySelectorAll('.panel-clock').forEach(el => {
                    if (el.innerText !== timeStr) el.innerText = timeStr;
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
                        <span style="background: linear-gradient(to right, var(--pt-theme-color), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(var(--pt-theme-color-rgb), 0.3));">${title}</span>
                        <div class="custom-tab-group">
                            <div class="custom-tab ${activeTabId === 'cat-btn' ? 'active' : ''}" data-target="cat-btn"><span style="pointer-events: none; display: flex; align-items: center; justify-content: center;">🚀</span></div>
                            <div class="custom-tab ${activeTabId === 'dict-btn' ? 'active' : ''}" data-target="dict-btn"><span style="pointer-events: none; display: flex; align-items: center; justify-content: center;">📖</span></div>
                            <div class="custom-tab ${activeTabId === 'admin-btn' ? 'active' : ''}" data-target="admin-btn"><span style="pointer-events: none; display: flex; align-items: center; justify-content: center;">⚙️</span></div>
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
                                    <span style="color: var(--pt-text-muted); font-size: 13px; line-height: 1.4;">${isEnabled ? t.onDesc : t.offDesc}</span>
                                </div>
                                <div class="toggle-switch ${isEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div class="settings-row" id="toggle-chat-hyphen">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 16px;">${t.chatToggleLabel}</span>
                                    <span style="color: var(--pt-text-muted); font-size: 13px; line-height: 1.4;">${isChatEnabled ? t.chatDesc : t.chatOffDesc}</span>
                                </div>
                                <div class="toggle-switch ${isChatEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div class="settings-row" id="toggle-tab-hotkeys">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 16px;">${t.tabHotkeysLabel}</span>
                                    <span style="color: var(--pt-text-muted); font-size: 13px; line-height: 1.4;">${t.tabHotkeysDesc}</span>
                                </div>
                                <div class="toggle-switch ${getTabHotkeys() ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px; opacity: 0.9; transition: 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">
                                <div style="width: 32px; height: 32px; border-radius: 10px; border: 2px solid var(--pt-theme-color); overflow: hidden; background: rgba(var(--pt-theme-color-rgb), 0.1); box-shadow: var(--pt-glow-effect); display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--pt-theme-color); font-size: 14px;">
                                    <img src="https://media.discordapp.net/attachments/1362588131966062736/1484245858982564163/download.jfif?ex=69bd872c&is=69bc35ac&hm=c8fb790d9047f95f9158952dec974f5ad608d504c98c959901e41b6421c14923&=&format=webp&width=32&height=32" style="width: 100%; height: 100%; object-fit: cover;" id="kb-idea-author-img" onerror="this.style.display='none'; this.parentElement.innerText='M'">
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 10px; font-weight: 800; color: var(--pt-text-muted); text-transform: uppercase; letter-spacing: 1px;">${t.ideaBy}</span>
                                    <span style="font-size: 13px; font-weight: 800; color: #fff; text-shadow: 0 0 10px rgba(var(--pt-theme-color-rgb), 0.5);">meow meow</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card" style="background: rgba(var(--pt-theme-color-rgb), 0.05); border-color: rgba(var(--pt-theme-color-rgb), 0.2);">
                        <div class="feature-header" style="color: var(--pt-theme-color);">
                            <div class="feature-icon" style="background: rgba(var(--pt-theme-color-rgb), 0.15); box-shadow: var(--pt-glow-effect);">💡</div>
                            <span>Tip</span>
                        </div>
                        <div style="color: var(--pt-text-color); opacity: 0.8; font-size: 14px; line-height: 1.7; margin-bottom: 12px;">
                            ${t.closeInfo}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; background: rgba(var(--pt-theme-color-rgb), 0.1); color: var(--pt-theme-color); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 12px; width: fit-content; border: 1px solid rgba(var(--pt-theme-color-rgb), 0.2);">
                            <span>rooticles.</span>
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
                    <div style="font-size: 12px; font-weight: 800; color: var(--pt-text-muted); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1.5px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📜 Recent</span>
                        <span id="clear-history" style="cursor: pointer; color: #ff4444; font-size: 10px; background: rgba(255, 68, 68, 0.1); padding: 5px 10px; border-radius: 8px; transition: 0.3s; font-weight: 700; border: 1px solid rgba(255,68,68,0.2);">CLEAR</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${history.map(h => `<span class="history-chip" style="padding: 6px 12px; background: rgba(var(--pt-theme-color-rgb), 0.08); border-radius: 10px; font-size: 12px; cursor: pointer; border: 1px solid rgba(var(--pt-theme-color-rgb), 0.15); font-weight: 700; transition: 0.3s; color: var(--pt-text-color);">${h}</span>`).join('')}
                    </div>
                </div>
            ` : '';

                const notesHtml = notes.length > 0 ? notes.map((note, index) => `
                    <div class="note-item">
                        <div style="flex: 1;">
                            <div class="note-content" style="font-size: 14px; line-height: 1.5; color: var(--pt-text-color); font-weight: 500;">${note.content}</div>
                            <div class="note-timestamp" style="font-size: 11px; opacity: 0.5; margin-top: 8px; font-weight: 600;">${new Date(note.timestamp).toLocaleString()}</div>
                        </div>
                        <button class="note-delete" data-index="${index}">✕</button>
                    </div>
                `).join('') : `<div style="text-align: center; color: var(--pt-text-muted); padding: 30px; font-size: 14px; font-weight: 600;">${t.noNotes}</div>`;

                const minLen = 2;
                const maxLen = 30;

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
                                <select class="modern-input" id="dict-search-mode">
                                    <option value="Contains" ${searchMode === 'Contains' ? 'selected' : ''}>Contains</option>
                                    <option value="StartsWith" ${searchMode === 'StartsWith' ? 'selected' : ''}>Starts With</option>
                                    <option value="EndsWith" ${searchMode === 'EndsWith' ? 'selected' : ''}>Ends With</option>
                                    <option value="SyllableChain" ${searchMode === 'SyllableChain' ? 'selected' : ''}>Syllable Chain</option>
                                </select>
                                <select class="modern-input" id="dict-word-type">
                                    <option value="All" ${wordType === 'All' ? 'selected' : ''}>All Words</option>
                                    <option value="Hyphen" ${wordType === 'Hyphen' ? 'selected' : ''}>Hyphen Only</option>
                                    <option value="Long" ${wordType === 'Long' ? 'selected' : ''}>Long Words</option>
                                    <option value="Casual" ${wordType === 'Casual' ? 'selected' : ''}>Casual</option>
                                    <option value="Shorts" ${wordType === 'Shorts' ? 'selected' : ''}>Shorts</option>
                                    <option value="Phobia" ${wordType === 'Phobia' ? 'selected' : ''}>Phobia</option>
                                    <option value="Apostrophes" ${wordType === 'Apostrophes' ? 'selected' : ''}>Apostrophes</option>
                                    <option value="Fish" ${wordType === 'Fish' ? 'selected' : ''}>Fish</option>
                                    <option value="Plants" ${wordType === 'Plants' ? 'selected' : ''}>Plants</option>
                                    <option value="Space" ${wordType === 'Space' ? 'selected' : ''}>Space</option>
                                    <option value="Elements" ${wordType === 'Elements' ? 'selected' : ''}>Elements</option>
                                    <option value="Gems" ${wordType === 'Gems' ? 'selected' : ''}>Gems</option>
                                    <option value="Mythology" ${wordType === 'Mythology' ? 'selected' : ''}>Mythology</option>
                                    <option value="Instruments" ${wordType === 'Instruments' ? 'selected' : ''}>Instruments</option>
                                    <option value="IT" ${wordType === 'IT' ? 'selected' : ''}>IT</option>
                                    <option value="Food" ${wordType === 'Food' ? 'selected' : ''}>Food</option>
                                    <option value="Spices" ${wordType === 'Spices' ? 'selected' : ''}>Spices</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card" id="dict-results-container" style="background: rgba(0,0,0,0.3); border-color: var(--pt-glass-border); padding: 28px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <div class="custom-dict-result-header" id="dict-result-header" style="font-size: 16px; font-weight: 800; color: var(--pt-theme-color); display: flex; align-items: center; gap: 12px;"></div>
                            <div style="font-size: 12px; font-weight: 900; color: #00d2ff; letter-spacing: 1px; text-shadow: 0 0 10px rgba(0,210,255,0.3);">${minLen} - ${maxLen} CHARS</div>
                        </div>
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

                    <div id="custom-dict-upload-area" style="display: ${dictLang === 'Custom' ? 'block' : 'none'}; margin-bottom: 24px; padding: 28px; background: rgba(var(--pt-theme-color-rgb), 0.08); border-radius: 24px; border: 2px dashed rgba(var(--pt-theme-color-rgb), 0.3); backdrop-filter: blur(10px);">
                        <div style="font-size: 15px; color: var(--pt-text-color); font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                            <span>📁</span> ${t.dictUploadDesc}
                        </div>
                        <input type="file" id="dict-file-upload" class="modern-input" accept=".txt" style="margin-bottom: 16px; border-style: solid;">
                        <textarea id="dict-manual-input" class="modern-input" style="min-height: 150px; font-size: 14px; margin-bottom: 16px; font-family: var(--pt-font-mono); line-height: 1.6;" placeholder="${t.dictPlaceholder}">${(getCustomDictionary() || []).join('\n')}</textarea>
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

                    <div class="feature-card" style="background: rgba(var(--pt-theme-color-rgb), 0.05); border-color: rgba(var(--pt-theme-color-rgb), 0.2);">
                        <div class="feature-header" style="color: var(--pt-theme-color);">
                            <div class="feature-icon" style="background: rgba(var(--pt-theme-color-rgb), 0.15); box-shadow: var(--pt-glow-effect);">💡</div>
                            <span>Pro-Tip</span>
                        </div>
                        <div style="color: var(--pt-text-color); opacity: 0.8; font-size: 14px; line-height: 1.7;">
                            Click on any word to copy it instantly. Use the filters to find the best words for your round!
                        </div>
                    </div>
                </div>
            `;
            };

            const updateAdminContent = () => {
                const t = translations[getLanguage()] || translations['English'];
                const themeColor = getThemeColor();
                const borderRadius = getBorderRadius();
                const clockEnabled = getClockEnabled();
                const panelPosition = getPanelPosition();
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
                                <div style="flex: 1; padding: 20px; background: rgba(255,255,255,0.04); border-radius: 20px; border: 1px solid var(--pt-glass-border); display: flex; flex-direction: column; align-items: center; gap: 12px; transition: 0.3s;" class="color-picker-container">
                                    <span style="font-size: 11px; font-weight: 800; color: var(--pt-text-muted); letter-spacing: 2px; text-transform: uppercase;">ACCENT COLOR</span>
                                    <input type="color" class="custom-theme-picker" id="admin-theme-picker" value="${themeColor}" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(255,255,255,0.1); cursor: pointer;">
                                </div>
                            </div>

                            <div class="settings-row" id="toggle-panel-pos" style="padding: 16px 20px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 15px;">Panel Side</span>
                                    <span style="color: var(--pt-text-muted); font-size: 12px; font-weight: 600;">Currently on the ${panelPosition.toUpperCase()} side</span>
                                </div>
                                <div style="display: flex; background: rgba(0,0,0,0.3); border-radius: 14px; padding: 5px; border: 1px solid var(--pt-glass-border);">
                                    <div id="pos-left-btn" style="padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 800; transition: 0.3s; ${panelPosition === 'left' ? 'background: var(--pt-theme-color); color: white; box-shadow: 0 4px 12px rgba(var(--pt-theme-color-rgb), 0.3);' : 'color: var(--pt-text-muted);'}">LEFT</div>
                                    <div id="pos-right-btn" style="padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 800; transition: 0.3s; ${panelPosition === 'right' ? 'background: var(--pt-theme-color); color: white; box-shadow: 0 4px 12px rgba(var(--pt-theme-color-rgb), 0.3);' : 'color: var(--pt-text-muted);'}">RIGHT</div>
                                </div>
                            </div>

                            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; border: 1px solid var(--pt-glass-border);">
                                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: var(--pt-text-muted); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 1px;">
                                    <span>${t.adminRadiusLabel}</span>
                                    <span style="color: var(--pt-theme-color);"><span id="val-admin-border-radius">${borderRadius}</span>px</span>
                                </div>
                                <input type="range" id="admin-border-radius" min="0" max="40" step="1" value="${borderRadius}" style="width: 100%; accent-color: var(--pt-theme-color); cursor: pointer;">
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
                                    <span style="color: var(--pt-text-muted); font-size: 12px; font-weight: 600;">Displays the current time in the navigation bar.</span>
                                </div>
                                <div class="toggle-switch ${clockEnabled ? 'on' : ''}"><div class="toggle-knob"></div></div>
                            </div>

                            <div class="settings-row" style="cursor: default;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 15px;">Fast-Access Key</span>
                                    <span style="color: var(--pt-text-muted); font-size: 12px; font-weight: 600;">Key to quickly open/close the panel.</span>
                                </div>
                                <input type="text" id="admin-toggle-key" class="modern-input" value="${getToggleKey()}" style="width: 80px; text-align: center; font-weight: 900; padding: 10px; border-radius: 12px; background: rgba(var(--pt-theme-color-rgb), 0.1); color: var(--pt-theme-color); border-color: rgba(var(--pt-theme-color-rgb), 0.2);">
                            </div>

                            <div class="settings-row" style="cursor: default;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-weight: 700; font-size: 15px;">${t.opacityKeyLabel}</span>
                                    <span style="color: var(--pt-text-muted); font-size: 12px; font-weight: 600;">Hold/Toggle this key for transparency.</span>
                                </div>
                                <input type="text" id="admin-opacity-key" class="modern-input" value="${getOpacityToggleKey()}" style="width: 80px; text-align: center; font-weight: 900; padding: 10px; border-radius: 12px; background: rgba(var(--pt-theme-color-rgb), 0.1); color: var(--pt-theme-color); border-color: rgba(var(--pt-theme-color-rgb), 0.2);">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px; gap: 15px;">
                        <div style="font-size: 11px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; color: var(--pt-theme-color); opacity: 0.8; text-shadow: 0 0 15px rgba(var(--pt-theme-color-rgb), 0.4);">
                            JKLM POWER TOOLS
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="padding: 5px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 10px; font-weight: 800; color: var(--pt-text-muted); border: 1px solid var(--pt-glass-border);">VERSION ${SCRIPT_VERSION}</span>
                            <span style="padding: 5px 12px; background: rgba(var(--pt-theme-color-rgb), 0.1); border-radius: 8px; font-size: 10px; font-weight: 800; color: var(--pt-theme-color); border: 1px solid rgba(var(--pt-theme-color-rgb), 0.2);">ROOT EDITION</span>
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

            allCustomPages.forEach(p => document.body.appendChild(p));

            window.closeCustomTabs = () => {
                [catTab, dictTab, adminTab].forEach(t => t.classList.remove('active'));
                allCustomPages.forEach(p => p.classList.remove('active'));
                const home = nav.querySelector('[data-tab="home"]') || nav.querySelector('.tab') || nav.querySelector('.custom-tab');
                if (home && ![catTab, dictTab, adminTab].includes(home)) home.click();
            };

            const toggleTab = (tab, page) => {
                const isActive = tab.classList.contains('active');
                if (isActive) {
                    window.closeCustomTabs();
                    return;
                }
                // Ensure width is at least 650px
                let currentWidth = getSidebarWidth();
                if (currentWidth < 650) {
                    currentWidth = 650;
                    setSidebarWidth(650);
                    updateSidebarWidths(650);
                }

                // Batch DOM updates for smoothness
                document.querySelectorAll('.page, .tab, .custom-tab').forEach(el => el.classList.remove('active'));
                allCustomPages.forEach(p => {
                    p.classList.remove('active');
                    p.classList.remove('selective-hidden');
                });
                tab.classList.add('active');
                page.classList.add('active');
                
                if (page === dictPage) {
                    setTimeout(loadDictionary, 50);
                }
            };

            // Enhanced Event Delegation for Tabs
            customRow.addEventListener('click', (e) => {
                const tab = e.target.closest('.custom-tab');
                if (!tab) return;
                
                const tabId = tab.id;
                if (tabId === 'cat-btn') toggleTab(catTab, kbPage);
                else if (tabId === 'dict-btn') toggleTab(dictTab, dictPage);
                else if (tabId === 'admin-btn') {
                    updateAdminContent();
                    toggleTab(adminTab, adminPage);
                }
            }, false);

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
                        e.preventDefault();
                        e.stopPropagation();
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
                if (row.id === 'toggle-tab-hotkeys') setTabHotkeys(!getTabHotkeys());
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
                    }
                }

                const ensureDictionary = async () => {
                    await loadDictionary();
                };

                ensureDictionary().then(() => {
                    let words;
                    if (wordType === 'Fish') words = dictionary.filter(isWordFish);
                    else if (wordType === 'Plants') words = dictionary.filter(isWordPlant);
                    else if (wordType === 'Space') words = dictionary.filter(isWordSpace);
                    else if (wordType === 'Elements') words = dictionary.filter(isWordElement);
                    else if (wordType === 'Gems') words = dictionary.filter(isWordGem);
                    else if (wordType === 'Mythology') words = dictionary.filter(isWordMyth);
                    else if (wordType === 'Instruments') words = dictionary.filter(isWordInstrument);
                    else if (wordType === 'IT') words = dictionary.filter(isWordTech);
                    else if (wordType === 'Food') words = dictionary.filter(isWordFood);
                    else if (wordType === 'Spices') words = dictionary.filter(isWordSpice);
                    else words = [...dictionary];
                    
                    const minLen = 2;
                    const maxLen = 30;

                    words = words.filter(w => w.length >= minLen && w.length <= maxLen);

                    if (syllable) {
                        if (searchMode === 'StartsWith') {
                            words = words.filter(w => w.toLowerCase().startsWith(syllable));
                        } else if (searchMode === 'EndsWith') {
                            words = words.filter(w => w.toLowerCase().endsWith(syllable));
                        } else if (searchMode === 'SyllableChain') {
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
                            const upperW = w.toUpperCase();
                            const upperSyl = syllable.toUpperCase();
                            let highlighted = upperW;
                            if (syllable && upperW.includes(upperSyl)) {
                                const parts = upperW.split(upperSyl);
                                highlighted = parts.join(`<strong>${upperSyl}</strong>`);
                            }
                            return `<span class="clickable-word" title="Click to copy" data-word="${upperW}">${highlighted}</span>`;
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
                        e.target.style.color = 'var(--pt-theme-color)';
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
                    return;
                }
                if (e.target.id === 'pos-right-btn') {
                    setPanelPosition('right');
                    updateThemeStyles();
                    updateAdminContent();
                    return;
                }

                const toggleClock = e.target.closest('#toggle-clock');
                if (toggleClock) {
                    setClockEnabled(!getClockEnabled());
                    updateThemeStyles();
                    updateAdminContent();
                    return;
                }
            });

            adminPage.addEventListener('change', (e) => {
                const picker = e.target.closest('#admin-theme-picker');
                if (picker) {
                    setThemeColor(picker.value);
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
                if (e.target.id === 'admin-opacity-key') {
                    e.preventDefault();
                    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
                    e.target.value = key;
                    setOpacityToggleKey(key);
                }
            });

            const gameObserver = new MutationObserver(() => {
                const sylEl = document.querySelector('.syllable');
                const selfInput = document.querySelector('.selfTurn input, .selfTurn textarea');

                if (selfInput) {
                    let counter = document.getElementById('pt-word-counter');
                    if (!counter) {
                        counter = document.createElement('div');
                        counter.id = 'pt-word-counter';
                        counter.style = 'position: absolute; right: 10px; top: -25px; background: rgba(0,0,0,0.6); color: var(--pt-theme-color); padding: 2px 8px; border-radius: 8px; font-size: 12px; font-weight: 800; border: 1px solid var(--pt-glass-border); pointer-events: none; z-index: 100;';
                        selfInput.parentElement.style.position = 'relative';
                        selfInput.parentElement.appendChild(counter);
                    }
                    const len = selfInput.value.length;
                    counter.innerText = `${len} CHARS`;
                    counter.style.display = 'block';
                    counter.style.borderColor = len > 0 ? 'var(--pt-theme-color)' : 'var(--pt-glass-border)';
                } else {
                    const counter = document.getElementById('pt-word-counter');
                    if (counter) counter.style.display = 'none';
                }

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

                updateThemeStyles();

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

            window.addEventListener('keydown', (e) => {
                if (e.key === getToggleKey()) {
                    const anyActive = allCustomPages.some(p => p.classList.contains('active'));
                    if (anyActive) {
                        window.closeCustomTabs();
                    } else {
                        toggleTab(adminTab, adminPage);
                    }
                }

                if (e.key === getOpacityToggleKey()) {
                    isOpacityReduced = !isOpacityReduced;
                    updateThemeStyles();
                }

                if (getTabHotkeys()) {
                    if (e.key === 'F1') { e.preventDefault(); toggleTab(catTab, kbPage); }
                    if (e.key === 'F2') { e.preventDefault(); toggleTab(dictTab, dictPage); }
                    if (e.key === 'F3') { e.preventDefault(); toggleTab(adminTab, adminPage); }
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
        if (e.key === 'F1' && !getTabHotkeys()) {
            e.preventDefault();
            sendToChat('GG');
            return;
        }

        const enabled = getEnabled();
        const chatEnabled = getChatEnabled();
        if (!enabled && !chatEnabled) return;

        const active = document.activeElement;
        const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);

        if (e.code === 'Space' || e.key === ' ') {
            if (!isInput) return;
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

    init();
    setTimeout(init, 1000);
    setTimeout(init, 3000);
    setTimeout(init, 6000);
})();
