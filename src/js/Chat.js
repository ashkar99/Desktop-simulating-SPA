import { Window } from './Window.js'

export class Chat extends Window {
  constructor () {
    super('Chat Channel')
    
    this.serverUrl = 'wss://courselab.lnu.se/message-app/socket'
    this.apiKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    this.defaultChannel = 'PWD-General'
    
    this.username = localStorage.getItem('pwd-chat-username') || null
    this.messages = JSON.parse(localStorage.getItem('pwd-chat-history')) || []
    this.socket = null
    
    this.element.style.width = '380px'
    this.element.style.height = '500px'
    
    if (this.username) {
      this.connect()
    } else {
      this.renderUsernameScreen()
    }
  }

  renderUsernameScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content chat-login-screen' 

    const label = document.createElement('h3')
    label.textContent = 'Enter your Username'
    label.className = 'chat-login-label'
    
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'e.g. Neo'
    input.className = 'chat-login-input'

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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return

    this.renderChatInterface()
    this.renderCachedMessages()
    this.addSystemMessage(`Connecting to ${this.defaultChannel}...`)
    
    this.socket = new WebSocket(this.serverUrl)

    this.socket.addEventListener('open', () => {
      this.addSystemMessage(`Connected to channel: ${this.defaultChannel}`)
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

  showChannelSelector () {
    const content = this.element.querySelector('.chat-wrapper')
    
    // Create Overlay
    const overlay = document.createElement('div')
    overlay.className = 'chat-overlay'
    
    const title = document.createElement('h3')
    title.textContent = 'Select Channel'
    title.style.color = 'var(--color-wood)'
    
    // Preset Buttons
    const grid = document.createElement('div')
    grid.className = 'channel-grid'
    
    const channels = ['PWD-General', 'PWD-Social', 'PWD-Help', 'PWD-Random']
    channels.forEach(chan => {
        const btn = document.createElement('button')
        btn.textContent = chan.replace('PWD-', '')
        btn.className = 'channel-btn'
        btn.addEventListener('click', () => this.switchChannel(chan))
        grid.appendChild(btn)
    })

    // Custom Input
    const inputGroup = document.createElement('div')
    inputGroup.className = 'channel-input-group'
    
    const input = document.createElement('input')
    input.placeholder = 'Or enter custom name...'
    input.style.flex = '1'; input.style.padding = '8px'; input.style.borderRadius = '4px'
    
    const joinBtn = document.createElement('button')
    joinBtn.textContent = 'Join'
    joinBtn.className = 'memory-btn'; joinBtn.style.padding = '0 15px'; joinBtn.style.width = 'auto'
    
    const handleCustom = () => {
        if(input.value.trim()) this.switchChannel(input.value.trim())
    }
    
    joinBtn.addEventListener('click', handleCustom)
    input.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleCustom() })

    // Cancel Button
    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.background = 'none'; cancelBtn.style.border = 'none'; cancelBtn.style.cursor = 'pointer'
    cancelBtn.style.fontSize = '0.8rem'; cancelBtn.style.textDecoration = 'underline'
    cancelBtn.addEventListener('click', () => overlay.remove())

    inputGroup.appendChild(input); inputGroup.appendChild(joinBtn)
    
    overlay.appendChild(title)
    overlay.appendChild(grid)
    overlay.appendChild(inputGroup)
    overlay.appendChild(cancelBtn)
    
    content.appendChild(overlay)
    setTimeout(() => input.focus(), 50)
  }

  switchChannel (newChannel) {
    if (newChannel === this.defaultChannel) {
        this.element.querySelector('.chat-overlay')?.remove()
        return
    }

    this.defaultChannel = newChannel

    if (this.socket) {
        this.socket.close()
    }
    
    this.messageArea.innerHTML = ''
    this.element.querySelector('.chat-overlay')?.remove()
    
    this.connect()
    
    const btn = this.element.querySelector('button[title^="Current:"]')
    if (btn) btn.title = `Current: ${this.defaultChannel}`
  }

  renderChatInterface () {
    const content = this.element.querySelector('.window-content') || this.element.querySelector('.chat-wrapper')
    content.innerHTML = ''
    content.className = 'chat-wrapper'

    this.statusHeader = document.createElement('div')
    this.statusHeader.className = 'chat-status'
    
    const userInfo = document.createElement('div')
    userInfo.innerHTML = `User: <b>${this.username}</b>`
    
    const controls = document.createElement('div')
    controls.className = 'chat-header-controls'

    this.statusText = document.createElement('span')
    this.statusText.innerHTML = 'Connecting...'
    
    // Channel Button triggers Overlay
    const channelBtn = document.createElement('button')
    channelBtn.textContent = 'Channel'
    channelBtn.className = 'chat-logout-btn'
    channelBtn.title = `Current: ${this.defaultChannel}`
    channelBtn.addEventListener('click', () => this.showChannelSelector())
    
    const logoutBtn = document.createElement('button')
    logoutBtn.textContent = 'Change User'
    logoutBtn.className = 'chat-logout-btn'
    logoutBtn.addEventListener('click', () => this.logout())

    controls.appendChild(this.statusText)
    controls.appendChild(channelBtn)
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

    // Safety Check: Only send if OPEN
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.addSystemMessage('Error: Not connected. Please wait...')
        return
    }
    const payload = {
      type: 'message', data: text, username: this.username,
      channel: this.defaultChannel, key: this.apiKey
    }
    this.socket.send(JSON.stringify(payload))
  }

  addMessage (sender, text, isMe) {
    this.renderBubbleOnly(sender, text, isMe)
    this.messages.push({ sender, text })
    if (this.messages.length > 50) this.messages.shift()
    localStorage.setItem('pwd-chat-history', JSON.stringify(this.messages))
  }

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
    msg.className = 'chat-system-message'
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

  logout () {
    if (this.socket) {
        this.socket.close()
        this.socket = null
    }
    
    localStorage.removeItem('pwd-chat-username')
    this.username = null
    
    // Reset to base window class
    const content = this.element.querySelector('.chat-wrapper')
    if(content) content.className = 'window-content'
    
    this.renderUsernameScreen()
  }
}