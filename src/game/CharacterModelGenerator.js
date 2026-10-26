import * as THREE from 'three';

/**
 * CharacterModelGenerator.js
 * Generates highly detailed, realistic, anatomically proportioned human character models
 * with authentic Bangladeshi Dhaka street attire, natural facial features, and PBR materials.
 */

// Cached procedural canvas textures for maximum performance & visual richness
let eyeTextureCache = null;
let gamchaTextureCache = null;
let lungiTextureCaches = [];
let topiTextureCache = null;
let fabricWeaveCache = null;

// Realistic South Asian skin tones with warm golden/olive/caramel undertones
export const SKIN_TONES = [
  0x9c6145, // Medium warm tan
  0xaa6e4c, // Golden caramel
  0x874e36, // Rich warm deep bronze
  0xb87b5a, // Warm olive tan
  0x733f2a  // Deep bronze
];

// Lip shades matching South Asian skin undertones
export const LIP_TONES = [
  0x8a4943,
  0x96534a,
  0x7d3e38,
  0xa15d54
];

/**
 * Procedural Eye Texture with limbal ring, iris fibers, pupil and specular glint
 */
export function getEyeTexture() {
  if (eyeTextureCache) return eyeTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Sclera base (soft warm white)
  const bgGrad = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
  bgGrad.addColorStop(0, '#f9f6f0');
  bgGrad.addColorStop(0.85, '#ede6dd');
  bgGrad.addColorStop(1.0, '#d8cbbe');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle sclera blood vessels at the edge
  ctx.strokeStyle = 'rgba(180, 80, 70, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 64); ctx.quadraticCurveTo(28, 55, 42, 60);
  ctx.moveTo(118, 64); ctx.quadraticCurveTo(100, 70, 86, 64);
  ctx.stroke();

  // Dark limbal ring
  ctx.fillStyle = '#180c06';
  ctx.beginPath();
  ctx.arc(64, 64, 38, 0, Math.PI * 2);
  ctx.fill();

  // Iris gradient (rich hazel-brown South Asian eye color)
  const irisGrad = ctx.createRadialGradient(64, 64, 10, 64, 64, 37);
  irisGrad.addColorStop(0, '#542d13');
  irisGrad.addColorStop(0.5, '#3b1c09');
  irisGrad.addColorStop(0.85, '#241005');
  irisGrad.addColorStop(1.0, '#120802');
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(64, 64, 36, 0, Math.PI * 2);
  ctx.fill();

  // Radial iris fibers
  ctx.strokeStyle = 'rgba(120, 70, 30, 0.28)';
  ctx.lineWidth = 1;
  for (let a = 0; a < Math.PI * 2; a += 0.2) {
    ctx.beginPath();
    ctx.moveTo(64 + Math.cos(a) * 14, 64 + Math.sin(a) * 14);
    ctx.lineTo(64 + Math.cos(a) * 34, 64 + Math.sin(a) * 34);
    ctx.stroke();
  }

  // Pitch black pupil
  ctx.fillStyle = '#060302';
  ctx.beginPath();
  ctx.arc(64, 64, 15, 0, Math.PI * 2);
  ctx.fill();

  // Primary corneal light reflection / glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(56, 54, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Secondary soft bounce glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(71, 72, 2.5, 0, Math.PI * 2);
  ctx.fill();

  eyeTextureCache = new THREE.CanvasTexture(canvas);
  eyeTextureCache.wrapS = THREE.ClampToEdgeWrapping;
  eyeTextureCache.wrapT = THREE.ClampToEdgeWrapping;
  return eyeTextureCache;
}

/**
 * Procedural Red-and-White Checkered Gamcha (গামছা) Texture
 */
export function getGamchaTexture() {
  if (gamchaTextureCache) return gamchaTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Vibrant Bengali red cloth base
  ctx.fillStyle = '#c71f2d';
  ctx.fillRect(0, 0, 256, 256);

  // Checkered grid lines in white and yellow
  ctx.strokeStyle = 'rgba(255, 245, 230, 0.75)';
  ctx.lineWidth = 6;
  for (let x = 0; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Thin yellow accent cross-checks
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
  ctx.lineWidth = 2.5;
  for (let x = 16; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 16; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Cloth micro-texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 1, 1);
  }

  gamchaTextureCache = new THREE.CanvasTexture(canvas);
  gamchaTextureCache.wrapS = THREE.RepeatWrapping;
  gamchaTextureCache.wrapT = THREE.RepeatWrapping;
  gamchaTextureCache.repeat.set(2, 2);
  return gamchaTextureCache;
}

/**
 * Procedural Bangladeshi Lungi (লুঙ্গি) Checked Textures
 */
