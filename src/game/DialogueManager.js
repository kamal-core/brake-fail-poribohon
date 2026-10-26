/**
 * DialogueManager: Event-Based Bengali Street Dialogue & Audio Playback System
 * Handles sequential audio queuing, fallback voice synthesis, volume/mute,
 * and graceful handling of missing audio files.
 */
export class DialogueManager {
  constructor(audioManager, gameState) {
    this.audioManager = audioManager;
    this.gameState = gameState;

    // Base directory for dialogue audio files (works with relative paths for GitHub & Vercel)
    this.basePath = (import.meta.env?.BASE_URL || './') + 'audio/dialogues/';

    // Dialogue Registry with primary and fallback filenames
    this.dialogueDefs = {
      pedestrian_angry: {
        files: ['pedestrian_angry.wav', 'pedestrian_angry.mp3'],
        text: 'ওই মিয়া! দেইখা চালাইতে পারেন না?',
        speaker: 'pedestrian',
        estimatedDuration: 2.7
      },
      crowd_catch_him: {
        files: ['crowd_catch_him.wav', 'crowd_catch_him.mp3'],
        text: 'ধর শালারে! ধর!',
        speaker: 'crowd',
        estimatedDuration: 1.5
      },
      slapstick_fight: {
        files: ['slapstick_fight.wav', 'slapstick_fight.mp3'],
        text: 'ধিসুম! ধাসুম! কিল! ফুঁসি! চিত-পটাং!',
        speaker: 'sfx',
        estimatedDuration: 2.2
      },
      driver_pleading: {
        files: ['driver_pleading.wav', 'driver_pleading.mp3'],
        text: 'ভাই, গরিব মানুষ, ছাইড়া দেন!',
        speaker: 'driver',
        estimatedDuration: 2.0
      },
      crowd_found_you: {
        files: ['crowd_found_you.wav', 'crowd_found_you.mp3'],
        text: 'পাইছি তোরে! খাইছি তোরে! পালাবি কই?',
        speaker: 'crowd',
        estimatedDuration: 2.4
      }
    };

    // Audio cache and queue state
    this.verifiedUrls = new Map(); // dialogueKey -> verified working URL
    this.audioCache = new Map(); // backward compatibility
    this.activeAudio = null;
    this.queue = [];
    this.isProcessingQueue = false;
    this.onDialogueStartCallback = null;
    this.onDialogueEndCallback = null;
    this.missingFilesLogged = new Set();
    this.pendingTimers = new Set();
  }

  /**
   * Set callback for HUD speech bubble updates
   */
  setOnDialogueCallback(cb) {
    this.onDialogueStartCallback = cb;
  }

  /**
   * Check if dialogue audio is muted
   */
  isMuted() {
    if (this.audioManager && this.audioManager.dialogueMuted) return true;
    if (this.gameState && !this.gameState.soundEnabled) return true;
    return false;
  }

  /**
   * Get current dialogue volume (0.0 to 1.0)
   */
  getVolume() {
    if (this.isMuted()) return 0;
    return 0.95;
  }

