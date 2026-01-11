import { Window } from './Window.js'

/**
 * The Chat Application.
 * Handles WebSocket communication, persistent username, and message history caching.
 */
export class Chat extends Window {
  constructor () {
    super('Chat Channel')
    
    // Server Config
    this.serverUrl = 'wss://courselab.lnu.se/message-app/socket'
    this.apiKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    this.defaultChannel = 'PWD-General'
    
    // State
    this.username = localStorage.getItem('pwd-chat-username') || null
    this.messages = JSON.parse(localStorage.getItem('pwd-chat-history')) || []
    this.socket = null
    
    this.element.style.width = '380px'
    this.element.style.height = '500px'
    this.element.style.minWidth = '300px'
    this.element.style.minHeight = '400px'
    
    if (this.username) {
      this.connect()
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
    input.style.width = '70%'

    const btn = document.createElement('button')
    btn.textContent = 'Enter Chat'
    btn.className = 'memory-btn'
    btn.style.width = 'auto'

    const saveName = () => {
      const name = input.value.trim()
      if (name) {
        this.username = name
        localStorage.setItem('pwd-chat-username', name)
        this.connect()
      }
    }

    btn.addEventListener('click', saveName)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName() })
    
    content.appendChild(label); content.appendChild(input); content.appendChild(btn)
  }

  connect () {
    this.renderChatInterface()
    this.renderCachedMessages() // Show history immediately
    this.addSystemMessage('Connecting to server...')
    
    this.socket = new WebSocket(this.serverUrl)

    this.socket.addEventListener('open', () => {
      this.addSystemMessage('Connected to channel: ' + this.defaultChannel)
      this.updateStatus(true)
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'heartbeat') return
        if (data.type === 'message') {
            const isMe = data.username === this.username
            this.addMessage(data.username, data.data, isMe)
        }
      } catch (e) { console.warn('Invalid JSON', e) }
    })

    this.socket.addEventListener('close', () => {
      this.addSystemMessage('Disconnected.')
      this.updateStatus(false)
    })
    
    this.socket.addEventListener('error', () => {
      this.addSystemMessage('Connection error.')
      this.updateStatus(false)
    })
  }

  renderChatInterface () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.classList.remove('window-content') 
    content.classList.add('chat-wrapper') 

    this.statusHeader = document.createElement('div')
    this.statusHeader.className = 'chat-status'
    
    // Left side: User info
    const userInfo = document.createElement('div')
    userInfo.innerHTML = `User: <b>${this.username}</b>`
    
    const controls = document.createElement('div')
    controls.style.display = 'flex'
    controls.style.gap = '10px'
    controls.style.alignItems = 'center'

    // Status Indicator
    this.statusText = document.createElement('span')
    this.statusText.innerHTML = 'Connecting...'
    
    // Logout Button
    const logoutBtn = document.createElement('button')
    logoutBtn.textContent = 'Change User'
    logoutBtn.style.fontSize = '0.7rem'
    logoutBtn.style.padding = '2px 6px'
    logoutBtn.style.cursor = 'pointer'
    logoutBtn.style.background = 'none'
    logoutBtn.style.border = '1px solid #999'
    logoutBtn.style.borderRadius = '4px'
    
    logoutBtn.addEventListener('click', () => this.logout())

    controls.appendChild(this.statusText)
    controls.appendChild(logoutBtn)
    
    this.statusHeader.appendChild(userInfo)
    this.statusHeader.appendChild(controls)
    content.appendChild(this.statusHeader)

    this.messageArea = document.createElement('div')
    this.messageArea.className = 'chat-messages'
    content.appendChild(this.messageArea)

    const inputArea = document.createElement('div')
    inputArea.className = 'chat-input-area'

    const textarea = document.createElement('textarea')
    textarea.placeholder = 'Type a message...'
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); this.sendMessage(textarea.value); textarea.value = ''
        }
    })
    
    const sendBtn = document.createElement('button')
    const icon = document.createElement('img')
    icon.src = './img/send-icon.png'
    icon.alt = 'Send'
    sendBtn.appendChild(icon)
    
    sendBtn.addEventListener('click', () => {
        this.sendMessage(textarea.value); textarea.value = ''
    })

    inputArea.appendChild(textarea); inputArea.appendChild(sendBtn)
    content.appendChild(inputArea)
  }

  sendMessage (text) {
    if (!text.trim()) return
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.addSystemMessage('Error: Not connected.')
        return
    }
    const payload = {
      type: 'message', data: text, username: this.username,
      channel: this.defaultChannel, key: this.apiKey
    }
    this.socket.send(JSON.stringify(payload))
  }

  // Renders AND Saves (For new incoming messages)
  addMessage (sender, text, isMe) {
    this.renderBubbleOnly(sender, text, isMe)
    
    // Save to Storage
    this.messages.push({ sender, text })
    if (this.messages.length > 50) this.messages.shift() // Limit to 50
    localStorage.setItem('pwd-chat-history', JSON.stringify(this.messages))
  }

  // Renders ONLY (For loading history)
  renderBubbleOnly (sender, text, isMe) {
    const bubble = document.createElement('div')
    bubble.className = `chat-bubble ${isMe ? 'me' : 'them'}`
    
    const meta = document.createElement('div')
    meta.className = 'chat-meta'
    meta.textContent = sender
    
    const content = document.createElement('div')
    content.textContent = text
    
    bubble.appendChild(meta); bubble.appendChild(content)
    this.messageArea.appendChild(bubble)
    this.messageArea.scrollTop = this.messageArea.scrollHeight
  }

  renderCachedMessages () {
    this.messages.forEach(msg => {
      const isMe = msg.sender === this.username
      this.renderBubbleOnly(msg.sender, msg.text, isMe)
    })
  }

  addSystemMessage (text) {
    const msg = document.createElement('div')
    msg.textContent = text
    msg.style.alignSelf = 'center'; msg.style.fontSize = '0.75rem'; msg.style.color = '#666'
    msg.style.fontStyle = 'italic'; msg.style.marginBottom = '5px'
    this.messageArea.appendChild(msg)
    this.messageArea.scrollTop = this.messageArea.scrollHeight
  }

  updateStatus (isConnected) {
    if (this.statusText) {
      const text = isConnected 
        ? '<span style="color:var(--color-emerald)">● Online</span>' 
        : '<span style="color:var(--color-terracotta)">● Offline</span>'
      this.statusText.innerHTML = text
    }
  }

  /**
   * Clears session and returns to login screen.
   */
  logout () {
    if (this.socket) {
        this.socket.close()
        this.socket = null
    }
    
    localStorage.removeItem('pwd-chat-username')
    this.username = null
    this.element.querySelector('.window-content').classList.remove('chat-wrapper')
    this.element.querySelector('.window-content').classList.add('window-content')
    this.renderUsernameScreen()
  }
}