export function getLungiTexture(styleIndex = 0) {
  if (lungiTextureCaches[styleIndex]) return lungiTextureCaches[styleIndex];

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const themes = [
    { base: '#1b3b6f', line1: '#60a5fa', line2: '#93c5fd', accent: '#f59e0b' }, // Blue classic
    { base: '#134e4a', line1: '#2dd4bf', line2: '#a7f3d0', accent: '#facc15' }, // Teal green
    { base: '#4c1d95', line1: '#a78bfa', line2: '#c4b5fd', accent: '#fb923c' }, // Royal purple
    { base: '#374151', line1: '#9ca3af', line2: '#e5e7eb', accent: '#ef4444' }  // Slate charcoal
  ];
  const t = themes[styleIndex % themes.length];

  ctx.fillStyle = t.base;
  ctx.fillRect(0, 0, 256, 256);

  // Thick woven stripes
  ctx.strokeStyle = t.line1;
  ctx.lineWidth = 8;
  for (let p = 0; p < 256; p += 48) {
    ctx.strokeRect(p, 0, 24, 256);
    ctx.strokeRect(0, p, 256, 24);
  }

  // Thin double pinstripes
  ctx.strokeStyle = t.line2;
  ctx.lineWidth = 2;
  for (let p = 0; p < 256; p += 24) {
    ctx.beginPath();
    ctx.moveTo(p, 0); ctx.lineTo(p, 256);
    ctx.moveTo(0, p); ctx.lineTo(256, p);
    ctx.stroke();
  }

  // Golden / Orange weaver line
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 1.5;
  for (let p = 12; p < 256; p += 48) {
    ctx.beginPath();
    ctx.moveTo(p, 0); ctx.lineTo(p, 256);
    ctx.moveTo(0, p); ctx.lineTo(256, p);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  lungiTextureCaches[styleIndex] = tex;
  return tex;
}

/**
 * Procedural White Islamic Prayer Cap (জালি টুপি) Texture with delicate openwork pattern
 */
export function getTopiTexture() {
  if (topiTextureCache) return topiTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 128, 128);

  // Crochet lattice eyelets
  ctx.fillStyle = '#cbd5e1';
  for (let y = 8; y < 128; y += 14) {
    const shift = (y % 28 === 0) ? 0 : 7;
    for (let x = shift; x < 128; x += 14) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  topiTextureCache = new THREE.CanvasTexture(canvas);
  topiTextureCache.wrapS = THREE.RepeatWrapping;
  topiTextureCache.wrapT = THREE.RepeatWrapping;
  topiTextureCache.repeat.set(3, 1);
  return topiTextureCache;
}

/**
 * Builds an organically proportioned human head with realistic facial anatomy,
 * eye sockets, eyelids, nose bridge, nostrils, lips, ears, and hair/beard options.
 */
export function buildRealisticHead(options = {}) {
  const {
    skinColor = SKIN_TONES[0],
    hairColor = 0x141416,
    hasMustache = true,
    hasBeard = false,
    hasTopi = false,
    hairStyle = 'gentleman', // 'gentleman' | 'fade' | 'elder' | 'female' | 'bald'
    isFemale = false,
    scale = 1.0
  } = options;

  const headGroup = new THREE.Group();

  // 1. Physically Based Skin Material with realistic softness
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65,
    metalness: 0.04
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.88,
    metalness: 0.05
  });

  const lipMat = new THREE.MeshStandardMaterial({
    color: LIP_TONES[Math.floor(Math.random() * LIP_TONES.length)],
    roughness: 0.55,
    metalness: 0.02
  });

  // 2. Cranium / Skull Base (Organically proportioned: narrower lateral width, elongated parietal depth)
  const craniumGeo = new THREE.SphereGeometry(0.125, 14, 14);
  const cranium = new THREE.Mesh(craniumGeo, skinMat);
  cranium.scale.set(0.88, 1.05, 1.02);
  cranium.position.set(0, 0.02, -0.01);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // 3. Lower Face: Jawline, Cheeks & Chin
  // Zygomatic / Cheeks structure
  const cheekGeo = new THREE.BoxGeometry(0.19, 0.11, 0.13);
  const cheeks = new THREE.Mesh(cheekGeo, skinMat);
  cheeks.position.set(0, -0.02, 0.04);
  headGroup.add(cheeks);

  // Tapered Mandible (Jawbone tapering down to chin)
  const jawGeo = new THREE.CylinderGeometry(0.065, 0.088, 0.12, 8);
  const jaw = new THREE.Mesh(jawGeo, skinMat);
  jaw.position.set(0, -0.075, 0.025);
  jaw.scale.set(1.15, 1.0, 0.85);
  headGroup.add(jaw);

  // Defined Chin projection
  const chinGeo = new THREE.SphereGeometry(0.038, 8, 8);
  const chin = new THREE.Mesh(chinGeo, skinMat);
  chin.scale.set(1.2, 0.9, 1.1);
  chin.position.set(0, -0.11, 0.075);
  headGroup.add(chin);

  // 4. Realistic Eyes with Sclera, Iris, Pupils and Eyelids
  const eyeTexture = getEyeTexture();
  const eyeMat = new THREE.MeshStandardMaterial({
    map: eyeTexture,
    roughness: 0.15,
    metalness: 0.05
  });

  const eyeGeo = new THREE.SphereGeometry(0.022, 10, 10);
  eyeGeo.scale(1.2, 0.9, 0.7);

  // Left & Right Eye Positions
  const eyeOffsetX = 0.048;
  const eyeY = 0.018;
  const eyeZ = 0.098;

  // Eyeballs
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-eyeOffsetX, eyeY, eyeZ);
  leftEye.rotation.y = -0.06;
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(eyeOffsetX, eyeY, eyeZ);
  rightEye.rotation.y = 0.06;
  headGroup.add(rightEye);

  // Upper Eyelids (Frames the eye and creates natural relaxed eyelid fold)
  const eyelidGeo = new THREE.CylinderGeometry(0.024, 0.025, 0.01, 8, 1, false, 0, Math.PI);
  const upperEyelidL = new THREE.Mesh(eyelidGeo, skinMat);
  upperEyelidL.rotation.z = Math.PI / 2;
  upperEyelidL.rotation.x = -0.3;
  upperEyelidL.position.set(-eyeOffsetX, eyeY + 0.014, eyeZ + 0.004);
  headGroup.add(upperEyelidL);

  const upperEyelidR = upperEyelidL.clone();
  upperEyelidR.position.set(eyeOffsetX, eyeY + 0.014, eyeZ + 0.004);
  headGroup.add(upperEyelidR);

  // Eyebrows (Arched 3D strips with hair texture)
  const browGeo = new THREE.BoxGeometry(0.046, 0.012, 0.018);
  const browL = new THREE.Mesh(browGeo, hairMat);
  browL.position.set(-eyeOffsetX, eyeY + 0.034, eyeZ + 0.008);
  browL.rotation.z = 0.12;
  browL.rotation.y = -0.15;
  headGroup.add(browL);

  const browR = new THREE.Mesh(browGeo, hairMat);
  browR.position.set(eyeOffsetX, eyeY + 0.034, eyeZ + 0.008);
  browR.rotation.z = -0.12;
  browR.rotation.y = 0.15;
  headGroup.add(browR);

  // 5. Sculpted 3D Nose with Bridge, Tip & Nostrils
  // Nasal Bridge
  const bridgeGeo = new THREE.CylinderGeometry(0.012, 0.022, 0.062, 5);
  const bridge = new THREE.Mesh(bridgeGeo, skinMat);
  bridge.position.set(0, -0.008, eyeZ + 0.014);
  bridge.rotation.x = 0.22;
  headGroup.add(bridge);

  // Rounded Nose Tip (Lobule)
  const noseTipGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
  noseTip.scale.set(1.1, 0.9, 1.2);
  noseTip.position.set(0, -0.032, eyeZ + 0.026);
  headGroup.add(noseTip);

  // Nostrils / Flared Alar Wings
  const alarGeo = new THREE.SphereGeometry(0.012, 6, 6);
  const nostrilL = new THREE.Mesh(alarGeo, skinMat);
  nostrilL.position.set(-0.022, -0.036, eyeZ + 0.018);
  headGroup.add(nostrilL);

  const nostrilR = nostrilL.clone();
  nostrilR.position.set(0.022, -0.036, eyeZ + 0.018);
  headGroup.add(nostrilR);

  // 6. Mouth & Realistic Lips
  // Philtrum indent
  const philtrumGeo = new THREE.BoxGeometry(0.014, 0.022, 0.01);
  const philtrum = new THREE.Mesh(philtrumGeo, skinMat);
  philtrum.position.set(0, -0.052, eyeZ + 0.012);
  headGroup.add(philtrum);

  // Upper Lip with subtle Cupid's bow contour
  const upperLipGeo = new THREE.BoxGeometry(0.052, 0.014, 0.016);
  const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
  upperLip.position.set(0, -0.066, eyeZ + 0.013);
  headGroup.add(upperLip);

  // Lower Lip (Fuller vermilion cushion)
  const lowerLipGeo = new THREE.SphereGeometry(0.024, 8, 6);
  const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
  lowerLip.scale.set(1.2, 0.45, 0.65);
  lowerLip.position.set(0, -0.082, eyeZ + 0.012);
  headGroup.add(lowerLip);

  // 7. Anatomical Outer Ears (Pinna, Helix & Lobule)
  const earGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.06, 6);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.116, -0.005, -0.005);
  earL.rotation.z = -0.22;
  earL.rotation.y = -0.3;
  earL.scale.set(0.65, 1.0, 1.0);
  headGroup.add(earL);

  const earR = new THREE.Mesh(earGeo, skinMat);
  earR.position.set(0.116, -0.005, -0.005);
  earR.rotation.z = 0.22;
  earR.rotation.y = 0.3;
  earR.scale.set(0.65, 1.0, 1.0);
  headGroup.add(earR);

  // 8. Hair & Headwear
  if (hasTopi) {
    // White crocheted Islamic prayer cap (জালি টুপি)
    const topiTex = getTopiTexture();
    const topiMat = new THREE.MeshStandardMaterial({
      map: topiTex,
      roughness: 0.6,
      metalness: 0.02
    });
    const topiGeo = new THREE.CylinderGeometry(0.118, 0.134, 0.09, 12);
    const topi = new THREE.Mesh(topiGeo, topiMat);
    topi.position.set(0, 0.108, -0.005);
    headGroup.add(topi);

    // Hair trimming under topi
    const hairRimGeo = new THREE.CylinderGeometry(0.126, 0.13, 0.04, 10, 1, true, 0, Math.PI * 1.6);
    const hairRim = new THREE.Mesh(hairRimGeo, hairMat);
    hairRim.rotation.y = Math.PI * 0.7;
    hairRim.position.set(0, 0.065, -0.01);
    headGroup.add(hairRim);
  } else if (hairStyle === 'female') {
    // Elegant sleek parted hair with low bun / braid for Bangladeshi woman
    const hairCapGeo = new THREE.SphereGeometry(0.134, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.72);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.02, -0.015);
    headGroup.add(hairCap);

    // Traditional low hair bun (খোঁপা)
    const bunGeo = new THREE.SphereGeometry(0.062, 10, 10);
    const bun = new THREE.Mesh(bunGeo, hairMat);
    bun.position.set(0, 0.01, -0.135);
    headGroup.add(bun);

    // Red floral hair ornament / Gajra accent
    const flowerGeo = new THREE.TorusGeometry(0.065, 0.016, 8, 12);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const flower = new THREE.Mesh(flowerGeo, flowerMat);
    flower.position.set(0, 0.01, -0.125);
    headGroup.add(flower);

    // Forehead Bindi (টিপ)
    const bindiGeo = new THREE.CircleGeometry(0.01, 8);
    const bindiMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c });
    const bindi = new THREE.Mesh(bindiGeo, bindiMat);
    bindi.position.set(0, 0.045, eyeZ + 0.016);
    headGroup.add(bindi);
  } else if (hairStyle === 'fade') {
    // Modern young Dhaka cropped fade
    const hairTopGeo = new THREE.CylinderGeometry(0.118, 0.126, 0.07, 10);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.set(0, 0.12, 0.01);
    headGroup.add(hairTop);

    const hairBackGeo = new THREE.SphereGeometry(0.13, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
    hairBack.position.set(0, 0.03, -0.02);
    headGroup.add(hairBack);
  } else {
    // Classic Dhaka gentleman side-parted hairstyle with volume
    const hairGeo = new THREE.SphereGeometry(0.132, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.68);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.03, -0.015);
    hairMesh.rotation.x = -0.15;
    headGroup.add(hairMesh);

    // Side part fringe sweep
    const sweepGeo = new THREE.BoxGeometry(0.13, 0.035, 0.05);
    const sweep = new THREE.Mesh(sweepGeo, hairMat);
    sweep.position.set(0.03, 0.105, 0.07);
    sweep.rotation.z = -0.15;
    headGroup.add(sweep);

    // Sideburns
    const sideburnGeo = new THREE.BoxGeometry(0.018, 0.05, 0.025);
    const sideburnL = new THREE.Mesh(sideburnGeo, hairMat);
    sideburnL.position.set(-0.114, 0.01, 0.03);
    headGroup.add(sideburnL);

    const sideburnR = sideburnL.clone();
    sideburnR.position.set(0.114, 0.01, 0.03);
    headGroup.add(sideburnR);
  }

  // 9. Facial Hair (Authentic Dhaka Mustache and Beards)
  if (hasMustache) {
    // Curved thick Dhaka mustache sitting naturally above the upper lip
    const stacheGroup = new THREE.Group();
    stacheGroup.position.set(0, -0.055, eyeZ + 0.018);

    const halfStacheGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.048, 6);
    const stacheL = new THREE.Mesh(halfStacheGeo, hairMat);
    stacheL.rotation.z = Math.PI / 2 + 0.35;
    stacheL.position.set(-0.025, -0.004, 0);
    stacheGroup.add(stacheL);

    const stacheR = new THREE.Mesh(halfStacheGeo, hairMat);
    stacheR.rotation.z = -(Math.PI / 2 + 0.35);
    stacheR.position.set(0.025, -0.004, 0);
    stacheGroup.add(stacheR);

    headGroup.add(stacheGroup);
  }

  if (hasBeard) {
    // Trimmed jawline and chin beard
    const beardGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.09, 8, 1, true, -Math.PI * 0.45, Math.PI * 0.9);
    const beard = new THREE.Mesh(beardGeo, hairMat);
    beard.position.set(0, -0.09, 0.02);
    headGroup.add(beard);

    // Chin goatee puff
    const chinBeardGeo = new THREE.SphereGeometry(0.036, 6, 6);
    const chinBeard = new THREE.Mesh(chinBeardGeo, hairMat);
    chinBeard.position.set(0, -0.125, 0.07);
    headGroup.add(chinBeard);
  }

  // Apply scaling
  if (scale !== 1.0) {
    headGroup.scale.set(scale, scale, scale);
  }

  return {
    group: headGroup,
    skinMat,
    hairMat
  };
}

