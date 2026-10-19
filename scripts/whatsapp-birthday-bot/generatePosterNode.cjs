const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

/**
 * Calculates turning age on the birthday
 */
function getTurningAge(birthdayStr) {
  if (!birthdayStr) return null;
  const parts = birthdayStr.split('-');
  if (parts.length !== 3) return null;
  const birthYear = parseInt(parts[0], 10);
  if (isNaN(birthYear)) return null;
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * Draws rounded rectangle path on canvas
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws decorative corner accents on frame
 */
function drawCornerAccents(ctx, x, y, width, height) {
  const size = 30;
  ctx.save();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(x + width - size, y);
  ctx.lineTo(x + width);
  ctx.lineTo(x + width, y + size);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(x, y + height - size);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + size, y + height);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(x + width - size, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - size);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws 4-point star
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * Draws festive sparkle stars
 */
function drawFestiveSparkles(ctx) {
  const sparkles = [
    { x: 180, y: 220, r: 8, color: '#fef08a' },
    { x: 920, y: 280, r: 12, color: '#f59e0b' },
    { x: 140, y: 720, r: 10, color: '#fb7185' },
    { x: 960, y: 840, r: 9, color: '#fef08a' },
    { x: 170, y: 1240, r: 14, color: '#f59e0b' },
    { x: 910, y: 1290, r: 11, color: '#fb7185' },
    { x: 220, y: 1720, r: 8, color: '#fef08a' },
    { x: 880, y: 1760, r: 10, color: '#f59e0b' }
  ];

  sparkles.forEach((s) => {
    ctx.save();
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 15;
    drawStar(ctx, s.x, s.y, 4, s.r, s.r / 3);
    ctx.fill();
    ctx.restore();
  });
}

/**
 * Draws image covering the square area proportionally
 */
function drawImageCover(ctx, img, x, y, width, height) {
  const imgRatio = img.width / img.height;
  const boxRatio = width / height;
  let sw, sh, sx, sy;

  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

/**
 * Word-wrap text inside a container
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

/**
 * Asynchronously loads image from URL or Base64 Data URL
 */
async function loadPhoto(photoSrc) {
  if (!photoSrc) return null;

  try {
    if (photoSrc.startsWith('data:')) {
      const base64Data = photoSrc.split(',')[1];
      const buf = Buffer.from(base64Data, 'base64');
      return await loadImage(buf);
    }
    if (photoSrc.startsWith('http://') || photoSrc.startsWith('https://')) {
      const res = await fetch(photoSrc);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      return await loadImage(Buffer.from(arrayBuf));
    }
    if (fs.existsSync(photoSrc)) {
      return await loadImage(photoSrc);
    }
  } catch (err) {
    console.warn(`[PosterGen] Could not load photo for celebrant: ${err.message}`);
  }
  return null;
}

/**
 * Generates the official 1080x1920 commemorative Birthday Poster
 * @param {Object} celebrant - Member details
 * @param {string} [outputPath] - Path to save the image (optional)
 * @returns {Promise<Buffer>} - JPEG image Buffer
 */
async function generateBirthdayPoster(celebrant, outputPath = null) {
  const width = 1080;
  const height = 1920;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- 1. LUXURY MIDNIGHT & GOLD GRADIENT BACKGROUND ---
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#060a16');
  bgGrad.addColorStop(0.35, '#0d1527');
  bgGrad.addColorStop(0.7, '#080d1a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // --- 2. AMBIENT GLOW EFFECTS ---
  const glow1 = ctx.createRadialGradient(250, 350, 0, 250, 350, 500);
  glow1.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  glow1.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(850, 1400, 0, 850, 1400, 600);
  glow2.addColorStop(0, 'rgba(244, 63, 94, 0.20)');
  glow2.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  const glow3 = ctx.createRadialGradient(540, 820, 0, 540, 820, 450);
  glow3.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
  glow3.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = glow3;
  ctx.fillRect(0, 0, width, height);

  // --- 3. ELEGANT GEOMETRIC BORDER FRAME ---
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 40);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 60, 60, width - 120, height - 120, 32);
  ctx.stroke();

  drawCornerAccents(ctx, 48, 48, width - 96, height - 96);
  ctx.restore();

  // --- 4. SPARKLING CONFETTI ACCENTS ---
  drawFestiveSparkles(ctx);

  // --- 5. TOP CREST & ACADEMIC HEADER ---
  ctx.save();
  ctx.textAlign = 'center';

  ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 240, 115, 600, 64, 32);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('FACULTY OF ENGINEERING • PERADENIYA', 540, 156);

  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
  ctx.fillText('OFFICIAL CLASS OF E/23 CELEBRATION', 540, 225);
  ctx.restore();

  // --- 6. "HAPPY BIRTHDAY" HEADLINE ---
  ctx.save();
  ctx.textAlign = 'center';

  const bdayGrad = ctx.createLinearGradient(200, 0, 880, 0);
  bdayGrad.addColorStop(0, '#fde68a');
  bdayGrad.addColorStop(0.5, '#f59e0b');
  bdayGrad.addColorStop(1, '#fb7185');

  ctx.font = 'bold 88px sans-serif';
  ctx.fillStyle = bdayGrad;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 30;
  ctx.fillText('HAPPY BIRTHDAY', 540, 335);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.fillText("✨ TODAY'S OFFICIAL SPOTLIGHT ✨", 540, 390);
  ctx.restore();

  // --- 7. CELEBRANT PHOTO PLACEHOLDER FRAME ---
  const photoSize = 600;
  const photoX = (width - photoSize) / 2; // 240
  const photoY = 460;
  const photoRadius = 40;

  // Outer Golden Ring Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
  ctx.shadowBlur = 40;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 10;
  drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, photoRadius);
  ctx.stroke();
  ctx.restore();

  // Draw Photo clipped inside placeholder
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, photoRadius);
  ctx.clip();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  const img = await loadPhoto(celebrant.photo);
  if (img) {
    drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
  } else {
    // Initials fallback
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(photoX, photoY, photoSize, photoSize);
    ctx.font = 'bold 160px sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((celebrant.name || 'E23').slice(0, 2).toUpperCase(), photoX + photoSize / 2, photoY + photoSize / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // Bottom gradient fade on photo
  const photoFade = ctx.createLinearGradient(0, photoY + photoSize - 160, 0, photoY + photoSize);
  photoFade.addColorStop(0, 'rgba(2, 6, 23, 0)');
  photoFade.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
  ctx.fillStyle = photoFade;
  ctx.fillRect(photoX, photoY + photoSize - 160, photoSize, 160);
  ctx.restore();

  // Photo ribbon badge
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  drawRoundedRect(ctx, 360, photoY + photoSize - 28, 360, 56, 28);
  ctx.fill();
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#020617';
  ctx.textAlign = 'center';
  ctx.fillText('🎂 BATCH CELEBRANT 🎂', 540, photoY + photoSize + 8);
  ctx.restore();

  // --- 8. CELEBRANT NAME & CREDENTIALS ---
  ctx.save();
  ctx.textAlign = 'center';

  ctx.font = 'bold 62px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 20;
  ctx.fillText(celebrant.name || 'E/23 Engineer', 540, 1160);

  const turningAge = getTurningAge(celebrant.birthday);
  const metaParts = [
    celebrant.regNo,
    celebrant.nickname ? `"${celebrant.nickname}"` : null,
    turningAge ? `Turning ${turningAge} Today!` : null
  ].filter(Boolean);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.shadowBlur = 0;
  ctx.fillText(metaParts.join('  •  '), 540, 1220);

  ctx.font = '500 24px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(celebrant.department || 'Faculty of Engineering, University of Peradeniya', 540, 1265);
  ctx.restore();

  // --- 9. WISH / QUOTE PARCHMENT CARD ---
  ctx.save();
  const cardX = 120;
  const cardY = 1320;
  const cardW = width - 240; // 840
  const cardH = 340;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 420, cardY - 22, 240, 44, 22);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText('CAMPUS BLESSING', 540, cardY + 7);

  const defaultWish = `Wishing you boundless joy, academic greatness, and unforgettable engineering memories on your special day! Here's to achieving all your grandest aspirations.`;
  const message = celebrant.quote ? `"${celebrant.quote}"` : `"${defaultWish}"`;

  ctx.font = 'italic 27px serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  wrapText(ctx, message, 540, cardY + 80, cardW - 80, 42);

  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('— With love from the E/23 Family 🎓❤️', 540, cardY + cardH - 35);
  ctx.restore();

  // --- 10. BOTTOM FOOTER WATERMARK ---
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.fillText('PERADENIYA ENGINEERING • BATCH E/23 CELEBRATIONS', 540, 1845);
  ctx.restore();

  // Export Buffer
  const buffer = canvas.toBuffer('image/jpeg', 88);

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, buffer);
  }

  return buffer;
}

module.exports = {
  generateBirthdayPoster,
  getTurningAge
};
