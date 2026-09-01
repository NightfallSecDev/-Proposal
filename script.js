/* ============================================================
   PROPOSAL WEBSITE — script.js
   All animations, navigation, music, canvas effects, navbar & footer,
   and interactive heart particle systems
============================================================ */

// ── STATE & CONSTANTS ────────────────────────────────────────
let currentPage = 1;
const TOTAL     = 9;
let isMusicPlaying = false;
let effectTimers   = [];
let heartCanvas, pCtx, heartAnimId;

const PAGE_INFO = [
  { num: 1, title: "Hey, You... ❤️", tab: 1 },
  { num: 2, title: "Our Story 📖", tab: 2 },
  { num: 3, title: "Why You ✨", tab: 3 },
  { num: 4, title: "My Heart 💭", tab: 4 },
  { num: 5, title: "My Letter 💌", tab: 5 },
  { num: 6, title: "The Question 💍", tab: 6 },
  { num: 7, title: "My Whole World Glows! 🎉", tab: 6 },
  { num: 8, title: "Take Your Time 🌸", tab: 6 },
  { num: 9, title: "Just You + Me? 🌌", tab: 6 },
];

// ── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  buildDotNav();
  setupMusicPlayer();
  setupKeyboard();
  setupInteractiveHeartEffects();

  // Particle Canvas Setup
  heartCanvas = document.getElementById('particle-canvas');
  if (heartCanvas) {
    pCtx = heartCanvas.getContext('2d');
    resizeCanvas(heartCanvas);
    window.addEventListener('resize', () => resizeCanvas(heartCanvas));
  }

  updateUI();
  onPageEnter(1);
});

// ── CONFIG ──────────────────────────────────────────────────
function applyConfig() {
  document.querySelectorAll('.my-name').forEach(el => el.textContent = CONFIG.MY_NAME);
  document.querySelectorAll('.her-name').forEach(el => el.textContent = CONFIG.HER_NAME);

  const photos = [
    ['.photo-1', CONFIG.PHOTO_1],
    ['.photo-2', CONFIG.PHOTO_2],
    ['.photo-3', CONFIG.PHOTO_3],
    ['.photo-4', CONFIG.PHOTO_4],
  ];
  photos.forEach(([sel, src]) => {
    document.querySelectorAll(sel).forEach(el => {
      el.src = src;
      el.onerror = () => {
        el.style.display = 'none';
        if (el.parentElement) {
          el.parentElement.style.background = 'linear-gradient(135deg, #ffb3c6, #e2d1f9)';
        }
      };
    });
  });

  const audioSrc = document.getElementById('audio-source');
  const audio    = document.getElementById('bg-music');
  if (audioSrc && audio) {
    audioSrc.src = CONFIG.SONG_URL;
    audio.load();
  }
}

// ── DOT NAV ─────────────────────────────────────────────────
function buildDotNav() {
  const nav = document.getElementById('dot-nav');
  if (!nav) return;
  nav.innerHTML = '';
  for (let i = 1; i <= TOTAL; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 1 ? ' active' : '');
    dot.title = `Page ${i}: ${PAGE_INFO[i-1].title}`;
    dot.addEventListener('click', () => goToPage(i));
    nav.appendChild(dot);
  }
}