/**
 * Creates an anatomically proportioned, seated Bangladeshi auto-rickshaw driver
 * with realistic polo/safari shirt, collar, breast pocket, draped red Gamcha,
 * gripping hands, leather sandals, and dynamic animation pivots.
 */
export function createRealisticDriver() {
  const driverRoot = new THREE.Group();
  driverRoot.position.set(0, 0.74, 1.18);

  // South Asian skin tone
  const skinColor = 0x9c6145;
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65,
    metalness: 0.04
  });

  // Green Bangladeshi safari polo shirt
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0x0f5132,
    roughness: 0.75,
    metalness: 0.02
  });

  // Traditional blue lungi
  const lungiTex = getLungiTexture(0);
  const lungiMat = new THREE.MeshStandardMaterial({
    map: lungiTex,
    roughness: 0.85,
    metalness: 0.02
  });

  // Authentic Red Gamcha
  const gamchaTex = getGamchaTexture();
  const gamchaMat = new THREE.MeshStandardMaterial({
    map: gamchaTex,
    roughness: 0.88,
    metalness: 0.02
  });

  // Leather driving sandals
  const sandalMat = new THREE.MeshStandardMaterial({
    color: 0x3d2314,
    roughness: 0.7
  });

  // 1. Lower Body (Driver seated firmly on seat)
  // Pelvis / Hips
  const pelvisGeo = new THREE.BoxGeometry(0.44, 0.22, 0.36);
  const pelvis = new THREE.Mesh(pelvisGeo, lungiMat);
  pelvis.position.set(0, 0.08, -0.02);
  driverRoot.add(pelvis);

  // Seated thighs extending forward
  const thighGeo = new THREE.BoxGeometry(0.19, 0.17, 0.44);
  const leftThigh = new THREE.Mesh(thighGeo, lungiMat);
  leftThigh.position.set(-0.13, 0.06, 0.22);
  driverRoot.add(leftThigh);

  const rightThigh = new THREE.Mesh(thighGeo, lungiMat);
  rightThigh.position.set(0.13, 0.06, 0.22);
  driverRoot.add(rightThigh);

  // Lower legs descending down to floorboard pedals
  const shinGeo = new THREE.BoxGeometry(0.16, 0.38, 0.18);
  const leftShin = new THREE.Mesh(shinGeo, lungiMat);
  leftShin.position.set(-0.13, -0.19, 0.44);
  driverRoot.add(leftShin);

  const rightShin = new THREE.Mesh(shinGeo, lungiMat);
  rightShin.position.set(0.13, -0.19, 0.44);
  driverRoot.add(rightShin);

  // Feet / Leather Sandals
  const footGeo = new THREE.BoxGeometry(0.12, 0.065, 0.22);
  const leftFoot = new THREE.Mesh(footGeo, sandalMat);
  leftFoot.position.set(-0.13, -0.36, 0.50);
  driverRoot.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, sandalMat);
  rightFoot.position.set(0.13, -0.36, 0.50);
  driverRoot.add(rightFoot);

  // 2. Articulated Upper Body Group (Leaning, breathing & steering tilt)
  const upperBody = new THREE.Group();
  upperBody.position.set(0, 0.18, 0);

  // Torso / Chest with polo shirt
  const torsoGeo = new THREE.BoxGeometry(0.44, 0.46, 0.26);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 0.23, 0);
  torso.castShadow = true;
  upperBody.add(torso);

  // Folded Shirt Collar
  const collarGeo = new THREE.BoxGeometry(0.24, 0.06, 0.18);
  const collar = new THREE.Mesh(collarGeo, shirtMat);
  collar.position.set(0, 0.46, 0.04);
  upperBody.add(collar);

  // Breast pocket with small pen detail
  const pocketGeo = new THREE.BoxGeometry(0.09, 0.09, 0.02);
  const pocket = new THREE.Mesh(pocketGeo, shirtMat);
  pocket.position.set(-0.12, 0.30, 0.132);
  upperBody.add(pocket);

  // Draped Gamcha (গামছা) over left shoulder across chest
  const gamchaShoulderGeo = new THREE.BoxGeometry(0.14, 0.48, 0.29);
  const gamchaShoulder = new THREE.Mesh(gamchaShoulderGeo, gamchaMat);
  gamchaShoulder.position.set(-0.155, 0.22, 0.01);
  upperBody.add(gamchaShoulder);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.088, 0.13, 8);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 0.48, 0);
  upperBody.add(neck);

  // 3. Head & Face (Interactive head turning and looking)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.62, 0);

  const headData = buildRealisticHead({
    skinColor,
    hairColor: 0x161618,
    hasMustache: true,
    hasBeard: false,
    hasTopi: true, // Signature white crocheted prayer cap
    scale: 1.05
  });
  headPivot.add(headData.group);
  upperBody.add(headPivot);

  // 4. Arms & Hands gripping the handlebar
  // Arms reach forward from shoulders to grips at (±0.4, 0.75, 0.08 fork)
  // Left Arm Group
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.24, 0.38, 0);

  // Upper arm
  const upperArmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.28, 8);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
  leftUpperArm.position.set(-0.06, -0.10, 0.12);
  leftUpperArm.rotation.x = 0.85;
  leftUpperArm.rotation.z = -0.35;
  leftArmGroup.add(leftUpperArm);

  // Forearm extending to left grip
  const forearmGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.32, 8);
  const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
  leftForearm.position.set(-0.12, -0.22, 0.36);
  leftForearm.rotation.x = 1.15;
  leftForearm.rotation.z = -0.28;
  leftArmGroup.add(leftForearm);

  // Left Hand gripping handlebar grip
  const handGeo = new THREE.SphereGeometry(0.048, 8, 8);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.scale.set(1.1, 0.8, 1.2);
  leftHand.position.set(-0.16, -0.32, 0.58);
  leftArmGroup.add(leftHand);

  upperBody.add(leftArmGroup);

  // Right Arm Group
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.24, 0.38, 0);

  const rightUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
  rightUpperArm.position.set(0.06, -0.10, 0.12);
  rightUpperArm.rotation.x = 0.85;
  rightUpperArm.rotation.z = 0.35;
  rightArmGroup.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
  rightForearm.position.set(0.12, -0.22, 0.36);
  rightForearm.rotation.x = 1.15;
  rightForearm.rotation.z = 0.28;
  rightArmGroup.add(rightForearm);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.scale.set(1.1, 0.8, 1.2);
  rightHand.position.set(0.16, -0.32, 0.58);
  rightArmGroup.add(rightHand);

  upperBody.add(rightArmGroup);

  driverRoot.add(upperBody);

  return {
    root: driverRoot,
    upperBody,
    head: headPivot,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup
  };
}

