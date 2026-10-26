import * as THREE from 'three';

/**
 * Cartoon Comic Visual Effects: Stars, Comic Spikes, Dust Puffs, Screen Flash
 */
export class CartoonEffects {
  constructor(scene) {
    this.scene = scene;
    this.activeEffects = [];

    // Pre-create star canvas texture
    this.starTexture = this.createStarTexture();
    this.powTexture = this.createComicTextTexture('ঢিশুম! 💥');
    this.dustTexture = this.createDustPuffTexture();

    // Additional comic slapstick fight textures
    this.fightBursts = [
      this.createComicTextTexture('ধিসুম! 💥'),
      this.createComicTextTexture('ধাসুম! 🥊'),
      this.createComicTextTexture('কিল-ঘুষি! ⭐'),
      this.createComicTextTexture('চিত-পটাং! 💫')
    ];

    // Screen flash overlay element
    this.flashEl = document.createElement('div');
    this.flashEl.className = 'comic-screen-flash';
    document.body.appendChild(this.flashEl);
  }

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffd100';
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 6;

    // 5-pointed comic star
    const cx = 64, cy = 64, outerR = 52, innerR = 24;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = (i % 2 === 0) ? outerR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createComicTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Comic burst background
    ctx.fillStyle = '#ffb703';
    ctx.strokeStyle = '#d90429';
    ctx.lineWidth = 8;

