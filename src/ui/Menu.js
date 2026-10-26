import { toBengaliNumber, formatBengaliCurrency } from '../utils/BengaliUtils.js';

export class Menu {
  constructor(gameState, onStartPlay, onRestart, onMenu) {
    this.gameState = gameState;
    this.onStartPlay = onStartPlay;
    this.onRestart = onRestart;
    this.onMenu = onMenu;

    this.menuOverlay = document.getElementById('menu-overlay');
    this.btnPlay = document.getElementById('btn-play');
    this.menuHighScore = document.getElementById('menu-high-score');

    this.gameOverModal = document.getElementById('game-over-modal');
    this.gameOverReason = document.getElementById('game-over-reason');
    this.goScore = document.getElementById('go-score');
    this.goPenalty = document.getElementById('go-penalty');
    this.goCars = document.getElementById('go-cars');
    this.goStalls = document.getElementById('go-stalls');
    this.goDistance = document.getElementById('go-distance');
    this.goBest = document.getElementById('go-best');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnMenu = document.getElementById('btn-menu');

    this.qualityBtns = document.querySelectorAll('.quality-btn');

    this.initEvents();
    this.updateHighScore();
  }

  initEvents() {
    this.btnPlay?.addEventListener('click', () => {
      this.hideStartMenu();
      if (this.onStartPlay) this.onStartPlay();
    });

    this.btnRestart?.addEventListener('click', () => {
      this.hideGameOver();
      if (this.onRestart) this.onRestart();
    });

    this.btnMenu?.addEventListener('click', () => {
      this.hideGameOver();
      this.showStartMenu();
      if (this.onMenu) {
        this.onMenu();
      } else {
        this.gameState.state = 'MENU';
      }
    });

    // Quality buttons
    this.qualityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.qualityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const quality = btn.getAttribute('data-quality');
        this.gameState.setQuality(quality);
      });
    });

    // Listen to gameover event
    this.gameState.subscribe((event, data) => {
      if (event === 'gameover') {
        this.showGameOver(data);
      }
    });
  }

  updateHighScore() {
    if (this.menuHighScore) {
      this.menuHighScore.textContent = formatBengaliCurrency(this.gameState.highScore);
    }
  }

  showStartMenu() {
    this.updateHighScore();
    this.menuOverlay?.classList.remove('hidden');
  }

  hideStartMenu() {
    this.menuOverlay?.classList.add('hidden');
  }

  showGameOver(data) {
    if (!this.gameOverModal) return;

    if (this.gameOverReason) this.gameOverReason.textContent = data.reason;
    if (this.goScore) this.goScore.textContent = formatBengaliCurrency(data.score);
    if (this.goPenalty) this.goPenalty.textContent = formatBengaliCurrency(data.penalty || 0);
    if (this.goCars) this.goCars.textContent = `${toBengaliNumber(data.cars)} টি`;
    if (this.goStalls) this.goStalls.textContent = `${toBengaliNumber(data.stalls)} টি`;
    if (this.goDistance) this.goDistance.textContent = `${toBengaliNumber(data.distance)} মিটার`;
    if (this.goBest) this.goBest.textContent = formatBengaliCurrency(data.best);

    this.gameOverModal.classList.remove('hidden');
  }

  hideGameOver() {
    this.gameOverModal?.classList.add('hidden');
  }
}
