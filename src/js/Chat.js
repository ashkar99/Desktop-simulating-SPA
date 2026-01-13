import { Window } from './Window.js'

/**
 * A real-time Chat Application using WebSockets.
 * Features include persistent username/history, channel switching,
 * offline caching, and visual notifications.
 * @augments Window
 */
export class Chat extends Window {
  /**
   * Creates an instance of the Chat application.
   */
  constructor () {
    super('Chat Channel')

    this.serverUrl = 'wss://courselab.lnu.se/message-app/socket'
    this.apiKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    this.defaultChannel = 'PWD-General'
    this.username = localStorage.getItem('pwd-chat-username') || null
    this.messages = JSON.parse(localStorage.getItem(this.historyKey)) || []
    this.socket = null

    // Window dimensions
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

  /**
   * Generates a unique localStorage key based on the current channel.
   * This ensures history is segregated by room.
   * @readonly
   * @returns {string} The storage key.
   */
  get historyKey () {
    return `pwd-chat-history-${this.defaultChannel}`
  }

  /**
   * Renders the initial login screen for username entry.
   */
  renderUsernameScreen () {
    const content = this.element.querySelector('.window-content')
    content.innerHTML = ''
    content.className = 'window-content chat-login-screen'

    const logo = document.createElement('img')
    logo.src = './img/chat-icon.png'
    logo.alt = 'Chat Logo'
    logo.className = 'chat-logo'

    const label = document.createElement('h3')
    label.textContent = 'Enter your Username'
    label.className = 'chat-login-label'

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'e.g. Conqueror (Max 12 chars)'
    input.className = 'chat-login-input'
    input.maxLength = 12

    const btn = document.createElement('button')
    btn.textContent = 'Enter Chat'
    btn.className = 'memory-btn'
    btn.style.width = 'auto'

    const saveName = () => {
      const name = input.value.trim()

      if (!name) return
      if (name.length > 12) {
        window.alert('Username must be 12 characters or less.')
        return
      }

      this.username = name
      localStorage.setItem('pwd-chat-username', name)
      this.connect()
    }

    btn.addEventListener('click', saveName)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName() })

