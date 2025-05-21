// js/main.js
import { CLASS_ACTIVE, CLASS_NAVBAR_SCROLLED, SCROLL_THRESHOLD_NAVBAR, NAV_LINK_OFFSET_EXTRA } from './modules/constants.js';
import { initHamburgerMenu, initSmoothScroll, initScrollToTopButton } from './modules/uiInteractions.js';
import { initTxtRotate, setupHeroCanvas } from './modules/animations.js';
import { initThemeManager } from './modules/themeManager.js';
import { initCommandPalette } from './modules/commandPalette.js';
import { initSettingsPanel, loadSavedSettings } from './modules/settingsPanel.js';
import { initProjectFeatures } from './modules/projectFeatures.js';
import { initContactForm } from './modules/formHandler.js';

// NProgress Page Loading Indicator
if (typeof NProgress !== 'undefined') {
    NProgress.configure({
        showSpinner: false,
        easing: 'ease',
        speed: 400,
        minimum: 0.1
    });
    NProgress.start();
    window.addEventListener('load', () => {
        NProgress.done();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");
    const sections = document.querySelectorAll("section[id]");

    // --- Navbar Styling & Active Link Highlighting on Scroll ---
    function handleScrollNavbarAndLinks() {
        if (navbar) {
            if (window.scrollY > SCROLL_THRESHOLD_NAVBAR) {
                navbar.classList.add(CLASS_NAVBAR_SCROLLED);
            } else {
                navbar.classList.remove(CLASS_NAVBAR_SCROLLED);
            }
        }

        let scrollY = window.pageYOffset;
        let currentActiveFound = false;
        const navEffectiveOffset = (navbar ? navbar.offsetHeight : 0) + NAV_LINK_OFFSET_EXTRA;

        sections.forEach(current => {
            if (!current) return;
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - navEffectiveOffset;
            let sectionId = current.getAttribute("id");

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active-link");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active-link");
                        currentActiveFound = true;
                    }
                });
            }
        });

        if (!currentActiveFound && sections.length > 0 && scrollY < (sections[0].offsetTop - navEffectiveOffset)) {
            navLinks.forEach(link => link.classList.remove("active-link"));
            const homeLink = document.querySelector('.nav-link[href="#home"]');
            if (homeLink) homeLink.classList.add("active-link");
        }
    }

    // Initializations
    initHamburgerMenu();
    initSmoothScroll();
    initScrollToTopButton(handleScrollNavbarAndLinks); // Pass handleScrollNavbarAndLinks if needed inside

    if (document.getElementById('heroCanvas')) {
        setupHeroCanvas();
    }
    initTxtRotate();

    initThemeManager(handleScrollNavbarAndLinks); // Pass handleScrollNavbarAndLinks to update navbar on theme change
    initCommandPalette();
    initSettingsPanel();
    loadSavedSettings(); // Load saved UI settings (theme, font size) from settingsPanel module

    initProjectFeatures();
    initContactForm();

    // Footer year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear().toString();
    }

    // Initial state checks
    handleScrollNavbarAndLinks();
    // toggleScrollToTopButtonVisibility() is handled by initScrollToTopButton's internal scroll listener

    // Combined Scroll Listener
    window.addEventListener('scroll', () => {
        handleScrollNavbarAndLinks();
        // Scroll to top visibility is handled within its own module's event listener now
    });
});