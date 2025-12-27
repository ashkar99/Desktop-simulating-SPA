import { Window } from './Window.js'

export class MemoryGame extends Window {
  constructor () {
    super('Memory Game')
    
    // The 8 images for our pairs (from your img/ folder)
    this.images = [
      'astronomy.png',
      'fountain.png',
      'garden.png',
      'grand-mosque.png',
      'mosque2.png',
      'person.png',
      'sword.png',
      'waterwheel.png'
    ]
    
    this.tiles = []     // All card elements
    this.flippedCards = [] // Cards currently flipped (max 2)
    this.matches = 0       // Track progress
    
    this.renderGame()
  }

  renderGame () {
    this.element.style.width = '550px' 
    this.element.style.height = '600px'
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const grid = document.createElement('div')
    grid.classList.add('memory-grid')

    // 2. Create Deck (Duplicate & Shuffle)
    const deck = [...this.images, ...this.images]
    deck.sort(() => 0.5 - Math.random())

    // 3. Create DOM Elements
    deck.forEach((imgName) => {
      const card = document.createElement('div')
      card.classList.add('memory-card')
      card.dataset.symbol = imgName // Used for matching logic
      
      card.setAttribute('tabindex', '0')
      card.setAttribute('role', 'button')

      // HTML Structure: Now using <img> tags
      // Front = The hidden image (Al-Andalus art)
      // Back = The geometric pattern
      card.innerHTML = `
        <div class="memory-card-face memory-card-front">
          <img src="./img/${imgName}" alt="Memory Card">
        </div>
        <div class="memory-card-face memory-card-back"></div>
      `

      card.addEventListener('click', () => this.flipCard(card))
      
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault() // Stop spacebar from scrolling the page
          this.flipCard(card)
        }
      })

      grid.appendChild(card)
      this.tiles.push(card)
    })

    content.appendChild(grid)
  }

  flipCard (card) {
    if (card.classList.contains('flipped') || 
        card.classList.contains('matched') || 
        this.flippedCards.length >= 2) {
      return
    }

    card.classList.add('flipped')
    this.flippedCards.push(card)

    if (this.flippedCards.length === 2) {
      this.checkMatch()
    }
  }

  checkMatch () {
    const [card1, card2] = this.flippedCards
    const img1 = card1.dataset.symbol
    const img2 = card2.dataset.symbol

    if (img1 === img2) {
      // Match Found
      card1.classList.add('matched')
      card2.classList.add('matched')
      this.flippedCards = []
      this.matches++

      if (this.matches === this.images.length) {
        setTimeout(() => alert('Victory! You have recovered the lost memories of Al-Andalus.'), 500)
      }
    } else {
      // No Match
      setTimeout(() => {
        card1.classList.remove('flipped')
        card2.classList.remove('flipped')
        this.flippedCards = []
      }, 1000)
    }
  }
}