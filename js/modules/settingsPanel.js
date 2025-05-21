// js/modules/settingsPanel.js
import { CLASS_ACTIVE, CLASS_SELECTED } from './constants.js';

const colorThemes = {
    'default': { '--primary-accent-color': '#58a6ff', '--secondary-accent-color': '#1f6feb' },
    'green': { '--primary-accent-color': '#3fb950', '--secondary-accent-color': '#2ea043' },
    'pink': { '--primary-accent-color': '#f778ba', '--secondary-accent-color': '#e95399' },
    'orange': { '--primary-accent-color': '#ff9f43', '--secondary-accent-color': '#f39c12' }
};

let settingsTriggerBtn, settingsPanel, settingsCloseBtn, accentColorOptions, fontSizeOptions;

function openSettingsPanel() {
    if (settingsPanel) {
        settingsPanel.classList.add(CLASS_ACTIVE);
    }
    if (settingsTriggerBtn) {
        settingsTriggerBtn.setAttribute('aria-expanded', 'true');
    }
}

function closeSettingsPanel() {
    if (settingsPanel) {
        settingsPanel.classList.remove(CLASS_ACTIVE);
    }
    if (settingsTriggerBtn) {
        settingsTriggerBtn.setAttribute('aria-expanded', 'false');
    }
}

function applyAccentColorTheme(themeName) {
    const themeColors = colorThemes[themeName];
    if (themeColors && document.documentElement) {
        for (const [cssVar, value] of Object.entries(themeColors)) {
            document.documentElement.style.setProperty(cssVar, value);
        }
        document.documentElement.style.setProperty('--filter-btn-text-color', themeColors['--primary-accent-color']);
        document.documentElement.style.setProperty('--filter-btn-active-bg', themeColors['--primary-accent-color']);
          // ---- KEY MODIFICATION FOR DARK MODE COMPATIBILITY ----
        // When a custom accent color is chosen from the panel,
        // force the text color on active elements (like filter buttons) to be white.
        // This ensures good contrast against any chosen accent color,
        // overriding dark mode's default text color for these specific cases if it was, for example, var(--primary-bg-color).
        document.documentElement.style.setProperty('--filter-btn-active-text', '#ffffff');
        // If other components have text on accent backgrounds (e.g., primary buttons),
        // you might need similar explicit overrides if their default dark mode text
        // doesn't contrast well with all possible new accent colors.
        // For example, if .btn-primary text color needed adjustment:
        // document.documentElement.style.setProperty('--button-text-color', '#ffffff');
        // (Currently, --button-text-color is already #ffffff in both modes, so it's fine).

        updateSelectedColorSwatchVisuals(themeName);
    }
}

function updateSelectedColorSwatchVisuals(themeName) {
    if (accentColorOptions) {
        accentColorOptions.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove(CLASS_SELECTED);
            swatch.setAttribute('aria-checked', 'false');
            if (swatch.dataset.colorTheme === themeName) {
                swatch.classList.add(CLASS_SELECTED);
                swatch.setAttribute('aria-checked', 'true');
            }
        });
    }
}

function applyFontSize(size) {
    if (document.body) {
        document.body.classList.remove('font-scale-small', 'font-scale-normal', 'font-scale-large');
        const sizeClass = `font-scale-${size}`;
        if (['font-scale-small', 'font-scale-large'].includes(sizeClass)) {
            document.body.classList.add(sizeClass);
        } else {
            document.body.classList.add('font-scale-normal'); // Default
        }
        updateSelectedFontSizeButtonVisuals(size);
    }
}

function updateSelectedFontSizeButtonVisuals(size) {
     if (fontSizeOptions) {
        fontSizeOptions.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.remove(CLASS_SELECTED);
            if (btn.dataset.size === size) {
                btn.classList.add(CLASS_SELECTED);
            }
        });
    }
}

export function loadSavedSettings() {
    const savedAccentTheme = localStorage.getItem('selectedAccentTheme');
    if (savedAccentTheme && colorThemes[savedAccentTheme]) {
        applyAccentColorTheme(savedAccentTheme);
    } else {
        applyAccentColorTheme('default');
    }

    const savedFontSize = localStorage.getItem('selectedFontSize');
    if (savedFontSize) {
        applyFontSize(savedFontSize);
    } else {
        applyFontSize('normal');
    }
}


export function initSettingsPanel() {
    settingsTriggerBtn = document.getElementById('settings-trigger-btn');
    settingsPanel = document.getElementById('settings-panel');
    settingsCloseBtn = document.getElementById('settings-close-btn');
    accentColorOptions = document.getElementById('accent-color-options');
    fontSizeOptions = document.getElementById('font-size-options');

    if (settingsTriggerBtn) {
        settingsTriggerBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            openSettingsPanel();
        });
    }

    if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', closeSettingsPanel);
    }

    if (accentColorOptions) {
        accentColorOptions.addEventListener('click', (e) => {
            const swatch = e.target.closest('.color-swatch');
            if (swatch) {
                const themeName = swatch.dataset.colorTheme;
                applyAccentColorTheme(themeName);
                localStorage.setItem('selectedAccentTheme', themeName);
            }
        });
    }

    if (fontSizeOptions) {
        fontSizeOptions.addEventListener('click', (e) => {
            const button = e.target.closest('.font-size-btn');
            if (button) {
                const size = button.dataset.size;
                applyFontSize(size);
                localStorage.setItem('selectedFontSize', size);
            }
        });
    }

    // Close on outside click
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (settingsPanel && settingsPanel.classList.contains(CLASS_ACTIVE) &&
            !settingsPanel.contains(target) &&
            target !== settingsTriggerBtn &&
            settingsTriggerBtn && !settingsTriggerBtn.contains(target)
        ) {
            closeSettingsPanel();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && settingsPanel && settingsPanel.classList.contains(CLASS_ACTIVE)) {
            closeSettingsPanel();
        }
    });
}