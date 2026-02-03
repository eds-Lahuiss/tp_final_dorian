// Système de swipe pour les cartes de personnages
class CardSwiper {
    constructor(cardElement, onSwipeLeft, onSwipeRight) {
        this.card = cardElement;
        this.onSwipeLeft = onSwipeLeft;
        this.onSwipeRight = onSwipeRight;
        
        // Variables pour le tracking du swipe
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.isAnimating = false; // Flag pour empêcher les swipes multiples
        
        // Seuil pour déclencher l'action (en pixels)
        this.swipeThreshold = 100;
        
        this.init();
    }
    
    init() {
        // Événements souris
        this.card.addEventListener('mousedown', this.onDragStart.bind(this));
        document.addEventListener('mousemove', this.onDragMove.bind(this));
        document.addEventListener('mouseup', this.onDragEnd.bind(this));
        
        // Événements tactiles (mobile)
        this.card.addEventListener('touchstart', this.onDragStart.bind(this));
        document.addEventListener('touchmove', this.onDragMove.bind(this));
        document.addEventListener('touchend', this.onDragEnd.bind(this));
    }
    
    onDragStart(e) {
        // Ignorer si on clique sur l'image (pour ouvrir la modal)
        if (e.target.classList.contains('card-image')) {
            return;
        }
        
        // Ignorer si un swipe est déjà en cours
        if (this.isAnimating) {
            return;
        }
        
        this.isDragging = true;
        this.card.style.transition = 'none';
        
        if (e.type === 'touchstart') {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        } else {
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }
    
    onDragMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        this.currentX = clientX - this.startX;
        this.currentY = clientY - this.startY;
        
        // Calculer la rotation en fonction du déplacement horizontal
        const rotation = this.currentX / 20;
        
        // Appliquer la transformation
        this.card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotation}deg)`;
        
        // Changer l'opacité et la couleur de la bordure selon la direction
        const opacity = Math.abs(this.currentX) / this.swipeThreshold;
        
        if (this.currentX > 0) {
            // Swipe vers la droite (Like) - bordure verte
            this.card.style.borderColor = `rgba(0, 208, 132, ${Math.min(opacity, 1)})`;
            this.card.style.boxShadow = `0 10px 40px rgba(0, 208, 132, ${Math.min(opacity * 0.5, 0.5)})`;
        } else if (this.currentX < 0) {
            // Swipe vers la gauche (Pass) - bordure rouge
            this.card.style.borderColor = `rgba(255, 71, 87, ${Math.min(opacity, 1)})`;
            this.card.style.boxShadow = `0 10px 40px rgba(255, 71, 87, ${Math.min(opacity * 0.5, 0.5)})`;
        }
    }
    
    onDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        // Vérifier si le swipe est suffisant
        if (Math.abs(this.currentX) > this.swipeThreshold) {
            // Bloquer les nouveaux swipes pendant l'animation
            this.isAnimating = true;
            // Swipe validé - animer la sortie
            this.animateSwipeOut(this.currentX > 0 ? 'right' : 'left');
        } else {
            // Swipe insuffisant - retour à la position initiale
            this.resetPosition();
        }
    }
    
    animateSwipeOut(direction) {
        const sign = direction === 'right' ? 1 : -1;
        const endX = sign * window.innerWidth * 1.5;
        const rotation = sign * 60;
        
        this.card.style.transform = `translate(${endX}px, ${this.currentY}px) rotate(${rotation}deg)`;
        this.card.style.opacity = '0';
        
        // Appeler le callback après l'animation
        setTimeout(() => {
            if (direction === 'right') {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
            this.resetPosition();
        }, 300);
    }
    
    resetPosition() {
        this.card.style.transition = 'transform 0.3s ease, opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
        this.card.style.transform = 'translate(0, 0) rotate(0deg)';
        this.card.style.opacity = '1';
        this.card.style.borderColor = 'rgba(0, 212, 255, 0.4)';
        this.card.style.boxShadow = '0 15px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        
        this.currentX = 0;
        this.currentY = 0;
    }
    
    // Méthode pour déclencher un swipe programmatique (depuis les boutons)
    triggerSwipe(direction) {
        if (this.isAnimating) return; // Empêcher les clics multiples
        this.isAnimating = true;
        this.card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        this.animateSwipeOut(direction);
    }
    
    destroy() {
        // Nettoyer les event listeners
        this.card.removeEventListener('mousedown', this.onDragStart);
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        
        this.card.removeEventListener('touchstart', this.onDragStart);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragEnd);
    }
}
