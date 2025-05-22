// js/modules/projectFeatures.js
import { CLASS_ACTIVE, CLASS_HIDE } from './constants.js';
import { getTranslation } from './languageManager.js'; // Import getTranslation

// Expose a refresh function for languageManager to call
window.refreshProjectFeaturesText = () => {
    // Re-initialize or specifically update text for GitHub stats
    // If initGitHubStats simply re-fetches and re-renders, calling it is fine.
    initGitHubStats();
};


async function fetchGitHubStats(repoName, cardElement) {
    const statsContainer = cardElement.querySelector('.github-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `<span class="stat-loading">${getTranslation('ghStatsLoading')}</span>`;

    try {
        const response = await fetch(`https://api.github.com/repos/${repoName}`);
        if (!response.ok) {
            throw new Error(getTranslation('ghStatsApiError', { status: response.status, repoName: repoName }));
        }
        const data = await response.json();
        const langForDate = document.documentElement.lang || 'en'; // Use current page lang for date locale
        const lastUpdated = new Date(data.pushed_at).toLocaleDateString(langForDate, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        statsContainer.innerHTML = `
            <span class="stat-item"><i class="fas fa-star"></i> ${data.stargazers_count}</span>
            <span class="stat-item"><i class="fas fa-code-branch"></i> ${data.forks_count}</span>
            <span class="stat-item"><i class="fas fa-history"></i> ${getTranslation('ghStatsUpdated')} ${lastUpdated}</span>
            ${data.language ? `<span class="stat-item"><i class="fas fa-code"></i> ${data.language}</span>` : ''}
        `;
    } catch (error) {
        console.error(`Error fetching GitHub stats for ${repoName}:`, error.message);
        if (statsContainer) {
            // error.message will be translated if it came from the 'throw new Error' above.
            // Otherwise, use a generic translated fallback.
            let displayError = error.message.startsWith("GitHub API error!") || error.message.startsWith("GitHub API hatası!")
                               ? error.message
                               : getTranslation('ghStatsCouldNotLoad');
            statsContainer.innerHTML = `<span class="stat-error">${displayError}</span>`;
        }
    }
}

function initGitHubStats() {
    const projectCardsWithRepos = document.querySelectorAll('.project-card[data-repo]');
    projectCardsWithRepos.forEach(card => {
        const repoName = card.dataset.repo;
        if (repoName && repoName.includes('/')) {
            let statsContainer = card.querySelector('.github-stats');
            if (!statsContainer) {
                statsContainer = document.createElement('div');
                statsContainer.className = 'github-stats';
                const projectLinksDiv = card.querySelector('.project-links');
                if (projectLinksDiv) {
                    card.insertBefore(statsContainer, projectLinksDiv);
                } else {
                    card.appendChild(statsContainer);
                }
            }
            fetchGitHubStats(repoName, card);
        } else if (repoName) {
            let statsContainer = card.querySelector('.github-stats');
             if (!statsContainer) { /* Dynamic creation if needed */ }
            if (statsContainer) {
                statsContainer.innerHTML = `<span class="stat-error">${getTranslation('ghStatsInvalidFormat')}</span>`;
            }
            console.warn(`Invalid GitHub repo format for card: ${repoName}. Expected 'username/repo'.`);
        }
    });
}

// --- Filterable Project Gallery --- (No changes needed for translation here if categories are not translated)
function initProjectFilter() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".projects-grid .project-card");

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", function() {
                filterButtons.forEach(btn => btn.classList.remove(CLASS_ACTIVE));
                this.classList.add(CLASS_ACTIVE);
                const filterValue = this.getAttribute("data-filter");

                projectCards.forEach(card => {
                    const cardCategoriesString = card.dataset.category;
                    const cardCategories = cardCategoriesString ? cardCategoriesString.split(' ') : [];
                    if (filterValue === "all" || cardCategories.includes(filterValue)) {
                        card.classList.remove(CLASS_HIDE);
                    } else {
                        card.classList.add(CLASS_HIDE);
                    }
                });
            });
        });
    }
}

export function initProjectFeatures() {
    initGitHubStats();
    initProjectFilter();
}