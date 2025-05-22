// js/modules/commandPalette.js
import { CLASS_ACTIVE, CLASS_SELECTED, CMD_PALETTE_TRANSITION_MS } from './constants.js';
import { getTranslation } from './languageManager.js'; // Import getTranslation

let commandPaletteOverlay, commandInput, commandResultsList, themeToggleBtn;
let selectedCommandIndex = -1;
let currentFilteredCommands = [];
let allCommands = []; // Store base command structure

function generateCommandsStructure() {
    // Define command structure with keys for translation
    return [
        { id: 'NavHome', nameKey: 'cmdNavHomeName', descriptionKey: 'cmdNavHomeDesc', action: '#home' },
        { id: 'NavAbout', nameKey: 'cmdNavAboutName', descriptionKey: 'cmdNavAboutDesc', action: '#about' },
        { id: 'NavEducation', nameKey: 'cmdNavEducationName', descriptionKey: 'cmdNavEducationDesc', action: '#education' },
        { id: 'NavSkills', nameKey: 'cmdNavSkillsName', descriptionKey: 'cmdNavSkillsDesc', action: '#skills' },
        { id: 'NavProjects', nameKey: 'cmdNavProjectsName', descriptionKey: 'cmdNavProjectsDesc', action: '#projects' },
        { id: 'NavContact', nameKey: 'cmdNavContactName', descriptionKey: 'cmdNavContactDesc', action: '#contact' },
        { id: 'ToggleTheme', nameKey: 'cmdToggleThemeName', descriptionKey: 'cmdToggleThemeDesc', action: function() { if (themeToggleBtn) themeToggleBtn.click(); } }
    ];
}

function populateTranslatedCommands() {
    const commandStructure = generateCommandsStructure();
    allCommands = commandStructure.map(cmd => ({
        ...cmd, // Keep original action and id
        name: getTranslation(cmd.nameKey),
        description: getTranslation(cmd.descriptionKey)
    }));
}

// This function will be exposed to be called by languageManager on language change
window.refreshCommandPaletteCommands = () => {
    populateTranslatedCommands();
    if (commandPaletteOverlay && commandPaletteOverlay.classList.contains(CLASS_ACTIVE) && commandInput) {
        renderCommandResults(commandInput.value); // Re-render if open
    }
};

function openCommandPalette() {
    if (commandPaletteOverlay) {
        populateTranslatedCommands(); // Ensure commands are translated on open
        commandPaletteOverlay.classList.add(CLASS_ACTIVE);
        commandPaletteOverlay.style.display = 'flex';
        if (commandInput) {
            commandInput.value = '';
            commandInput.setAttribute('placeholder', getTranslation('cmdPaletteInputPlaceholder'));
        }
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
    currentFilteredCommands = allCommands.filter(command =>
        command.name.toLowerCase().includes(query.toLowerCase()) ||
        (command.description && command.description.toLowerCase().includes(query.toLowerCase()))
    );

    if (currentFilteredCommands.length === 0) {
        const li = document.createElement('li');
        li.textContent = getTranslation('cmdNoResults');
        li.classList.add('no-results');
        commandResultsList.appendChild(li);
    } else {
        currentFilteredCommands.forEach((command) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.textContent = command.name;
            if (command.description && command.description !== command.descriptionKey) { // Show if translation exists
                const descSpan = document.createElement('span');
                descSpan.className = 'command-description';
                descSpan.textContent = ` (${command.description})`;
                li.appendChild(descSpan);
            }
            li.addEventListener('click', () => executeCommand(command)); // Pass the translated command object
            commandResultsList.appendChild(li);
        });
    }
    selectedCommandIndex = -1; // Reset selection
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

function executeCommand(command) { // command is the translated command object
    if (typeof command.action === 'function') {
        command.action();
    } else if (typeof command.action === 'string' && command.action.startsWith('#')) {
        const targetElement = document.querySelector(command.action);
        if (targetElement) {
            const hamburger = document.querySelector(".hamburger");
            const navMenu = document.querySelector(".nav-menu");
            if (hamburger && navMenu && hamburger.classList.contains(CLASS_ACTIVE)) {
                hamburger.classList.remove(CLASS_ACTIVE);
                navMenu.classList.remove(CLASS_ACTIVE);
            }
            const navbar = document.querySelector(".navbar");
            let navbarHeight = navbar ? navbar.offsetHeight : 0;
            const elementPosition = targetElement.offsetTop;
            const offsetPosition = elementPosition - navbarHeight - 15;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    }
    closeCommandPalette();
}

export function initCommandPalette() {
    commandPaletteOverlay = document.getElementById('command-palette');
    commandInput = document.getElementById('command-input');
    commandResultsList = document.getElementById('command-results');
    themeToggleBtn = document.getElementById('theme-toggle');

    populateTranslatedCommands(); // Initial population

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
            // Arrow navigation and Enter key logic remains largely the same
            // Ensure currentFilteredCommands is used for execution
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