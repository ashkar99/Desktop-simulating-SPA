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
   * Helper to stop the timer (prevents memory leaks).
   */
  stopTimer () {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
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
   * Renders the question UI (Timer + Question Text + Inputs).
   */
  renderQuestion (data) {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = `
      <div id="timer-container" class="quiz-timer-container">
        <div id="timer-bar" class="quiz-timer-bar"></div>
      </div>
      
      <p class="quiz-question-text">${data.question}</p>
      <div id="inputs-area" class="quiz-inputs-area"></div>
    `
    
    const inputsArea = content.querySelector('#inputs-area')

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
   * Renders radio buttons for multiple choice questions.
   */
  renderAlternatives (element, data) {
    const form = document.createElement('div')
    form.className = 'quiz-alternatives-grid'

    for (const [key, value] of Object.entries(data.alternatives)) {
      const label = document.createElement('label')
      label.className = 'quiz-radio-label'
      label.innerHTML = `
        <input type="radio" name="alt" value="${key}"> 
        <span>${value}</span>
      `
      form.appendChild(label)
      
      // Select radio when clicking the whole box for better UX
      label.addEventListener('click', () => {
          const radio = label.querySelector('input')
          if(radio) radio.checked = true
      })
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
    
    btn.addEventListener('click', submit)
    element.appendChild(form)
    element.appendChild(btn)
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
   */
  renderGameOver (message) {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = `
      <h2 style="color:var(--color-terracotta)">Game Over</h2>
      <p class="quiz-message error">${message}</p>
      <div class="quiz-controls">
        <button id="restart-btn" class="memory-btn">Try Again</button>
        <button id="highscore-btn" class="memory-btn secondary">High Scores</button>
      </div>
    `
    content.querySelector('#restart-btn').addEventListener('click', () => this.renderStartScreen())
    content.querySelector('#highscore-btn').addEventListener('click', () => this.renderHighScoreScreen())
  }

  /**
   * Renders the Victory screen and saves the score.
   */
  renderVictory () {
    this.storage.saveScore(this.nickname, this.totalTime)
    const timeInSeconds = (this.totalTime / 1000).toFixed(2)

    const content = this.element.querySelector('.window-content')
    content.innerHTML = `
      <h2 style="color:var(--color-emerald)">Victory!</h2>
      <p>Well done, ${this.nickname}!</p>
      <p>Total Time: <b>${timeInSeconds}s</b></p>
      
      <div class="quiz-highscore-list">
        <h3>Hall of Fame</h3>
        <ol id="score-list-ol"></ol>
      </div>

      <button id="restart-btn" class="memory-btn">Play Again</button>
    `
    
    // Render list
    const listEl = content.querySelector('#score-list-ol')
    const topScores = this.storage.getHighScores()
    
    topScores.forEach(score => {
        const li = document.createElement('li')
        li.textContent = `${score.nickname} (${(score.time/1000).toFixed(2)}s)`
        listEl.appendChild(li)
    })

    content.querySelector('#restart-btn').addEventListener('click', () => this.renderStartScreen())
  }

  /**
   * Renders the High Score table (Top 5).
   */
  renderHighScoreScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = `
      <h2>Top 5 High Scores</h2>
      <div class="quiz-highscore-list">
        <ol id="score-list-ol"></ol>
      </div>
      <button id="back-btn" class="memory-btn">Back</button>
    `

    const listEl = content.querySelector('#score-list-ol')
    const topScores = this.storage.getHighScores()
    
    if (topScores.length === 0) listEl.innerHTML = '<li>No scores yet!</li>'
    else {
        topScores.forEach(score => {
            const li = document.createElement('li')
            li.textContent = `${score.nickname} (${(score.time/1000).toFixed(2)}s)`
            listEl.appendChild(li)
        })
    }

    content.querySelector('#back-btn').addEventListener('click', () => this.renderStartScreen())
  }

  showMessage (msg, type) {
    const el = this.element.querySelector('#message')
    if (el) {
      el.textContent = msg
      el.style.color = type === 'error' ? 'var(--color-terracotta)' : 'var(--color-emerald)'
    }
  }
}