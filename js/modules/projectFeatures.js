// js/modules/projectFeatures.js
import { CLASS_ACTIVE, CLASS_HIDE } from './constants.js';

// --- GitHub Repository Information Fetcher ---
async function fetchGitHubStats(repoName, cardElement) {
    const statsContainer = cardElement.querySelector('.github-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `<span class="stat-loading">Loading stats...</span>`;

    try {
        const response = await fetch(`https://api.github.com/repos/${repoName}`);
        if (!response.ok) {
            throw new Error(`GitHub API error! status: ${response.status} for ${repoName}`);
        }
        const data = await response.json();
        const lastUpdated = new Date(data.pushed_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        statsContainer.innerHTML = `
            <span class="stat-item"><i class="fas fa-star"></i> ${data.stargazers_count}</span>
            <span class="stat-item"><i class="fas fa-code-branch"></i> ${data.forks_count}</span>
            <span class="stat-item"><i class="fas fa-history"></i> Updated: ${lastUpdated}</span>
            ${data.language ? `<span class="stat-item"><i class="fas fa-code"></i> ${data.language}</span>` : ''}
        `;
    } catch (error) {
        console.error(`Error fetching GitHub stats for ${repoName}:`, error);
        if (statsContainer) {
            statsContainer.innerHTML = `<span class="stat-error">Could not load GitHub stats.</span>`;
        }
    }
}

function initGitHubStats() {
    const projectCardsWithRepos = document.querySelectorAll('.project-card[data-repo]');
    projectCardsWithRepos.forEach(card => {
        const repoName = card.dataset.repo;
        if (repoName && repoName.includes('/')) {
            // Create the .github-stats div if it doesn't exist and you want to add it dynamically
            let statsContainer = card.querySelector('.github-stats');
            if (!statsContainer) {
                statsContainer = document.createElement('div');
                statsContainer.className = 'github-stats';
                // Insert it before project-links or at a specific position
                const projectLinksDiv = card.querySelector('.project-links');
                if (projectLinksDiv) {
                    card.insertBefore(statsContainer, projectLinksDiv);
                } else {
                    card.appendChild(statsContainer); // Fallback
                }
            }
            fetchGitHubStats(repoName, card);
        } else if (repoName) {
            let statsContainer = card.querySelector('.github-stats');
            if (!statsContainer) { /* As above */ }
            if (statsContainer) {
                statsContainer.innerHTML = `<span class="stat-error">Invalid repo format. Use 'username/repo'.</span>`;
            }
            console.warn(`Invalid GitHub repo format for card: ${repoName}. Expected 'username/repo'.`);
        }
    });
}


// --- Filterable Project Gallery ---
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
                    const cardCategoriesString = card.dataset.category; // e.g., "web dev java"
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