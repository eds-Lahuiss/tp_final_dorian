const API_URL = 'https://rickandmortyapi.com/api/character';

let characters = [];
let currentIndex = 0;
let nextPageUrl = null;
let matches = JSON.parse(localStorage.getItem('matches')) || [];
let cardSwiper = null;

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
        <div class="card-content">
            <div class="card-header">
                <h2>${character.name}</h2>
                <div>
                    <span class="badge status-${character.status.toLowerCase()}">${character.status}</span>
                    <span class="badge">${character.species}</span>
                    <span class="badge">${character.gender}</span>
                </div>
            </div>
            <div class="card-details">
                <p><strong>Origine:</strong> ${character.origin.name}</p>
                <p><strong>Localisation:</strong> ${character.location.name}</p>
            </div>
        </div>
    `;
    
    document.getElementById('currentCard').innerHTML = cardHTML;
    document.getElementById('noMoreCards').style.display = 'none';
    document.getElementById('loadMoreBtn').style.display = 'none';
    
    // Initialiser le swiper pour la nouvelle carte
    initializeSwiper();
}

function initializeSwiper() {
    // Détruire l'ancien swiper s'il existe
    if (cardSwiper) {
        cardSwiper.destroy();
    }
    
    const card = document.getElementById('currentCard');
    cardSwiper = new CardSwiper(
        card,
        handlePass,  // Swipe gauche = Pass
        handleLike   // Swipe droite = Like
    );
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCharacters();
});

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const species = document.getElementById('speciesSelect').value;
    const status = document.getElementById('statusSelect').value;
    const gender = document.getElementById('genderSelect').value;

    let searchUrl = API_URL + '?';
    
    if (species) searchUrl += `species=${species}&`;
    if (status) searchUrl += `status=${status}&`;
    if (gender) searchUrl += `gender=${gender}&`;
    
    // Retirer le dernier "&"
    searchUrl = searchUrl.slice(0, -1);
    
    fetchCharacters(searchUrl);
});

let passCount = 0;
let likeCount = 0;
let isProcessing = false; // Verrou pour empêcher les swipes multiples

// Fonction pour gérer le pass (appelée par le swipe ET le bouton)
function handlePass() {
    if (isProcessing) return; // Bloquer si un swipe est déjà en cours
    isProcessing = true;
    
    passCount++;
    document.getElementById('passCount').textContent = passCount;
    currentIndex++;
    
    // Attendre un peu avant de réactiver les swipes
    setTimeout(() => {
        displayCurrentCharacter();
        isProcessing = false;
    }, 100);
}

// Fonction pour gérer le like (appelée par le swipe ET le bouton)
function handleLike() {
    if (isProcessing) return; // Bloquer si un swipe est déjà en cours
    isProcessing = true;
    
    likeCount++;
    document.getElementById('likeCount').textContent = likeCount;
    
    // Ajouter aux matchs
    addToMatches(characters[currentIndex]);
    
    currentIndex++;
    
    // Attendre un peu avant de réactiver les swipes
    setTimeout(() => {
        displayCurrentCharacter();
        isProcessing = false;
    }, 100);
}

// Bouton Pass - déclenche l'animation de swipe
document.getElementById('passBtn').addEventListener('click', () => {
    if (cardSwiper && currentIndex < characters.length && !isProcessing) {
        cardSwiper.triggerSwipe('left');
    }
});

// Bouton Like - déclenche l'animation de swipe
document.getElementById('likeBtn').addEventListener('click', () => {
    if (cardSwiper && currentIndex < characters.length && !isProcessing) {
        cardSwiper.triggerSwipe('right');
    }
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
    const matchNotification = document.getElementById('matchNotification');
    
    matchNotification.textContent = matches.length;
    
    matchesList.innerHTML = matches.map(character => `
        <div class="match-card" data-id="${character.id}">
            <img src="${character.image}" alt="${character.name}">
            <div class="match-info">
                <div class="match-name">${character.name}</div>
                <div class="match-status">${character.species} • ${character.status}</div>
            </div>
            <button class="btn-remove-match" onclick="event.stopPropagation(); removeMatch(${character.id})">×</button>
        </div>
    `).join('');
}

function removeMatch(id) {
    matches = matches.filter(m => m.id !== id);
    localStorage.setItem('matches', JSON.stringify(matches));
    displayMatches();
}

// Ouvrir/Fermer la sidebar
document.getElementById('floatingMatchesBtn').addEventListener('click', () => {
    document.getElementById('matchesSidebar').classList.add('active');
});

document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('matchesSidebar').classList.remove('active');
});

// Fermer en cliquant en dehors
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('matchesSidebar');
    const btn = document.getElementById('floatingMatchesBtn');
    
    if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// Charger les matchs au démarrage
document.addEventListener('DOMContentLoaded', () => {
    displayMatches();
    fetchCharacters();
});