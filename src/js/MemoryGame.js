import { SoundPlayer } from './SoundPlayer.js'
import { Window } from './Window.js'

/**
 * A Memory Game application that extends the Window class.
 * Features customizable difficulty, single and two-player modes,
 * keyboard accessibility, and a dynamic scoring system.
 */
export class MemoryGame extends Window {
  /**
   * Creates an instance of MemoryGame.
   * Initializes game assets, state variables, and renders the start screen.
   */
  constructor () {
    super('Memory Game')

    this.images = [
      'astronomy.png', 'fountain.png', 'garden.png', 'grand-mosque.png',
      'mosque2.png', 'person.png', 'sword.png', 'waterwheel.png'
    ]

    // Game State
    this.tiles = []
    this.flippedCards = []
    this.matches = 0
    this.attempts = 0

    // Navigation State
    this.activeIndex = 0
    this.activeMenuIndex = 0
    this.isTwoPlayer = false

    // Timer State
    this.timerInterval = null
    this.timeElapsed = 0
    this.timerRunning = false

    this.renderStartScreen()
  }

  /**
   * Renders the main menu (Start Screen).
   * Handles the layout for the mode toggle and difficulty selection.
   * Resets window dimensions to menu defaults.
   */
  renderStartScreen () {
    this.stopTimer()
    this.tiles = []
    this.activeMenuIndex = 0

    // Reset Window Dimensions for Menu
    this.element.style.width = '400px'
    this.element.style.height = '530px'
    this.element.style.minWidth = '300px'
    this.element.style.minHeight = '530px'

    const content = this.element.querySelector('.window-content')
    content.classList.remove('game-mode')
    content.innerHTML = ''

    // Create Menu Container
    const menu = document.createElement('div')
    menu.className = 'memory-menu'

    // Logo
    const logo = document.createElement('img')
    logo.src = './img/memory-icon.png'
    logo.className = 'memory-logo'
    logo.addEventListener('dragstart', (e) => e.preventDefault())
    menu.appendChild(logo)

    // Title
    const title = document.createElement('h2')
    title.textContent = 'Choose Difficulty'
    title.className = 'memory-title'
    menu.appendChild(title)

    // Menu Items (Mode Toggle + Difficulty Levels)
    const menuItems = [
      {
        type: 'toggle',
        label: this.isTwoPlayer ? 'Mode: 2 Players' : 'Mode: 1 Player'
      },
      { type: 'start', label: 'Easy (2x2)', rows: 2, cols: 2 },
      { type: 'start', label: 'Medium (2x4)', rows: 2, cols: 4 },
      { type: 'start', label: 'Hard (4x4)', rows: 4, cols: 4 }
    ]

    menuItems.forEach((item, index) => {
      const btn = document.createElement('button')
      btn.textContent = item.label
      btn.className = 'memory-btn'
      btn.setAttribute('tabindex', '0')

      if (item.type === 'toggle') {
        btn.classList.add('memory-toggle-active')
      }

      // Interaction Logic
      btn.addEventListener('click', () => {
        this.activeMenuIndex = index

        if (item.type === 'toggle') {
          this.isTwoPlayer = !this.isTwoPlayer
          btn.textContent = this.isTwoPlayer ? 'Mode: 2 Players' : 'Mode: 1 Player'
        } else {
          this.startGame(item.rows, item.cols)
        }
      })

      // Keyboard & Focus Logic
      btn.addEventListener('keydown', (e) => this.handleMenuKeydown(e, index, menuItems.length))
      btn.addEventListener('focus', () => { this.activeMenuIndex = index })
      btn.addEventListener('mouseenter', () => { btn.focus() }) // Sync hover with focus

      menu.appendChild(btn)
    })

    content.appendChild(menu)
    setTimeout(() => { this.focus() }, 50)
  }

