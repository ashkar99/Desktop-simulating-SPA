/**
 * A shared audio utility to handle sound effects across all apps.
 */
export class SoundPlayer {
  /**
   * Plays a sound file from the ./audio/ directory.
   * @param {string} name - The name of the audio file without extension (e.g., 'win').
   * @param {number} [volume=0.5] - Volume level between 0.0 and 1.0.
   */
  static play (name, volume = 0.5) {
    const audio = new window.Audio(`./audio/${name}.mp3`)
    audio.volume = volume
    audio.play().catch(e => {
      // Catch autoplay restrictions or missing files to prevent crashing
    })
  }
}