import { StatsTracker } from '../utils/StatsTracker.js';
import { toBengaliNumber, formatBengaliCurrency } from '../utils/BengaliUtils.js';

export class Menu {
  constructor(gameState, onStartPlay, onRestart, onMenu) {
    this.gameState = gameState;
    this.onStartPlay = onStartPlay;
    this.onRestart = onRestart;
    this.onMenu = onMenu;

    // Home / Start Menu Elements (Image 1)
    this.menuOverlay = document.getElementById('menu-overlay');
    this.btnPlay = document.getElementById('btn-play');
    this.btnAbout = document.getElementById('btn-about');
    this.btnOpenDisclaimer = document.getElementById('btn-open-disclaimer');
    this.menuHighScore = document.getElementById('menu-high-score');

    // About Us Overlay Elements (Image 2)
    this.aboutOverlay = document.getElementById('about-overlay');
    this.btnNavHome = document.getElementById('btn-nav-home');
    this.btnNavPlay = document.getElementById('btn-nav-play');
    this.btnNavPlayCta = document.getElementById('btn-nav-play-cta');
    this.btnNavDisclaimer = document.getElementById('btn-nav-disclaimer');
    this.btnBackFromAbout = document.getElementById('btn-back-from-about');

    // Disclaimer Modal Elements
    this.disclaimerModal = document.getElementById('disclaimer-modal');
    this.btnCloseDisclaimer = document.getElementById('btn-close-disclaimer');

    // Game Over & Breaking News Tabloid Elements
    this.gameOverModal = document.getElementById('game-over-modal');
    this.goHeadline = document.getElementById('go-headline');
    this.hospitalCanvas = document.getElementById('hospital-canvas');
    this.gameOverReason = document.getElementById('game-over-reason');
    this.goScore = document.getElementById('go-score');
    this.goPenalty = document.getElementById('go-penalty');
    this.goCars = document.getElementById('go-cars');
    this.goStalls = document.getElementById('go-stalls');
    this.goDistance = document.getElementById('go-distance');
    this.goBest = document.getElementById('go-best');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnMenu = document.getElementById('btn-menu');

    this.initEvents();
  }

  initEvents() {
    // 1. Play Button on Home Screen
    this.btnPlay?.addEventListener('click', () => {
      this.hideStartMenu();
      this.hideAboutPage();
      this.hideDisclaimer();
      if (this.onStartPlay) this.onStartPlay();
    });

    // 2. Play Buttons on About Us Page
    const startFromAbout = () => {
      this.hideAboutPage();
      this.hideStartMenu();
      this.hideDisclaimer();
      if (this.onStartPlay) this.onStartPlay();
    };
    this.btnNavPlay?.addEventListener('click', startFromAbout);
    this.btnNavPlayCta?.addEventListener('click', startFromAbout);

    // 3. Navigation to About Page
    this.btnAbout?.addEventListener('click', () => {
      this.showAboutPage();
    });

    // 4. Return to Home Screen from About Page
    const backToHome = () => {
      this.showStartMenu();
    };
    this.btnNavHome?.addEventListener('click', backToHome);
    this.btnBackFromAbout?.addEventListener('click', backToHome);

    // 5. Open & Close Disclaimer Modal
    this.btnOpenDisclaimer?.addEventListener('click', () => {
      this.showDisclaimer();
    });
    this.btnNavDisclaimer?.addEventListener('click', () => {
      this.showDisclaimer();
    });
    this.btnCloseDisclaimer?.addEventListener('click', () => {
      this.hideDisclaimer();
    });

    // 6. Game Over Actions
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

    // 7. Subscribe to Game State events
    this.gameState.subscribe((event, data) => {
      if (event === 'gameover') {
        this.showGameOver(data);
      }
    });
  }

  showStartMenu() {
    this.aboutOverlay?.classList.add('hidden');
    this.disclaimerModal?.classList.add('hidden');
    this.menuOverlay?.classList.remove('hidden');
  }

  hideStartMenu() {
    this.menuOverlay?.classList.add('hidden');
  }

  showAboutPage() {
    this.menuOverlay?.classList.add('hidden');
    this.disclaimerModal?.classList.add('hidden');
    this.aboutOverlay?.classList.remove('hidden');

    // Update dynamic live stats
    const stats = StatsTracker.getStats();
    const elPlayers = document.getElementById('stat-players-num');
    const elRuns = document.getElementById('stat-runs-num');
    const elHours = document.getElementById('stat-hours-num');

    if (elPlayers) elPlayers.textContent = stats.playersFormatted;
    if (elRuns) elRuns.textContent = stats.runsFormatted;
    if (elHours) elHours.textContent = stats.hoursFormatted;
  }

  hideAboutPage() {
    this.aboutOverlay?.classList.add('hidden');
  }

  showDisclaimer() {
    this.disclaimerModal?.classList.remove('hidden');
  }

