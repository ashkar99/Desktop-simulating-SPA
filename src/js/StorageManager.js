/**
 * specific logic for Quiz scores and Chat history.
 * @class - StorageManager.
 */
export class StorageManager {
  
  /**
   * Safely retrieves and parses a JSON item.
   * @param {string} key - LocalStorage key.
   * @param {any} defaultValue - Value to return if key doesn't exist.
   * @returns {any} Parsed value or defaultValue.
   */
  #load (key, defaultValue) {
    const data = localStorage.getItem(key)
    try {
      return data ? JSON.parse(data) : defaultValue
    } catch (e) {
      console.warn(`StorageManager: Corrupt data for key "${key}"`, e)
      return defaultValue
    }
  }

  /**
   * Stringifies and saves an item.
   * @param {string} key - LocalStorage key.
   * @param {any} value - Value to save.
   */
  #save (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('StorageManager: Quota exceeded or disabled', e)
    }
  }

  /**
   * Retrieves the saved username.
   * @returns {string|null} The saved username or null if not set.
   */
  getUsername () {
    return localStorage.getItem('pwd-chat-username') || null
  }

  /**
   * Saves the username.
   * @param {string} username - The username to save.
   */
  saveUsername (username) {
    localStorage.setItem('pwd-chat-username', username)
  }

  /**
   * Retrieves chat history for a specific channel.
   * @param {string} channel - The chat channel.
   * @returns {Array} Array of message objects.
   */
  getChatHistory (channel) {
    return this.#load(`pwd-chat-history-${channel}`, [])
  }

  /**
   * Saves chat history for a channel.
   * @param {string} channel - The chat channel.
   * @param {Array} messages - Array of message objects.
   */
  saveChatHistory (channel, messages) {
    this.#save(`pwd-chat-history-${channel}`, messages)
  }

  /**
   * Retrieves high scores for a specific list.
   * @param {*} listKey - LocalStorage key for the high score list.
   * @returns - Array of high score objects.
   */
  getHighScores (listKey) {
    return this.#load(listKey, [])
  }

  /**
   * Saves a new score to a specific list.
   * @param {string} nickname - User's name.
   * @param {number} time - Total time in milliseconds.
   * @param {string} listName - The unique key for the mode.
   */
  saveHighScore (nickname, time, listKey) {
    const scores = this.getHighScores(listKey)
    scores.push({ nickname, time })
    scores.sort((a, b) => a.time - b.time)
    const top5 = scores.slice(0, 5)
  
    this.#save(listKey, top5)
  }

  /**
   * Retrieves the best streak for the word game.
   * @returns {number} The current best streak.
   */
  getWordStreak () {
    return this.#load('pwd-word-streak', 0)
  }

  /**
   * Saves the current streak.
   * @param {number} streak - The number of consecutive wins.
   */
  saveWordStreak (streak) {
    this.#save('pwd-word-streak', streak)
  }

  getBestStreak () {
    return parseInt(localStorage.getItem('word-best-streak')) || 0
  }

  saveBestStreak (streak) {
    const currentBest = this.getBestStreak()
    if (streak > currentBest) {
      localStorage.setItem('word-best-streak', streak)
    }
  }
}
