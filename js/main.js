// js/main.js
import { CLASS_ACTIVE, CLASS_NAVBAR_SCROLLED, SCROLL_THRESHOLD_NAVBAR, NAV_LINK_OFFSET_EXTRA } from './modules/constants.js';
import { initHamburgerMenu, initSmoothScroll, initScrollToTopButton } from './modules/uiInteractions.js';
// animations.js'den initTxtRotate'i initializeTxtRotateModule olarak ve TxtRotate sınıfını import edin
import { initTxtRotate as initializeTxtRotateModule, setupHeroCanvas, TxtRotate } from './modules/animations.js';
import { initThemeManager } from './modules/themeManager.js';
import { initCommandPalette } from './modules/commandPalette.js';
import { initSettingsPanel, loadSavedSettings } from './modules/settingsPanel.js';
import { initProjectFeatures } from './modules/projectFeatures.js';
import { initContactForm } from './modules/formHandler.js';
import { initLanguageManager, getTranslation } from './modules/languageManager.js';

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

// Global function for TxtRotate re-initialization
// SADECE BU VERSİYON KALMALI:
window.initializeTxtRotateElements = (specificElement = null) => {
    initializeTxtRotateModule(specificElement); // animations.js'deki güncellenmiş initTxtRotate'i çağırır
};

// Global refresh functions for modules that need to update their text
// (Bu fonksiyonların commandPalette.js ve projectFeatures.js içinde tanımlı olduğundan emin olun
// ve languageManager tarafından çağrıldığında doğru şekilde çalıştıklarını kontrol edin.)
window.refreshCommandPaletteCommands = () => {
    if (typeof initCommandPalette === 'function' && window.commandPaletteInitialized) {
        // Gerekirse initCommandPalette(); çağrılabilir veya commandPalette modülünde özel bir refresh fonksiyonu olabilir.
        // languageManager.js içindeki setLanguage fonksiyonunda bu tür refresh'ler çağrılıyor.
    }
};

window.refreshProjectFeaturesText = () => {
    if (typeof initProjectFeatures === 'function' && window.projectFeaturesInitialized) {
        initProjectFeatures();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Language Manager first, it will load and apply initial translations
    await initLanguageManager(); // Wait for initial language setup (SADECE BİR KEZ ÇAĞIRILMALI)

    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");
    const sections = document.querySelectorAll("section[id]");

    function handleScrollNavbarAndLinks() {
        if (navbar) {
            navbar.classList.toggle(CLASS_NAVBAR_SCROLLED, window.scrollY > SCROLL_THRESHOLD_NAVBAR);
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

    // Initializations of other modules AFTER language is set up
    initHamburgerMenu();
    initSmoothScroll();
    initScrollToTopButton();

    if (document.getElementById('heroCanvas')) {
        setupHeroCanvas();
    }
    
    // Dil yöneticisi çevirileri uyguladıktan sonra TxtRotate'i başlat
    window.initializeTxtRotateElements(); 

    initThemeManager(handleScrollNavbarAndLinks);
    initCommandPalette();
    window.commandPaletteInitialized = true;

    initSettingsPanel();
    loadSavedSettings();

    initProjectFeatures();
    window.projectFeaturesInitialized = true;

    initContactForm();

    handleScrollNavbarAndLinks(); // Initial check

    window.addEventListener('scroll', () => {
        handleScrollNavbarAndLinks();
    });
});