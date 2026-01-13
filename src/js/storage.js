export class HighScoreManager {
  /**
   * Retrieves the top 5 scores for a specific list.
   * @param {string} listName - The unique key for the mode (e.g., 'quiz-server-normal').
   * @returns {Array} Array of high score objects with 'nickname' and 'time' properties.
   */
  getHighScores (listName) {
    const data = localStorage.getItem(listName)
    return data ? JSON.parse(data) : []
  }

  /**
   * Saves a new score to a specific list.
   * @param {string} nickname - User's name.
   * @param {number} time - Total time in milliseconds.
   * @param {string} listName - The unique key for the mode.
   */
  saveScore (nickname, time, listName) {
    const scores = this.getHighScores(listName)
    scores.push({ nickname, time })
    scores.sort((a, b) => a.time - b.time)
    const top5 = scores.slice(0, 5)
    localStorage.setItem(listName, JSON.stringify(top5))
  }
}
