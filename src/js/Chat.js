import { Window } from './Window.js'

/**
 * The Chat Application.
 * Handles WebSocket communication, persistent username, and message history.
 */
export class Chat extends Window {
  constructor () {
    super('Chat Channel')
    
    // --- Server Configuration (From README_chat.md) ---
    this.serverUrl = 'wss://courselab.lnu.se/message-app/socket'
    this.apiKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    this.defaultChannel = 'PWD-General' // Default channel for all students
    
    // --- State ---
    this.username = localStorage.getItem('pwd-chat-username') || null
    this.socket = null
    this.messages = []
    
    this.element.style.width = '380px'
    this.element.style.height = '500px'
    
    // Initialize
    if (this.username) {
      this.connect()
    } else {
      this.renderUsernameScreen()
    }
  }

  /**
   * Screen 1: Login
   */
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
    
    // Focus input automatically
    setTimeout(() => input.focus(), 50)

    const btn = document.createElement('button')
    btn.textContent = 'Enter Chat'
    btn.className = 'memory-btn' 
    btn.style.width = 'auto'

    const saveName = () => {
      const name = input.value.trim()
      if (name) {
        this.username = name
        localStorage.setItem('pwd-chat-username', name)
        this.connect() // Changed from renderChatInterface to connect
      }
    }

    btn.addEventListener('click', saveName)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveName()
    })
    
    content.appendChild(label)
    content.appendChild(input)
    content.appendChild(btn)
  }

  /**
   * Connects to the WebSocket server.
   */
  connect () {
    this.renderChatInterface()
    this.addSystemMessage('Connecting to server...')
    
    // 1. Open Connection
    this.socket = new WebSocket(this.serverUrl)

    // 2. Handle Open
    this.socket.addEventListener('open', () => {
      this.addSystemMessage('Connected to channel: ' + this.defaultChannel)
      this.updateStatus(true)
    })

    // 3. Handle Incoming Messages
    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // IGNORE Heartbeats (as per README)
        if (data.type === 'heartbeat') return

        // Handle Chat Messages
        if (data.type === 'message') {
            // Check if it's "Me" (so we don't duplicate, though server usually echoes)
            const isMe = data.username === this.username
            this.addMessage(data.username, data.data, isMe)
        }
      } catch (e) {
        console.warn('Invalid JSON received', e)
      }
    })

    // 4. Handle Errors/Close
    this.socket.addEventListener('close', () => {
      this.addSystemMessage('Disconnected from server.')
      this.updateStatus(false)
    })
    
    this.socket.addEventListener('error', () => {
      this.addSystemMessage('Connection error.')
      this.updateStatus(false)
    })
  }

  /**
   * Screen 2: The Main Interface
   */
  renderChatInterface () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.classList.remove('window-content') 
    content.classList.add('chat-wrapper') 

    // Header
    this.statusHeader = document.createElement('div')
    this.statusHeader.className = 'chat-status'
    this.statusHeader.innerHTML = `User: <b>${this.username}</b> <span>Connecting...</span>`
    content.appendChild(this.statusHeader)

    // Messages
    this.messageArea = document.createElement('div')
    this.messageArea.className = 'chat-messages'
    content.appendChild(this.messageArea)

    // Input
    const inputArea = document.createElement('div')
    inputArea.className = 'chat-input-area'

    const textarea = document.createElement('textarea')
    textarea.placeholder = 'Type a message...'
    
    // Send on Enter (Shift+Enter for new line)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            this.sendMessage(textarea.value)
            textarea.value = ''
        }
    })
    
    const sendBtn = document.createElement('button')
    sendBtn.textContent = 'Send'
    sendBtn.className = 'memory-btn'
    sendBtn.style.width = 'auto'
    sendBtn.style.padding = '0 15px'

    sendBtn.addEventListener('click', () => {
        this.sendMessage(textarea.value)
        textarea.value = ''
    })

    inputArea.appendChild(textarea)
    inputArea.appendChild(sendBtn)
    content.appendChild(inputArea)
  }

  /**
   * Sends a JSON payload to the server.
   */
  sendMessage (text) {
    if (!text.trim()) return
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.addSystemMessage('Error: Not connected to server.')
        return
    }

    // Construct Payload
    const payload = {
      type: 'message',
      data: text,
      username: this.username,
      channel: this.defaultChannel, 
      key: this.apiKey
    }

    this.socket.send(JSON.stringify(payload))
    // If it feels slow, enable "optimistic UI" later.
  }

  /**
   * UI Helpers
   */
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

  addSystemMessage (text) {
    const msg = document.createElement('div')
    msg.textContent = text
    msg.style.alignSelf = 'center'
    msg.style.fontSize = '0.75rem'
    msg.style.color = '#666'
    msg.style.fontStyle = 'italic'
    msg.style.marginBottom = '5px'
    this.messageArea.appendChild(msg)
    this.messageArea.scrollTop = this.messageArea.scrollHeight
  }

  updateStatus (isConnected) {
    if (this.statusHeader) {
      const statusText = isConnected 
        ? '<span style="color:var(--color-emerald)">● Online</span>' 
        : '<span style="color:var(--color-terracotta)">● Offline</span>'
      this.statusHeader.innerHTML = `User: <b>${this.username}</b> <span>${statusText}</span>`
    }
  }
}