  /**
   * Stop currently playing dialogue audio immediately
   */
  stopCurrentAudio() {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
      } catch (e) {}
      this.activeAudio = null;
    }
  }

  /**
   * Tries to find and play an audio file for a dialogue key, checking both .wav and .mp3.
   * If neither exists or playback fails, logs a helpful warning and plays procedural fallback.
   * Returns a Promise that resolves when the dialogue finishes.
   */
  async play(dialogueKey, customText = null, customSpeaker = null) {
    const def = this.dialogueDefs[dialogueKey] || {
      files: [`${dialogueKey}.wav`, `${dialogueKey}.mp3`],
      text: customText || dialogueKey,
      speaker: customSpeaker || 'crowd',
      estimatedDuration: 2.0
    };

    const text = customText || def.text;
    const speaker = customSpeaker || def.speaker;

    // Trigger visual speech bubble
    if (this.onDialogueStartCallback && speaker !== 'sfx') {
      this.onDialogueStartCallback(text, speaker);
    }

    // If muted, wait estimated duration then resolve
    if (this.isMuted()) {
      return this.waitWithTimer(def.estimatedDuration * 1000);
    }

    // Stop any existing active dialogue audio so sounds do not overlap
    this.stopCurrentAudio();

    // Resolve working audio URL
    const audioUrl = await this.resolveAudioUrl(dialogueKey, def);

    if (audioUrl) {
      return new Promise((resolve) => {
        let isResolved = false;
        let safetyTimer = null;

        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.volume = this.getVolume();
        this.activeAudio = audio;

        const cleanup = () => {
          if (isResolved) return;
          isResolved = true;

          if (safetyTimer) {
            clearTimeout(safetyTimer);
            this.pendingTimers.delete(safetyTimer);
          }

          audio.onended = null;
          audio.onerror = null;

          if (this.activeAudio === audio) {
            this.activeAudio = null;
          }

          if (this.onDialogueEndCallback) this.onDialogueEndCallback(dialogueKey);
          resolve();
        };

        audio.onended = cleanup;
        audio.onerror = (e) => {
          this.logMissingWarning(dialogueKey, def.files[0]);
          this.fallbackSpeech(text, speaker);
          cleanup();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Autoplay policy or browser audio restrictions
            this.logMissingWarning(dialogueKey, def.files[0], err.message);
            this.fallbackSpeech(text, speaker);
            cleanup();
          });
        }

        // Safety fallback timer in case ended event doesn't fire
        const duration = (audio.duration && !isNaN(audio.duration) && audio.duration > 0)
          ? audio.duration + 0.3
          : def.estimatedDuration + 0.5;

        safetyTimer = setTimeout(cleanup, duration * 1000);
        this.pendingTimers.add(safetyTimer);
      });
    } else {
      // Audio file not found: Log helpful warning and fallback to synthesizer
      this.logMissingWarning(dialogueKey, def.files.join(' or '));
      this.fallbackSpeech(text, speaker);
      return this.waitWithTimer(def.estimatedDuration * 1000);
    }
  }

  /**
   * Resolves a verified working audio URL for the dialogue definition
   */
  async resolveAudioUrl(dialogueKey, def) {
    if (this.verifiedUrls.has(dialogueKey)) {
      return this.verifiedUrls.get(dialogueKey);
    }

    for (const filename of def.files) {
      const url = `${this.basePath}${filename}`;

      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          this.verifiedUrls.set(dialogueKey, url);
          return url;
        }
      } catch (err) {
        // Fetch check failed, continue to next extension
      }
    }
    return null;
  }

  /**
   * Log helpful warning for missing audio file without spamming
   */
  logMissingWarning(key, filename, details = '') {
    if (!this.missingFilesLogged.has(key)) {
      this.missingFilesLogged.add(key);
      console.warn(`[DialogueManager] Dialogue audio file missing: ${this.basePath}${filename}. ${details} Continuing with comic voice synthesizer fallback.`);
    }
  }

  /**
   * Fallback speech synthesis using AudioManager's vocal cadence & Web Speech API
   */
  fallbackSpeech(text, speaker) {
    if (this.audioManager && typeof this.audioManager.speakDialogue === 'function') {
      this.audioManager.speakDialogue(text, speaker, true);
    }
  }

  /**
   * Helper promise-based timer that can be cancelled on reset
   */
  waitWithTimer(ms) {
    return new Promise((resolve) => {
      const timerId = setTimeout(() => {
        this.pendingTimers.delete(timerId);
        resolve();
      }, ms);
      this.pendingTimers.add(timerId);
    });
  }

  /**
   * Queue a dialogue to be played sequentially after the current one finishes
   */
  queueDialogue(dialogueKey, customText = null, customSpeaker = null) {
    return new Promise((resolve) => {
      this.queue.push({ dialogueKey, customText, customSpeaker, resolve });
      this.processQueue();
    });
  }

  /**
   * Process dialogue queue sequentially
   */
  async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      try {
        await this.play(item.dialogueKey, item.customText, item.customSpeaker);
      } catch (e) {
        console.warn('[DialogueManager] Queue item error:', e);
      }
      if (item.resolve) item.resolve();
    }

    this.isProcessingQueue = false;
  }

  /**
   * Play an entire sequence of dialogue items sequentially with custom delays
   * @param {Array<{ key: string, text?: string, speaker?: string, delayAfter?: number, onStart?: Function }>} steps
   */
  async playSequence(steps) {
    for (const step of steps) {
      if (step.onStart) step.onStart();
      await this.play(step.key, step.text, step.speaker);
      if (step.delayAfter && step.delayAfter > 0) {
        await this.waitWithTimer(step.delayAfter);
      }
    }
  }

  /**
   * Stops all active audio and clears pending queues (e.g. on Restart / Game Over)
   */
  stopAll() {
    this.stopCurrentAudio();

    this.queue = [];
    this.isProcessingQueue = false;

    // Clear all pending timeouts
    this.pendingTimers.forEach(id => clearTimeout(id));
    this.pendingTimers.clear();

    // Cancel speech synthesis if speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}
