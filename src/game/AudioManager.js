// SoundManager: 3-Channel Audio Engine & Bengali Dialogue Synthesizer for Dhaka Street Driving
import { DialogueManager } from './DialogueManager.js';

export class SoundManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.ctx = null;

    // Dialogue Manager for authentic Bengali audio clips & sequential queues
    this.dialogues = new DialogueManager(this, this.gameState);

    // Channels
    this.masterGain = null;
    this.vehicleGain = null;
    this.sfxGain = null;
    this.dialogueGain = null;

    // Electric Auto-Rickshaw (Tomtom / Easybike) Sound Nodes
    this.motorOsc = null;
    this.gearOsc = null;
    this.rattleNode = null;
    this.rattleGain = null;
    this.motorFilter = null;
    this.isEngineRunning = false;
    this.isInitialized = false;

    // Dialogue State
    this.dialogueMuted = localStorage.getItem('baper_rasta_dialogue_muted') === 'true';
    this.lastDialogueTime = 0;
    this.dialogueCooldown = 2200; // ms
    this._onDialogueCallback = null;

    // Available speech synthesis voice
    this.bengaliVoice = null;
    this.initSpeechSynth();

    // Listen for state changes
    if (this.gameState) {
      this.gameState.subscribe((event, data) => {
        if (event === 'sound') {
          this.setMuted(!data);
        }
      });
    }
  }

  get onDialogueCallback() {
    return this._onDialogueCallback;
  }

  set onDialogueCallback(cb) {
    this._onDialogueCallback = cb;
    if (this.dialogues) {
      this.dialogues.setOnDialogueCallback(cb, this._onDialogueEndCallback);
    }
  }

  setDialogueCallbacks(onStart, onEnd) {
    this._onDialogueCallback = onStart;
    this._onDialogueEndCallback = onEnd;
    if (this.dialogues) {
      this.dialogues.setOnDialogueCallback(onStart, onEnd);
    }
  }

  /**
   * Authentic piercing Dhaka traffic police whistle with pea rattle
   */
  playPoliceWhistle() {
    this.unlock();
    if (this.dialogues) {
      this.dialogues.play('police_whistle', '👮‍♂️ ট্রাফিক পুলিশ: থামেন! গাড়ি থামান!', 'police');
      return;
    }
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const tremolo = this.ctx.createOscillator();
    const tremoloGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2850, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3120, now);

    tremolo.type = 'sine';
    tremolo.frequency.setValueAtTime(18, now);
    tremoloGain.gain.setValueAtTime(140, now);
    tremolo.connect(tremoloGain);
    tremoloGain.connect(osc1.frequency);
    tremoloGain.connect(osc2.frequency);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gain.gain.setValueAtTime(0.5, now + 0.6);
    gain.gain.linearRampToValueAtTime(0, now + 0.7);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    tremolo.start(now);
    osc1.start(now);
    osc2.start(now);
    tremolo.stop(now + 1.65);
    osc1.stop(now + 1.65);
    osc2.stop(now + 1.65);
  }

  initSpeechSynth() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Look for Bengali voices (bn-BD, bn-IN, or containing bangla)
        this.bengaliVoice = voices.find(v =>
          v.lang.toLowerCase().startsWith('bn') ||
          v.name.toLowerCase().includes('bengali') ||
          v.name.toLowerCase().includes('bangla')
        ) || null;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.gameState?.soundEnabled ? 0.75 : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Channel 1: Vehicle Channel
      this.vehicleGain = this.ctx.createGain();
      this.vehicleGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.vehicleGain.connect(this.masterGain);

      // Channel 2: SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Channel 3: Dialogue Channel
      this.dialogueGain = this.ctx.createGain();
      this.dialogueGain.gain.setValueAtTime(this.dialogueMuted ? 0 : 0.95, this.ctx.currentTime);
      this.dialogueGain.connect(this.masterGain);

      this.setupTomtomSynth();
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  unlock() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.75, this.ctx.currentTime, 0.05);
  }

  toggleDialogueMute() {
    this.dialogueMuted = !this.dialogueMuted;
    localStorage.setItem('baper_rasta_dialogue_muted', this.dialogueMuted.toString());
    if (this.dialogueGain && this.ctx) {
      this.dialogueGain.gain.setTargetAtTime(this.dialogueMuted ? 0 : 0.95, this.ctx.currentTime, 0.05);
    }
    return !this.dialogueMuted;
  }

  /**
   * Smooth, pleasant, realistic electric rickshaw hum (mellow, comforting, zero harsh buzz)
   */
  setupTomtomSynth() {
    if (!this.ctx) return;

    // 1. Warm low-frequency primary sine hum (85Hz at idle)
    this.motorOsc = this.ctx.createOscillator();
    this.motorOsc.type = 'sine';
    this.motorOsc.frequency.setValueAtTime(85, this.ctx.currentTime);

    // 2. Soft sub-overtone triangle wave for gentle presence
    this.gearOsc = this.ctx.createOscillator();
    this.gearOsc.type = 'triangle';
    this.gearOsc.frequency.setValueAtTime(170, this.ctx.currentTime);

    // Gentle lowpass filter to keep all frequencies warm and smooth
    this.motorFilter = this.ctx.createBiquadFilter();
    this.motorFilter.type = 'lowpass';
    this.motorFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.motorFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Engine channel gain (soft, comfortable volume)
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // Soft sub-overtone gain
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.motorOsc.connect(this.motorFilter);
    this.gearOsc.connect(subGain);
    subGain.connect(this.motorFilter);
    this.motorFilter.connect(this.engineGain);
    this.engineGain.connect(this.vehicleGain);

    this.motorOsc.start();
    this.gearOsc.start();
  }

  startEngine() {
    this.unlock();
    if (!this.engineGain || !this.ctx) return;
    this.isEngineRunning = true;
    this.engineGain.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.25);
  }

  stopEngine() {
    if (!this.engineGain || !this.ctx) return;
    this.isEngineRunning = false;
    this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
  }

  updateEngine(speedRatio, isBoosting, isBraking = false) {
    if (!this.isEngineRunning || !this.ctx || !this.motorOsc) return;

    const now = this.ctx.currentTime;

    // Smooth gentle frequency curve: 85Hz (idle) -> 175Hz (cruise) -> 220Hz (boost)
    const baseFreq = 85 + speedRatio * 90 + (isBoosting ? 45 : 0);
    this.motorOsc.frequency.setTargetAtTime(baseFreq, now, 0.1);
    this.gearOsc.frequency.setTargetAtTime(baseFreq * 2, now, 0.1);

    // Gentle lowpass filter tracking (never harsh)
    const filterFreq = 260 + speedRatio * 180 + (isBoosting ? 80 : 0);
    this.motorFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);

    // Smooth comfortable volume: 0.05 at idle, up to 0.13 at high speed
    const targetVol = isBraking ? 0.03 : (0.05 + speedRatio * 0.07 + (isBoosting ? 0.04 : 0));
    this.engineGain.gain.setTargetAtTime(targetVol, now, 0.1);
  }

  /**
   * Classic Dhaka Rickshaw / Tomtom air horn ("প্যাঁ প্যাঁ")
   */
  playHorn() {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(740, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1100, now);
    osc2.frequency.exponentialRampToValueAtTime(1180, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.38);
    osc2.stop(now + 0.38);
  }

  /**
   * Crash collision impact sound
   */
  playCrash(intensity = 1.0) {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = Math.min(0.55, 0.38 * intensity);

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(420, now);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + duration);
    subGain.gain.setValueAtTime(0.85 * intensity, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    whiteNoise.start(now);
    subOsc.start(now);
    whiteNoise.stop(now + duration);
    subOsc.stop(now + duration);
  }

  /**
   * Cartoon Slapstick arrest sound effect
   */
  playSlapstickArrest() {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Comedic spring / cartoon boing
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Turbo Boost whoosh sound
   */
  playBoost() {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.3);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  /**
   * Battery recharge chime
   */
  playRecharge() {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /**
   * Speak or synthesize fictional Bengali dialogue
   * @param {string} text Bengali dialogue string
   * @param {'crowd'|'driver'|'pedestrian'} speaker
   * @param {boolean} force Force play ignoring cooldown
   */
  speakDialogue(text, speaker = 'crowd', force = false) {
    const nowMs = Date.now();
    if (!force && nowMs - this.lastDialogueTime < this.dialogueCooldown) {
      return;
    }
    this.lastDialogueTime = nowMs;

    // Trigger visual speech bubble callback
    if (this.onDialogueCallback) {
      this.onDialogueCallback(text, speaker);
    }

    if (this.dialogueMuted) return;
    this.unlock();

    // 1. Try Browser Speech Synthesis
    let speechSucceeded = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // clear previous utterance
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.bengaliVoice) {
          utterance.voice = this.bengaliVoice;
          utterance.lang = this.bengaliVoice.lang;
        } else {
          utterance.lang = 'bn-BD';
        }

        if (speaker === 'driver') {
          utterance.pitch = 1.45; // Comical crying pitch
          utterance.rate = 1.05;
        } else if (speaker === 'crowd') {
          utterance.pitch = 1.05;
          utterance.rate = 1.15;
        } else {
          utterance.pitch = 1.25;
          utterance.rate = 1.2;
        }

        utterance.volume = 0.95;
        window.speechSynthesis.speak(utterance);
        speechSucceeded = true;
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }

    // 2. Procedural Comic Speech-Cadence Audio Fallback
    // Plays expressive vocal formants so dialogue has clear comic audio presence even if speech synth is silent
    this.playProceduralVoiceCadence(speaker);
  }

  /**
   * Plays a cartoon expressive vocal cadence through the Web Audio dialogue channel
   */
  playProceduralVoiceCadence(speaker) {
    if (!this.ctx || !this.dialogueGain) return;

    const now = this.ctx.currentTime;
    const syllables = (speaker === 'driver') ? [320, 260, 380, 290] : [240, 310, 220, 340, 260];
    const dur = 0.11;

    syllables.forEach((baseFreq, i) => {
      const t = now + i * dur;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = (speaker === 'driver') ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t + dur);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(speaker === 'driver' ? 1200 : 850, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.dialogueGain);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  }
}

// Export as both SoundManager and AudioManager for backward compatibility
export { SoundManager as AudioManager };