/**
 * Creates authentic Dhaka street pedestrians with 4 distinct archetypes:
 * 1. 'gentleman': Office worker in dress shirt, formal trousers & leather shoes.
 * 2. 'elder': Traditional elder in Panjabi/Kurta, Lungi/pajamas, prayer cap & beard.
 * 3. 'youth': Young university student in graphic tee, denim jeans & sneakers.
 * 4. 'woman': Bangladeshi woman in colorful Salwar Kameez with draped Dupatta/Orna.
 */
export function createRealisticPedestrian(index = 0) {
  const group = new THREE.Group();

  const archetypes = ['gentleman', 'elder', 'youth', 'woman'];
  const type = archetypes[index % archetypes.length];

  const skinColor = SKIN_TONES[index % SKIN_TONES.length];
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65,
    metalness: 0.04
  });

  const isFemale = (type === 'woman');
  const heightScale = isFemale ? 0.94 : (0.97 + (index % 3) * 0.03);

  let upperMat, lowerMat, shoeMat;
  let hasMustache = false;
  let hasBeard = false;
  let hasTopi = false;
  let hairStyle = 'gentleman';

  if (type === 'gentleman') {
    // Light blue formal dress shirt
    upperMat = new THREE.MeshStandardMaterial({ color: 0x8ecae6, roughness: 0.7 });
    // Dark formal trousers
    lowerMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85 });
    shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    hasMustache = (index % 2 === 0);
    hairStyle = 'gentleman';
  } else if (type === 'elder') {
    // White / Cream traditional embroidered Panjabi (Kurta)
    upperMat = new THREE.MeshStandardMaterial({ color: 0xf1faee, roughness: 0.8 });
    // Checkered Lungi
    const lungiTex = getLungiTexture((index + 1) % 4);
    lowerMat = new THREE.MeshStandardMaterial({ map: lungiTex, roughness: 0.85 });
    shoeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    hasBeard = true;
    hasMustache = true;
    hasTopi = true;
    hairStyle = 'elder';
  } else if (type === 'youth') {
    // Vibrant graphic casual t-shirt
    const teeColors = [0xf59e0b, 0xef4444, 0x10b981, 0x6366f1];
    upperMat = new THREE.MeshStandardMaterial({ color: teeColors[index % teeColors.length], roughness: 0.75 });
    // Blue denim jeans
    lowerMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
    shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    hairStyle = 'fade';
  } else {
    // Bangladeshi Woman: Vibrant Salwar Kameez
    const kameezColors = [0xd946ef, 0x06b6d4, 0xf43f5e, 0x8b5cf6];
    upperMat = new THREE.MeshStandardMaterial({ color: kameezColors[index % kameezColors.length], roughness: 0.7 });
    lowerMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.75 });
    shoeMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.6 });
    hairStyle = 'female';
  }

  // 1. Pelvis / Hips Root
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, 0.88, 0);

  const pelvisGeo = new THREE.BoxGeometry(0.34, 0.18, 0.22);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, lowerMat);
  pelvisGroup.add(pelvisMesh);

  // 2. Legs Hierarchy (Thigh -> Shin -> Foot)
  const legRadius = isFemale ? 0.055 : 0.065;
  const legLength = 0.44;

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.11, 0, 0);

  const leftThighGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.85, legLength, 8);
  const leftThigh = new THREE.Mesh(leftThighGeo, lowerMat);
  leftThigh.position.set(0, -legLength / 2, 0);
  leftLegGroup.add(leftThigh);

  const leftKneeGroup = new THREE.Group();
  leftKneeGroup.position.set(0, -legLength, 0);

  const leftShinGeo = new THREE.CylinderGeometry(legRadius * 0.85, legRadius * 0.7, legLength, 8);
  const leftShin = new THREE.Mesh(leftShinGeo, lowerMat);
  leftShin.position.set(0, -legLength / 2, 0);
  leftKneeGroup.add(leftShin);

  const footGeo = new THREE.BoxGeometry(0.09, 0.06, 0.18);
  const leftFoot = new THREE.Mesh(footGeo, shoeMat);
  leftFoot.position.set(0, -legLength, 0.04);
  leftKneeGroup.add(leftFoot);

  leftLegGroup.add(leftKneeGroup);
  pelvisGroup.add(leftLegGroup);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.11, 0, 0);

  const rightThighGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.85, legLength, 8);
  const rightThigh = new THREE.Mesh(rightThighGeo, lowerMat);
  rightThigh.position.set(0, -legLength / 2, 0);
  rightLegGroup.add(rightThigh);

  const rightKneeGroup = new THREE.Group();
  rightKneeGroup.position.set(0, -legLength, 0);

  const rightShinGeo = new THREE.CylinderGeometry(legRadius * 0.85, legRadius * 0.7, legLength, 8);
  const rightShin = new THREE.Mesh(rightShinGeo, lowerMat);
  rightShin.position.set(0, -legLength / 2, 0);
  rightKneeGroup.add(rightShin);

  const rightFoot = new THREE.Mesh(footGeo, shoeMat);
  rightFoot.position.set(0, -legLength, 0.04);
  rightKneeGroup.add(rightFoot);

  rightLegGroup.add(rightKneeGroup);
  pelvisGroup.add(rightLegGroup);

  // 3. Torso & Chest
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.14, 0);

  const torsoWidth = isFemale ? 0.36 : 0.42;
  const torsoGeo = new THREE.BoxGeometry(torsoWidth, 0.46, 0.22);
  const torsoMesh = new THREE.Mesh(torsoGeo, upperMat);
  torsoMesh.position.set(0, 0.23, 0);
  torsoMesh.castShadow = true;
  torsoGroup.add(torsoMesh);

  // Traditional Panjabi hem extending past knees for elder
  if (type === 'elder') {
    const kurtaSkirtGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.42, 8);
    const kurtaSkirt = new THREE.Mesh(kurtaSkirtGeo, upperMat);
    kurtaSkirt.position.set(0, -0.05, 0);
    torsoGroup.add(kurtaSkirt);
  }

  // Draped Dupatta / Orna (উড়না) across chest and shoulder for woman
  if (isFemale) {
    const ornaGeo = new THREE.BoxGeometry(torsoWidth + 0.04, 0.48, 0.24);
    const ornaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.65 });
    const orna = new THREE.Mesh(ornaGeo, ornaMat);
    orna.position.set(0, 0.23, 0.01);
    torsoGroup.add(orna);
  }

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.11, 8);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 0.49, 0);
  torsoGroup.add(neck);

  // 4. Head with detailed facial anatomy
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.59, 0);

  const headData = buildRealisticHead({
    skinColor,
    hairColor: (type === 'elder') ? 0x9ca3af : 0x141416, // Gray hair for elder
    hasMustache,
    hasBeard,
    hasTopi,
    hairStyle,
    isFemale,
    scale: 0.98
  });
  headPivot.add(headData.group);
  torsoGroup.add(headPivot);

  // 5. Articulated Arms (Shoulder -> Upper arm -> Elbow -> Forearm -> Hand)
  const armRadius = isFemale ? 0.042 : 0.052;
  const armLength = 0.38;

  // Left Arm
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-(torsoWidth / 2 + 0.03), 0.42, 0);

  const leftUpperArmGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.85, armLength * 0.55, 6);
  const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, upperMat);
  leftUpperArm.position.set(0, -armLength * 0.27, 0);
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -armLength * 0.55, 0);

  const leftForearmGeo = new THREE.CylinderGeometry(armRadius * 0.85, armRadius * 0.7, armLength * 0.45, 6);
  const leftForearm = new THREE.Mesh(leftForearmGeo, skinMat);
  leftForearm.position.set(0, -armLength * 0.22, 0);
  leftElbow.add(leftForearm);

  const handGeo = new THREE.SphereGeometry(0.038, 6, 6);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -armLength * 0.45, 0.01);
  leftElbow.add(leftHand);

  leftShoulder.add(leftElbow);
  torsoGroup.add(leftShoulder);

  // Right Arm
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set((torsoWidth / 2 + 0.03), 0.42, 0);

  const rightUpperArm = new THREE.Mesh(leftUpperArmGeo, upperMat);
  rightUpperArm.position.set(0, -armLength * 0.27, 0);
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -armLength * 0.55, 0);

  const rightForearm = new THREE.Mesh(leftForearmGeo, skinMat);
  rightForearm.position.set(0, -armLength * 0.22, 0);
  rightElbow.add(rightForearm);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -armLength * 0.45, 0.01);
  rightElbow.add(rightHand);

  rightShoulder.add(rightElbow);
  torsoGroup.add(rightShoulder);

  pelvisGroup.add(torsoGroup);
  group.add(pelvisGroup);

  group.scale.set(heightScale, heightScale, heightScale);

  return {
    mesh: group,
    pelvis: pelvisGroup,
    torso: torsoGroup,
    head: headPivot,
    leftLeg: leftLegGroup,
    leftKnee: leftKneeGroup,
    rightLeg: rightLegGroup,
    rightKnee: rightKneeGroup,
    leftArm: leftShoulder,
    leftElbow: leftElbow,
    rightArm: rightShoulder,
    rightElbow: rightElbow,
    walkPhase: Math.random() * Math.PI * 2,
    baseY: 0.88,
    type
  };
}