    const cx = 128, cy = 64;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const r = (i % 2 === 0) ? 58 : 38;
      const a = (i * Math.PI) / 8;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 34px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, cx, cy);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createDustPuffTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(230, 220, 200, 0.85)';
    ctx.beginPath();
    ctx.arc(64, 64, 40, 0, Math.PI * 2);
    ctx.arc(44, 50, 28, 0, Math.PI * 2);
    ctx.arc(84, 50, 28, 0, Math.PI * 2);
    ctx.arc(64, 40, 26, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Spawn comic accident burst at world position
   */
  spawnAccidentBurst(position) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.position.y += 1.2;

    // 1. Comic text sprite ("ঢিশুম! 💥")
    const textMat = new THREE.SpriteMaterial({ map: this.powTexture, transparent: true, depthWrite: false });
    const textSprite = new THREE.Sprite(textMat);
    textSprite.scale.set(2.4, 1.2, 1);
    group.add(textSprite);

    // 2. Ring of spinning stars
    const starCount = 5;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      const starMat = new THREE.SpriteMaterial({ map: this.starTexture, transparent: true, depthWrite: false });
      const star = new THREE.Sprite(starMat);
      star.scale.set(0.7, 0.7, 1);
      const angle = (i * Math.PI * 2) / starCount;
      star.position.set(Math.cos(angle) * 1.2, Math.sin(angle) * 0.7, 0);
      group.add(star);
      stars.push(star);
    }

    this.scene.add(group);

    // Screen flash
    this.triggerScreenFlash();

    this.activeEffects.push({
      group,
      stars,
      life: 0,
      maxLife: 0.85,
      type: 'accident'
    });
  }

  /**
   * Spawn slapstick arrest dust cloud & star storm around vehicle
   */
  spawnArrestCloud(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const puffs = [];
    for (let i = 0; i < 8; i++) {
      const puffMat = new THREE.SpriteMaterial({ map: this.dustTexture, transparent: true, opacity: 0.9, depthWrite: false });
      const puff = new THREE.Sprite(puffMat);
      puff.scale.set(1.8 + Math.random(), 1.8 + Math.random(), 1);
      puff.position.set(
        (Math.random() - 0.5) * 2.2,
        0.8 + Math.random() * 1.2,
        (Math.random() - 0.5) * 2.2
      );
      group.add(puff);
      puffs.push(puff);
    }

    // Swirling comic stars
    const stars = [];
    for (let i = 0; i < 6; i++) {
      const starMat = new THREE.SpriteMaterial({ map: this.starTexture, transparent: true, depthWrite: false });
      const star = new THREE.Sprite(starMat);
      star.scale.set(0.8, 0.8, 1);
      group.add(star);
      stars.push(star);
    }

    this.scene.add(group);

    this.activeEffects.push({
      group,
      puffs,
      stars,
      life: 0,
      maxLife: 2.2,
      type: 'arrest'
    });
  }

  /**
   * Spawn exaggerated non-graphic slapstick cartoon fight sequence around vehicle
   */
  spawnSlapstickFight(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    // 1. Swelling dust puffs
    const puffs = [];
    for (let i = 0; i < 10; i++) {
      const puffMat = new THREE.SpriteMaterial({ map: this.dustTexture, transparent: true, opacity: 0.92, depthWrite: false });
      const puff = new THREE.Sprite(puffMat);
      puff.scale.set(1.6 + Math.random() * 1.2, 1.6 + Math.random() * 1.2, 1);
      puff.position.set(
        (Math.random() - 0.5) * 2.4,
        0.7 + Math.random() * 1.4,
        (Math.random() - 0.5) * 2.4
      );
      group.add(puff);
      puffs.push(puff);
    }

    // 2. Swirling cartoon stars
    const stars = [];
    for (let i = 0; i < 8; i++) {
      const starMat = new THREE.SpriteMaterial({ map: this.starTexture, transparent: true, depthWrite: false });
      const star = new THREE.Sprite(starMat);
      star.scale.set(0.85, 0.85, 1);
      group.add(star);
      stars.push(star);
    }

    // 3. Popping Comic Text Bursts ("ধিসুম!", "ধাসুম!", "কিল-ঘুষি!", "চিত-পটাং!")
    const textSprites = [];
    this.fightBursts.forEach((tex, idx) => {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(1.9, 0.95, 1);
      const angle = (idx * Math.PI) / 2 + (Math.random() - 0.5) * 0.4;
      sp.position.set(
        Math.cos(angle) * 1.5,
        1.2 + (idx % 2) * 0.5,
        Math.sin(angle) * 1.5
      );
      group.add(sp);
      textSprites.push({ sprite: sp, basePos: sp.position.clone(), delay: idx * 0.4 });
    });

    this.scene.add(group);
    this.triggerScreenFlash();

    this.activeEffects.push({
      group,
      puffs,
      stars,
      textSprites,
      life: 0,
      maxLife: 2.5,
      type: 'fight'
    });
  }

  triggerScreenFlash() {
    if (!this.flashEl) return;
    this.flashEl.classList.add('flash-active');
    setTimeout(() => {
      this.flashEl.classList.remove('flash-active');
    }, 180);
  }

  update(dt) {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const eff = this.activeEffects[i];
      eff.life += dt;
      const progress = eff.life / eff.maxLife;

      if (eff.type === 'accident') {
        // Expand and float upwards
        eff.group.position.y += dt * 1.5;
        eff.group.scale.setScalar(1.0 + progress * 0.4);

        // Spin stars
        eff.stars.forEach((s, idx) => {
          const a = progress * 6 + idx;
          s.position.x = Math.cos(a) * (1.2 + progress * 0.8);
          s.position.y = Math.sin(a) * (0.8 + progress * 0.5);
          s.material.opacity = 1.0 - progress;
        });
      } else if (eff.type === 'arrest') {
        // Puff dust clouds and swirl stars
        eff.puffs.forEach(p => {
          p.scale.multiplyScalar(1.0 + dt * 0.4);
          p.material.opacity = Math.max(0, 1.0 - progress);
        });

        eff.stars.forEach((s, idx) => {
          const a = progress * 10 + (idx * Math.PI / 3);
          s.position.set(Math.cos(a) * 1.6, 1.4 + Math.sin(a * 2) * 0.4, Math.sin(a) * 1.6);
          s.material.opacity = Math.max(0, 1.0 - progress);
        });
      } else if (eff.type === 'fight') {
        // Exaggerated dust cloud billowing and swirling
        eff.puffs.forEach((p, idx) => {
          p.scale.multiplyScalar(1.0 + dt * 0.35);
          p.position.y += dt * 0.25;
          p.material.opacity = Math.max(0, (1.0 - progress) * 0.95);
        });

        // Fast spinning stars
        eff.stars.forEach((s, idx) => {
          const a = progress * 14 + (idx * Math.PI / 4);
          s.position.set(Math.cos(a) * 1.8, 1.3 + Math.sin(a * 2.5) * 0.5, Math.sin(a) * 1.8);
          s.material.opacity = Math.max(0, 1.0 - progress);
        });

        // Comic punch text bursts popping out sequentially
        eff.textSprites.forEach(({ sprite, basePos, delay }) => {
          const timeSince = eff.life - delay;
          if (timeSince > 0) {
            const burstProgress = Math.min(1, timeSince / 0.8);
            const scale = Math.sin(burstProgress * Math.PI) * 1.8;
            sprite.scale.set(scale, scale * 0.5, 1);
            sprite.position.y = basePos.y + burstProgress * 0.6;
            sprite.material.opacity = Math.max(0, 1.0 - burstProgress);
          } else {
            sprite.scale.set(0, 0, 0);
          }
        });
      }

      if (eff.life >= eff.maxLife) {
        this.scene.remove(eff.group);
        this.activeEffects.splice(i, 1);
      }
    }
  }

  clearAll() {
    this.activeEffects.forEach(eff => {
      this.scene.remove(eff.group);
    });
    this.activeEffects = [];
  }
}
