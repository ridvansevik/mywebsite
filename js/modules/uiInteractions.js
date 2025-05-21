// js/modules/uiInteractions.js
import { CLASS_ACTIVE, SCROLL_THRESHOLD_TOP_BTN } from './constants.js';

export function initHamburgerMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle(CLASS_ACTIVE);
            navMenu.classList.toggle(CLASS_ACTIVE);
        });
    }
    if (navLinks.length > 0) {
        navLinks.forEach(n => n.addEventListener("click", () => {
            if (hamburger && navMenu && hamburger.classList.contains(CLASS_ACTIVE)) {
                hamburger.classList.remove(CLASS_ACTIVE);
                navMenu.classList.remove(CLASS_ACTIVE);
            }
        }));
    }
}

export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const navbar = document.querySelector(".navbar");
                    let navbarHeight = navbar ? navbar.offsetHeight : 0;
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - navbarHeight - 15;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    const navMenu = document.querySelector(".nav-menu");
                    const hamburger = document.querySelector(".hamburger");
                    if (navMenu && hamburger && this.closest('.nav-menu') && navMenu.classList.contains(CLASS_ACTIVE)) {
                        hamburger.classList.remove(CLASS_ACTIVE);
                        navMenu.classList.remove(CLASS_ACTIVE);
                    }
                }
            } catch (error) {
                console.error("Smooth scroll target error for selector:", targetId, error);
            }
        });
    });
}

export function initScrollToTopButton() {
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    function toggleScrollToTopButtonVisibility() {
        if (scrollToTopBtn) {
            if (document.body.scrollTop > SCROLL_THRESHOLD_TOP_BTN || document.documentElement.scrollTop > SCROLL_THRESHOLD_TOP_BTN) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        }
    }

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    // Add scroll listener specifically for this button
    window.addEventListener('scroll', toggleScrollToTopButtonVisibility);
    toggleScrollToTopButtonVisibility(); // Initial check
}