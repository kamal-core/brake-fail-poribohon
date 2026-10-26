// Unified Input Manager for Keyboard and Touch

export class InputManager {
  constructor(audioManager, gameState) {
    this.audio = audioManager;
    this.gameState = gameState;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      boost: false,
      handbrake: false
    };

    this.touch = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      boost: false,
      handbrake: false
    };

    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);

    this.init();
  }

  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  handleKeyDown(e) {
    // Unlock Web Audio on first key interaction
    this.audio?.unlock();

    // Prevent default scroll on gameplay keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.boost = true;
        break;
      case 'Space':
        this.keys.handbrake = true;
        break;
      case 'KeyC':
        this.gameState?.notify('toggleCamera', true);
        break;
      case 'KeyH':
        this.audio?.playHorn();
        this.gameState?.notify('horn', true);
        break;
      case 'KeyM':
        this.gameState?.toggleSound();
        break;
      case 'Escape':
      case 'KeyP':
        this.gameState?.notify('togglePause', true);
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.boost = false;
        break;
      case 'Space':
        this.keys.handbrake = false;
        break;
    }
  }

  setTouch(action, active) {
    this.audio?.unlock();
    if (action === 'horn' && active) {
      this.audio?.playHorn();
      this.gameState?.notify('horn', true);
      return;
    }
    if (this.touch.hasOwnProperty(action)) {
      this.touch[action] = !!active;
    }
  }

  get isForward() {
    return this.keys.forward || this.touch.forward;
  }

  get isBackward() {
    return this.keys.backward || this.touch.backward;
  }

  get isLeft() {
    return this.keys.left || this.touch.left;
  }

  get isRight() {
    return this.keys.right || this.touch.right;
  }

  get isBoost() {
    return this.keys.boost || this.touch.boost;
  }

  get isHandbrake() {
    return this.keys.handbrake || this.touch.handbrake;
  }
}
