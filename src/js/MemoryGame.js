import { Window } from './Window.js'

export class MemoryGame extends Window {
  constructor () {
    super('Memory Game')
    
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
    
    this.tiles = [] // Hold the DOM elements in order
    this.flippedCards = []
    this.matches = 0
    
    this.renderGame()
  }

  renderGame () {
    this.element.style.width = '550px'
    this.element.style.height = '600px'
    
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    const grid = document.createElement('div')
    grid.classList.add('memory-grid')

    // Create Deck and Shuffle
    const deck = [...this.images, ...this.images]
    deck.sort(() => 0.5 - Math.random())

    // Create DOM Elements
    deck.forEach((imgName, index) => {
      const card = document.createElement('div')
      card.classList.add('memory-card')
      card.dataset.symbol = imgName
      
      // Accessibility attributes
      card.setAttribute('tabindex', '0') // Focusable
      card.setAttribute('role', 'button')
      card.setAttribute('aria-label', 'Memory Card')

      card.innerHTML = `
        <div class="memory-card-face memory-card-front">
          <img src="./img/${imgName}" alt="Memory Card Content">
        </div>
        <div class="memory-card-face memory-card-back"></div>
      `

      card.addEventListener('click', () => this.flipCard(card))
      card.addEventListener('keydown', (e) => this.handleKeyDown(e, index))

      grid.appendChild(card)
      this.tiles.push(card) // Store reference for index calculation
    })

    content.appendChild(grid)
  }

  /**
   * Handles grid navigation (Arrows) and interaction (Space/Enter)
   * @param {KeyboardEvent} e 
   * @param {number} index - Current card index (0-15)
   */
  handleKeyDown (e, index) {
    const cols = 4 // Number of columns in the grid
    const total = this.tiles.length
    let nextIndex = null

    switch (e.key) {
      case 'ArrowRight':
        if ((index + 1) % cols !== 0) nextIndex = index + 1
        break
        
      case 'ArrowLeft':
        if (index % cols !== 0) nextIndex = index - 1
        break
        
      case 'ArrowDown':
        if (index + cols < total) nextIndex = index + cols
        break
        
      case 'ArrowUp':
        if (index - cols >= 0) nextIndex = index - cols
        break
        
      case 'Enter':
      case ' ':
        e.preventDefault() 
        this.flipCard(this.tiles[index])
        return 
    }

    if (nextIndex !== null) {
      e.preventDefault() // Stop page scroll
      this.tiles[nextIndex].focus()
    }
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
