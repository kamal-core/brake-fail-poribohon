import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generator for authentic Dhaka street visuals.
 */

/**
 * Rickshaw rear art plate texture ("বাপের রাস্তা", "সুপারহিট!")
 */
export function createRickshawBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  // Vibrant yellow background
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative floral outer border
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#d90429';
  ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#008000';
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  // Top header text banner
  ctx.fillStyle = '#d90429';
  ctx.fillRect(25, 25, canvas.width - 50, 95);

  // Title: বাপের রাস্তা
  ctx.font = 'bold 58px "Hind Siliguri", "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 6;
  ctx.fillText('ব্রেকফেল পরিবহন', canvas.width / 2, 70);
  ctx.shadowColor = 'transparent';

  // Decorative heart / couple graphic or floral emblem in the middle
  ctx.fillStyle = '#fff0c2';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 200, 160, 65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d90429';
  ctx.stroke();

  // Decorative flowers & dots
  const drawFlower = (x, y, radius, color) => {
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  };

  drawFlower(95, 200, 16, '#e63946');
  drawFlower(canvas.width - 95, 200, 16, '#2a9d8f');

  // Subtitle banner inside center oval
  ctx.font = 'bold 36px "Hind Siliguri", "Segoe UI", sans-serif';
  ctx.fillStyle = '#b30000';
  ctx.fillText('ব্রেক নাই, বিপদের শেষ নাই!', canvas.width / 2, 185);

  ctx.font = 'bold 20px "Hind Siliguri", "Segoe UI", sans-serif';
  ctx.fillStyle = '#005500';
  ctx.fillText('★ BRAKE FAIL PORIBOHON ★', canvas.width / 2, 225);

  // Bottom ornamental band with triangles/fringes
  const fringeY = 285;
  const fringeHeight = 70;
  const colors = ['#e63946', '#2a9d8f', '#e76f51', '#264653', '#f4a261', '#9b5de5'];
  const segmentWidth = canvas.width / 12;

  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(i * segmentWidth, fringeY, segmentWidth, fringeHeight);
    
    // Tiny decorative dot on each fringe
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(i * segmentWidth + segmentWidth / 2, fringeY + 35, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Metro Rail viaduct pillar posters (as seen in the reference screenshot)
 */
export function createMetroPosterTexture(type = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (type === 0) {
    // "পরিচ্ছন্ন শহর সবুজ শহর"
    ctx.fillStyle = '#f4f1de';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#2d6a4f';
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.fillStyle = '#1b4332';
    ctx.fillRect(16, 20, canvas.width - 32, 110);

    ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('পরিচ্ছন্ন শহর', canvas.width / 2, 60);
    ctx.fillStyle = '#95d5b2';
    ctx.fillText('সবুজ শহর', canvas.width / 2, 105);

    // Tree graphic
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 40, 200, 28, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 + 40, 200, 28, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2, 170, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7f4f24';
    ctx.fillRect(canvas.width / 2 - 10, 200, 20, 60);

    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#1b4332';
    ctx.fillText('আমার শহর, আমার দায়িত্ব', canvas.width / 2, 290);

    // Slogan box at bottom
    ctx.fillStyle = '#d8f3dc';
    ctx.fillRect(20, 330, canvas.width - 40, 140);
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#081c15';
    ctx.fillText('যেখানে সেখানে ময়লা', canvas.width / 2, 370);
    ctx.fillText('ফেলবেন না।', canvas.width / 2, 400);
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#2d6a4f';
    ctx.fillText('ঢাকা উত্তর সিটি কর্পোরেশন', canvas.width / 2, 440);
  } else if (type === 1) {
    // "পাত্রী চাই" poster
    ctx.fillStyle = '#fffdf0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#c1121f';
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#c1121f';
    ctx.textAlign = 'center';
    ctx.fillText('পাত্রী চাই', canvas.width / 2, 60);

    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText('পাত্র বুয়েট ইঞ্জিনিয়ার', canvas.width / 2, 110);
    ctx.fillText('বর্তমানে কানাডা প্রবাসী', canvas.width / 2, 140);
    ctx.fillText('সুশ্রী, নামাজি পাত্রী আবশ্যক', canvas.width / 2, 170);

    ctx.strokeStyle = '#999999';
    ctx.beginPath();
    ctx.moveTo(30, 200);
    ctx.lineTo(canvas.width - 30, 200);
    ctx.stroke();

    // Tear-off contact strips at bottom
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('যোগাযোগ:', canvas.width / 2, 240);
    ctx.font = 'bold 22px monospace';
    ctx.fillText('০১৭১১-XXXXXX', canvas.width / 2, 280);

    // "টু-লেট" small poster plastered on bottom half
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(20, 340, canvas.width - 40, 140);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#b7094c';
    ctx.strokeRect(20, 340, canvas.width - 40, 140);

    ctx.font = 'bold 34px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#b7094c';
    ctx.fillText('টু-লেট', canvas.width / 2, 390);
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('২ রুমের ফ্ল্যাট ভাড়া', canvas.width / 2, 430);
    ctx.fillText('ছোট পরিবার অগ্রাধিকার', canvas.width / 2, 460);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Bengali store signboards
 */
export function createShopSignTexture(title, subtitle, bgColor = '#d90429', textColor = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // Inner accent line
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffd100';
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Main shop title
  ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  ctx.fillText(title, canvas.width / 2, 46);
  ctx.shadowColor = 'transparent';

  // Subtitle / category
  if (subtitle) {
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#ffe066';
    ctx.fillText(subtitle, canvas.width / 2, 94);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Bangladeshi road texture: dark asphalt with subtle grain and white dashed lane lines.
 */
export function createRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base asphalt color
  ctx.fillStyle = '#26262a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle asphalt noise / grain
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
    data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Tar repair patches (authentic Dhaka street detail!)
  ctx.fillStyle = '#1c1c1e';
  for (let p = 0; p < 8; p++) {
    const px = Math.random() * (canvas.width - 150);
    const py = Math.random() * (canvas.height - 100);
    ctx.beginPath();
    ctx.ellipse(px, py, 40 + Math.random() * 50, 20 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }

  // White dashed lane divider markings
  ctx.fillStyle = '#dcdde1';
  const lanePositions = [0.25, 0.5, 0.75];
  const dashLength = 120;
  const dashGap = 90;
  const dashWidth = 14;

  lanePositions.forEach(ratio => {
    const x = canvas.width * ratio - dashWidth / 2;
    for (let y = 0; y < canvas.height; y += dashLength + dashGap) {
      ctx.fillRect(x, y, dashWidth, dashLength);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Bangladeshi yellow-and-black curb pattern texture
 */
export function createCurbTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const segmentWidth = 64;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = (i % 2 === 0) ? '#ffcc00' : '#1c1c20';
    ctx.fillRect(i * segmentWidth, 0, segmentWidth, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Brick sidewalk texture (red/terracotta Dhaka paving bricks)
 */
export function createSidewalkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#9c5138';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Brick grid
  const brickW = 64;
  const brickH = 32;
  ctx.strokeStyle = '#5a2d1e';
  ctx.lineWidth = 3;

  for (let row = 0; row < canvas.height / brickH; row++) {
    const offsetX = (row % 2 === 0) ? 0 : brickW / 2;
    for (let col = -1; col < canvas.width / brickW + 1; col++) {
      const x = col * brickW + offsetX;
      const y = row * brickH;
      // Slight brick color variation
      const tint = (Math.random() - 0.5) * 20;
      ctx.fillStyle = `rgb(${156 + tint}, ${81 + tint/2}, ${56 + tint/3})`;
      ctx.fillRect(x, y, brickW, brickH);
      ctx.strokeRect(x, y, brickW, brickH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Local bus livery texture (e.g. "বিহঙ্গ পরিবহন", "১০০ হাত দূরে থাকুন")
 */
export const DHAKA_BUS_COMPANIES = [
  {
    name: 'বলাকা পরিবহন',
    english: 'BALAKA',
    baseColor: '#f77f00', // Balaka orange
    stripeColor: '#003049',
    textColor: '#ffffff',
    route: 'গাজীপুর ⇄ সায়েদাবাদ | সেবাই মূল লক্ষ্য'
  },
  {
    name: 'আজমেরী পরিবহন',
    english: 'AZMERI',
    baseColor: '#1b4332', // Emerald green
    stripeColor: '#ffd166',
    textColor: '#ffffff',
    route: 'চন্দ্রা ⇄ সদরঘাট | ১০০ হাত দূরে থাকুন'
  },
  {
    name: 'প্রভাতী বনশ্রী পরিবহন',
    english: 'PROVATI BANASREE',
    baseColor: '#d90429', // Crimson red
    stripeColor: '#f8f9fa',
    textColor: '#ffffff',
    route: 'গুলিস্তান ⇄ বনশ্রী ⇄ বাড্ডা'
  },
  {
    name: 'বৈশাখী পরিবহন',
    english: 'BOISHAKHI',
    baseColor: '#0077b6', // Classic blue
    stripeColor: '#ffb703',
    textColor: '#ffffff',
    route: 'মিরপুর ১৪ ⇄ নতুন বাজার | গতি সীমিত রাখুন'
  },
  {
    name: 'বিহঙ্গ পরিবহন',
    english: 'BIHANGA',
    baseColor: '#03045e', // Deep royal navy
    stripeColor: '#d90429',
    textColor: '#ffffff',
    route: 'মিরপুর ১২ ⇄ আজিমপুর | ঢাকা সিটি সার্ভিস'
  }
];

export function createBusLiveryTexture(busConfig = DHAKA_BUS_COMPANIES[0]) {
  if (typeof busConfig === 'string') {
    const found = DHAKA_BUS_COMPANIES.find(b => b.name === busConfig);
    busConfig = found || {
      name: busConfig,
      english: 'DHAKA',
      baseColor: '#0077b6',
      stripeColor: '#ffb703',
      textColor: '#ffffff',
      route: 'ঢাকা সিটি সার্ভিস | ১০০ হাত দূরে থাকুন'
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = busConfig.baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = busConfig.stripeColor;
  ctx.fillRect(0, 92, canvas.width, 36);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 132, canvas.width, 10);

  ctx.fillStyle = '#111827';
  ctx.fillRect(35, 18, canvas.width - 70, 52);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 4;
  for (let x = 35; x < canvas.width - 70; x += 65) {
    ctx.strokeRect(x, 18, 60, 52);
  }

  ctx.font = '900 36px "Hind Siliguri", sans-serif';
  ctx.fillStyle = busConfig.textColor;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  ctx.fillText(busConfig.name, canvas.width / 2, 120);
  ctx.shadowColor = 'transparent';

  ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#f8f9fa';
  ctx.fillText(busConfig.route, canvas.width / 2, 185);

  ctx.font = '900 13px sans-serif';
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText(busConfig.english + ' PORIBOHON LTD.', canvas.width / 2, 218);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const DHAKA_JUNCTION_SIGNS = [
  {
    ahead: 'ফার্মগেট ↑',
    right: 'শাহবাগ →',
    left: '← কারওয়ান বাজার',
    slogan: 'সড়ক নিরাপত্তা আইন মেনে চলুন'
  },
  {
    ahead: 'মিরপুর ১০ ↑',
    right: 'ধানমন্ডি →',
    left: '← গুলিস্থান',
    slogan: 'গতিসীমা ৩০ কিমি/ঘণ্টা'
  },
  {
    ahead: 'মতিঝিল ↑',
    right: 'পল্টন →',
    left: '← মহাখালী',
    slogan: 'ওভারটেকিং বিপজ্জনক'
  },
  {
    ahead: 'মগবাজার ↑',
    right: 'বাংলামোটর →',
    left: '← যাত্রাবাড়ী',
    slogan: 'জেব্রা ক্রসিংয়ে পথচারীকে পথ দিন'
  },
  {
    ahead: 'বাড্ডা ↑',
    right: 'রামপুরা →',
    left: '← বিজয়নগর',
    slogan: 'নিরাপদ সড়ক, সবার অধিকার'
  }
];

export function createDhakaDirectionalSignTexture(signData = DHAKA_JUNCTION_SIGNS[0]) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1b4332';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(24, 150);
  ctx.lineTo(canvas.width - 24, 150);
  ctx.stroke();

  ctx.font = '900 40px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(signData.ahead, canvas.width / 2, 70);

  ctx.font = 'bold 27px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(signData.left, 36, 126);

  ctx.textAlign = 'right';
  ctx.fillText(signData.right, canvas.width - 36, 126);

  ctx.shadowColor = 'transparent';
  ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.fillText(signData.slogan, canvas.width / 2, 204);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRechargeMarkingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, 256, 256);

  // Outer glowing yellow circle
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#ffd100';
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Yellow background disk
  ctx.fillStyle = 'rgba(255, 209, 0, 0.4)';
  ctx.fill();

  // Electric lightning bolt
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(140, 30);
  ctx.lineTo(80, 135);
  ctx.lineTo(125, 135);
  ctx.lineTo(110, 226);
  ctx.lineTo(180, 115);
  ctx.lineTo(135, 115);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


/**
 * Protest banner texture ("আমাদের দাবি মানতে হবে! রাস্তা অবরোধ!")
 */
export function createProtestBannerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Red background
  ctx.fillStyle = '#b30000';
  ctx.fillRect(0, 0, 512, 128);

  // Border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffd100';
  ctx.strokeRect(4, 4, 504, 120);

  // Text
  ctx.font = 'bold 32px "Hind Siliguri", "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('দফা এক দাবি এক! রাস্তা বন্ধ!', 256, 42);

  ctx.font = 'bold 24px "Hind Siliguri", "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffd100';
  ctx.fillText('★ আমাদের দাবি মানতে হবে ★', 256, 88);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
