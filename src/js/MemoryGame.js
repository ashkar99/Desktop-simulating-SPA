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
    
    this.activeIndex = 0      
    this.activeMenuIndex = 0  
    
    this.timerInterval = null
    this.timeElapsed = 0
    this.timerRunning = false
    
    this.renderStartScreen()
  }

  renderStartScreen () {
    this.stopTimer()
    this.tiles = [] 
    this.activeMenuIndex = 0 
    
    this.element.style.width = '400px' 
    this.element.style.height = '500px'
    this.element.style.minWidth = '300px'
    this.element.style.minHeight = '480px'
    
    const content = this.element.querySelector('.window-content')
    content.classList.remove('game-mode')
    content.innerHTML = ''

    const menu = document.createElement('div')
    menu.className = 'memory-menu'

    const logo = document.createElement('img')
    logo.src = './img/memory-icon.png'
    logo.className = 'memory-logo'
    logo.addEventListener('dragstart', (e) => e.preventDefault())
    menu.appendChild(logo)

    const title = document.createElement('h2')
    title.textContent = 'Choose Difficulty'
    title.className = 'memory-title'
    menu.appendChild(title)

    const sizes = [
      { label: 'Easy (2x2)', rows: 2, cols: 2 },
      { label: 'Medium (2x4)', rows: 2, cols: 4 },
      { label: 'Hard (4x4)', rows: 4, cols: 4 }
    ]

    sizes.forEach((size, index) => {
      const btn = document.createElement('button')
      btn.textContent = size.label
      btn.className = 'memory-btn'
      btn.setAttribute('tabindex', '0')
      
      btn.addEventListener('click', () => {
        this.activeMenuIndex = index 
        this.startGame(size.rows, size.cols)
      }) 
      btn.addEventListener('keydown', (e) => this.handleMenuKeydown(e, index, sizes.length))
      btn.addEventListener('focus', () => { this.activeMenuIndex = index })
      btn.addEventListener('mouseenter', () => {btn.focus()})
      menu.appendChild(btn)
    })

    content.appendChild(menu)
    setTimeout(() => { this.focus() }, 50)
  }

  handleMenuKeydown(e, index, totalButtons) {
    const buttons = this.element.querySelectorAll('.memory-menu button')
    let nextIndex = null
    if (e.key === 'ArrowDown') {
        e.preventDefault(); nextIndex = (index + 1) % totalButtons
    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); nextIndex = (index - 1 + totalButtons) % totalButtons
    }
    if (nextIndex !== null) {
        this.activeMenuIndex = nextIndex; buttons[nextIndex].focus()
    }
  }

  startGame (rows, cols) {
    this.gridRows = rows
    this.gridCols = cols

    this.attempts = 0
    this.matches = 0
    this.flippedCards = []
    this.tiles = []
    this.activeIndex = 0

    this.stopTimer()
    this.timeElapsed = 0
    this.timerRunning = false

    if (cols === 2) {
      this.element.style.width = '350px'; this.element.style.height = '400px'
      this.element.style.minWidth = '250px'; this.element.style.minHeight = '300px'
    } else if (cols === 4 && rows === 2) {
      this.element.style.width = '550px'; this.element.style.height = '350px'
      this.element.style.minWidth = '450px'; this.element.style.minHeight = '300px'
    } else {
      this.element.style.width = '550px'; this.element.style.height = '600px'
      this.element.style.minWidth = '450px'; this.element.style.minHeight = '500px'
    }

    const content = this.element.querySelector('.window-content')
    content.classList.add('game-mode')
    content.innerHTML = ''
    
    const statusBar = document.createElement('div')
    statusBar.className = 'status-bar'
    this.attemptsDisplay = document.createElement('span')
    this.attemptsDisplay.textContent = 'Attempts: 0'
    this.timerDisplay = document.createElement('span')
    this.timerDisplay.textContent = 'Time: 00:00:00'
    
    statusBar.appendChild(this.attemptsDisplay)
    statusBar.appendChild(this.timerDisplay)
    content.appendChild(statusBar)
    
    const grid = document.createElement('div')
    grid.classList.add('memory-grid')
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.memory-card')
      if (!card || !grid.contains(card)) return
      
      const index = this.tiles.indexOf(card)
      if (index !== -1) {
          this.activeIndex = index
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

    setTimeout(() => { this.focus() }, 50)
  }

  startTimer () {
    if (this.timerRunning) return
    this.timerRunning = true
    this.timerInterval = setInterval(() => {
      this.timeElapsed += 10
      this.updateTimerDisplay()
    }, 10)
  }

  stopTimer () {
    this.timerRunning = false
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  updateTimerDisplay () {
    if (!this.timerDisplay) return
    const totalSeconds = Math.floor(this.timeElapsed / 1000)
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const seconds = (totalSeconds % 60).toString().padStart(2, '0')
    const ms = Math.floor((this.timeElapsed % 1000) / 10).toString().padStart(2, '0')
    this.timerDisplay.textContent = `Time: ${minutes}:${seconds}:${ms}`
  }

  focus () {
    if (this.tiles && this.tiles.length > 0) {
      if (this.tiles[this.activeIndex] && document.body.contains(this.tiles[this.activeIndex])) {
        this.tiles[this.activeIndex].focus()
      } else if (this.tiles[0]) {
        this.tiles[0].focus()
      }
    } else {
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
      case 'ArrowRight': if ((index + 1) % cols !== 0) nextIndex = index + 1; break
      case 'ArrowLeft': if (index % cols !== 0) nextIndex = index - 1; break
      case 'ArrowDown': if (index + cols < total) nextIndex = index + cols; break
      case 'ArrowUp': if (index - cols >= 0) nextIndex = index - cols; break
      case 'Enter':
      case ' ':
        e.preventDefault(); this.activeIndex = index; this.flipCard(this.tiles[index]); return 
    }
    if (nextIndex !== null) {
      e.preventDefault(); this.activeIndex = nextIndex; this.tiles[nextIndex].focus()
    }
  }

  flipCard (card) {
    if (card.classList.contains('flipped') || card.classList.contains('matched') || this.flippedCards.length >= 2) return
    if (!this.timerRunning) {
        this.startTimer()
    }

    card.classList.add('flipped')
    this.flippedCards.push(card)
    if (this.flippedCards.length === 2) this.checkMatch()
  }

  checkMatch () {
    this.attempts++
    if (this.attemptsDisplay) {
        this.attemptsDisplay.textContent = `Attempts: ${this.attempts}`
    }

    const [card1, card2] = this.flippedCards
    if (card1.dataset.symbol === card2.dataset.symbol) {
      card1.classList.add('matched'); card2.classList.add('matched')
      this.flippedCards = []; this.matches++
      
      if (this.matches === (this.gridRows * this.gridCols) / 2) {
        this.stopTimer()
        
        setTimeout(() => {
            const totalSeconds = Math.floor(this.timeElapsed / 1000)
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
            const seconds = (totalSeconds % 60).toString().padStart(2, '0')
            const ms = Math.floor((this.timeElapsed % 1000) / 10).toString().padStart(2, '0')
            
            alert(`Victory!\n\nSize: ${this.gridRows}x${this.gridCols}\nAttempts: ${this.attempts}\nTime: ${minutes}:${seconds}:${ms}`)
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