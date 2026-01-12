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
  renderStartScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content quiz-layout'

    content.innerHTML = `
      <h2 class="quiz-title">Knowledge Challenge</h2>
      <p>Enter your name, traveler.</p>
      
      <input type="text" id="nickname" class="quiz-input" placeholder="Nickname (Max 15)" maxlength="15" autofocus />
      
      <div class="quiz-controls">
        <button id="start-btn" class="memory-btn">Start Journey</button>
        <button id="highscore-btn" class="memory-btn secondary">High Scores</button>
      </div>
      
      <div id="message" class="quiz-message"></div>
    `

    // Attach Listeners
    const input = content.querySelector('#nickname')
    const startBtn = content.querySelector('#start-btn')
    const highscoreBtn = content.querySelector('#highscore-btn')

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
    highscoreBtn.addEventListener('click', () => console.log('Show High Scores'))

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startGame()
    })
    
    // Auto-focus input
    setTimeout(() => input.focus(), 50)
  }

  /**
   * Placeholder for game start logic
   */
  async startGame () {
    console.log('Game starting for:', this.nickname)
    // Next step: Fetch the first question
  }

  showMessage (msg, type) {
    const el = this.element.querySelector('#message')
    if (el) {
      el.textContent = msg
      el.style.color = type === 'error' ? 'var(--color-terracotta)' : 'var(--color-emerald)'
    }
  }
}