    content.appendChild(logo)
    content.appendChild(label)
    content.appendChild(input)
    content.appendChild(btn)
  }

  /**
   * Establishes the WebSocket connection and sets up event listeners.
   */
  connect () {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return

    this.renderChatInterface()
    // Ensure seeing cached messages before connection
    if (this.messageArea.children.length === 0) {
      this.renderCachedMessages()
    }
    this.addSystemMessage(`Connecting to ${this.defaultChannel}...`)
    this.updateStatus(false)

    this.socket = new window.WebSocket(this.serverUrl)

    this.socket.addEventListener('open', () => {
      this.addSystemMessage(`Connected to channel: ${this.defaultChannel}`)
      this.updateStatus(true)
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'heartbeat') return
        if (data.channel !== this.defaultChannel) return

        if (data.type === 'message') {
          const isMe = data.username === this.username
          this.addMessage(data.username, data.data, isMe)

          // If it's NOT me, and the window is NOT the top one...
          if (!isMe && !this.element.classList.contains('active-window')) {
            this.notify()
          }
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

  /**
   * Displays the Channel Selector overlay.
   */
  showChannelSelector () {
    const content = this.element.querySelector('.chat-wrapper')

    const overlay = document.createElement('div')
    overlay.className = 'chat-overlay'

    const title = document.createElement('h3')
    title.textContent = 'Select Channel'
    title.className = 'chat-overlay-title'

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

    const inputGroup = document.createElement('div')
    inputGroup.className = 'channel-input-group'

    const input = document.createElement('input')
    input.placeholder = 'Custom channel name... (max 15 chars)'
    input.maxLength = 15
    input.className = 'channel-input-custom'

    const joinBtn = document.createElement('button')
    joinBtn.textContent = 'Join'
    joinBtn.className = 'memory-btn channel-join-btn'

    const handleCustom = () => {
      const val = input.value.trim()
      if (!val) return
      if (val.length > 15) {
        window.alert('Channel name too long (Max 15).')
        return
      }
      this.switchChannel(val)
    }

    joinBtn.addEventListener('click', handleCustom)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleCustom() })

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.className = 'channel-cancel-btn'
    cancelBtn.addEventListener('click', () => overlay.remove())

    inputGroup.appendChild(input)
    inputGroup.appendChild(joinBtn)

    overlay.appendChild(title)
    overlay.appendChild(grid)
    overlay.appendChild(inputGroup)
    overlay.appendChild(cancelBtn)

    content.appendChild(overlay)
    setTimeout(() => input.focus(), 50)
  }

  /**
   * Switches the active channel and reconnects the WebSocket.
   * @param {string} newChannel - The name of the channel to join.
   */
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
    this.messages = JSON.parse(localStorage.getItem(this.historyKey)) || []
    this.renderCachedMessages()
    this.connect()

    const btn = this.element.querySelector('button[title^="Current:"]')
    if (btn) btn.title = `Current: ${this.defaultChannel}`
  }

  /**
   * Renders the main chat interface (Messages, Input, Header).
   */
  renderChatInterface () {
    const content = this.element.querySelector('.window-content') || this.element.querySelector('.chat-wrapper')
    content.innerHTML = ''
    content.className = 'chat-wrapper'

    this.statusHeader = document.createElement('div')
    this.statusHeader.className = 'chat-status'

    const userInfo = document.createElement('div')
    userInfo.innerHTML = `<b>${this.username}</b>`

    const controls = document.createElement('div')
    controls.className = 'chat-header-controls'

    this.statusText = document.createElement('span')
    this.statusText.innerHTML = 'Connecting...'

    const channelBtn = document.createElement('button')
    const channelIcon = document.createElement('img')
    channelIcon.src = './img/channel-icon.png'
    channelIcon.alt = 'Channels'
    channelBtn.appendChild(channelIcon)

    channelBtn.className = 'chat-header-btn'
    channelBtn.title = `Switch Channel (Current: ${this.defaultChannel})`
    channelBtn.addEventListener('click', () => this.showChannelSelector())

    const logoutBtn = document.createElement('button')
    const logoutIcon = document.createElement('img')
    logoutIcon.src = './img/switch-user-icon.png'
    logoutIcon.alt = 'Change User'
    logoutBtn.appendChild(logoutIcon)

    logoutBtn.className = 'chat-header-btn'
    logoutBtn.title = 'Change User / Logout'
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
        this.markAsRead()
      }
    })

    textarea.addEventListener('focus', () => this.markAsRead())
    textarea.addEventListener('click', () => this.markAsRead())

    const sendBtn = document.createElement('button')
    const sendIcon = document.createElement('img')
    sendIcon.src = './img/send-icon.png'
    sendIcon.alt = 'Send'
    sendBtn.appendChild(sendIcon)

    sendBtn.addEventListener('click', () => {
      this.sendMessage(textarea.value); textarea.value = ''
      this.markAsRead()
    })

    inputArea.appendChild(textarea)
    inputArea.appendChild(sendBtn)
    content.appendChild(inputArea)
  }

  /**
   * Sends a message payload to the server.
   * @param {string} text - The message content.
   */
  sendMessage (text) {
    if (!text.trim()) return
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.addSystemMessage('Error: Not connected. Please wait...')
      return
    }
    const payload = {
      type: 'message',
      data: text,
      username: this.username,
      channel: this.defaultChannel,
      key: this.apiKey
    }
    this.socket.send(JSON.stringify(payload))
  }

  /**
   * Adds a message to the UI and caches it in localStorage.
   * @param {string} sender - The username of the sender.
   * @param {string} text - The message content.
   * @param {boolean} isMe - True if the message was sent by the current user.
   */
  addMessage (sender, text, isMe) {
    this.renderBubbleOnly(sender, text, isMe)
    this.messages.push({ sender, text })
    if (this.messages.length > 50) this.messages.shift()

    // Save to the channel-specific key
    localStorage.setItem(this.historyKey, JSON.stringify(this.messages))
  }

  /**
   * Renders a single message bubble to the DOM.
   * @param {string} sender - The sender's name.
   * @param {string} text - The message content.
   * @param {boolean} isMe - Styling flag for 'me' vs 'them'.
   */
  renderBubbleOnly (sender, text, isMe) {
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

  /**
   * Loads and renders messages from localStorage for the current channel.
   */
  renderCachedMessages () {
    this.messages.forEach(msg => {
      const isMe = msg.sender === this.username
      this.renderBubbleOnly(msg.sender, msg.text, isMe)
    })
  }

  /**
   * Adds a system message (italicized, centered) to the chat area.
   * @param {string} text - The system message to display.
   */
  addSystemMessage (text) {
    const msg = document.createElement('div')
    msg.textContent = text
    msg.className = 'chat-system-message'
    this.messageArea.appendChild(msg)
    this.messageArea.scrollTop = this.messageArea.scrollHeight
  }

  /**
   * Updates the status indicator in the header.
   * @param {boolean} isConnected - Connection status.
   */
  updateStatus (isConnected) {
    if (!this.statusText) return

    this.statusText.innerHTML = ''

    const channelSpan = document.createElement('span')
    channelSpan.textContent = this.defaultChannel
    channelSpan.className = 'chat-status-channel'

    const statusSpan = document.createElement('span')
    if (isConnected) {
      statusSpan.textContent = '● Online'
      statusSpan.className = 'chat-status-online'
    } else {
      statusSpan.textContent = '● Offline'
      statusSpan.className = 'chat-status-offline'
    }

    this.statusText.appendChild(channelSpan)
    this.statusText.appendChild(statusSpan)
  }

  /**
   * Overrides parent focus to clear notifications.
   */
  focus () {
    super.focus()
    this.markAsRead()
  }

  /**
   * Triggers a visual notification (sound + red header).
   */
  notify () {
    const audio = new window.Audio('./audio/notification.mp3')
    audio.play().catch(e => { /* Ignore auto-play errors */ })
    const header = this.element.querySelector('.window-header')
    if (header) {
      header.classList.add('unread')
    }
  }

  /**
   * Removes the unread status.
   */
  markAsRead () {
    const header = this.element.querySelector('.window-header')
    if (header) {
      header.classList.remove('unread')
    }
  }

  /**
   * Logs the user out, clears session, and returns to login screen.
   */
  logout () {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    localStorage.removeItem('pwd-chat-username')
    this.username = null

    const content = this.element.querySelector('.chat-wrapper')
    if (content) content.className = 'window-content'

    this.renderUsernameScreen()
  }
}
