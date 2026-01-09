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
    this.attempts = 0
    
    this.renderStartScreen()
  }

  renderStartScreen () {
    this.tiles = [] 
    this.element.style.width = '400px' 
    this.element.style.height = '500px'
    
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const menu = document.createElement('div')
    menu.style.display = 'flex'
    menu.style.flexDirection = 'column'
    menu.style.alignItems = 'center'
    menu.style.justifyContent = 'center'
    menu.style.height = '100%'
    menu.style.gap = '15px'

    const title = document.createElement('h2')
    title.textContent = 'Choose Difficulty'
    menu.appendChild(title)

    const sizes = [
      { label: 'Easy (2x2)', rows: 2, cols: 2 },
      { label: 'Medium (2x4)', rows: 2, cols: 4 },
      { label: 'Hard (4x4)', rows: 4, cols: 4 }
    ]

    sizes.forEach(size => {
      const btn = document.createElement('button')
      btn.textContent = size.label
      btn.style.padding = '10px 20px'
      btn.style.width = '80%'
      btn.style.cursor = 'pointer'
      btn.setAttribute('tabindex', '0')
      btn.addEventListener('click', () => this.startGame(size.rows, size.cols)) 
      menu.appendChild(btn)
    })

    content.appendChild(menu)
    
    // Focus the first button
    setTimeout(() => {
        const firstBtn = this.element.querySelector('button')
        if (firstBtn) firstBtn.focus()
    }, 10)
  }

  startGame (rows, cols) {
    this.gridRows = rows
    this.gridCols = cols
    this.attempts = 0
    this.matches = 0
    this.flippedCards = []
    this.tiles = []

    // Dynamic Window Sizing
    if (cols === 2) {
      this.element.style.width = '300px'
      this.element.style.height = '350px'
    } else if (cols === 4 && rows === 2) {
      this.element.style.width = '550px'
      this.element.style.height = '350px'
    } else {
      this.element.style.width = '550px'
      this.element.style.height = '600px'
    }

    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    const grid = document.createElement('div')
    grid.classList.add('memory-grid')
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`

    const numPairs = (rows * cols) / 2
    const selectedImages = this.images.slice(0, numPairs)
    const deck = [...selectedImages, ...selectedImages]
    deck.sort(() => 0.5 - Math.random())

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
    this.focus()
  }

  /**
   * Handles grid navigation (Arrows) and interaction (Space/Enter)
   * @param {KeyboardEvent} e 
   * @param {number} index - Current card index (0-15)
   */
  handleKeyDown (e, index) {
    const cols = this.gridCols
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

  /**
   * Focuses the first card in the grid to enable immediate keyboard play.
   */
  focus () {
    if (this.tiles && this.tiles.length > 0) {
      this.tiles[0].focus()
    } else {
      const firstBtn = this.element.querySelector('button')
      if (firstBtn) firstBtn.focus()
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
    this.attempts++
    const [card1, card2] = this.flippedCards
    const img1 = card1.dataset.symbol
    const img2 = card2.dataset.symbol

    if (img1 === img2) {
      // Match Found
      card1.classList.add('matched')
      card2.classList.add('matched')
      this.flippedCards = []
      this.matches++

      if (this.matches === (this.gridRows * this.gridCols) / 2) {
        setTimeout(() => {
          alert(`Victory!\n\nSize: ${this.gridRows}x${this.gridCols}\nAttempts: ${this.attempts}`)
          this.renderStartScreen()
        }, 500)
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
