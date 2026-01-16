import { Window } from './Window.js'
import { QuizAPI } from './QuizApi.js'
import { LocalProvider } from './LocalProvider.js'
import { StorageManager } from './StorageManager.js'
import { Timer } from './Timer.js'

export class Quiz extends Window {
  constructor () {
    super('Al-Andalus Quiz')

    // Dependencies
    this.api = null
    this.storage = new StorageManager()

    // Game State
    this.nickname = ''
    this.totalTime = 0
    this.timer = null
    this.timeLimit = 10
    this.startUrl = null
    this.activeKey = 'quiz-server-normal'

    // Window Dimensions
    this.element.style.width = '400px'
    this.element.style.height = '600px'
    this.element.style.minWidth = '320px'
    this.element.style.minHeight = '550px'

    this.renderStartScreen()
  }

  /**
   * Cleans up the timer when the window is closed.
   */
  close () {
    if (this.timer) this.timer.stop()
    super.close()
  }
  
   /**
   * Renders the Start Screen.
   * Logic updated to handle unique High Score lists for each mode.
   */
  renderStartScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content quiz-layout'

    const logo = document.createElement('img')
    logo.src = './img/quiz-icon.png'
    logo.alt = 'Quiz Logo'
    logo.className = 'quiz-logo'

    const title = document.createElement('h2')
    title.className = 'quiz-title'
    title.textContent = 'Knowledge Challenge'

    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'nickname'
    input.className = 'quiz-input'
    input.placeholder = 'Nickname (Max 15)'
    input.maxLength = 15
    input.autofocus = true

    let currentSource = 'server'
    let currentLevel = 'normal'

    const sourceBtn = document.createElement('button')
    sourceBtn.className = 'memory-btn'

    const updateSourceBtn = () => {
      if (currentSource === 'server') {
        sourceBtn.textContent = 'Source: Server (LNU)'
        sourceBtn.style.backgroundColor = 'var(--color-azure)'
      } else {
        sourceBtn.textContent = 'Source: Local (Custom)'
        sourceBtn.style.backgroundColor = 'var(--color-emerald)'
      }
    }
    updateSourceBtn()

    sourceBtn.addEventListener('click', () => {
      currentSource = currentSource === 'server' ? 'local' : 'server'
      updateSourceBtn()
    })

    const levelBtn = document.createElement('button')
    levelBtn.className = 'memory-btn'

    const updateLevelBtn = () => {
      if (currentLevel === 'normal') {
        levelBtn.textContent = 'Level: Normal'
        levelBtn.style.backgroundColor = 'var(--color-gold)'
        this.timeLimit = 10
      } else {
        levelBtn.textContent = 'Level: Hard'
        levelBtn.style.backgroundColor = 'var(--color-terracotta)'
        this.timeLimit = 5
      }
    }
    updateLevelBtn()

    levelBtn.addEventListener('click', () => {
      currentLevel = currentLevel === 'normal' ? 'hard' : 'normal'
      updateLevelBtn()
    })

    const controls = document.createElement('div')
    controls.className = 'quiz-controls'

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Start Journey'
    startBtn.className = 'memory-btn'

    const highscoreBtn = document.createElement('button')
    highscoreBtn.textContent = 'High Scores'
    highscoreBtn.className = 'memory-btn secondary'

    const messageDiv = document.createElement('div')
    messageDiv.id = 'message'
    messageDiv.className = 'quiz-message'

    const startGame = async () => {
      const name = input.value.trim()
      if (name) {
        this.nickname = name
        this.activeKey = `quiz-${currentSource}-${currentLevel}`

        if (currentSource === 'local') {
          this.api = new LocalProvider()
          await this.api.init()
          this.startUrl = 1
        } else {
          this.api = new QuizAPI()
          this.startUrl = 'https://courselab.lnu.se/quiz/question/1'
        }
        this.startGame()
      } else {
        this.showMessage('Please enter a nickname!', 'error')
      }
    }

    startBtn.addEventListener('click', startGame)

    highscoreBtn.addEventListener('click', () => {
      const key = `quiz-${currentSource}-${currentLevel}`
      this.renderHighScoreScreen(key)
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startGame()
      if (e.key === 'ArrowDown') sourceBtn.focus()
    })

    sourceBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') levelBtn.focus()
      if (e.key === 'ArrowUp') input.focus()
    })

    levelBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') startBtn.focus()
      if (e.key === 'ArrowUp') sourceBtn.focus()
    })

    const handleControlNav = (e) => {
      if (e.key === 'ArrowRight') highscoreBtn.focus()
      if (e.key === 'ArrowLeft') startBtn.focus()
      if (e.key === 'ArrowUp') levelBtn.focus()
    }
    startBtn.addEventListener('keydown', handleControlNav)
    highscoreBtn.addEventListener('keydown', handleControlNav)

    controls.appendChild(startBtn)
    controls.appendChild(highscoreBtn)

    content.appendChild(logo)
    content.appendChild(title)
    content.appendChild(input)
    content.appendChild(sourceBtn)
    content.appendChild(levelBtn)
    content.appendChild(controls)
    content.appendChild(messageDiv)

    setTimeout(() => input.focus(), 50)
  }

  /**
   * Begins the quiz by fetching the first question.
   */
  async startGame () {
    this.totalTime = 0
    await this.fetchQuestion(this.startUrl)
  }

  /**
   * Plays a sound effect located in the audio directory.
   * @param {string} soundName - The filename of the sound (without extension).
   */
  playSound (soundName) {
    const audio = new window.Audio(`./audio/${soundName}.mp3`)
    audio.volume = 0.5
    audio.play().catch(e => {})
  }

  /**
   * Fetches a question from the API and updates the UI.
   * @param {string} url - The URL to fetch the question from.
   */
  async fetchQuestion (url) {
    try {
      const content = this.element.querySelector('.window-content')
      content.innerHTML = ''
      const loader = document.createElement('div')
      loader.className = 'loader'
      loader.textContent = 'Consulting the Oracle...'
      content.appendChild(loader)

      const data = await this.api.getQuestion(url)
      this.renderQuestion(data)
    } catch (error) {
      console.error(error)
      this.renderGameOver('Network Error or Server Down.')
    }
  }

  /**
   * Renders the Question UI, including the timer and input area.
   * @param {object} data - The question data from the API.
   */
  renderQuestion (data) {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const timerWrapper = document.createElement('div')
    timerWrapper.style.width = '100%'
    content.appendChild(timerWrapper)

    const questionText = document.createElement('p')
    questionText.className = 'quiz-question-text'
    questionText.textContent = data.question

    const inputsArea = document.createElement('div')
    inputsArea.id = 'inputs-area'
    inputsArea.className = 'quiz-inputs-area'

    content.appendChild(questionText)
    content.appendChild(inputsArea)

    if (data.alternatives) {
      this.renderAlternatives(inputsArea, data)
    } else {
      this.renderTextInput(inputsArea, data)
    }

    this.timer = new Timer(timerWrapper, this.timeLimit, () => {
      this.renderGameOver('Time is up!')
    })
    this.timer.start()
  }

  /**
   * Renders a standard text input field.
   * @param {HTMLElement} element - The container element to render the input into.
   * @param {object} data - The question data from the API.
   */
  renderTextInput (element, data) {
    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'quiz-input'
    input.placeholder = 'Type your answer...'

    const btn = document.createElement('button')
    btn.textContent = 'Submit'
    btn.className = 'memory-btn'

    const submit = () => {
      if (input.value) {
        this.submitAnswer(data.nextURL, { answer: input.value })
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit()
    })

    btn.addEventListener('click', submit)
    element.appendChild(input)
    element.appendChild(btn)
    setTimeout(() => input.focus(), 50)
  }

  /**
   * Renders radio buttons for multiple-choice questions.
   * @param {HTMLElement} element - The container element to render the alternatives into.
   * @param {object} data - The question data from the API.
   */
  renderAlternatives (element, data) {
    const form = document.createElement('div')
    form.className = 'quiz-alternatives-grid'

    for (const [key, value] of Object.entries(data.alternatives)) {
      const label = document.createElement('label')
      label.className = 'quiz-radio-label'
      
      const radio = document.createElement('input')
      radio.type = 'radio'
      radio.name = 'alt'
      radio.value = key
      
      const span = document.createElement('span')
      span.textContent = value

      label.appendChild(radio)
      label.appendChild(span)
      form.appendChild(label)
    }

    const btn = document.createElement('button')
    btn.textContent = 'Submit Answer'
    btn.className = 'memory-btn'

    const submit = () => {
      const selected = form.querySelector('input[name="alt"]:checked')
      if (selected) {
        this.submitAnswer(data.nextURL, { answer: selected.value })
      }
    }

    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submit()
      }
    })

    btn.addEventListener('click', submit)
    element.appendChild(form)
    element.appendChild(btn)

    const firstInput = form.querySelector('input')
    if (firstInput) setTimeout(() => firstInput.focus(), 50)
  }

  /**
   * Submits the user's answer to the API.
   * @param {string} url - The URL to submit the answer to.
   * @param {object} answerPayload - The answer payload containing the user's answer.
   */
  async submitAnswer (url, answerPayload) {
    if (this.timer) {
      this.totalTime += this.timer.stop()
    }

    try {
      const response = await this.api.sendAnswer(url, answerPayload)
      if (response.nextURL) {
        this.playSound('correct')
        this.fetchQuestion(response.nextURL)
      } else {
        this.renderVictory()
      }
    } catch (error) {
      this.renderGameOver('Wrong Answer!')
    }
  }

  /**
   * Renders the Game Over screen.
   * @param {string} message - The game over message to display.
   */
  renderGameOver (message) {
    this.playSound('lose')
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const h2 = document.createElement('h2')
    h2.textContent = 'Game Over'
    h2.style.color = 'var(--color-terracotta)'
    const p = document.createElement('p')
    p.className = 'quiz-message error'
    p.textContent = message
    const controls = document.createElement('div')
    controls.className = 'quiz-controls'

    const restartBtn = document.createElement('button')
    restartBtn.textContent = 'Try Again'
    restartBtn.className = 'memory-btn'
    restartBtn.addEventListener('click', () => this.renderStartScreen())

    const highscoreBtn = document.createElement('button')
    highscoreBtn.textContent = 'High Scores'
    highscoreBtn.className = 'memory-btn secondary'
    highscoreBtn.addEventListener('click', () => this.renderHighScoreScreen(this.activeKey))

    restartBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') highscoreBtn.focus()
    })
    highscoreBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') restartBtn.focus()
    })

    controls.appendChild(restartBtn)
    controls.appendChild(highscoreBtn)
    content.appendChild(h2)
    content.appendChild(p)
    content.appendChild(controls)
    setTimeout(() => restartBtn.focus(), 50)
  }

  /**
   * Renders the Victory screen and saves the score to the specific list.
   */
  renderVictory () {
    this.playSound('win')
    this.storage.saveScore(this.nickname, this.totalTime, this.activeKey)
    const timeInSeconds = (this.totalTime / 1000).toFixed(2)
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const h2 = document.createElement('h2')
    h2.textContent = 'Victory!'
    h2.style.color = 'var(--color-emerald)'

    const pGreeting = document.createElement('p')
    pGreeting.textContent = `Well done, ${this.nickname}!`
    const pTime = document.createElement('p')
    pTime.textContent = 'Total Time: '
    const bTime = document.createElement('b')
    bTime.textContent = `${timeInSeconds}s`
    pTime.appendChild(bTime)

    const hsDiv = document.createElement('div')
    hsDiv.className = 'quiz-highscore-list'
    const h3 = document.createElement('h3')
    h3.textContent = 'Hall of Fame'
    const ol = document.createElement('ol')

    const topScores = this.storage.getHighScores(this.activeKey)
    topScores.forEach(score => {
      const li = document.createElement('li')
      li.textContent = `${score.nickname} (${(score.time / 1000).toFixed(2)}s)`
      ol.appendChild(li)
    })
    hsDiv.appendChild(h3)
    hsDiv.appendChild(ol)

    const restartBtn = document.createElement('button')
    restartBtn.textContent = 'Play Again'
    restartBtn.className = 'memory-btn'
    restartBtn.addEventListener('click', () => this.renderStartScreen())

    content.appendChild(h2)
    content.appendChild(pGreeting)
    content.appendChild(pTime)
    content.appendChild(hsDiv)
    content.appendChild(restartBtn)
    setTimeout(() => restartBtn.focus(), 50)
  }

  /**
   * Renders the High Score table.
   * @param {string} listKey - The specific list to display depending on mode.
   */
  renderHighScoreScreen (listKey) {
    const targetKey = listKey || this.activeKey
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''

    const titleText = targetKey.replace('quiz-', '').replace('-', ' / ').toUpperCase()
    const h2 = document.createElement('h2')
    h2.textContent = titleText

    const hsDiv = document.createElement('div')
    hsDiv.className = 'quiz-highscore-list'
    const ol = document.createElement('ol')
    const topScores = this.storage.getHighScores(targetKey)

    if (topScores.length === 0) {
      const li = document.createElement('li')
      li.textContent = 'No scores yet!'
      ol.appendChild(li)
    } else {
      topScores.forEach(score => {
        const li = document.createElement('li')
        li.textContent = `${score.nickname} (${(score.time / 1000).toFixed(2)}s)`
        ol.appendChild(li)
      })
    }
    hsDiv.appendChild(ol)

    const backBtn = document.createElement('button')
    backBtn.textContent = 'Back'
    backBtn.className = 'memory-btn'
    backBtn.addEventListener('click', () => this.renderStartScreen())

    content.appendChild(h2)
    content.appendChild(hsDiv)
    content.appendChild(backBtn)
    setTimeout(() => backBtn.focus(), 50)
  }

  /**
   * Displays a message to the user.
   * @param {string} msg - The message to display.
   * @param {string} type - The type of message.
   */
  showMessage (msg, type) {
    const el = this.element.querySelector('#message')
    if (el) {
      el.textContent = msg
      el.style.color = type === 'error' ? 'var(--color-terracotta)' : 'var(--color-emerald)'
    }
  }
}
