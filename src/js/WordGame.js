import { Window } from './Window.js'
import { StorageManager } from './StorageManager.js'

export class WordGame extends Window {
  constructor () {
    super("The Caliph's Scroll")
    this.storage = new StorageManager()

    this.element.style.width = '400px'
    this.element.style.height = '600px'
    this.element.style.minWidth = '320px'
    this.element.style.minHeight = '550px'

    this.element.classList.add('word-game-window')

    this.categories = {
      scholar: [
        'JAVASCRIPT', 'MODULE', 'INTERFACE', 'VARIABLE', 'BROWSER',
        'OBJECT', 'ARRAY', 'FUNCTION', 'SYNTAX', 'PROMISE'
      ],
      architect: [
        'ALHAMBRA', 'CORDOBA', 'GRANADA', 'MOSQUE', 'PALACE',
        'CALIPHATE', 'GARDENS', 'ARCH', 'GEOMETRY', 'MINARET'
      ]
    }

    this.selectedCategory = 'architect' // Default

    this.secretWord = ''
    this.guessedLetters = new Set()
    this.lives = 6
    this.isGameOver = false

    this.streak = this.storage.getWordStreak()
    this.renderStartScreen()
  }

  playSound (soundName) {
    const audio = new window.Audio(`./audio/${soundName}.mp3`)
    audio.volume = 0.5
    audio.play().catch(e => {})
  }

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
    subtitle.textContent = 'Decipher the ancient words to protect your realm.'
    subtitle.className = 'word-subtitle'

    const streakInfo = document.createElement('p')
    streakInfo.textContent = `Current Streak: ${this.streak}`
    streakInfo.className = 'word-streak-info'

    // --- TOGGLE BUTTON (Replaces Select) ---
    const pathBtn = document.createElement('button')
    pathBtn.className = 'memory-btn' // Reuse generic style
    
    // Helper to update button text/color based on state
    const updatePathBtn = () => {
      if (this.selectedCategory === 'architect') {
        pathBtn.textContent = 'Path: The Architect (History)'
        pathBtn.style.backgroundColor = 'var(--color-terracotta)'
      } else {
        pathBtn.textContent = 'Path: The Scholar (Code)'
        pathBtn.style.backgroundColor = 'var(--color-azure)'
      }
    }
    updatePathBtn() // Set initial state

    pathBtn.onclick = () => {
      // Toggle Logic
      this.selectedCategory = (this.selectedCategory === 'architect') ? 'scholar' : 'architect'
      updatePathBtn()
    }
    // Keyboard support for toggle
    pathBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        this.selectedCategory = (this.selectedCategory === 'architect') ? 'scholar' : 'architect'
        updatePathBtn()
      }
    })

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Unroll Scroll'
    startBtn.className = 'memory-btn'
    
    startBtn.onclick = () => this.startGame()
    startBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.startGame()
    })

    content.appendChild(logo)
    content.appendChild(title)
    content.appendChild(subtitle)
    content.appendChild(streakInfo)
    content.appendChild(pathBtn) // Add Toggle
    content.appendChild(startBtn)

    setTimeout(() => startBtn.focus(), 50)
  }

  startGame () {
    const wordList = this.categories[this.selectedCategory]
    const randomIndex = Math.floor(Math.random() * wordList.length)
    this.secretWord = wordList[randomIndex]
    
    this.guessedLetters.clear()
    this.lives = 6
    this.isGameOver = false

    this.renderGameUI()
  }

  renderGameUI () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content word-game-active'

    const statsBar = document.createElement('div')
    statsBar.className = 'word-stats'

    const heartsContainer = document.createElement('div')
    heartsContainer.id = 'word-lives'
    for (let i = 1; i <= 6; i++) {
      const heart = document.createElement('img')
      heart.src = './img/heart-full.png'
      heart.alt = 'Life'
      heart.className = 'word-heart'
      heart.id = `heart-${i}`
      heartsContainer.appendChild(heart)
    }
    
    const streakDisplay = document.createElement('div')
    streakDisplay.textContent = `Streak: ${this.streak}`
    streakDisplay.className = 'word-game-streak'

    statsBar.appendChild(heartsContainer)
    statsBar.appendChild(streakDisplay)
    
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
        btn.id = `key-${char}`
        btn.onclick = () => this.handleGuess(char)
        rowDiv.appendChild(btn)
      }
      keyboard.appendChild(rowDiv)
    })

    content.appendChild(statsBar)
    content.appendChild(this.wordDisplay)
    content.appendChild(keyboard)
    
    this.element.setAttribute('tabindex', '0')
    this.element.focus()

    this.element.onkeydown = (e) => {
      const char = e.key.toUpperCase()
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (alphabet.includes(char)) {
        this.handleGuess(char)
      }
    }
  }

  handleGuess (letter) {
    if (this.isGameOver) return
    if (this.guessedLetters.has(letter)) return

    this.guessedLetters.add(letter)
    
    const btn = this.element.querySelector(`#key-${letter}`)
    if (btn) btn.disabled = true

    if (this.secretWord.includes(letter)) {
      if (btn) btn.classList.add('correct')
      this.playSound('correct')
      this.updateWordDisplay()
      this.checkWin()
    } else {
      if (btn) btn.classList.add('wrong')
      this.lives--
      this.playSound('wrong')
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
      this.streak++
      this.storage.saveWordStreak(this.streak)
      
      this.playSound('win')
      this.wordDisplay.classList.add('win')
      this.renderEndScreen('Victory!', 'The Scroll is Safe.')
    }
  }

  checkLoss () {
    if (this.lives <= 0) {
      this.isGameOver = true
      this.streak = 0
      this.storage.saveWordStreak(this.streak)
      
      this.playSound('lose')
      this.wordDisplay.textContent = this.secretWord.split('').join(' ')
      this.wordDisplay.classList.add('lose')
      this.renderEndScreen('Defeat', 'The Scroll is Lost.')
    }
  }

  renderEndScreen (titleText, msgText) {
    setTimeout(() => {
      const content = this.element.querySelector('.window-content')
      content.innerHTML = ''
      content.className = 'window-content word-game-layout'

      const title = document.createElement('h2')
      title.textContent = titleText
      title.className = 'word-title'
      title.classList.add(titleText === 'Victory!' ? 'win' : 'lose')

      const msg = document.createElement('p')
      msg.textContent = msgText
      msg.className = 'word-subtitle'

      const streakMsg = document.createElement('p')
      streakMsg.textContent = `Current Streak: ${this.streak}`
      streakMsg.className = 'word-end-streak'

      if (titleText === 'Defeat') {
        const reveal = document.createElement('p')
        reveal.textContent = `The word was: ${this.secretWord}`
        reveal.className = 'word-end-reveal'
        content.appendChild(reveal)
      }

      const restartBtn = document.createElement('button')
      restartBtn.textContent = 'Play Again'
      restartBtn.className = 'memory-btn'
      restartBtn.onclick = () => this.startGame()
      
      setTimeout(() => restartBtn.focus(), 50)

      content.appendChild(title)
      content.appendChild(msg)
      content.appendChild(streakMsg)
      content.appendChild(restartBtn)
    }, 1000)
  }
}