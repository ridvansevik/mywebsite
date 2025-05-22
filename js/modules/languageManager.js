// js/modules/languageManager.js
import { CLASS_ACTIVE } from './constants.js'; // Assuming CLASS_ACTIVE is used for active lang button styling

let currentTranslations = {};
let currentLang = 'en';

const translatableElementsCache = new Map();

function queryAndCacheElements() {
    translatableElementsCache.clear();
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.dataset.translateKey;
        if (!translatableElementsCache.has(key)) translatableElementsCache.set(key, []);
        translatableElementsCache.get(key).push({el, type: 'textContent'});
    });
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
        const key = el.dataset.translateKeyPlaceholder;
        if (!translatableElementsCache.has(key)) translatableElementsCache.set(key, []);
        translatableElementsCache.get(key).push({el, type: 'placeholder', attr: 'placeholder'});
    });
    document.querySelectorAll('[data-translate-key-title]').forEach(el => {
        const key = el.dataset.translateKeyTitle;
        if (!translatableElementsCache.has(key)) translatableElementsCache.set(key, []);
        translatableElementsCache.get(key).push({el, type: 'title', attr: 'title'});
    });
    document.querySelectorAll('[data-translate-key-aria-label]').forEach(el => {
        const key = el.dataset.translateKeyAriaLabel;
        if (!translatableElementsCache.has(key)) translatableElementsCache.set(key, []);
        translatableElementsCache.get(key).push({el, type: 'aria-label', attr: 'aria-label'});
    });
    document.querySelectorAll('[data-translate-key-rotate]').forEach(el => {
        const key = el.dataset.translateKeyRotate;
        if (!translatableElementsCache.has(key)) translatableElementsCache.set(key, []);
        translatableElementsCache.get(key).push({el, type: 'data-rotate', attr: 'data-rotate'});
    });
}

async function loadLanguage(lang) {
    try {
        const response = await fetch(`locales/${lang}.json?v=${Date.now()}`); // Cache busting
        if (!response.ok) {
            console.error(`Could not load ${lang}.json: ${response.statusText}. Falling back to English.`);
            if (lang !== 'en') return await loadLanguage('en'); // Fallback to English
            throw new Error(`Could not load en.json either.`);
        }
        currentTranslations = await response.json();
        currentLang = lang;
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;
        return currentTranslations;
    } catch (error) {
        console.error('Failed to load language files:', error);
        document.documentElement.lang = 'en'; // Default to English on error
        return {}; // Return empty object on critical failure
    }
}

// REPLACE the existing applyTranslationsToPage function with this one:
function applyTranslationsToPage() {
    if (Object.keys(currentTranslations).length === 0) {
        console.warn("No translations loaded, cannot apply.");
        return;
    }

    translatableElementsCache.forEach((elements, key) => {
        // Get the raw translation string first from the loaded JSON
        let rawTranslationForKey = currentTranslations[key];

        // If there's no specific translation for the key, use the key itself as a fallback.
        // This helps identify missing translations if a key appears on the page.
        if (rawTranslationForKey === undefined) {
            rawTranslationForKey = key;
        }

        let finalTranslation = rawTranslationForKey;

        // Check for {currentYear} placeholder and replace if present (applies to strings only)
        if (typeof finalTranslation === 'string' && finalTranslation.includes('{currentYear}')) {
            const year = new Date().getFullYear().toString();
            finalTranslation = finalTranslation.replace(new RegExp(`{currentYear}`, 'g'), year);
        }
        // Add similar universal placeholder replacements here if needed in the future, e.g., {appName}

        // The condition "finalTranslation !== key" ensures we only update if a translation exists (or was modified, e.g., year inserted).
        // The second part "elements.some(...)" is for attributes that might have a key but no initial value matching the key.
        if (finalTranslation !== key || elements.some(item => item.el.dataset[item.type] !== undefined)) {
            elements.forEach(item => {
                if (item.type === 'textContent') {
                    item.el.textContent = finalTranslation;
                } else if (item.attr) { // Handles title, placeholder, aria-label etc.
                     if (item.type === 'data-rotate') {
                        // For data-rotate, we expect an array directly from currentTranslations
                        if (Array.isArray(currentTranslations[key])) {
                            item.el.setAttribute('data-rotate', JSON.stringify(currentTranslations[key]));
                            if (window.initializeTxtRotateElements) {
                                window.initializeTxtRotateElements(item.el);
                            }
                        } else {
                             console.warn(`Expected array for data-rotate key '${key}', but received:`, currentTranslations[key]);
                             // Fallback: use finalTranslation if it's a stringified array, or clear attribute
                             if(typeof finalTranslation === 'string') item.el.setAttribute(item.attr, finalTranslation); else item.el.removeAttribute(item.attr);
                        }
                    } else { // For other attributes like title, placeholder
                        item.el.setAttribute(item.attr, finalTranslation);
                    }
                }
            });
        }
    });
}

export function getTranslation(key, params = {}) {
    let translation = currentTranslations[key] || key;
    for (const param in params) {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    }
    return translation;
}

export async function setLanguage(lang) {
    await loadLanguage(lang);
    applyTranslationsToPage();
    updateLanguageButtonStates(lang);

    if (window.refreshCommandPaletteCommands) {
        window.refreshCommandPaletteCommands();
    }
    if (window.refreshProjectFeaturesText) {
        window.refreshProjectFeaturesText();
    }
    // Add other refresh calls if needed for other dynamic content modules
}

function updateLanguageButtonStates(lang) {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.toggle(CLASS_ACTIVE, btn.dataset.lang === lang); // Or your active class e.g. 'active-lang'
    });
    document.getElementById('lang-en')?.setAttribute('title', getTranslation('langSwitcherToEn'));
    document.getElementById('lang-tr')?.setAttribute('title', getTranslation('langSwitcherToTr'));
}

export async function initLanguageManager() {
    queryAndCacheElements(); // Initial cache of elements

    const preferredLang = localStorage.getItem('preferredLang') || navigator.language.split('-')[0];
    const supportedLangs = ['en', 'tr'];
    const initialLang = supportedLangs.includes(preferredLang) ? preferredLang : 'en';

    // Set language will load and apply translations.
    // No need to await here in DOMContentLoaded, let it run.
    setLanguage(initialLang);

    document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-tr')?.addEventListener('click', () => setLanguage('tr'));
}

// Call this if you dynamically add translatable content to the DOM after initial load.
export function refreshTranslatableElements() {
    queryAndCacheElements();
    applyTranslationsToPage();
}