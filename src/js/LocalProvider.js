export class LocalProvider {
  constructor () {
    this.questions = []
  }

  /**
   * Loads questions from the JSON file.
   */
  async init () {
    const req = await fetch('./json/questions.json')
    this.questions = await req.json()
  }

  /**
   * Simulates fetching a question by ID.
   * @param {number|string} id - The question ID.
   * @returns {object} The question data.
   */
  async getQuestion (id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const q = this.questions.find(item => item.id === Number(id))
    if (!q) throw new Error('Question not found')

    // Return the data in the exact format the Quiz expects
    return {
      id: q.id,
      question: q.question,
      alternatives: q.alternatives,
      nextURL: q.id
    }
  }

  /**
   * Simulates sending an answer to the server.
   * @param {number|string} id - The question ID.
   * @param {object} answerPayload - The answer payload containing the user's answer.
   * @returns {object} Result object with nextURL or victory message.
   */
  async sendAnswer (id, answerPayload) {
    await new Promise(resolve => setTimeout(resolve, 200))

    const q = this.questions.find(item => item.id === Number(id))
    if (!q) throw new Error('Question not found')

    const userAnswer = answerPayload.answer.toString().toLowerCase().trim()
    const correct = q.correctAnswer.toString().toLowerCase().trim()

    if (userAnswer === correct) {
      const currentIndex = this.questions.indexOf(q)
      const nextQuestion = this.questions[currentIndex + 1]

      if (nextQuestion) {
        return { nextURL: nextQuestion.id, message: 'Correct' }
      } else {
        return { nextURL: null, message: 'Victory' }
      }
    } else {
      throw new Error('Wrong answer')
    }
  }
}