  /**
   * Handles keyboard navigation within the main menu.
   * Allowing the user to cycle through buttons using ArrowUp/ArrowDown.
   * @param {KeyboardEvent} e - The keydown event.
   * @param {number} index - The index of the currently focused button.
   * @param {number} totalButtons - The total number of buttons in the menu.
   */
  handleMenuKeydown (e, index, totalButtons) {
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

  /**
   * Initializes and starts a new game session.
   * Sets up the grid, resets scores/timer, and builds the UI based on the selected mode.
   * @param {number} rows - Number of rows in the grid.
   * @param {number} cols - Number of columns in the grid.
   */
  startGame (rows, cols) {
    this.gridRows = rows
    this.gridCols = cols

    // Reset Game State
    this.attempts = 0
    this.matches = 0
    this.flippedCards = []
    this.tiles = []
    this.activeIndex = 0

    // Reset Timer
    this.stopTimer()
    this.timeElapsed = 0
    this.timerRunning = false

    // Reset Player State
    this.currentPlayer = 1
    this.scores = { 1: 0, 2: 0 }

    // Dynamic Window Sizing
    if (cols === 2) {
      this.element.style.width = '300px'; this.element.style.height = '350px'
      this.element.style.minWidth = '290px'; this.element.style.minHeight = '335px'
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

    // Create Status Bar
    const statusBar = document.createElement('div')
    statusBar.className = 'status-bar'

    // Conditional UI based on Mode
    if (this.isTwoPlayer) {
      // 2-Player UI
      this.p1Display = document.createElement('span')
      this.p1Display.className = 'player-score active-turn'
      this.p1Display.textContent = 'Player 1: 0'

      this.p2Display = document.createElement('span')
      this.p2Display.className = 'player-score'
      this.p2Display.textContent = 'Player 2: 0'

      statusBar.appendChild(this.p1Display)
      statusBar.appendChild(this.p2Display)
    } else {
      // 1-Player UI
      this.attemptsDisplay = document.createElement('span')
      this.attemptsDisplay.textContent = 'Attempts: 0'

      this.timerDisplay = document.createElement('span')
      this.timerDisplay.textContent = 'Time: 00:00:00'

      statusBar.appendChild(this.attemptsDisplay)
      statusBar.appendChild(this.timerDisplay)
    }

    content.appendChild(statusBar)

    // Create Grid
    const grid = document.createElement('div')
    grid.classList.add('memory-grid')
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`

    // Handle Clicks in Grid
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

    // Generate Cards
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

      const frontFace = document.createElement('div')
      frontFace.className = 'memory-card-face memory-card-front'

      const img = document.createElement('img')
      img.src = `./img/${imgName}`
      img.alt = 'Memory Card'
      frontFace.appendChild(img)

      const backFace = document.createElement('div')
      backFace.className = 'memory-card-face memory-card-back'

      card.appendChild(frontFace)
      card.appendChild(backFace)
      card.addEventListener('keydown', (e) => this.handleGameKeydown(e, index))
      grid.appendChild(card)
      this.tiles.push(card)
    })

    content.appendChild(grid)

    setTimeout(() => { this.focus() }, 50)
  }

  /**
   * Starts the millisecond timer.
   * Runs every 10ms to update the display time.
   */
  startTimer () {
    if (this.timerRunning) return
    this.timerRunning = true
    this.timerInterval = setInterval(() => {
      this.timeElapsed += 10
      this.updateTimerDisplay()
    }, 10)
  }

  /**
   * Stops the timer and clears the interval.
   */
  stopTimer () {
    this.timerRunning = false
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  /**
   * Formats the elapsed time into MM:SS:MS and updates the DOM element.
   * Safe to call even if the timer display is not present (e.g. 2-player mode).
   */
  updateTimerDisplay () {
    if (!this.timerDisplay) return
    const totalSeconds = Math.floor(this.timeElapsed / 1000)
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const seconds = (totalSeconds % 60).toString().padStart(2, '0')
    const ms = Math.floor((this.timeElapsed % 1000) / 10).toString().padStart(2, '0')
    this.timerDisplay.textContent = `Time: ${minutes}:${seconds}:${ms}`
  }

  /**
   * Manages focus within the window.
   * Prioritizes the active grid tile during gameplay, or the active menu button.
   */
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

  /**
   * Handles keyboard navigation within the game grid (Arrow Keys, Enter, Space).
   * @param {KeyboardEvent} e - The keydown event.
   * @param {number} index - The index of the currently focused card.
   */
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

  /**
   * Flips a specific card if it is valid to do so.
   * Triggers the timer (in single player) and checks for matches.
   * @param {HTMLElement} card - The DOM element representing the card to flip.
   */
  flipCard (card) {
    if (card.classList.contains('flipped') || card.classList.contains('matched') || this.flippedCards.length >= 2) return

    // Only start timer in Single Player mode
    if (!this.isTwoPlayer && !this.timerRunning) {
      this.startTimer()
    }
    SoundPlayer.play('flip')

    card.classList.add('flipped')
    this.flippedCards.push(card)
    if (this.flippedCards.length === 2) this.checkMatch()
  }

  /**
   * Compares the two flipped cards.
   * Handles scoring (1P vs 2P), turn switching, and victory conditions.
   */
  checkMatch () {
    const [card1, card2] = this.flippedCards
    const isMatch = card1.dataset.symbol === card2.dataset.symbol

    if (isMatch) {
      setTimeout(() => {
        SoundPlayer.play('correct')

        card1.classList.add('matched'); card2.classList.add('matched')
        this.flippedCards = [] // Unlock the board
        this.matches++

        // Update Scores
        if (this.isTwoPlayer) {
          this.scores[this.currentPlayer]++
          this.updateScoreUI()
        } else {
          this.attempts++
          if (this.attemptsDisplay) this.attemptsDisplay.textContent = `Attempts: ${this.attempts}`
        }

        // Check Victory
        if (this.matches === (this.gridRows * this.gridCols) / 2) {
          this.handleVictory()
        }
      }, 500)
    } else {
      if (!this.isTwoPlayer) {
        this.attempts++
        if (this.attemptsDisplay) this.attemptsDisplay.textContent = `Attempts: ${this.attempts}`
      }

      setTimeout(() => {
        card1.classList.remove('flipped'); card2.classList.remove('flipped')
        this.flippedCards = []

        // 2-Player: Switch Turn ONLY on a miss
        if (this.isTwoPlayer) {
          this.switchTurn()
        }
      }, 1000)
    }
  }

  /**
   * Switches control between Player 1 and Player 2.
   * Updates the UI to highlight the active player.
   */
  switchTurn () {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1

    // Toggle CSS classes for visual feedback
    if (this.currentPlayer === 1) {
      this.p1Display.classList.add('active-turn')
      this.p2Display.classList.remove('active-turn')
    } else {
      this.p1Display.classList.remove('active-turn')
      this.p2Display.classList.add('active-turn')
    }
  }

  /**
   * Updates the score text for both players in the status bar.
   */
  updateScoreUI () {
    this.p1Display.textContent = `Player 1: ${this.scores[1]}`
    this.p2Display.textContent = `Player 2: ${this.scores[2]}`
  }

  /**
   * Handles the end-of-game logic.
   * Stops the timer and displays a victory alert with relevant stats.
   */
  handleVictory () {
    this.stopTimer()
    SoundPlayer.play('win')

    setTimeout(() => {
      let msg = ''

      if (this.isTwoPlayer) {
        const s1 = this.scores[1]
        const s2 = this.scores[2]
        if (s1 > s2) msg = `Player 1 Wins!\nScore: ${s1} - ${s2}`
        else if (s2 > s1) msg = `Player 2 Wins!\nScore: ${s2} - ${s1}`
        else msg = `It's a Tie!\nScore: ${s1} - ${s1}`
      } else {
        // Single Player Msg
        const totalSeconds = Math.floor(this.timeElapsed / 1000)
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
        const seconds = (totalSeconds % 60).toString().padStart(2, '0')
        const ms = Math.floor((this.timeElapsed % 1000) / 10).toString().padStart(2, '0')
        msg = `Victory!\nAttempts: ${this.attempts}\nTime: ${minutes}:${seconds}:${ms}`
      }

      alert(msg)
      this.renderStartScreen()
    }, 500)
  }
}
