// js/modules/themeManager.js
import { CLASS_DARK_MODE } from './constants.js';

export function initThemeManager(handleScrollNavbarAndLinksCallback) {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    function applyTheme(theme) {
        if (theme === CLASS_DARK_MODE) {
            document.body.classList.add(CLASS_DARK_MODE);
            if (themeToggleBtn) themeToggleBtn.innerHTML = sunIcon;
        } else {
            document.body.classList.remove(CLASS_DARK_MODE);
            if (themeToggleBtn) themeToggleBtn.innerHTML = moonIcon;
        }
        if (typeof handleScrollNavbarAndLinksCallback === 'function') {
            handleScrollNavbarAndLinksCallback(); // Update navbar color immediately
        }
    }

    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme || 'light-mode'); // Apply saved or default

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            let newTheme = document.body.classList.contains(CLASS_DARK_MODE) ? 'light-mode' : CLASS_DARK_MODE;
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}