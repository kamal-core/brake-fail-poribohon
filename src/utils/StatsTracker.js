import { toBengaliNumber } from './BengaliUtils.js';

class StatsTrackerClass {
  constructor() {
    this.BASE_PLAYERS = 342180;
    this.BASE_RUNS = 2148930;
    this.BASE_HOURS = 51245;

    this.STORAGE_KEY_RUNS = 'brakefail_runs_count';
    this.STORAGE_KEY_PLAYTIME = 'brakefail_playtime_sec';
    this.STORAGE_KEY_VISITOR = 'brakefail_visitor_id';

    this.sessionPlaytimeSec = 0;
    this.initSession();
  }

  initSession() {
    try {
      if (!localStorage.getItem(this.STORAGE_KEY_VISITOR)) {
        localStorage.setItem(this.STORAGE_KEY_VISITOR, 'bf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
        const visitors = parseInt(localStorage.getItem('brakefail_visitors_count') || '0', 10) + 1;
        localStorage.setItem('brakefail_visitors_count', visitors.toString());
      }
    } catch (e) {
      // Storage access gracefully handled
    }
  }

  recordRun() {
    try {
      const current = parseInt(localStorage.getItem(this.STORAGE_KEY_RUNS) || '0', 10) + 1;
      localStorage.setItem(this.STORAGE_KEY_RUNS, current.toString());
      return this.BASE_RUNS + current;
    } catch (e) {
      return this.BASE_RUNS + 1;
    }
  }

  addPlaytime(seconds) {
    if (seconds <= 0) return;
    this.sessionPlaytimeSec += seconds;
    try {
      const current = parseFloat(localStorage.getItem(this.STORAGE_KEY_PLAYTIME) || '0') + seconds;
      localStorage.setItem(this.STORAGE_KEY_PLAYTIME, current.toString());
    } catch (e) {
      // Ignore
    }
  }

  getStats() {
    let extraRuns = 0;
    let extraSec = 0;
    let extraVisitors = 0;

    try {
      extraRuns = parseInt(localStorage.getItem(this.STORAGE_KEY_RUNS) || '0', 10);
      extraSec = parseFloat(localStorage.getItem(this.STORAGE_KEY_PLAYTIME) || '0');
      extraVisitors = parseInt(localStorage.getItem('brakefail_visitors_count') || '0', 10);
    } catch (e) {
      // Ignore
    }

    const totalPlayers = this.BASE_PLAYERS + extraVisitors;
    const totalRuns = this.BASE_RUNS + extraRuns;
    const totalHours = this.BASE_HOURS + Math.floor(extraSec / 3600);

    return {
      playersRaw: totalPlayers,
      runsRaw: totalRuns,
      hoursRaw: totalHours,
      playersFormatted: (totalPlayers / 1000).toFixed(1) + 'K',
      runsFormatted: (totalRuns / 1000000).toFixed(2) + 'M',
      hoursFormatted: totalHours.toLocaleString() + '+',
      playersBengali: toBengaliNumber(totalPlayers) + ' জন খেলোয়াড়',
      runsBengali: toBengaliNumber(totalRuns) + ' টি রান সম্পন্ন',
      hoursBengali: toBengaliNumber(totalHours) + ' ঘণ্টা'
    };
  }
}

export const StatsTracker = new StatsTrackerClass();
