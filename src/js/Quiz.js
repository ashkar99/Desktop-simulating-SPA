import { Window } from './Window.js'
import { QuizAPI } from './api.js'
import { HighScoreManager } from './storage.js'

export class Quiz extends Window {
  constructor () {
    super('Al-Andalus Quiz')

    // Dependencies
    this.api = new QuizAPI()
    this.storage = new HighScoreManager()

    // Game State
    this.nickname = ''
    this.totalTime = 0
    this.questionStartTime = 0
    this.timerInterval = null
    this.startUrl = 'https://courselab.lnu.se/quiz/question/1'

    // Window Dimensions
    this.element.style.width = '400px'
    this.element.style.height = '500px'

    // Render Initial View
    this.renderStartScreen()
  }

  /**
   * Cleans up the timer when the window is closed.
   */
  close () {
    this.stopTimer()
    super.close()
  }

  /**
   * Helper to stop the active countdown timer and accumulate elapsed time.
   */
  stopTimer () {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
      
      const elapsed = Date.now() - this.questionStartTime
      this.totalTime += elapsed
    }
  }

  /**
   * Renders the nickname entry screen.
   */
  /**
   * Renders the initial Start Screen with nickname input.
   */
  renderStartScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content quiz-layout'

    const title = document.createElement('h2')
    title.className = 'quiz-title'
    title.textContent = 'Knowledge Challenge'

    const p = document.createElement('p')
    p.textContent = 'Enter your name, traveler.'

    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'nickname'
    input.className = 'quiz-input'
    input.placeholder = 'Nickname (Max 15)'
    input.maxLength = 15
    input.autofocus = true

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

    const startGame = () => {
      const name = input.value.trim()
      if (name) {
        this.nickname = name
        this.startGame()
      } else {
        this.showMessage('Please enter a nickname!', 'error')
      }
    }

    startBtn.addEventListener('click', startGame)
    highscoreBtn.addEventListener('click', () => this.renderHighScoreScreen())
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startGame()
    })

    controls.appendChild(startBtn)
    controls.appendChild(highscoreBtn)

    content.appendChild(title)
    content.appendChild(p)
    content.appendChild(input)
    content.appendChild(controls)
    content.appendChild(messageDiv)

    // Focus helper
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
   * Fetches a question from the API and updates the UI.
   *
   * @param {string} url - The API URL for the question.
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
   *
   * @param {object} data - The question data object from the API.
   */
  renderQuestion (data) {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = '' 
    
    const timerContainer = document.createElement('div')
    timerContainer.id = 'timer-container'
    timerContainer.className = 'quiz-timer-container'

    const timerBar = document.createElement('div')
    timerBar.id = 'timer-bar'
    timerBar.className = 'quiz-timer-bar'
    
    timerContainer.appendChild(timerBar)

    const questionText = document.createElement('p')
    questionText.className = 'quiz-question-text'
    questionText.textContent = data.question

    const inputsArea = document.createElement('div')
    inputsArea.id = 'inputs-area'
    inputsArea.className = 'quiz-inputs-area'

    content.appendChild(timerContainer)
    content.appendChild(questionText)
    content.appendChild(inputsArea)

    if (data.alternatives) {
      this.renderAlternatives(inputsArea, data)
    } else {
      this.renderTextInput(inputsArea, data)
    }

    this.startTimer()
  }

  /**
   * Renders a standard text input field.
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
        if (input.value) this.submitAnswer(data.nextURL, { answer: input.value })
    }

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    btn.addEventListener('click', submit)

    element.appendChild(input)
    element.appendChild(btn)
    setTimeout(() => input.focus(), 50)
  }

  /**
   * Renders radio buttons for multiple-choice questions.
   * @param {HTMLElement} element - The DOM element to append inputs to.
   * @param {object} data - The question data.
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
   * Starts the 20-second countdown timer.
   */
  startTimer () {
    this.questionStartTime = Date.now()
    const timerBar = this.element.querySelector('#timer-bar')
    if (!timerBar) return

    if (this.timerInterval) clearInterval(this.timerInterval)

    this.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - this.questionStartTime) / 1000
      const limit = 20 // 20 seconds limit
      const remaining = limit - elapsed
      const percentage = (remaining / limit) * 100

      if (timerBar) {
          timerBar.style.width = `${percentage}%`
          // Change color to red as it gets low
          if (percentage < 30) timerBar.style.backgroundColor = 'var(--color-terracotta)'
          else timerBar.style.backgroundColor = 'var(--color-emerald)'
      }

      if (remaining <= 0) {
        this.stopTimer()
        this.renderGameOver('Time is up!')
      }
    }, 100)
  }

  /**
   * Submits the user's answer to the API.
   */
  async submitAnswer (url, answerPayload) {
    this.stopTimer()
    try {
      const response = await this.api.sendAnswer(url, answerPayload)
      if (response.nextURL) {
        this.fetchQuestion(response.nextURL)
      } else {
        this.renderVictory()
      }
    } catch (error) {
      this.renderGameOver('Wrong Answer!')
    }
  }

  /**
   * Renders the Game Over screen with options to restart.
   *
   * @param {string} message - The reason for game over.
   */
  renderGameOver (message) {
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
    highscoreBtn.addEventListener('click', () => this.renderHighScoreScreen())

    controls.appendChild(restartBtn)
    controls.appendChild(highscoreBtn)
    content.appendChild(h2)
    content.appendChild(p)
    content.appendChild(controls)
  }

  /**
   * Renders the Victory screen and saves the score.
   */
  renderVictory () {
    this.storage.saveScore(this.nickname, this.totalTime)
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

    const topScores = this.storage.getHighScores()
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
  }

  /**
   * Renders the High Score table (Top 5).
   */
  renderHighScoreScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = '' 

    const h2 = document.createElement('h2')
    h2.textContent = 'Top 5 High Scores'
    const hsDiv = document.createElement('div')
    hsDiv.className = 'quiz-highscore-list'
    const ol = document.createElement('ol')
    const topScores = this.storage.getHighScores()

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
  }

  showMessage (msg, type) {
    const el = this.element.querySelector('#message')
    if (el) {
      el.textContent = msg
      el.style.color = type === 'error' ? 'var(--color-terracotta)' : 'var(--color-emerald)'
    }
  }
}