/**
 * Natural Walking Animation System:
 * - Coordinated opposite arm-leg swings
 * - Knee flexion on backward leg recovery
 * - Hip bounce and pelvic rotation
 * - Step cadence matched precisely to speed to eliminate sliding!
 */
export function animatePedestrianWalking(pedData, dt, speed = 1.4) {
  // Stride length ~ 0.85m -> Cadence = speed / stride * 2*PI
  const stepCadence = (speed / 0.85) * Math.PI * 2;
  pedData.walkPhase = (pedData.walkPhase + dt * stepCadence) % (Math.PI * 2);
  const phase = pedData.walkPhase;

  // Leg Swing (Inverse Sinusoidal)
  const maxLegSwing = 0.52;
  pedData.leftLeg.rotation.x = Math.sin(phase) * maxLegSwing;
  pedData.rightLeg.rotation.x = -Math.sin(phase) * maxLegSwing;

  // Knee Flexion: Knee only bends backward during leg pickup
  const leftLift = Math.max(0, -Math.sin(phase));
  const rightLift = Math.max(0, Math.sin(phase));
  pedData.leftKnee.rotation.x = leftLift * 0.75;
  pedData.rightKnee.rotation.x = rightLift * 0.75;

  // Arm Swing: Opposite to leg swing
  const maxArmSwing = 0.42;
  pedData.leftArm.rotation.x = -Math.sin(phase) * maxArmSwing;
  pedData.rightArm.rotation.x = Math.sin(phase) * maxArmSwing;

  // Slight natural elbow bend
  pedData.leftElbow.rotation.x = 0.15 + leftLift * 0.25;
  pedData.rightElbow.rotation.x = 0.15 + rightLift * 0.25;

  // Pelvic bounce (double frequency: peaks on each step)
  const verticalBounce = Math.abs(Math.sin(phase)) * 0.045;
  pedData.pelvis.position.y = pedData.baseY + verticalBounce;

  // Subtle pelvic / torso rotation around Y axis
  pedData.torso.rotation.y = Math.sin(phase) * 0.08;

  // Head stabilization (counteracts bounce)
  pedData.head.rotation.x = -verticalBounce * 0.5;
  pedData.head.rotation.y = -Math.sin(phase) * 0.04;
}

