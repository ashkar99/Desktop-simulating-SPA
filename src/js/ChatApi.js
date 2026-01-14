/**
 * Handles WebSocket connection and protocol for the Chat application.
 * @class - ChatAPI.
 */
export class ChatAPI {
  constructor () {
    this.serverUrl = 'wss://courselab.lnu.se/message-app/socket'
    this.apiKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    this.socket = null
    this.handlers = {}
  }

  /**
   * Connects to the WebSocket server.
   * @param {string} channel - The channel to listen to (client-side filtering).
   * @param {object} handlers - Callbacks for events ({ onOpen, onMessage, onError, onClose }).
   */
  connect (channel, handlers) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return

    this.handlers = handlers
    this.socket = new window.WebSocket(this.serverUrl)

    this.socket.addEventListener('open', () => {
      if (this.handlers.onOpen) this.handlers.onOpen()
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        // Protocol: Filter Heartbeats
        if (data.type === 'heartbeat') return

        // Protocol: Client-Side Channel Filtering
        if (data.channel !== channel) return

        if (this.handlers.onMessage) {
          this.handlers.onMessage(data)
        }
      } catch (e) {
        console.warn('ChatAPI: Invalid JSON received', e)
      }
    })

    this.socket.addEventListener('close', () => {
      if (this.handlers.onClose) this.handlers.onClose()
    })

    this.socket.addEventListener('error', (err) => {
      if (this.handlers.onError) this.handlers.onError(err)
    })
  }

  /**
   * Sends a message object to the server.
   * @param {string} text - The message content.
   * @param {string} username - The sender.
   * @param {string} channel - The target channel.
   */
  sendMessage (text, username, channel) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('ChatAPI: Socket not connected')
    }

    const payload = {
      type: 'message',
      data: text,
      username: username,
      channel: channel,
      key: this.apiKey
    }

    this.socket.send(JSON.stringify(payload))
  }

  /**
   * Closes the connection.
   */
  disconnect () {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}