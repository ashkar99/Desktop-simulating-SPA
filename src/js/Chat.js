import { Window } from './Window.js'

/**
 * The Chat Application.
 * Handles the UI for messaging and persistent username storage.
 */
export class Chat extends Window {
  constructor () {
    super('Chat Channel')
    this.username = localStorage.getItem('pwd-chat-username') || null
    this.element.style.width = '380px'
    this.element.style.height = '500px'
    
    if (this.username) {
      this.renderChatInterface()
    } else {
      this.renderUsernameScreen()
    }
  }

  
  renderUsernameScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.style.display = 'flex'
    content.style.flexDirection = 'column'
    content.style.alignItems = 'center'
    content.style.justifyContent = 'center'
    content.style.gap = '15px'

    const label = document.createElement('h3')
    label.textContent = 'Enter your Username'
    label.style.color = 'var(--color-wood)'
    
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'e.g. Neo'
    input.style.padding = '10px'
    input.style.borderRadius = '5px'
    input.style.border = '2px solid var(--color-gold)'
    input.style.width = '70%'

    const btn = document.createElement('button')
    btn.textContent = 'Enter Chat'
    btn.className = 'memory-btn' // Reuse existing button styles
    btn.style.width = 'auto'

    const saveName = () => {
      const name = input.value.trim()
      if (name) {
        this.username = name
        localStorage.setItem('pwd-chat-username', name)
        this.renderChatInterface()
      }
    }

    btn.addEventListener('click', saveName)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveName()
    })
    
    content.appendChild(label)
    content.appendChild(input)
    content.appendChild(btn)
    
    setTimeout(() => input.focus(), 50)
  }

  
  renderChatInterface () {
    
  }
}