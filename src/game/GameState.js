// Game State Management & LocalStorage Persistence

export class GameState {
  constructor() {
    this.score = 0;
    this.carsHit = 0;
    this.stallsHit = 0;
    this.distance = 0;
    this.speed = 0;
    this.battery = 100;
    this.boostEnergy = 100;
    this.isBoosting = false;
    this.isRecharging = false;
    this.collisionPenalty = 0;

    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.gameOverReason = '';

    // Load saved settings
    this.highScore = parseInt(localStorage.getItem('baper_rasta_high_score') || '0', 10);
    this.soundEnabled = localStorage.getItem('baper_rasta_sound') !== 'false';
    this.quality = localStorage.getItem('baper_rasta_quality') || 'medium';

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      listener(event, data, this);
    }
  }

  reset() {
    this.score = 0;
    this.carsHit = 0;
    this.stallsHit = 0;
    this.distance = 0;
    this.speed = 0;
    this.battery = 100;
    this.boostEnergy = 100;
    this.isBoosting = false;
    this.isRecharging = false;
    this.collisionPenalty = 0;
    this.state = 'PLAYING';
    this.gameOverReason = '';
    this.notify('reset', null);
  }

  addScore(points, reason = '') {
    if (this.state !== 'PLAYING') return;
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('baper_rasta_high_score', this.highScore.toString());
    }
    this.notify('score', { points, total: this.score, reason });
  }

  applyCollisionPenalty(penaltyAmount = 500, reason = 'পথচারী দুর্ঘটনার ক্ষতিপূরণ জরিমানা') {
    this.collisionPenalty += penaltyAmount;
    this.score = Math.max(0, this.score - penaltyAmount);
    this.notify('score', { points: -penaltyAmount, total: this.score, reason });
    this.notify('penalty', { penalty: this.collisionPenalty, reason });
  }

  recordVehicleHit() {
    this.carsHit++;
  }

  recordStallHit() {
    this.stallsHit++;
  }

  drainBattery(deltaSeconds) {
    if (this.state !== 'PLAYING') return;
    // Standard drain: 1.5% per second, faster if boosting (6%/s)
    const drainRate = this.isBoosting ? 6.5 : 1.6;
    this.battery = Math.max(0, this.battery - drainRate * deltaSeconds);

    if (this.battery <= 0) {
      this.triggerGameOver('ব্যাটারির চার্জ শেষ! বাপের রাস্তায় টমটম বন্ধ হয়ে গেছে!');
    }
    this.notify('battery', this.battery);
  }

  rechargeBattery(amount = 100) {
    this.battery = Math.min(100, this.battery + amount);
    this.notify('recharge', this.battery);
  }

  updateBoost(deltaSeconds, isRequested) {
    if (isRequested && this.boostEnergy > 5 && this.battery > 5) {
      this.isBoosting = true;
      this.boostEnergy = Math.max(0, this.boostEnergy - 35 * deltaSeconds);
    } else {
      this.isBoosting = false;
      this.boostEnergy = Math.min(100, this.boostEnergy + 20 * deltaSeconds);
    }
  }

  setSpeed(speedKmh) {
    this.speed = speedKmh;
    this.notify('speed', this.speed);
  }

  addDistance(meters) {
    this.distance += meters;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('baper_rasta_sound', this.soundEnabled.toString());
    this.notify('sound', this.soundEnabled);
    return this.soundEnabled;
  }

  setQuality(q) {
    this.quality = q;
    localStorage.setItem('baper_rasta_quality', q);
    this.notify('quality', this.quality);
  }

  triggerGameOver(reason = 'রাস্তায় সংঘর্ষে গাড়ি ভেঙে গেছে!') {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.gameOverReason = reason;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('baper_rasta_high_score', this.highScore.toString());
    }

    this.notify('gameover', {
      score: this.score,
      best: this.highScore,
      cars: this.carsHit,
      stalls: this.stallsHit,
      distance: Math.floor(this.distance),
      penalty: this.collisionPenalty,
      reason: this.gameOverReason
    });
  }
}