/**
 * Sprinting Animation for Chasing Crowd in Pursuit Mode
 */
export function animatePedestrianRunning(pedData, dt, speed = 10.5) {
  const stepCadence = (speed / 1.1) * Math.PI * 2;
  pedData.walkPhase = (pedData.walkPhase + dt * stepCadence) % (Math.PI * 2);
  const phase = pedData.walkPhase;

  // Forward aggressive torso lean
  pedData.torso.rotation.x = 0.28;

  // High knee drives
  const maxRunSwing = 0.85;
  pedData.leftLeg.rotation.x = Math.sin(phase) * maxRunSwing;
  pedData.rightLeg.rotation.x = -Math.sin(phase) * maxRunSwing;

  const leftLift = Math.max(0, -Math.sin(phase));
  const rightLift = Math.max(0, Math.sin(phase));
  pedData.leftKnee.rotation.x = leftLift * 1.2;
  pedData.rightKnee.rotation.x = rightLift * 1.2;

  // Powerful arm pump
  const maxArmPump = 0.85;
  pedData.leftArm.rotation.x = -Math.sin(phase) * maxArmPump;
  pedData.rightArm.rotation.x = Math.sin(phase) * maxArmPump;

  pedData.leftElbow.rotation.x = 0.65;
  pedData.rightElbow.rotation.x = 0.65;

  // Vertical bounce
  pedData.pelvis.position.y = pedData.baseY + Math.abs(Math.sin(phase)) * 0.09;
}
