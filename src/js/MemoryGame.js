import { Window } from './Window.js'

export class MemoryGame extends Window {
  constructor () {
    super('Memory Game')
    
    this.images = [
      'astronomy.png', 'fountain.png', 'garden.png', 'grand-mosque.png',
      'mosque2.png', 'person.png', 'sword.png', 'waterwheel.png'
    ]
    
    this.tiles = [] 
    this.flippedCards = []
    this.matches = 0
    this.attempts = 0
    
    // Trackers for "Sticky Focus"
    this.acctiveCardIndex = 0
    this.activeMenuIndex = 0 
    
    this.renderStartScreen()
  }

  renderStartScreen () {
    this.tiles = [] 
    this.activeMenuIndex = 0
    this.element.style.width = '400px' 
    this.element.style.height = '500px'
    
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const menu = document.createElement('div')
    menu.className = 'memory-menu'
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

    sizes.forEach((size, index) => {
      const btn = document.createElement('button')
      btn.textContent = size.label
      btn.style.padding = '10px 20px'
      btn.style.width = '80%'
      btn.style.cursor = 'pointer'
      btn.setAttribute('tabindex', '0')
      btn.addEventListener('click', () => {
        this.activeMenuIndex = index
        this.startGame(size.rows, size.cols)
      })
      
      // Keyboard Navigation tracking
      btn.addEventListener('keydown', (e) => this.handleMenuKeydown(e, index, sizes.length))
      btn.addEventListener('focus', () => { this.activeMenuIndex = index })
      menu.appendChild(btn)
    })

    content.appendChild(menu)

    setTimeout(() => {
        this.focus()
    }, 50)
  }

  handleMenuKeydown(e, index, totalButtons) {
    const buttons = this.element.querySelectorAll('.memory-menu button')
    let nextIndex = null

    if (e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = (index + 1) % totalButtons
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = (index - 1 + totalButtons) % totalButtons
    }

    if (nextIndex !== null) {
        this.activeMenuIndex = nextIndex // Update tracker
        buttons[nextIndex].focus()
    }
  }

  startGame (rows, cols) {
    this.gridRows = rows
    this.gridCols = cols
    this.attempts = 0
    this.matches = 0
    this.flippedCards = []
    this.tiles = []
    this.acctiveCardIndex = 0 

    // Window Sizing
    if (cols === 2) {
      this.element.style.width = '300px'; this.element.style.height = '350px'
    } else if (cols === 4 && rows === 2) {
      this.element.style.width = '550px'; this.element.style.height = '350px'
    } else {
      this.element.style.width = '550px'; this.element.style.height = '600px'
    }

    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    const grid = document.createElement('div')
    grid.classList.add('memory-grid')
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.memory-card')
      if (!card || !grid.contains(card)) return
      
      // Update tracker on mouse click
      const index = this.tiles.indexOf(card)
      if (index !== -1) {
          this.acctiveCardIndex = index
          card.focus() 
      }
      this.flipCard(card)
    })

    const numPairs = (rows * cols) / 2
    const selectedImages = this.images.slice(0, numPairs)
    const deck = [...selectedImages, ...selectedImages]
    deck.sort(() => 0.5 - Math.random())

    deck.forEach((imgName, index) => {
      const card = document.createElement('div')
      card.classList.add('memory-card')
      card.dataset.symbol = imgName
      card.setAttribute('tabindex', '0')
      card.setAttribute('role', 'button')

      card.innerHTML = `
        <div class="memory-card-face memory-card-front">
          <img src="./img/${imgName}" alt="Memory Card">
        </div>
        <div class="memory-card-face memory-card-back"></div>
      `
      
      card.addEventListener('keydown', (e) => this.handleGameKeydown(e, index))
      grid.appendChild(card)
      this.tiles.push(card)
    })
    
    content.appendChild(grid)
    setTimeout(() => {
       this.focus()
    }, 50)
  }

  /**
   * Smart Focus: Recovers focus to the last used card or menu button.
   */
  focus () {
    // Game Mode
    if (this.tiles && this.tiles.length > 0) {
      if (this.tiles[this.acctiveCardIndex] && document.body.contains(this.tiles[this.acctiveCardIndex])) {
        this.tiles[this.acctiveCardIndex].focus()
      } else if (this.tiles[0]) {
        this.tiles[0].focus()
      }
    } 
    // Menu Mode
    else {
      const buttons = this.element.querySelectorAll('.window-content button')
      if (buttons.length > 0) {
        const btnToFocus = buttons[this.activeMenuIndex] || buttons[0]
        btnToFocus.focus()
      }
    }
  }

  handleGameKeydown (e, index) {
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
        this.acctiveCardIndex = index
        this.flipCard(this.tiles[index])
        return 
    }

    if (nextIndex !== null) {
      e.preventDefault() 
      this.acctiveCardIndex = nextIndex
      this.tiles[nextIndex].focus()
    }
  }

  flipCard (card) {
    if (card.classList.contains('flipped') || card.classList.contains('matched') || this.flippedCards.length >= 2) return
    card.classList.add('flipped')
    this.flippedCards.push(card)
    if (this.flippedCards.length === 2) this.checkMatch()
  }

  checkMatch () {
    this.attempts++
    const [card1, card2] = this.flippedCards
    if (card1.dataset.symbol === card2.dataset.symbol) {
      card1.classList.add('matched'); card2.classList.add('matched')
      this.flippedCards = []; this.matches++
      if (this.matches === (this.gridRows * this.gridCols) / 2) {
        setTimeout(() => {
          alert(`Victory!\n\nSize: ${this.gridRows}x${this.gridCols}\nAttempts: ${this.attempts}`)
          this.renderStartScreen()
        }, 500)
      }
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped'); card2.classList.remove('flipped')
        this.flippedCards = []
      }, 1000)
    }
  }
}