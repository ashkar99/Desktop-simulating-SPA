import { Window } from './Window.js'

/**
 * The Caliph's Scroll (Word Game).
 * A Hangman-style game where players decipher words to protect their shields.
 * @augments Window
 */
export class WordGame extends Window {
  constructor () {
    super("The Caliph's Scroll")

    this.element.style.width = '600px'
    this.element.style.height = '500px'

    // 1. Define the Data (The Word List)
    this.words = [
      'ALHAMBRA', 'CORDOBA', 'GRANADA', 'MOSQUE', 'PALACE',
      'JAVASCRIPT', 'MODULE', 'INTERFACE', 'VARIABLE', 'BROWSER',
      'CALIPHATE', 'GARDENS', 'ARCH', 'GEOMETRY', 'SCHOLAR'
    ]

    // 2. Define Game State
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

    // Theme: The Scroll Icon
    const icon = document.createElement('div')
    const logo = document.createElement('img')
    logo.src = './img/word-icon.png'
    logo.alt = 'Scroll Icon'
    logo.className = 'word-logo'

    const title = document.createElement('h2')
    title.textContent = "The Caliph's Scroll"
    title.style.color = 'var(--color-wood)'
    title.style.fontSize = '2rem'
    title.style.margin = '10px 0'

    const subtitle = document.createElement('p')
    subtitle.textContent = 'Decipher the ancient words to protect your shields.'
    subtitle.style.fontStyle = 'italic'
    subtitle.style.color = 'var(--color-azure)'
    subtitle.style.marginBottom = '20px'

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Unroll Scroll'
    startBtn.className = 'memory-btn'
    
    startBtn.onclick = () => {
      console.log('Game State Initialized')
      this.startGame()
    }

    content.appendChild(icon)
    content.appendChild(title)
    content.appendChild(subtitle)
    content.appendChild(startBtn)
  }

  startGame () {
    console.log('TODO: Implement Game Loop')
    alert('Game mechanics coming in next commit!')
  }
}