  hideDisclaimer() {
    this.disclaimerModal?.classList.add('hidden');
  }

  /**
   * Comedic Dhaka tabloid news headlines matching collision cause
   */
  getComedicHeadline(reason = '') {
    const r = reason.toLowerCase();
    if (r.includes('বাস') || r.includes('বিহঙ্গ') || r.includes('bus')) {
      return 'বড় বাসের ছাদে রিকশার শুভ মহরত! যাত্রীদের উল্লাস!';
    }
    if (r.includes('পাবলিক') || r.includes('গণধোলাই') || r.includes('ধাওয়া')) {
      return 'পাবলিকের মাইর খেয়ে চালকের হালুয়া টাইট: হাসপাতালে স্যালাইন চলছে!';
    }
    if (r.includes('আন্দোলন') || r.includes('ব্যারিকেড')) {
      return 'আন্দোলনের ব্যারিকেডে ঢুকে চালকের লঙ্কাকাণ্ড! গণধোলাই খেয়ে হাসপাতালে!';
    }
    if (r.includes('চার্জ') || r.includes('ব্যাটারি')) {
      return 'ড্রেন লাইনে বিদ্যুৎ চুরি করতে গিয়ে শট খেয়ে চালক ও রিকশা উভয়েই স্তব্ধ!';
    }
    if (r.includes('টং') || r.includes('দোকান')) {
      return 'চায়ের দোকানে টমটমের অভিযান: ৫০ কেটলি চা মাটিতে, দোকানির আহাজারি!';
    }
    return 'ব্রেক ছাড়া ঢাকার রাস্তায় রিকশা নিয়ে দুঃসাহসিক অভিযান সমাপ্ত!';
  }

  /**
   * Procedural Hospital Bed Illustration on Canvas
   */
  drawHospitalBed(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Hospital room wall & floor
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, w, h * 0.75);

    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    ctx.fillStyle = '#78909c';
    ctx.fillRect(0, h * 0.73, w, 4);

    // Red Cross medical emblem
    ctx.fillStyle = '#ef5350';
    ctx.fillRect(w * 0.5 - 4, 16, 8, 24);
    ctx.fillRect(w * 0.5 - 12, 24, 24, 8);

    // 1. IV Drip Stand
    ctx.strokeStyle = '#546e7a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 175);
    ctx.lineTo(40, 30);
    ctx.lineTo(55, 30);
    ctx.stroke();

    ctx.fillStyle = '#e1f5fe';
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(46, 32, 18, 38, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(3, 169, 244, 0.45)';
    ctx.fillRect(48, 48, 14, 20);

    ctx.strokeStyle = 'rgba(2, 136, 209, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(55, 70);
    ctx.bezierCurveTo(60, 110, 110, 120, 165, 118);
    ctx.stroke();

    // 2. Hospital Bed
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 4;
    ctx.strokeRect(90, 75, 10, 85);
    ctx.strokeRect(90, 95, 10, 65);

    ctx.fillStyle = '#455a64';
    ctx.fillRect(95, 125, 260, 10);
    ctx.fillRect(105, 135, 8, 40);
    ctx.fillRect(335, 135, 8, 40);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 112, 250, 15);

    // Pillow
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(140, 108, 22, 12, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Driver
    ctx.fillStyle = '#8d5b4c';
    ctx.beginPath();
    ctx.arc(145, 100, 16, 0, Math.PI * 2);
    ctx.fill();

    // Bandage
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(144, 96, 17, Math.PI * 0.7, Math.PI * 2.1);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(142, 90, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Dizzy Eyes
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(140, 102, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillRect(139, 101, 2, 2);

    ctx.beginPath();
    ctx.moveTo(148, 99);
    ctx.lineTo(154, 105);
    ctx.moveTo(154, 99);
    ctx.lineTo(148, 105);
    ctx.stroke();

    // Blanket
    ctx.fillStyle = '#42a5f5';
    ctx.strokeStyle = '#1e88e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(155, 108, 180, 24, [8, 8, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // 4. Elevated Leg & Pulley
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(345, 140);
    ctx.lineTo(345, 25);
    ctx.lineTo(290, 25);
    ctx.stroke();

    ctx.fillStyle = '#90a4ae';
    ctx.beginPath();
    ctx.arc(290, 25, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(290, 32);
    ctx.lineTo(275, 75);
    ctx.stroke();

    ctx.save();
    ctx.translate(245, 95);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, 52, 16, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8d5b4c';
    ctx.beginPath();
    ctx.arc(52, 8, 5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#d32f2f';
    ctx.fillText('হালুয়া টাইট!', 6, 11);
    ctx.restore();
  }

  showGameOver(data) {
    if (!this.gameOverModal) return;

    const headline = this.getComedicHeadline(data.reason);
    if (this.goHeadline) {
      this.goHeadline.textContent = headline;
    }

    if (this.hospitalCanvas) {
      this.drawHospitalBed(this.hospitalCanvas);
    }

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