// ── UI SYNC (NAVBAR & FOOTER) ───────────────────────────────
function updateUI() {
  const info = PAGE_INFO[currentPage - 1];

  // 1. Progress Bar
  const pct = ((currentPage - 1) / (TOTAL - 1)) * 100;
  const pBar = document.getElementById('progress-bar');
  if (pBar) pBar.style.width = pct + '%';

  // 2. Footer Page Number & Title
  const footerNum = document.getElementById('footer-page-num');
  const footerTitle = document.getElementById('footer-page-title');
  if (footerNum) footerNum.textContent = `${currentPage} / ${TOTAL}`;
  if (footerTitle) footerTitle.textContent = info.title;

  // 3. Navbar Tabs Active State
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const tabTarget = parseInt(tab.getAttribute('data-page'), 10);
    tab.classList.toggle('active', tabTarget === info.tab);
  });

  // 4. Dot Indicators
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === currentPage);
  });

  // 5. Back / Navigation Button visibility
  const navBack = document.getElementById('nav-back-btn');
  const footerPrev = document.getElementById('footer-prev-btn');
  const footerNext = document.getElementById('footer-next-btn');

  const hideBack = [1, 7, 8, 9].includes(currentPage);
  if (navBack) navBack.classList.toggle('hidden', hideBack);
  if (footerPrev) footerPrev.classList.toggle('hidden', currentPage === 1);
  if (footerNext) footerNext.classList.toggle('hidden', currentPage === TOTAL);
}

// ── NAVIGATION ──────────────────────────────────────────────
function nextPage() { 
  if (currentPage < TOTAL) goToPage(currentPage + 1); 
}

function prevPage() { 
  if (currentPage > 1) goToPage(currentPage - 1); 
}

function goToPage(num) {
  if (num === currentPage || num < 1 || num > TOTAL) return;

  // Leave current page
  const from = document.getElementById(`p${currentPage}`);
  if (from) from.classList.remove('active');
  onPageLeave(currentPage);

  currentPage = num;

  // Enter next page
  setTimeout(() => {
    const to = document.getElementById(`p${currentPage}`);
    if (to) to.classList.add('active');
    onPageEnter(currentPage);
  }, 200);

  updateUI();
}

// ── KEYBOARD NAV ────────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPage();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevPage();
    if (e.key === ' ') {
      // Space toggles music
      const playBtn = document.getElementById('play-btn');
      if (playBtn) playBtn.click();
    }
  });
}

// ── INTERACTIVE HEART EFFECTS (Click, Touch & Cursor Trail) ──
function setupInteractiveHeartEffects() {
  const heartEmojis = ['❤️', '💖', '💕', '💗', '💓', '✨', '🌸', '💫'];

  // 1. Mouse / Pointer Trail (Throttled)
  let lastTrailTime = 0;
  window.addEventListener('pointermove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < 70) return; // limit frequency
    lastTrailTime = now;

    createTrailHeart(e.clientX, e.clientY);
  }, { passive: true });

  function createTrailHeart(x, y) {
    const heart = document.createElement('span');
    heart.className = 'cursor-trail-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = `${Math.random() * 0.6 + 0.8}rem`;

    document.body.appendChild(heart);
    setTimeout(() => {
      if (heart.parentElement) heart.remove();
    }, 850);
  }

  // 2. Click / Tap Heart Burst Effect
  window.addEventListener('pointerdown', (e) => {
    // Ignore clicks on input sliders
    if (e.target.tagName === 'INPUT') return;
    spawnHeartBurst(e.clientX, e.clientY, 8);
  });

  // 3. Double-Click Heart Fountain
  window.addEventListener('dblclick', (e) => {
    spawnHeartBurst(e.clientX, e.clientY, 20);
  });

  // 4. Glowing Heart Clickable Burst on Page 6
  document.querySelectorAll('.glowing-heart, .badge-pulse, .hb').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnHeartBurst(cx, cy, 25);
    });
  });
}

function spawnHeartBurst(x, y, count = 10) {
  const emojis = ['❤️', '💖', '💕', '💗', '💓', '💝', '✨', '🌸'];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-burst-particle';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Random physics & trajectory
    const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
    const distance = Math.random() * 70 + 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rot = (Math.random() * 60 - 30);
    const size = Math.random() * 0.8 + 1.1;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = `${size}rem`;
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.setProperty('--ty', `${ty}px`);
    heart.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(heart);

    setTimeout(() => {
      if (heart.parentElement) heart.remove();
    }, 1300);
  }
}

