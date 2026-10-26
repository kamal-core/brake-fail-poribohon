import { Game } from './game/Game.js';

window.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.getElementById('progress-bar-fill');
  const loadingDetail = document.getElementById('loading-detail');

  // Smooth loading progression
  const steps = [
    { pct: 25, text: 'ঢাকা শহরের জ্যাম এবং রাস্তা লোড হচ্ছে...' },
    { pct: 55, text: 'মেট্রোরেলের পিলার এবং পোস্টার সাঁটানো হচ্ছে...' },
    { pct: 80, text: 'টমটম এবং ইজিবাইকে ব্যাটারি লাগানো হচ্ছে...' },
    { pct: 100, text: 'রাস্তায় নামার প্রস্তুতি সম্পন্ন!' }
  ];

  for (const step of steps) {
    if (progressBar) progressBar.style.width = `${step.pct}%`;
    if (loadingDetail) loadingDetail.textContent = step.text;
    await new Promise(r => setTimeout(r, 180));
  }

  // Initialize Game
  try {
    const game = new Game();
    window.__GAME__ = game; // Expose for debugging if needed

    // Fade out loading screen
    setTimeout(() => {
      loadingScreen?.classList.add('hidden');

      // Check query params for instant test drive
      const params = new URLSearchParams(window.location.search);
      if (params.has('play')) {
        game.menu.hideStartMenu();
        game.startPlay();
        if (params.has('gas')) {
          game.input.keys.forward = true;
        }
        if (params.has('steerLeft')) {
          game.input.keys.left = true;
        }
        if (params.has('steerRight')) {
          game.input.keys.right = true;
        }
      }
    }, 250);
  } catch (err) {
    console.error('Failed to initialize game:', err);
    if (loadingDetail) {
      loadingDetail.textContent = 'গেম লোড করতে সমস্যা হয়েছে। দয়া করে পেজটি রিফ্রেশ করুন।';
      loadingDetail.style.color = '#ff4757';
    }
  }
});
