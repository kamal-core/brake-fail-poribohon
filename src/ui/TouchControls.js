export class TouchControls {
  constructor(inputManager) {
    this.input = inputManager;
    this.container = document.getElementById('touch-controls');

    this.btnLeft = document.getElementById('touch-left');
    this.btnRight = document.getElementById('touch-right');
    this.btnGas = document.getElementById('touch-gas');
    this.btnBrake = document.getElementById('touch-brake');
    this.btnBoost = document.getElementById('touch-boost');
    this.btnHorn = document.getElementById('touch-horn');

    this.init();
  }

  init() {
    this.bindButton(this.btnLeft, 'left');
    this.bindButton(this.btnRight, 'right');
    this.bindButton(this.btnGas, 'forward');
    this.bindButton(this.btnBrake, 'backward');
    this.bindButton(this.btnBoost, 'boost');
    this.bindButton(this.btnHorn, 'horn');

    // Auto-detect touch device
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 900;
    if (isTouch) {
      this.show();
    }
  }

  bindButton(button, actionName) {
    if (!button) return;

    const startAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.classList.add('active');
      this.input.setTouch(actionName, true);
    };

    const stopAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.classList.remove('active');
      this.input.setTouch(actionName, false);
    };

    button.addEventListener('pointerdown', startAction, { passive: false });
    button.addEventListener('pointerup', stopAction, { passive: false });
    button.addEventListener('pointercancel', stopAction, { passive: false });
    button.addEventListener('pointerleave', stopAction, { passive: false });

    // Prevent right-click context menu on buttons
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  show() {
    this.container?.classList.remove('hidden');
  }

  hide() {
    this.container?.classList.add('hidden');
  }
}
