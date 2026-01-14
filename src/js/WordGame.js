import { Window } from './Window.js'

/**
 * The Caliph's Scroll (Word Game).
 * A Hangman-style game where players guess the secret word to protect their shields.
 * @augments Window - Inherits from the Window class.
 */
export class WordGame extends Window {
  constructor () {
    super("The Caliph's Scroll")

    // Window Setup
    this.element.style.width = '500px'
    this.element.style.height = '400px'
    
    // Game State
    this.secretWord = ''
    this.lives = 6
    
    this.renderStartScreen()
  }

  /**
   * Renders the initial menu.
   */
  renderStartScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.style.textAlign = 'center'
    content.style.display = 'flex'
    content.style.flexDirection = 'column'
    content.style.alignItems = 'center'
    content.style.justifyContent = 'center'
    content.style.gap = '20px'

    const title = document.createElement('h2')
    title.textContent = 'Protect the Scroll'
    title.style.color = 'var(--color-wood)'

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Start Game'
    startBtn.className = 'memory-btn'
    startBtn.addEventListener('click', () => {
      console.log('Game Started!') 
      // Test
      content.innerHTML = '<h3>Game Loading...</h3>'
    })

    content.appendChild(title)
    content.appendChild(startBtn)
  }
}