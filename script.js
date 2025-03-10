// DOM Elements
const flagDescription = document.getElementById('flagDescription');
const countryName = document.getElementById('countryName');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const aiSearch = document.getElementById('aiSearch');
const directSearch = document.getElementById('directSearch');
const tabButtons = document.querySelectorAll('.tab-btn');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKey');
const saveSettingsButton = document.getElementById('saveSettings');

// Constants
const COUNTRIES_API = 'https://restcountries.com/v3.1';
const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const STORAGE_KEY = 'countryFinderApiKey';

// State
let allCountries = [];
let apiKey = localStorage.getItem(STORAGE_KEY) || '';

// Initialize
async function init() {
    try {
        showLoading(true);
        const response = await fetch(`${COUNTRIES_API}/all`);
        allCountries = await response.json();
        setupTabListeners();
        setupDirectSearch();
        setupSettingsListeners();
        // Show all countries initially
        displayResults(allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common)));
    } catch (error) {
        showError('Failed to load countries data');
    } finally {
        showLoading(false);
    }
}

// Settings Functionality
function setupSettingsListeners() {
    settingsButton.addEventListener('click', () => {
        apiKeyInput.value = apiKey;
        settingsModal.classList.remove('hidden');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    saveSettingsButton.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        localStorage.setItem(STORAGE_KEY, apiKey);
        settingsModal.classList.add('hidden');
    });
}

// Tab Functionality
function setupTabListeners() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            if (button.dataset.tab === 'ai') {
                aiSearch.classList.remove('hidden');
                directSearch.classList.add('hidden');
            } else {
                aiSearch.classList.add('hidden');
                directSearch.classList.remove('hidden');
            }
            
            // Show all countries when switching tabs and no search is active
            const activeInput = button.dataset.tab === 'ai' ? flagDescription : countryName;
            if (!activeInput.value.trim()) {
                displayResults(allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common)));
            }
        });
    });
}

// Direct Search Functionality
function setupDirectSearch() {
    let searchTimeout;
    countryName.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim().toLowerCase();
            if (searchTerm) {
                const filteredCountries = allCountries.filter(country => 
                    country.name.common.toLowerCase().includes(searchTerm) ||
                    country.name.official.toLowerCase().includes(searchTerm)
                );
                displayResults(filteredCountries);
            } else {
                // Show all countries when search is cleared
                displayResults(allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common)));
            }
        }, 300);
    });
}

// Event Listeners
searchButton.addEventListener('click', handleSearch);
flagDescription.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Clear input handlers
flagDescription.addEventListener('input', (e) => {
    if (!e.target.value.trim()) {
        displayResults(allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common)));
    }
});

async function handleSearch() {
    const description = flagDescription.value.trim();
    if (!description) {
        displayResults(allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common)));
        return;
    }

    if (!apiKey) {
        showError('Please add your OpenAI API key in settings first');
        settingsModal.classList.remove('hidden');
        return;
    }

    showLoading(true);
    clearResults();

    try {
        const matchingCountries = await findMatchingFlags(description);
        displayResults(matchingCountries);
    } catch (error) {
        showError('Error searching flags. Please check your API key and try again.');
    } finally {
        showLoading(false);
    }
}

// API Calls
async function findMatchingFlags(description) {
    const prompt = `Given this flag description: "${description}", return a JSON array of country codes (ISO 3166-1 alpha-3) that best match this description. Only return the JSON array, nothing else. Example: ["USA", "GBR", "FRA"]`;

    const response = await fetch(OPENAI_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const countryCodes = JSON.parse(data.choices[0].message.content);
    
    return allCountries
        .filter(country => countryCodes.includes(country.cca3))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
}

// UI Functions
function displayResults(countries) {
    if (!countries.length) {
        showError('No matching flags found. Try a different search.');
        return;
    }

    const html = countries.map(country => `
        <div class="country-card">
            <img src="${country.flags.png}" alt="${country.flags.alt || country.name.common + ' flag'}" />
            <div class="country-info">
                <div class="country-name">${country.name.common}</div>
                <div>${country.region}</div>
            </div>
        </div>
    `).join('');

    resultsDiv.innerHTML = html;
}

function showLoading(show) {
    loadingDiv.classList.toggle('hidden', !show);
    searchButton.disabled = show;
}

function showError(message) {
    resultsDiv.innerHTML = `<div class="error">${message}</div>`;
}

function clearResults() {
    resultsDiv.innerHTML = '';
}

// Start the app
init(); 