// ── PER-PAGE LOGIC ──────────────────────────────────────────
function onPageLeave(num) {
  effectTimers.forEach(clearInterval);
  effectTimers = [];

  cancelAnimationFrame(heartAnimId);

  const pf = document.getElementById('particle-field-4');
  if (pf) pf.innerHTML = '';
}

function onPageEnter(num) {
  if (pCtx && heartCanvas) {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
  }

  switch (num) {
    case 1: runPage1(); break;
    case 2: runPage2(); break;
    case 3: runPage3(); break;
    case 4: runPage4(); break;
    case 5: runPage5(); break;
    case 6: runPage6(); break;
    case 7: runPage7(); break;
    case 8: runPage8(); break;
    case 9: runPage9(); break;
  }
}

// ── PAGE 1: floating glowing hearts ─────────────────────────
function runPage1() {
  if (!heartCanvas || !pCtx) return;
  const hearts = [];
  for (let i = 0; i < 22; i++) hearts.push(makeHeart(heartCanvas));

  function draw() {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    hearts.forEach(h => {
      h.y   -= h.speed;
      h.x   += Math.sin(h.phase) * 0.7;
      h.phase += 0.03;
      h.life -= 0.0035;

      if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = h.life * 0.75;
      pCtx.font        = `${h.size}px serif`;
      pCtx.shadowBlur  = 12;
      pCtx.shadowColor = 'rgba(255, 107, 157, 0.8)';
      pCtx.fillText(h.emoji, h.x, h.y);
      pCtx.restore();
    });
    heartAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function makeHeart(canvas) {
  const emojis = ['❤️','💕','💗','💖','💓','🌸','✨','💝'];
  return {
    x:     Math.random() * canvas.width,
    y:     canvas.height + 40,
    size:  Math.random() * 26 + 16,
    speed: Math.random() * 1.3 + 0.5,
    phase: Math.random() * Math.PI * 2,
    life:  Math.random() * 0.5 + 0.5,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  };
}

// ── PAGE 2: gentle canvas petals & hearts ───────────────────
function runPage2() {
  if (!heartCanvas || !pCtx) return;
  const petals = [];
  for (let i = 0; i < 22; i++) petals.push(makePetal(heartCanvas));

  const hearts = [];
  for (let i = 0; i < 8; i++) hearts.push(makeHeart(heartCanvas));

  function draw() {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    
    // Draw petals
    petals.forEach(p => {
      p.y   += p.speed;
      p.x   += Math.sin(p.phase) * 0.8;
      p.rot += 0.02;
      p.phase += 0.02;
      if (p.y > heartCanvas.height + 30) Object.assign(p, makePetal(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = 0.55;
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot);
      pCtx.fillStyle = p.color;
      pCtx.beginPath();
      pCtx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    });

    // Draw floating hearts
    hearts.forEach(h => {
      h.y -= h.speed * 0.8;
      h.x += Math.sin(h.phase) * 0.5;
      h.phase += 0.02;
      h.life -= 0.003;
      if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = h.life * 0.6;
      pCtx.font = `${h.size}px serif`;
      pCtx.fillText(h.emoji, h.x, h.y);
      pCtx.restore();
    });

    heartAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function makePetal(canvas) {
  const colors = ['#ffb3c6','#ffd6e0','#ffcce5','#e2d1f9','#ffc8dd'];
  return {
    x:     Math.random() * canvas.width,
    y:     -20,
    w:     Math.random() * 10 + 6,
    h:     Math.random() * 6  + 4,
    speed: Math.random() * 1.5 + 0.5,
    rot:   Math.random() * Math.PI,
    phase: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

// ── PAGE 3: lavender glow hearts ────────────────────────────
function runPage3() {
  if (!heartCanvas || !pCtx) return;
  const hearts = [];
  for (let i = 0; i < 16; i++) hearts.push(makeHeart(heartCanvas));

  function draw() {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    hearts.forEach(h => {
      h.y   -= h.speed;
      h.x   += Math.sin(h.phase) * 0.6;
      h.phase += 0.025;
      h.life -= 0.0035;

      if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = h.life * 0.7;
      pCtx.font        = `${h.size}px serif`;
      pCtx.shadowBlur  = 15;
      pCtx.shadowColor = 'rgba(216, 180, 254, 0.9)';
      pCtx.fillText(h.emoji, h.x, h.y);
      pCtx.restore();
    });
    heartAnimId = requestAnimationFrame(draw);
  }
  draw();
}

// ── PAGE 4: floating particles & glowing hearts ─────────────
function runPage4() {
  if (!heartCanvas || !pCtx) return;
  const sparks = [];
  for (let i = 0; i < 35; i++) sparks.push(makeSpark(heartCanvas));

  const hearts = [];
  for (let i = 0; i < 10; i++) hearts.push(makeHeart(heartCanvas));

  function draw() {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    sparks.forEach(s => {
      s.y   -= s.speed;
      s.life -= 0.005;
      if (s.life <= 0) Object.assign(s, makeSpark(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = s.life * 0.8;
      pCtx.beginPath();
      pCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      pCtx.fillStyle = s.color;
      pCtx.shadowBlur  = 12;
      pCtx.shadowColor = s.color;
      pCtx.fill();
      pCtx.restore();
    });

    hearts.forEach(h => {
      h.y   -= h.speed * 0.7;
      h.x   += Math.sin(h.phase) * 0.5;
      h.phase += 0.02;
      h.life -= 0.003;
      if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = h.life * 0.65;
      pCtx.font        = `${h.size}px serif`;
      pCtx.shadowBlur  = 10;
      pCtx.shadowColor = 'rgba(255, 179, 198, 0.8)';
      pCtx.fillText(h.emoji, h.x, h.y);
      pCtx.restore();
    });

    heartAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function makeSpark(canvas) {
  const colors = ['#ffb3c6','#e2d1f9','#ffffff','#fecfef','#c77dff'];
  return {
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 3 + 1,
    speed: Math.random() * 0.6 + 0.2,
    life:  Math.random() * 0.6 + 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

// ── PAGE 5: petals raining & glowing hearts ──────────────────
function runPage5() {
  if (!heartCanvas || !pCtx) return;
  const petals = [];
  for (let i = 0; i < 28; i++) petals.push(makePetal(heartCanvas));

  const hearts = [];
  for (let i = 0; i < 12; i++) hearts.push(makeHeart(heartCanvas));

  function draw() {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    petals.forEach(p => {
      p.y   += p.speed;
      p.x   += Math.sin(p.phase) * 1.2;
      p.rot += 0.025;
      p.phase += 0.025;
      if (p.y > heartCanvas.height + 30) Object.assign(p, makePetal(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = 0.6;
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot);
      pCtx.fillStyle = p.color;
      pCtx.beginPath();
      pCtx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    });

    hearts.forEach(h => {
      h.y   -= h.speed;
      h.x   += Math.sin(h.phase) * 0.6;
      h.phase += 0.025;
      h.life -= 0.0035;
      if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = h.life * 0.7;
      pCtx.font        = `${h.size}px serif`;
      pCtx.shadowBlur  = 12;
      pCtx.shadowColor = 'rgba(255, 107, 157, 0.8)';
      pCtx.fillText(h.emoji, h.x, h.y);
      pCtx.restore();
    });

    heartAnimId = requestAnimationFrame(draw);
  }
  draw();
}

// ── PAGE 6: twinkling stars & glowing aura hearts ───────────
function runPage6() {
  const sc = document.getElementById('star-canvas');
  if (sc) {
    resizeCanvas(sc);
    const ctx = sc.getContext('2d');
    const stars = Array.from({length: 160}, () => makeStar(sc));

    function draw() {
      ctx.clearRect(0, 0, sc.width, sc.height);
      stars.forEach(s => {
        s.t += 0.02;
        const a = 0.3 + 0.7 * Math.abs(Math.sin(s.t));
        ctx.save();
        ctx.globalAlpha  = a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle    = s.color;
        ctx.shadowBlur   = s.r * 4;
        ctx.shadowColor  = s.color;
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Floating hearts with extra glow
  if (heartCanvas && pCtx) {
    const hearts = [];
    for (let i = 0; i < 18; i++) hearts.push(makeHeart(heartCanvas));

    function drawH() {
      pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
      hearts.forEach(h => {
        h.y   -= h.speed;
        h.x   += Math.sin(h.phase) * 0.6;
        h.phase += 0.025;
        h.life -= 0.003;
        if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

        pCtx.save();
        pCtx.globalAlpha = h.life * 0.8;
        pCtx.font        = `${h.size}px serif`;
        pCtx.shadowBlur  = 18;
        pCtx.shadowColor = 'rgba(255, 107, 157, 0.9)';
        pCtx.fillText(h.emoji, h.x, h.y);
        pCtx.restore();
      });
      heartAnimId = requestAnimationFrame(drawH);
    }
    drawH();
  }
}

function makeStar(canvas) {
  const colors = ['#fff','#ffe','#ffd6e0','#e2d1f9','#c9b8f0'];
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.3,
    t: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

// ── PAGE 7: confetti + fireworks + heart shower ─────────────
function runPage7() {
  fireConfetti();
  launchFireworks();

  if (heartCanvas && pCtx) {
    const hearts = [];
    for (let i = 0; i < 35; i++) hearts.push(makeHeart(heartCanvas));

    function draw() {
      pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
      hearts.forEach(h => {
        h.y   -= h.speed * 1.2;
        h.x   += Math.sin(h.phase) * 0.9;
        h.phase += 0.035;
        h.life -= 0.0035;
        if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

        pCtx.save();
        pCtx.globalAlpha = h.life;
        pCtx.font        = `${h.size * 1.1}px serif`;
        pCtx.shadowBlur  = 20;
        pCtx.shadowColor = 'rgba(255, 107, 157, 1)';
        pCtx.fillText(h.emoji, h.x, h.y);
        pCtx.restore();
      });
      heartAnimId = requestAnimationFrame(draw);
    }
    draw();
  }
}

function fireConfetti() {
  if (typeof confetti !== 'function') return;
  const duration = 6000;
  const end      = Date.now() + duration;
  function frame() {
    if (Date.now() > end) return;
    const pc = 50 * ((end - Date.now()) / duration);
    confetti({ particleCount: pc, angle: 60,  spread: 70, origin: {x:.1, y:.6}, colors: ['#ffb3c6','#e2d1f9','#fff','#fecfef'] });
    confetti({ particleCount: pc, angle: 120, spread: 70, origin: {x:.9, y:.6}, colors: ['#ffb3c6','#e2d1f9','#fff','#fecfef'] });
    requestAnimationFrame(frame);
  }
  frame();
}

function launchFireworks() {
  const colors = ['#ff9a9e','#fecfef','#e2d1f9','#c9b8f0','#ffffff'];
  let count = 0;
  const max = 22;

  function firework() {
    if (count++ >= max) return;
    const x  = Math.random();
    const y  = Math.random() * 0.6;
    const c  = colors[Math.floor(Math.random() * colors.length)];
    const pc = Math.floor(Math.random() * 40 + 30);
    confetti({ particleCount: pc, spread: 360, startVelocity: Math.random() * 15 + 10, origin: {x, y}, colors: [c, '#fff', '#fecfef'], ticks:80, gravity: .5 });
    effectTimers.push(setTimeout(firework, Math.random() * 600 + 200));
  }
  firework();
}

// ── PAGE 8: gentle floating hearts ──────────────────────────
function runPage8() {
  if (!heartCanvas || !pCtx) return;
  const hearts = [];
  for (let i = 0; i < 15; i++) hearts.push(makeHeart(heartCanvas));

  function draw() {
    pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    hearts.forEach(h => {
      h.y   -= h.speed * 0.7;
      h.x   += Math.sin(h.phase) * 0.5;
      h.phase += 0.02;
      h.life -= 0.003;
      if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

      pCtx.save();
      pCtx.globalAlpha = h.life * 0.65;
      pCtx.font        = `${h.size}px serif`;
      pCtx.shadowBlur  = 12;
      pCtx.shadowColor = 'rgba(255, 179, 198, 0.8)';
      pCtx.fillText(h.emoji, h.x, h.y);
      pCtx.restore();
    });
    heartAnimId = requestAnimationFrame(draw);
  }
  draw();
}

// ── PAGE 9: finale stars & hearts ───────────────────────────
function runPage9() {
  const sc = document.getElementById('finale-stars');
  if (sc) {
    resizeCanvas(sc);
    const ctx = sc.getContext('2d');
    const stars = Array.from({length: 200}, () => makeStar(sc));

    function draw() {
      ctx.clearRect(0, 0, sc.width, sc.height);
      stars.forEach(s => {
        s.t += 0.015;
        const a = 0.2 + 0.8 * Math.abs(Math.sin(s.t));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle   = s.color;
        ctx.shadowBlur  = s.r * 5;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  if (heartCanvas && pCtx) {
    const hearts = [];
    for (let i = 0; i < 20; i++) hearts.push(makeHeart(heartCanvas));

    function drawH() {
      pCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
      hearts.forEach(h => {
        h.y   -= h.speed * 0.8;
        h.x   += Math.sin(h.phase) * 0.6;
        h.phase += 0.025;
        h.life -= 0.003;
        if (h.life <= 0) Object.assign(h, makeHeart(heartCanvas));

        pCtx.save();
        pCtx.globalAlpha = h.life * 0.75;
        pCtx.font        = `${h.size}px serif`;
        pCtx.shadowBlur  = 15;
        pCtx.shadowColor = 'rgba(255, 107, 157, 0.85)';
        pCtx.fillText(h.emoji, h.x, h.y);
        pCtx.restore();
      });
      heartAnimId = requestAnimationFrame(drawH);
    }
    drawH();
  }
}

// ── MUSIC PLAYER ────────────────────────────────────────────
function setupMusicPlayer() {
  const audio     = document.getElementById('bg-music');
  const playBtn   = document.getElementById('play-btn');
  const playIcon  = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const soundWave = document.getElementById('sound-wave');
  const seekBar   = document.getElementById('seek-bar');
  const volBar    = document.getElementById('vol-bar');
  const curTime   = document.getElementById('cur-time');
  const durTime   = document.getElementById('dur-time');

  if (!audio || !playBtn) return;

  audio.volume = 0.8;

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        isMusicPlaying = true;
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (soundWave) soundWave.classList.add('playing');
      }).catch(e => {
        console.log("Audio play error:", e);
      });
    } else {
      audio.pause();
      isMusicPlaying = false;
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (soundWave) soundWave.classList.remove('playing');
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (isNaN(audio.duration)) return;
    if (seekBar) seekBar.value = (audio.currentTime / audio.duration) * 100;
    if (curTime) curTime.textContent = fmt(audio.currentTime);
    if (durTime) durTime.textContent = fmt(audio.duration);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (durTime) durTime.textContent = fmt(audio.duration);
  });

  if (seekBar) {
    seekBar.addEventListener('input', () => {
      if (!isNaN(audio.duration)) {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
      }
    });
  }

  if (volBar) {
    volBar.addEventListener('input', () => {
      audio.volume = volBar.value / 100;
    });
  }
}

function fmt(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

// ── CANVAS UTILS ─────────────────────────────────────────────
function resizeCanvas(canvas) {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  if (heartCanvas) resizeCanvas(heartCanvas);
  const sc = document.getElementById('star-canvas');
  if (sc) resizeCanvas(sc);
  const fs = document.getElementById('finale-stars');
  if (fs) resizeCanvas(fs);
});
