import { Window } from './Window.js'

export class MemoryGame extends Window {
  constructor () {
    super('Memory Game')
    // 8 pairs of emojis (Al-Andalus themed logic/nature)
    this.images = ['🌙', '🕌', '📜', '🦁', '🌿', '🏺', '⚔️', '💎'] 
    
    this.tiles = []     // All card elements
    this.flippedCards = [] // Cards currently flipped (max 2)
    this.matches = 0       // Track progress
    
    this.renderGame()
  }

  renderGame () {
    this.element.style.width = '320px'
    this.element.style.height = '360px'
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const grid = document.createElement('div')
    grid.classList.add('memory-grid')

    // 1. Create pairs and shuffle
    const deck = [...this.images, ...this.images]
    deck.sort(() => 0.5 - Math.random()) // Simple shuffle

    // 2. Create DOM elements
    deck.forEach((symbol, index) => {
      const card = document.createElement('div')
      card.classList.add('memory-card')
      card.dataset.symbol = symbol
      
      // Accessibility: Keyboard navigation
      card.setAttribute('tabindex', '0')
      card.setAttribute('role', 'button')
      card.setAttribute('aria-label', 'Memory Card')

      // HTML Structure for 3D Flip
      card.innerHTML = `
        <div class="memory-card-face memory-card-front">${symbol}</div>
        <div class="memory-card-face memory-card-back"></div>
      `

      // Event Listeners (Click + Enter key)
      card.addEventListener('click', () => this.flipCard(card))
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.flipCard(card)
      })

      grid.appendChild(card)
      this.tiles.push(card)
    })

    content.appendChild(grid)
  }

  flipCard (card) {
    // Ignore if already matched, already flipped, or if 2 cards are already open
    if (card.classList.contains('flipped') || 
        card.classList.contains('matched') || 
        this.flippedCards.length >= 2) {
      return
    }

    // 1. Flip visual
    card.classList.add('flipped')
    this.flippedCards.push(card)

    // 2. Check for match if 2 cards are open
    if (this.flippedCards.length === 2) {
      this.checkMatch()
    }
  }

  checkMatch () {
    const [card1, card2] = this.flippedCards
    const symbol1 = card1.dataset.symbol
    const symbol2 = card2.dataset.symbol

    if (symbol1 === symbol2) {
      // Match Found
      card1.classList.add('matched')
      card2.classList.add('matched')
      this.flippedCards = []
      this.matches++

      // Check Win Condition
      if (this.matches === this.images.length) {
        setTimeout(() => alert('Victory! You have recovered the lost memories of Al-Andalus.'), 500)
      }
    } else {
      // No Match - Flip back after delay
      setTimeout(() => {
        card1.classList.remove('flipped')
        card2.classList.remove('flipped')
        this.flippedCards = []
      }, 1000)
    }
  }
}