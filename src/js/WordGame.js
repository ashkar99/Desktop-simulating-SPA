import { Window } from './Window.js'

/**
 * The Caliph's Scroll (Word Game).
 * A Hangman-style game where players decipher words to protect their shields.
 * @augments Window
 */
export class WordGame extends Window {
  constructor () {
    super("The Caliph's Scroll")

    // Window dimensions
    this.element.style.width = '400px'
    this.element.style.height = '600px'
    this.element.style.minWidth = '320px'
    this.element.style.minHeight = '550px'

    this.words = [
      'ALHAMBRA', 'CORDOBA', 'GRANADA', 'MOSQUE', 'PALACE',
      'JAVASCRIPT', 'MODULE', 'INTERFACE', 'VARIABLE', 'BROWSER',
      'CALIPHATE', 'GARDENS', 'ARCH', 'GEOMETRY', 'SCHOLAR'
    ]

    // Game State
    this.secretWord = ''
    this.guessedLetters = new Set()
    this.lives = 6
    this.isGameOver = false

    this.renderStartScreen()
  }

  /**
   * Renders the themed main menu.
   */
  renderStartScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content word-game-layout'

    const logo = document.createElement('img')
    logo.src = './img/word-icon.png'
    logo.alt = 'Scroll Icon'
    logo.className = 'word-logo'
    logo.addEventListener('dragstart', (e) => e.preventDefault())

    const title = document.createElement('h2')
    title.textContent = "The Caliph's Scroll"
    title.className = 'word-title'

    const subtitle = document.createElement('p')
    subtitle.textContent = 'Decipher the ancient words to protect your shields.'
    subtitle.className = 'word-subtitle'

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Unroll Scroll'
    startBtn.className = 'memory-btn'
    
    startBtn.onclick = () => {
      console.log('Game State Initialized')
      this.startGame()
    }

    content.appendChild(logo)
    content.appendChild(title)
    content.appendChild(subtitle)
    content.appendChild(startBtn)
  }

  startGame () {
    console.log('TODO: Implement Game Loop')
    alert('Game mechanics coming in next commit!')
  }

  /**
   * Initializes Game State and switches UI.
   */
  startGame () {
    const randomIndex = Math.floor(Math.random() * this.words.length)
    this.secretWord = this.words[randomIndex]
    
    this.guessedLetters.clear()
    this.lives = 6
    this.isGameOver = false

    this.renderGameUI()
  }

  /**
   * Renders the active game interface.
   */
  renderGameUI () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content word-game-active'

    const statsBar = document.createElement('div')
    statsBar.className = 'word-stats'

    this.wordDisplay = document.createElement('div')
    this.wordDisplay.className = 'word-display'
    this.wordDisplay.textContent = '_ _ _ _ _ _' 
    

    content.appendChild(statsBar)
    content.appendChild(this.wordDisplay)
  }
}

