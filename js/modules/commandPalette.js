// js/modules/commandPalette.js
import { CLASS_ACTIVE, CLASS_SELECTED, CMD_PALETTE_TRANSITION_MS } from './constants.js';

export function initCommandPalette() {
    const commandPaletteOverlay = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandResultsList = document.getElementById('command-results');
    const themeToggleBtn = document.getElementById('theme-toggle'); // For 'Toggle Theme' command

    let selectedCommandIndex = -1;
    let currentFilteredCommands = [];

    const commands = [
        { name: 'Go to Home', action: '#home', description: 'Navigate to Home section' },
        { name: 'Go to About', action: '#about', description: 'Navigate to About Me' },
        { name: 'Go to Education', action: '#education', description: 'Navigate to Education' },
        { name: 'Go to Skills', action: '#skills', description: 'Navigate to Skills' },
        { name: 'Go to Projects', action: '#projects', description: 'Navigate to Projects' },
        { name: 'Go to Contact', action: '#contact', description: 'Navigate to Contact form' },
        { name: 'Toggle Theme', action: function() { if (themeToggleBtn) themeToggleBtn.click(); }, description: 'Switch light/dark theme' }
    ];

    function openCommandPalette() {
        if (commandPaletteOverlay) {
            commandPaletteOverlay.classList.add(CLASS_ACTIVE);
            commandPaletteOverlay.style.display = 'flex';
            if (commandInput) commandInput.value = '';
            renderCommandResults('');
            if (commandInput) commandInput.focus();
            selectedCommandIndex = -1;
        }
    }

    function closeCommandPalette() {
        if (commandPaletteOverlay) {
            commandPaletteOverlay.classList.remove(CLASS_ACTIVE);
            setTimeout(() => {
                if (!commandPaletteOverlay.classList.contains(CLASS_ACTIVE)) {
                    commandPaletteOverlay.style.display = 'none';
                }
            }, CMD_PALETTE_TRANSITION_MS);
        }
    }

    function renderCommandResults(query) {
        if (!commandResultsList) return;
        commandResultsList.innerHTML = '';
        currentFilteredCommands = commands.filter(command =>
            command.name.toLowerCase().includes(query.toLowerCase()) ||
            (command.description && command.description.toLowerCase().includes(query.toLowerCase()))
        );

        if (currentFilteredCommands.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No commands found.';
            li.classList.add('no-results');
            commandResultsList.appendChild(li);
        } else {
            currentFilteredCommands.forEach((command) => {
                const li = document.createElement('li');
                li.setAttribute('role', 'option');
                li.textContent = command.name;
                if (command.description) {
                    const descSpan = document.createElement('span');
                    descSpan.className = 'command-description';
                    descSpan.textContent = ` (${command.description})`;
                    li.appendChild(descSpan);
                }
                li.addEventListener('click', () => executeCommand(command));
                commandResultsList.appendChild(li);
            });
        }
        selectedCommandIndex = -1;
        updateSelectedCommandHighlight();
    }

    function updateSelectedCommandHighlight() {
        if (!commandResultsList) return;
        const items = commandResultsList.querySelectorAll('li');
        items.forEach((item, index) => {
            if (index === selectedCommandIndex && !item.classList.contains('no-results')) {
                item.classList.add(CLASS_SELECTED);
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove(CLASS_SELECTED);
                item.setAttribute('aria-selected', 'false');
            }
        });
    }

    function executeCommand(command) {
        if (typeof command.action === 'function') {
            command.action();
        } else if (typeof command.action === 'string' && command.action.startsWith('#')) {
            const targetElement = document.querySelector(command.action);
            if (targetElement) {
                const hamburger = document.querySelector(".hamburger"); // Consider passing or importing
                const navMenu = document.querySelector(".nav-menu");   // Consider passing or importing
                if (hamburger && navMenu && hamburger.classList.contains(CLASS_ACTIVE)) {
                    hamburger.classList.remove(CLASS_ACTIVE);
                    navMenu.classList.remove(CLASS_ACTIVE);
                }
                // Use smooth scroll logic from uiInteractions for consistency if desired
                // For simplicity here, direct scrollIntoView
                const navbar = document.querySelector(".navbar");
                let navbarHeight = navbar ? navbar.offsetHeight : 0;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - navbarHeight - 15; // Consistent offset
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }
        closeCommandPalette();
    }

    if (commandInput) {
        commandInput.addEventListener('input', (e) => renderCommandResults(e.target.value));
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (commandPaletteOverlay && !commandPaletteOverlay.classList.contains(CLASS_ACTIVE)) {
                openCommandPalette();
            } else {
                closeCommandPalette();
            }
        }
        if (commandPaletteOverlay && commandPaletteOverlay.classList.contains(CLASS_ACTIVE)) {
            if (e.key === 'Escape') {
                closeCommandPalette();
            }
            const items = commandResultsList.querySelectorAll('li:not(.no-results)');
            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedCommandIndex = (selectedCommandIndex + 1) % items.length;
                updateSelectedCommandHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedCommandIndex = (selectedCommandIndex - 1 + items.length) % items.length;
                updateSelectedCommandHighlight();
            } else if (e.key === 'Enter' && selectedCommandIndex > -1 && currentFilteredCommands[selectedCommandIndex]) {
                e.preventDefault();
                executeCommand(currentFilteredCommands[selectedCommandIndex]);
            }
        }
    });

    if (commandPaletteOverlay) {
        commandPaletteOverlay.addEventListener('click', function(e) {
            if (e.target === commandPaletteOverlay) {
                closeCommandPalette();
            }
        });
    }
}