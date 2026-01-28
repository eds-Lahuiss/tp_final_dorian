const API_URL = 'https://rickandmortyapi.com/api/character';

let characters = [];
let currentIndex = 0;
let nextPageUrl = null;
let matches = JSON.parse(localStorage.getItem('matches')) || [];

async function fetchCharacters(url = API_URL) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        characters = data.results;
        nextPageUrl = data.info.next;
        currentIndex = 0;
        displayCurrentCharacter();

        console.log('Personnage chargé(e)', characters);
    } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        showError('Impossible de charger les personnages. Veuillez réessayer plus tard.');
    }
}

    function displayCurrentCharacter() {
        if (currentIndex >= characters.length) {
            document.getElementById('noMoreCards').style.display = 'block';
            document.getElementById('loadMoreBtn').style.display = 'block';
            return;
        }

        const character = characters[currentIndex];
        const cardHTML = `
        <img src="${character.image}" alt="${character.name}" class="card-image">
        <div class="card-info">
            <h3 class="card-name">${character.name}</h3>
            <div class="card-badges">
                <span class="badge badge-${character.status.toLowerCase()}">${character.status}</span>
                <span class="badge">${character.species}</span>
                <span class="badge">${character.gender}</span>
            </div>
        </div>
    `;
    
    document.getElementById('currentCard').innerHTML = cardHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCharacters();
});

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('nameInput').value.trim();
    const status = document.getElementById('statusSelect').value;
    const gender = document.getElementById('genderSelect').value;

    let searchUrl = API_URL + '?';
    
    if (name) searchUrl += `name=${name}&`;
    if (status) searchUrl += `status=${status}&`;
    if (gender) searchUrl += `gender=${gender}&`;
    
    // Retirer le dernier "&"
    searchUrl = searchUrl.slice(0, -1);
    
    fetchCharacters(searchUrl);
});

let passCount = 0;
let likeCount = 0;

// Bouton Pass
document.getElementById('passBtn').addEventListener('click', () => {
    passCount++;
    document.getElementById('passCount').textContent = passCount;
    currentIndex++;
    displayCurrentCharacter();
});

// Bouton Like
document.getElementById('likeBtn').addEventListener('click', () => {
    likeCount++;
    document.getElementById('likeCount').textContent = likeCount;
    
    // Ajouter aux matchs
    addToMatches(characters[currentIndex]);
    
    currentIndex++;
    displayCurrentCharacter();
});

function addToMatches(character) {
    // Vérifier si pas déjà dans les matchs
    if (!matches.find(m => m.id === character.id)) {
        matches.push(character);
        localStorage.setItem('matches', JSON.stringify(matches));
        displayMatches();
    }
}

function displayMatches() {
    const matchesList = document.getElementById('matchesList');
    const matchesCount = document.querySelector('.matches-count');
    
    matchesCount.textContent = matches.length;
    
    matchesList.innerHTML = matches.map(character => `
        <div class="match-card" data-id="${character.id}">
            <img src="${character.image}" alt="${character.name}">
            <div class="match-name">${character.name}</div>
            <button class="btn-remove-match" onclick="removeMatch(${character.id})">×</button>
        </div>
    `).join('');
}

function removeMatch(id) {
    matches = matches.filter(m => m.id !== id);
    localStorage.setItem('matches', JSON.stringify(matches));
    displayMatches();
}