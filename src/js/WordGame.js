import { Window } from './Window.js'
import { StorageManager } from './StorageManager.js'
import { Timer } from './Timer.js'

export class WordGame extends Window {
  constructor () {
    super("The Caliph's Scroll")
    this.storage = new StorageManager()

    this.element.style.width = '400px'
    this.element.style.height = '600px'
    this.element.style.minWidth = '320px'
    this.element.style.minHeight = '550px'
    this.element.classList.add('word-game-window')

    this.categories = { scholar: [], architect: [] }
    this.loadWords()

    this.levels = {
      easy: {
        label: 'Level: Easy (Relaxed)',
        color: 'var(--color-azure)',
        hearts: 6,
        time: null
      },
      normal: {
        label: 'Level: Normal (60s)',
        color: 'var(--color-gold)',
        hearts: 6,
        time: 60
      },
      hard: {
        label: 'Level: Hard (3 Hearts)',
        color: 'var(--color-terracotta)',
        hearts: 3,
        time: 60
      },
      brutal: {
        label: 'Level: Brutal (30s)',
        color: '#8B0000',
        hearts: 3,
        time: 30
      },
      mujahid: {
        label: 'Level: Mujahid (1 Heart)',
        color: 'black',
        hearts: 1,
        time: 15
      }
    }

    this.levelKeys = ['easy', 'normal', 'hard', 'brutal', 'mujahid']
    this.selectedCategory = 'architect'
    this.selectedLevel = 'easy'

    this.timer = null
    this.currentWordObj = null
    this.secretWord = ''
    this.guessedLetters = new Set()
    this.lives = 6
    this.isGameOver = false

    this.streak = this.storage.getWordStreak()
    this.bestStreak = this.storage.getBestStreak()
    this.renderStartScreen()
  }

