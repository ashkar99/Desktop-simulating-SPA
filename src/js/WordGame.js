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
   * Renders the active game interface (QWERTY Keyboard & Hearts).
   */
  renderGameUI () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content word-game-active'

    const statsBar = document.createElement('div')
    statsBar.className = 'word-stats'

    const heartsContainer = document.createElement('div')
    heartsContainer.id = 'word-lives'
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('img')
      heart.src = './img/full-heart.png'
      heart.alt = 'Life'
      heart.className = 'word-heart'
      heart.id = `heart-${i}` // ID helps find the heart
      heartsContainer.appendChild(heart)
    }
    statsBar.appendChild(heartsContainer)
    
    this.wordDisplay = document.createElement('div')
    this.wordDisplay.className = 'word-display'
    this.updateWordDisplay() 
    
    const keyboard = document.createElement('div')
    keyboard.className = 'word-keyboard'
    
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

    rows.forEach(rowString => {
      const rowDiv = document.createElement('div')
      rowDiv.className = 'keyboard-row'
      
      for (const char of rowString) {
        const btn = document.createElement('button')
        btn.textContent = char
        btn.className = 'word-key'
        btn.id = `key-${char}` // ID helps find the button
        btn.onclick = () => this.handleGuess(char)
        rowDiv.appendChild(btn)
      }
      keyboard.appendChild(rowDiv)
    })

    content.appendChild(statsBar)
    content.appendChild(this.wordDisplay)
    content.appendChild(keyboard)
  }

  handleGuess (letter) {
    if (this.isGameOver) return
    if (this.guessedLetters.has(letter)) return

    this.guessedLetters.add(letter)
    
    const btn = this.element.querySelector(`#key-${letter}`)
    if (btn) btn.disabled = true

    if (this.secretWord.includes(letter)) {
      if (btn) btn.classList.add('correct')
      this.updateWordDisplay()
      this.checkWin()
    } else {
      if (btn) btn.classList.add('wrong')
      this.lives--
      this.updateHeartUI()
      this.checkLoss()
    }
  }

  updateWordDisplay () {
    const display = this.secretWord
      .split('')
      .map(char => this.guessedLetters.has(char) ? char : '_')
      .join(' ')
    this.wordDisplay.textContent = display
  }

  updateHeartUI () {
    const heartIndex = this.lives + 1
    const heart = this.element.querySelector(`#heart-${heartIndex}`)
    if (heart) {
      heart.classList.add('lost')
    }
  }

  checkWin () {
    const isWin = this.secretWord.split('').every(c => this.guessedLetters.has(c))
    if (isWin) {
      this.isGameOver = true
      this.wordDisplay.style.color = 'var(--color-emerald)'
      setTimeout(() => alert('Victory! The Scroll is Safe.'), 200)
    }
  }

  checkLoss () {
    if (this.lives <= 0) {
      this.isGameOver = true
      this.wordDisplay.textContent = this.secretWord.split('').join(' ')
      this.wordDisplay.style.color = 'var(--color-terracotta)'
      setTimeout(() => alert('Defeat! The Scroll is Lost.'), 200)
    }
  }

}

