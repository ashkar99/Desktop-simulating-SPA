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
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.classList.remove('window-content')
    content.classList.add('chat-wrapper')

    // Status Bar
    this.statusHeader = document.createElement('div')
    this.statusHeader.className = 'chat-status'
    this.statusHeader.innerHTML = `User: <b>${this.username}</b> <span>Disconnected</span>`
    content.appendChild(this.statusHeader)

    // Messages Area
    this.messageArea = document.createElement('div')
    this.messageArea.className = 'chat-messages'
    content.appendChild(this.messageArea)

    // Input Area
    const inputArea = document.createElement('div')
    inputArea.className = 'chat-input-area'

    const textarea = document.createElement('textarea')
    textarea.placeholder = 'Type a message...'
    
    const sendBtn = document.createElement('button')
    sendBtn.textContent = 'Send'
    sendBtn.className = 'memory-btn'
    sendBtn.style.width = 'auto'
    sendBtn.style.padding = '0 15px'

    // Temporary: Just echo the message to prove UI works /////////////////////
    sendBtn.addEventListener('click', () => {
        if(textarea.value.trim()) {
            this.addMessage('Me', textarea.value, true)
            textarea.value = ''
        }
    })

    inputArea.appendChild(textarea)
    inputArea.appendChild(sendBtn)
    content.appendChild(inputArea)
  }

  addMessage (sender, text, isMe) {
    const bubble = document.createElement('div')
    bubble.className = `chat-bubble ${isMe ? 'me' : 'them'}`
    
    const meta = document.createElement('div')
    meta.className = 'chat-meta'
    meta.textContent = sender
    
    const content = document.createElement('div')
    content.textContent = text
    
    bubble.appendChild(meta)
    bubble.appendChild(content)
    this.messageArea.appendChild(bubble)
    this.messageArea.scrollTop = this.messageArea.scrollHeight
  }

}