  close () {
    if (this.timer) this.timer.stop()
    super.close()
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
    subtitle.textContent = 'Decipher the ancient words to protect your realm from invaders.'
    subtitle.className = 'word-subtitle'

    const streakInfo = document.createElement('p')
    streakInfo.textContent = `Current Streak: ${this.streak}  |  Best: ${this.bestStreak}`
    streakInfo.className = 'word-streak-info'

    const pathBtn = document.createElement('button')
    pathBtn.className = 'memory-btn'

    const updatePathBtn = () => {
      pathBtn.className = 'memory-btn path-btn'

      if (this.selectedCategory === 'architect') {
        pathBtn.textContent = 'Path: The Architect (History)'
        pathBtn.classList.add('architect')
      } else {
        pathBtn.textContent = 'Path: The Scholar (Code)'
        pathBtn.classList.add('scholar')
      }
    }
    updatePathBtn()

    pathBtn.addEventListener('click', () => {
      this.selectedCategory = (this.selectedCategory === 'architect') ? 'scholar' : 'architect'
      updatePathBtn()
    })

    const levelBtn = document.createElement('button')
    levelBtn.className = 'memory-btn'

    const updateLevelBtn = () => {
      const config = this.levels[this.selectedLevel]
      levelBtn.textContent = config.label
      levelBtn.className = 'memory-btn level-btn'
      levelBtn.classList.add(this.selectedLevel)
    }
    updateLevelBtn()

    levelBtn.addEventListener('click', () => {
      const currentIndex = this.levelKeys.indexOf(this.selectedLevel)
      const nextIndex = (currentIndex + 1) % this.levelKeys.length
      this.selectedLevel = this.levelKeys[nextIndex]
      updateLevelBtn()
    })

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Unroll Scroll'
    startBtn.className = 'memory-btn'
    startBtn.addEventListener('click', () => this.startGame())

    pathBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        levelBtn.focus()
      }
    })
    levelBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        pathBtn.focus()
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        startBtn.focus()
      }
    })
    startBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        pathBtn.focus()
      }
    })

    content.appendChild(logo)
    content.appendChild(title)
    content.appendChild(subtitle)
    content.appendChild(streakInfo)
    content.appendChild(pathBtn)
    content.appendChild(levelBtn)
    content.appendChild(startBtn)
    setTimeout(() => pathBtn.focus(), 50)
  }

  /**
   * Fetches the words from the JSON file.
   */
  async loadWords () {
    try {
      const res = await fetch('./json/words.json')
      if (!res.ok) throw new Error('Failed to load words')
      this.categories = await res.json()
    } catch (err) {
      console.error(err)
      // Fallback if JSON fails
      this.categories = {
        scholar: [{ word: 'ERROR', hint: 'Check Console', definition: 'File not found' }],
        architect: [{ word: 'ERROR', hint: 'Check Console', definition: 'File not found' }]
      }
    }
  }

  playSound (soundName) {
    const audio = new window.Audio(`./audio/${soundName}.mp3`)
    audio.volume = 0.5
    audio.play().catch(e => {})
  }

  startGame () {
    const wordList = this.categories[this.selectedCategory]
    if (!wordList || wordList.length === 0) return

    const randomIndex = Math.floor(Math.random() * wordList.length)
    this.currentWordObj = wordList[randomIndex]
    this.secretWord = this.currentWordObj.word

    const config = this.levels[this.selectedLevel]
    this.lives = config.hearts

    if (this.timer) this.timer.stop()

    this.guessedLetters.clear()
    this.isGameOver = false

    this.renderGameUI()

    if (config.time) {
      const content = this.element.querySelector('.window-content')
      this.timer = new Timer(content, config.time, () => {
        this.lives = 0
        this.checkLoss(true)
      })
      this.timer.start()
    }
  }

  renderGameUI () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content word-game-active'

    const statsBar = document.createElement('div')
    statsBar.className = 'word-stats'

    const heartsContainer = document.createElement('div')
    heartsContainer.id = 'word-lives'
    for (let i = 1; i <= this.lives; i++) {
      const heart = document.createElement('img')
      heart.src = './img/full-heart.png'
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

    const hintDisplay = document.createElement('div')
    const hintText = this.currentWordObj ? this.currentWordObj.hint : '...'
    hintDisplay.textContent = `Hint: ${hintText}`
    hintDisplay.className = 'word-hint'

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
    content.appendChild(hintDisplay)
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
    if (heart) heart.classList.add('lost')
  }

  checkWin () {
    const isWin = this.secretWord.split('').every(c => this.guessedLetters.has(c))
    if (isWin) {
      if (this.timer) this.timer.stop()
      this.isGameOver = true
      this.streak++

      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak
        this.storage.saveBestStreak(this.bestStreak)
      }
      this.storage.saveWordStreak(this.streak)

      this.playSound('win')
      this.wordDisplay.classList.add('win')
      this.renderEndScreen('Victory!', 'The Scroll is Safe.')
    }
  }

  checkLoss (isTimeout = false) {
    if (this.lives <= 0 || isTimeout) {
      if (this.timer) this.timer.stop()
      this.isGameOver = true
      this.streak = 0
      this.storage.saveWordStreak(this.streak)

      this.playSound('lose')
      this.wordDisplay.textContent = this.secretWord.split('').join(' ')
      this.wordDisplay.classList.add('lose')

      const msg = isTimeout ? 'Time ran out!' : 'The Scroll is Lost.'
      this.renderEndScreen('Defeat', msg)
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

      const defBox = document.createElement('div')
      defBox.className = 'word-definition-box'

      const wordText = this.currentWordObj ? this.currentWordObj.word : this.secretWord
      const defText = this.currentWordObj ? this.currentWordObj.definition : 'Definition unavailable'

      const wordNode = document.createElement('strong')
      wordNode.textContent = wordText
      const br = document.createElement('br')
      const defNode = document.createElement('span')
      defNode.textContent = defText
      defNode.classList.add('word-def-text')

      defBox.appendChild(wordNode)
      defBox.appendChild(br)
      defBox.appendChild(defNode)

      const streakMsg = document.createElement('p')
      streakMsg.textContent = `Current Streak: ${this.streak}  |  Best: ${this.bestStreak}`
      streakMsg.className = 'word-end-streak'

      const restartBtn = document.createElement('button')
      restartBtn.textContent = 'Play Again'
      restartBtn.className = 'memory-btn'
      restartBtn.onclick = () => this.startGame()

      const menuBtn = document.createElement('button')
      menuBtn.textContent = 'Back to Menu'
      menuBtn.className = 'memory-btn'
      menuBtn.classList.add('menu-back-btn')
      menuBtn.onclick = () => this.renderStartScreen()

      restartBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); menuBtn.focus() }
      })
      menuBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); restartBtn.focus() }
      })

      content.appendChild(title)
      content.appendChild(msg)
      content.appendChild(defBox)
      content.appendChild(streakMsg)
      content.appendChild(restartBtn)
      content.appendChild(menuBtn)
      setTimeout(() => restartBtn.focus(), 50)
    }, 1000)
  }
}
