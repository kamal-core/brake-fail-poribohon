import { toBengaliNumber, formatBengaliCurrency, VIP_ALERTS } from '../utils/BengaliUtils.js';

export class HUD {
  constructor(gameState, soundManager = null) {
    this.gameState = gameState;
    this.soundManager = soundManager;

    this.container = document.getElementById('hud');
    this.scoreVal = document.getElementById('score-val');
    this.batteryVal = document.getElementById('battery-val');
    this.batteryFill = document.getElementById('battery-fill');
    this.speedVal = document.getElementById('speed-val');
    this.alertBanner = document.getElementById('alert-banner');
    this.alertText = document.getElementById('alert-text');
    this.popupContainer = document.getElementById('damage-popup-container');
    this.btnCamera = document.getElementById('btn-camera');
    this.btnSound = document.getElementById('btn-sound');
    this.btnDialogue = document.getElementById('btn-dialogue');
    this.btnPause = document.getElementById('btn-pause');

    // Speech Bubble elements
    this.speechContainer = document.getElementById('speech-bubble-container');
    this.speechBubble = document.getElementById('speech-bubble');
    this.speechSpeaker = document.getElementById('speech-speaker');
    this.speechText = document.getElementById('speech-text');
    this.speechTimeout = null;

    this.displayedScore = 0;
    this.targetScore = 0;
    this.alertTimeout = null;

    this.initEvents();
    this.subscribeToGameState();
  }

  setSoundManager(sm) {
    this.soundManager = sm;
    this.updateDialogueButtonState();
  }

  initEvents() {
    this.btnCamera?.addEventListener('click', () => {
      this.gameState.notify('toggleCamera', true);
    });

    this.btnSound?.addEventListener('click', () => {
      this.gameState.toggleSound();
    });

    this.btnDialogue?.addEventListener('click', () => {
      if (this.soundManager) {
        const enabled = this.soundManager.toggleDialogueMute();
        this.updateDialogueButtonState();
        this.showAlert(enabled ? '🗣️ বাংলা কণ্ঠ সংলাপ চালু' : '🔇 বাংলা কণ্ঠ সংলাপ বন্ধ');
      }
    });

    this.btnPause?.addEventListener('click', () => {
      this.gameState.notify('togglePause', true);
    });
  }

  updateDialogueButtonState() {
    if (this.btnDialogue && this.soundManager) {
      this.btnDialogue.textContent = this.soundManager.dialogueMuted ? '🔇' : '🗣️';
    }
  }

  subscribeToGameState() {
    this.gameState.subscribe((event, data) => {
      switch (event) {
        case 'score':
          this.targetScore = data.total;
          this.showDamagePopup(data.points, data.reason);
          break;
        case 'battery':
          this.updateBattery(data);
          break;
        case 'recharge':
          this.updateBattery(data);
          this.showAlert('⚡ ড্রেন লাইন থেকে ফুল চার্জ সফল!');
          break;
        case 'speed':
          if (this.speedVal) {
            this.speedVal.textContent = toBengaliNumber(data);
          }
          break;
        case 'sound':
          if (this.btnSound) {
            this.btnSound.textContent = data ? '🔊' : '🔇';
          }
          break;
        case 'reset':
          this.displayedScore = 0;
          this.targetScore = 0;
          if (this.scoreVal) this.scoreVal.textContent = '০';
          this.updateBattery(100);
          this.hideSpeechBubble();
          break;
      }
    });
  }

  show() {
    this.container?.classList.remove('hidden');
    this.updateDialogueButtonState();
  }

  hide() {
    this.container?.classList.add('hidden');
    this.hideSpeechBubble();
  }

  update(dt) {
    if (this.displayedScore < this.targetScore) {
      const step = Math.max(15, Math.ceil((this.targetScore - this.displayedScore) * 10 * dt));
      this.displayedScore = Math.min(this.targetScore, this.displayedScore + step);
      if (this.scoreVal) {
        this.scoreVal.textContent = toBengaliNumber(this.displayedScore);
      }
    }
  }

  updateBattery(pct) {
    if (this.batteryVal) {
      this.batteryVal.textContent = `${toBengaliNumber(Math.ceil(pct))}%`;
    }
    if (this.batteryFill) {
      this.batteryFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      if (pct < 20) {
        this.batteryFill.style.background = '#e63946';
      } else if (pct < 50) {
        this.batteryFill.style.background = '#ffb703';
      } else {
        this.batteryFill.style.background = 'linear-gradient(90deg, #ff4757 0%, #ffd100 40%, #2ed573 100%)';
      }
    }
  }

  showDamagePopup(points, reason) {
    if (!this.popupContainer) return;
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = `+${formatBengaliCurrency(points)} ${reason ? `(${reason})` : ''}`;
    this.popupContainer.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 1200);
  }

  showAlert(message) {
    if (!this.alertBanner || !this.alertText) return;
    this.alertText.textContent = message;
    this.alertBanner.classList.remove('hidden');

    clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      this.alertBanner.classList.add('hidden');
    }, 4500);
  }

  /**
   * Display comic speech bubble for fictional Bengali dialogue
   */
  showSpeechBubble(text, speaker = 'crowd') {
    if (!this.speechContainer || !this.speechBubble || !this.speechSpeaker || !this.speechText) return;

    if (!text) {
      this.hideSpeechBubble();
      return;
    }

    this.speechText.textContent = text;
    this.speechBubble.className = 'comic-speech-bubble';

    if (speaker === 'driver') {
      this.speechSpeaker.textContent = '🛺 ড্রাইভার (কান্নাকাটি):';
      this.speechBubble.classList.add('speaker-driver');
    } else if (speaker === 'crowd') {
      this.speechSpeaker.textContent = '🏃‍♂️ ক্ষুব্ধ পাবলিক (ধাওয়া):';
      this.speechBubble.classList.add('speaker-crowd');
    } else if (speaker === 'police') {
      this.speechSpeaker.textContent = '👮‍♂️ ট্রাফিক পুলিশ:';
      this.speechBubble.classList.add('speaker-police');
    } else {
      this.speechSpeaker.textContent = '🚶 পথচারী:';
      this.speechBubble.classList.add('speaker-pedestrian');
    }

    this.speechContainer.classList.remove('hidden');

    clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      this.hideSpeechBubble();
    }, 4500);
  }

  hideSpeechBubble() {
    this.speechContainer?.classList.add('hidden');
  }
}
