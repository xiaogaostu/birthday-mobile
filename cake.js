/* ============================================================
   cake.js — procedural galaxy cake (Three.js)
   Integrated from cake-night-standalone.html (user build).
   ============================================================ */

(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const STAR_COLORS = [
    0xffe066, 0xffb347, 0xff3d6e, 0xff5ad6, 0xc46bff,
    0x5ea8ff, 0x3ef0ff, 0x5dffc4, 0xfff8e8, 0xff8ad8,
    0xffffff, 0xff6a3a, 0xffd12a, 0xff4fa8, 0x8a7bff
  ];
  const BOKEH_COLORS = [
    0xffe08a, 0xffa060, 0x6af0ff, 0xc48bff, 0xff6ad8,
    0x7dffd0, 0xfff6d8, 0x9ac0ff, 0xffc05a, 0xd8b0ff,
    0xffffff, 0xff90d0, 0xff7a9a, 0x80e0ff
  ];
  const FLAME_ORB_COLORS = [
    0xffffff, 0xfff8d8, 0xffe08a, 0xffa050, 0xff70d8,
    0xd09aff, 0xa0e8ff, 0xffb8e8, 0xfff0c0, 0xf0d0ff
  ];
  const NEBULA = [
    '50,140,255', '40,230,255', '190,70,255', '255,50,180',
    '255,150,40', '50,255,200', '255,230,90', '90,100,255',
    '255,100,70', '255,70,170', '255,200,60', '255,90,220'
  ];
  const BRUSH = [
    '255,150,40', '255,80,150', '255,210,70', '255,55,120',
    '255,170,60', '255,100,190', '255,220,100', '255,90,60'
  ];

  // Cake proportions — squat cylinder matching 示例.mp4 night frames
  const CAKE_R = 1.78;
  const CAKE_H = 1.16;
  const CAKE_TOP = CAKE_H * 0.5;
  const CAKE_BOT = -CAKE_H * 0.5;
  const PLATE_Y = CAKE_BOT - 0.04;
  const PLATE_R = 2.62;
  const DOME_R = 3.55;
  const DOME_Y = 0.22;
  const CANDLE_H = 1.02;
  const FLAME_Y = CAKE_TOP + CANDLE_H + 0.14;
  const RING_Y = 0.02; // midsection Saturn orbits

  function canvas2d(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function makeGlowTexture() {
    const c = canvas2d(256, 256);
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(.18, 'rgba(255,255,255,.72)');
    grad.addColorStop(.42, 'rgba(255,255,255,.18)');
    grad.addColorStop(.72, 'rgba(255,255,255,.04)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return c;
  }

  function makeStarTexture() {
    const c = canvas2d(64, 64);
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(.2, 'rgba(255,245,220,.85)');
    grad.addColorStop(.55, 'rgba(255,230,180,.12)');
    grad.addColorStop(1, 'rgba(255,220,160,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(255,250,235,.7)';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(32, 2); g.lineTo(32, 62);
    g.moveTo(2, 32); g.lineTo(62, 32);
    g.stroke();
    return c;
  }


  function makeFlameTexture() {
    // fuller teardrop flame — white core, gold/coral body, soft pink tip glow (示例 lit)
    const c = canvas2d(160, 288);
    const g = c.getContext('2d');
    g.clearRect(0, 0, 160, 288);
    // outer soft halo
    const halo = g.createRadialGradient(80, 190, 2, 80, 178, 64);
    halo.addColorStop(0, 'rgba(255,190,110,.42)');
    halo.addColorStop(.4, 'rgba(255,120,170,.16)');
    halo.addColorStop(1, 'rgba(255,160,120,0)');
    g.fillStyle = halo;
    g.beginPath();
    g.ellipse(80, 188, 36, 58, 0, 0, Math.PI * 2);
    g.fill();
    // main teardrop body
    g.save();
    g.translate(80, 240);
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(22, -20, 28, -82, 0, -178);
    g.bezierCurveTo(-28, -82, -22, -20, 0, 0);
    g.closePath();
    const body = g.createLinearGradient(0, 0, 0, -178);
    body.addColorStop(0, 'rgba(255,130,55,.98)');
    body.addColorStop(.22, 'rgba(255,175,65,1)');
    body.addColorStop(.48, 'rgba(255,230,150,1)');
    body.addColorStop(.72, 'rgba(255,248,225,1)');
    body.addColorStop(1, 'rgba(255,255,255,.62)');
    g.fillStyle = body;
    g.fill();
    // hot white core
    g.beginPath();
    g.moveTo(0, -10);
    g.bezierCurveTo(10, -26, 11, -68, 0, -118);
    g.bezierCurveTo(-11, -68, -10, -26, 0, -10);
    g.closePath();
    const core = g.createLinearGradient(0, -10, 0, -118);
    core.addColorStop(0, 'rgba(255,205,110,.95)');
    core.addColorStop(.38, 'rgba(255,255,255,1)');
    core.addColorStop(1, 'rgba(255,255,255,.4)');
    g.fillStyle = core;
    g.fill();
    g.restore();
    return c;
  }

  function makeSmokeTexture() {
    const c = canvas2d(128, 128);
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    grad.addColorStop(0, 'rgba(220,220,235,.55)');
    grad.addColorStop(.45, 'rgba(180,180,205,.22)');
    grad.addColorStop(1, 'rgba(160,160,190,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return c;
  }

  function makeStreakTexture() {
    const c = canvas2d(256, 32);
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 16, 256, 16);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(.15, 'rgba(255,255,255,.15)');
    grad.addColorStop(.45, 'rgba(255,255,255,.9)');
    grad.addColorStop(.7, 'rgba(210,230,255,.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 10, 256, 12);
    const soft = g.createRadialGradient(180, 16, 0, 180, 16, 14);
    soft.addColorStop(0, 'rgba(255,255,255,.55)');
    soft.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = soft;
    g.fillRect(160, 0, 40, 32);
    return c;
  }

  function drawStarPath(g, x, y, outer, inner, points, rot) {
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = rot + (i * Math.PI) / points;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
  }

  function makeGalaxyTexture() {
    const W = 2048, H = 512;
    const c = canvas2d(W, H);
    const g = c.getContext('2d');

    // chromatic night glaze — dark field, vivid clouds painted over it (not additive, so they don't clip to white)
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#070212');
    bg.addColorStop(.22, '#12063a');
    bg.addColorStop(.46, '#0c184e');
    bg.addColorStop(.7, '#220840');
    bg.addColorStop(1, '#04020c');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    const nebulaCols = [
      '255,70,170', '255,150,60', '70,220,255', '190,90,255',
      '255,210,90', '255,90,130', '60,255,210', '130,150,255',
      '255,120,200', '255,180,80', '255,80,110', '90,170,255'
    ];
    // local clouds, not full-width stripes — a dark galaxy with glowing blotches
    for (let i = 0; i < 34; i++) {
      const col = pick(nebulaCols);
      const x = rand(0, W);
      const y = rand(H * .08, H * .92);
      const rx = rand(110, 320);
      const ry = rand(36, 110);
      for (const ox of [-W, 0, W]) {
        g.save();
        g.translate(x + ox, y);
        g.rotate(rand(-0.9, 0.9));
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        const a = rand(.5, .78);
        grad.addColorStop(0, `rgba(${col},${a})`);
        grad.addColorStop(.42, `rgba(${col},${a * .55})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = grad;
        g.scale(1, ry / rx);
        g.beginPath();
        g.arc(0, 0, rx, 0, TAU);
        g.fill();
        g.restore();
      }
    }

    const strokeCols = [
      '255,95,160', '255,150,50', '255,214,80', '255,70,130',
      '70,220,255', '170,90,255', '255,120,190', '40,190,255',
      '255,170,70', '255,80,210', '120,255,210', '255,110,90'
    ];
    for (let i = 0; i < 18; i++) {
      const col = pick(strokeCols);
      const x0 = rand(0, W);
      const y0 = rand(H * .08, H * .92);
      const len = rand(160, 420);
      const thick = rand(18, 46);
      const amp = rand(-70, 70);
      for (const ox of [-W, 0, W]) {
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = `rgba(${col},${rand(.4, .68)})`;
        g.lineWidth = thick;
        g.beginPath();
        g.moveTo(x0 + ox, y0);
        g.bezierCurveTo(
          x0 + ox + len * .28, y0 + amp,
          x0 + ox + len * .62, y0 - amp * .6,
          x0 + ox + len, y0 + amp * .2
        );
        g.stroke();
        g.restore();
      }
    }

    for (let i = 0; i < 28; i++) {
      const col = pick(strokeCols);
      const x = rand(0, W);
      const y = rand(H * .06, H * .94);
      const rx = rand(40, 120);
      const ry = rand(14, 40);
      for (const ox of [-W, 0, W]) {
        g.save();
        g.translate(x + ox, y);
        g.rotate(rand(-1.2, 1.2));
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        const a = rand(.4, .7);
        grad.addColorStop(0, `rgba(${col},${a})`);
        grad.addColorStop(.5, `rgba(${col},${a * .4})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = grad;
        g.scale(1, ry / rx);
        g.beginPath();
        g.arc(0, 0, rx, 0, TAU);
        g.fill();
        g.restore();
      }
    }

    // thin warm flecks only — keep them from lifting the whole glaze
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) {
      const x = rand(0, W);
      g.fillStyle = `rgba(255,215,120,${rand(.12, .28)})`;
      g.beginPath();
      g.ellipse(x, rand(6, 48), rand(8, 22), rand(4, 12), rand(-.4, .4), 0, TAU);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';

    // multicolor glitter baked into the glaze — cream, gold, pink, cyan
    const dustCols = ['#fff6e0', '#ffe08a', '#ff9a4a', '#ff7ad4', '#7ef0ff', '#ffffff', '#ffd24a', '#d9a0ff'];
    for (let i = 0; i < 4200; i++) {
      const x = rand(0, W);
      const y = rand(0, H);
      g.globalAlpha = rand(.45, .95);
      g.fillStyle = dustCols[i % dustCols.length];
      g.beginPath();
      g.arc(x, y, rand(.3, 1.5), 0, TAU);
      g.fill();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 280; i++) {
      const x = rand(0, W);
      const y = rand(0, H);
      g.fillStyle = pick(['#ffd34f', '#ffe28a', '#ffb84a', '#fff1b0', '#ffffff', '#ff9a3c', '#ff6ad0', '#7be8ff', '#ff4fa8', '#c9a0ff']);
      g.globalAlpha = rand(.78, 1);
      drawStarPath(g, x, y, rand(5, 16), rand(1.8, 6), 5, rand(0, TAU));
      g.fill();
    }
    // a few gold-dominated flecks (少量金屑)
    const splash = ['#ffd34f', '#ffb84a', '#ffe28a', '#fff4dc', '#ffffff', '#ff9a3c', '#ffd9a0'];
    for (let i = 0; i < 150; i++) {
      const x = rand(0, W);
      const y = rand(0, H);
      g.globalAlpha = rand(.4, .8);
      g.fillStyle = pick(splash);
      if (Math.random() < .72) {
        g.beginPath();
        g.arc(x, y, rand(1, 5), 0, TAU);
        g.fill();
      } else {
        g.save();
        g.translate(x, y);
        g.rotate(rand(0, TAU));
        g.fillRect(-rand(2, 7), -rand(.8, 2), rand(4, 12), rand(1.4, 4));
        g.restore();
      }
    }
    g.globalAlpha = 1;
    return c;
  }

  function makeTopTexture() {
    const S = 720;
    const c = canvas2d(S, S);
    const g = c.getContext('2d');
    g.fillStyle = '#120818';
    g.fillRect(0, 0, S, S);

    // swirling gold / magenta / cyan frosting + a warm candle pool
    const cx = S * .5, cy = S * .5;
    for (let i = 22; i >= 0; i--) {
      const t = i / 22;
      const r = S * (.07 + t * .44);
      const grad = g.createRadialGradient(cx, cy, r * .45, cx, cy, r);
      if (i % 4 === 0) {
        grad.addColorStop(0, `rgba(255,214,80,${.48 + (1 - t) * .38})`);
        grad.addColorStop(1, 'rgba(255,140,40,0)');
      } else if (i % 4 === 1) {
        grad.addColorStop(0, `rgba(230,80,255,${.4 + (1 - t) * .34})`);
        grad.addColorStop(1, 'rgba(160,40,240,0)');
      } else if (i % 4 === 2) {
        grad.addColorStop(0, `rgba(255,70,160,${.4 + (1 - t) * .32})`);
        grad.addColorStop(1, 'rgba(255,40,130,0)');
      } else {
        grad.addColorStop(0, `rgba(80,230,255,${.32 + (1 - t) * .28})`);
        grad.addColorStop(1, 'rgba(40,180,255,0)');
      }
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx + Math.sin(i * 1.35) * 10, cy + Math.cos(i * .95) * 8, r, 0, TAU);
      g.fill();
    }

    const wash = g.createRadialGradient(cx, cy, 0, cx, cy, S * .5);
    wash.addColorStop(0, 'rgba(255,246,200,.86)');
    wash.addColorStop(.22, 'rgba(255,186,90,.48)');
    wash.addColorStop(.48, 'rgba(255,110,190,.28)');
    wash.addColorStop(.72, 'rgba(140,90,255,.16)');
    wash.addColorStop(1, 'rgba(8,4,20,0)');
    g.fillStyle = wash;
    g.fillRect(0, 0, S, S);

    const cols = ['#ffe066', '#ff6a2a', '#ff3d70', '#ff4de0', '#b070ff', '#30f0ff', '#fff6e0', '#ffffff', '#ffb050', '#ff90d0', '#7dffb0'];
    for (let i = 0; i < 1100; i++) {
      const ang = rand(0, TAU);
      const rr = Math.pow(Math.random(), .55) * (S * .46);
      const x = cx + Math.cos(ang) * rr;
      const y = cy + Math.sin(ang) * rr;
      g.globalAlpha = rand(.5, 1);
      g.fillStyle = pick(cols);
      if (Math.random() < .55) {
        g.beginPath();
        g.arc(x, y, rand(1.4, 6), 0, TAU);
        g.fill();
      } else {
        drawStarPath(g, x, y, rand(4, 13), rand(1.6, 5), 5, rand(0, TAU));
        g.fill();
      }
    }
    g.globalAlpha = 1;
    return c;
  }

  function makePlateTexture() {
    const S = 1024;
    const c = canvas2d(S, S);
    const g = c.getContext('2d');
    const cx = S / 2, cy = S / 2;

    // thin luminous lavender / purple disc (demo plate — airy, not opaque)
    const base = g.createRadialGradient(cx, cy, 0, cx, cy, S * .5);
    base.addColorStop(0, 'rgba(255,252,255,.98)');
    base.addColorStop(.16, 'rgba(255,214,236,.94)');
    base.addColorStop(.38, 'rgba(214,168,255,.88)');
    base.addColorStop(.66, 'rgba(150,120,255,.76)');
    base.addColorStop(1, 'rgba(110,70,210,.5)');
    g.fillStyle = base;
    g.beginPath();
    g.arc(cx, cy, S * .495, 0, TAU);
    g.fill();

    // just 2 very thin faint rings — no layered hard-edge circles
    g.globalCompositeOperation = 'lighter';
    for (const [i, a] of [[4, .12], [8, .08]]) {
      const r = (S * .072) * i;
      g.strokeStyle = `rgba(235,222,255,${a})`;
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(cx, cy, r, 0, TAU);
      g.stroke();
    }
    // inner glow core (soft)
    const core = g.createRadialGradient(cx, cy, 0, cx, cy, S * .22);
    core.addColorStop(0, 'rgba(255,255,255,.5)');
    core.addColorStop(.45, 'rgba(232,214,255,.18)');
    core.addColorStop(1, 'rgba(180,150,255,0)');
    g.fillStyle = core;
    g.beginPath();
    g.arc(cx, cy, S * .22, 0, TAU);
    g.fill();

    // rim bloom (soft edge self-glow)
    const rim = g.createRadialGradient(cx, cy, S * .4, cx, cy, S * .5);
    rim.addColorStop(0, 'rgba(200,170,255,0)');
    rim.addColorStop(.65, 'rgba(196,166,255,.22)');
    rim.addColorStop(1, 'rgba(255,240,255,.4)');
    g.fillStyle = rim;
    g.beginPath();
    g.arc(cx, cy, S * .5, 0, TAU);
    g.fill();
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  function makeTextTexture() {
    const c = canvas2d(900, 220);
    const g = c.getContext('2d');
    g.clearRect(0, 0, 900, 220);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = 'rgba(255,255,255,.85)';
    g.shadowBlur = 18;
    g.fillStyle = 'rgba(255,255,255,.98)';
    g.font = '92px "Great Vibes", "Segoe Script", "Apple Chancery", cursive';
    g.fillText('happy birthday', 450, 100);
    g.shadowBlur = 8;
    g.fillStyle = 'rgba(255,250,255,.55)';
    g.font = '92px "Great Vibes", "Segoe Script", "Apple Chancery", cursive';
    g.fillText('happy birthday', 450, 100);
    g.shadowBlur = 0;
    return c;
  }

  function starShape(outer, inner) {
    const s = new THREE.Shape();
    for (let i = 0; i < 16; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }

  class CakeScene {
    constructor(canvas) {
      if (!window.THREE) throw new Error('Three.js not loaded');
      this.canvas = canvas;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
      // 手机：相机略抬高看蛋糕下移，给顶部文案留空
      const narrow = (typeof window !== 'undefined' && window.innerWidth < 700);
      this.narrow = narrow;
      this.camera.position.set(narrow ? 0.2 : 0.35, narrow ? 2.85 : 2.48, narrow ? 6.6 : 6.15);
      this.lookTarget = new THREE.Vector3(1.78, 0.42, 0);
      this.camera.lookAt(this.lookTarget);
      this.baseZ = 6.15;
      this.baseY = 2.48;
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.5;

      this.root = new THREE.Group();
      this.root.position.set(1.78, 0.04, 0);
      this.root.rotation.y = 0.28;
      this.scene.add(this.root);

      this.rings = [];
      this.smokes = [];
      this.floaters = [];
      this.confetti = [];
      this.flameOrbs = [];
      this.bokehOrbs = [];
      this.streaks = [];
      this.time = 0;
      this.last = performance.now();
      this.camX = 0;
      this.camY = 0;
      this.tx = 0;
      this.ty = 0;
      this.lit = true;
      this.flameLevel = 1;
      this.fxMode = 'stars';
      this.sprites = {};
      this.dummy = new THREE.Object3D();
      this.tmpColor = new THREE.Color();
      this.orbitAngle = 0.28;
      this.rootTurn = 0.28;
      this.spinDir = 1;
      // drag-to-spin + wheel zoom
      this.dragging = false;
      this.lastDragX = 0;
      this.dragAcc = 0;
      this.dragInertia = 0;
      this.dragMoved = 0;
      this.zoomOffset = 0;
      this.zoomTarget = 0;
      this.zoomIdle = 0;
      this.smokeClock = 0;
      this.motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this.reduced = !!(this.motion && this.motion.matches);
      if (this.motion) {
        const onChange = (ev) => { this.reduced = ev.matches; };
        if (this.motion.addEventListener) this.motion.addEventListener('change', onChange);
        else if (this.motion.addListener) this.motion.addListener(onChange);
      }

      this.buildTextures();
      this.buildLights();
      this.buildCake();
      this.buildPlate();
      this.buildCandle();
      this.buildDome();
      this.buildRings();
      this.buildBottomScript();
      this.buildOuterStars();
      this.buildFloatingStars();
      this.buildFloatingConfetti();
      this.buildSceneBokeh();
      this.buildStreaks();
      this.resize();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      window.addEventListener('resize', () => this.resize());
    }

    buildTextures() {
      const glow = new THREE.CanvasTexture(makeGlowTexture());
      glow.encoding = THREE.sRGBEncoding;
      const star = new THREE.CanvasTexture(makeStarTexture());
      star.encoding = THREE.sRGBEncoding;
      const smoke = new THREE.CanvasTexture(makeSmokeTexture());
      const flameTex = new THREE.CanvasTexture(makeFlameTexture());
      flameTex.encoding = THREE.sRGBEncoding;
      const streak = new THREE.CanvasTexture(makeStreakTexture());
      streak.encoding = THREE.sRGBEncoding;
      const galaxy = new THREE.CanvasTexture(makeGalaxyTexture());
      galaxy.encoding = THREE.sRGBEncoding;
      galaxy.wrapS = THREE.RepeatWrapping;
      galaxy.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const text = new THREE.CanvasTexture(makeTextTexture());
      text.encoding = THREE.sRGBEncoding;
      text.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const top = new THREE.CanvasTexture(makeTopTexture());
      top.encoding = THREE.sRGBEncoding;
      top.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const plate = new THREE.CanvasTexture(makePlateTexture());
      plate.encoding = THREE.sRGBEncoding;
      plate.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.sprites.glow = glow;
      this.sprites.star = star;
      this.sprites.smoke = smoke;
      this.sprites.flame = flameTex;
      this.sprites.streak = streak;
      this.sprites.text = text;
      this.sprites.top = top;
      this.sprites.plate = plate;
      this.galaxy = galaxy;
    }

    addGlow(color, size, pos, opacity, parent) {
      const mat = new THREE.SpriteMaterial({
        map: this.sprites.glow,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      if (Array.isArray(size)) sprite.scale.set(size[0], size[1], 1);
      else sprite.scale.set(size, size, 1);
      sprite.position.copy(pos);
      (parent || this.root).add(sprite);
      return sprite;
    }

    buildLights() {
      // saturated fills — bloom comes from lights and emissive, not a CSS filter
      this.scene.add(new THREE.AmbientLight(0xc090ff, 0.36));
      const hemi = new THREE.HemisphereLight(0xffc4ee, 0x241048, 0.58);
      this.scene.add(hemi);

      const key = new THREE.DirectionalLight(0xfff6ff, 1.2);
      key.position.set(-4.5, 7, 6);
      this.scene.add(key);

      const rim = new THREE.DirectionalLight(0xff5ec4, 1.45);
      rim.position.set(5.5, 3.5, -4.5);
      this.scene.add(rim);

      const warm = new THREE.DirectionalLight(0xffc060, 1.15);
      warm.position.set(1.2, 5.5, 3.2);
      this.scene.add(warm);

      const blue = new THREE.PointLight(0x4db4ff, 2.55, 14, 2);
      blue.position.set(-2.8, 0.4, 3.4);
      this.scene.add(blue);

      const magenta = new THREE.PointLight(0xff4ec0, 2.05, 12, 2);
      magenta.position.set(2.2, 1.1, 2.6);
      this.scene.add(magenta);

      const cyan = new THREE.PointLight(0x3eecff, 1.7, 11, 2);
      cyan.position.set(-1.6, 2.2, -2.8);
      this.scene.add(cyan);

      // plate uplight — pink-gold bloom under the cake
      this.plateLight = new THREE.PointLight(0xffb4ea, 3.4, 11, 2);
      this.plateLight.position.set(0, PLATE_Y + 0.18, 0);
      this.root.add(this.plateLight);

      this.candleLight = new THREE.PointLight(0xffa848, 5.2, 12, 2);
      this.candleLight.position.set(0, FLAME_Y - 0.05, 0.1);
      this.root.add(this.candleLight);

      const fill = new THREE.PointLight(0xd060ff, 1.7, 11, 2);
      fill.position.set(2.8, 1.6, -2.5);
      this.scene.add(fill);

      // warm pool on the frosting
      const topFill = new THREE.PointLight(0xffd090, 2.15, 8, 2);
      topFill.position.set(0.2, CAKE_TOP + 1.4, 1.6);
      this.root.add(topFill);
    }

    buildCake() {
      const bodyMat = new THREE.MeshBasicMaterial({
        map: this.galaxy,
        toneMapped: false
      });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(CAKE_R, CAKE_R * 1.012, CAKE_H, 160, 1, false),
        bodyMat
      );
      body.position.y = 0;
      this.root.add(body);

      const topMat = new THREE.MeshBasicMaterial({
        map: this.sprites.top,
        toneMapped: false
      });
      const top = new THREE.Mesh(new THREE.CylinderGeometry(CAKE_R * 1.002, CAKE_R * 1.002, 0.04, 96), topMat);
      top.position.y = CAKE_TOP + 0.01;
      this.root.add(top);

      // gold rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(CAKE_R * 1.004, 0.03, 8, 150),
        new THREE.MeshPhysicalMaterial({
          color: 0xfff0c0,
          roughness: 0.16,
          metalness: 0.62,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          emissive: 0xffb030,
          emissiveIntensity: 1.25
        })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = CAKE_TOP + 0.005;
      this.root.add(rim);

      this.buildGoldDrips();
      this.buildStarSprinkles();
      this.buildRoundConfetti();
    }

    buildGoldDrips() {
      const dripMat = new THREE.MeshPhysicalMaterial({
        color: 0xfff2c8,
        metalness: 0.62,
        roughness: 0.16,
        emissive: 0xffc048,
        emissiveIntensity: 1.22,
        clearcoat: 1
      });
      for (let i = 0; i < 34; i++) {
        const a = (i / 34) * TAU + rand(-0.1, 0.1);
        const len = rand(0.16, 0.58);
        const rad = rand(0.02, 0.038);
        const drip = new THREE.Mesh(
          new THREE.CylinderGeometry(rad * 0.7, rad, len, 8),
          dripMat
        );
        const r = CAKE_R * 1.01;
        drip.position.set(Math.sin(a) * r, CAKE_TOP - len * 0.35 - 0.02, Math.cos(a) * r);
        // tip blob
        const tip = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.05, 8, 8), dripMat);
        tip.position.set(Math.sin(a) * r, CAKE_TOP - len * 0.7 - 0.02, Math.cos(a) * r);
        this.root.add(tip);
        this.root.add(drip);
      }
    }

    buildStarSprinkles() {
      const geo = new THREE.ShapeGeometry(starShape(0.5, 0.22));
      const mat = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        toneMapped: false
      });
      const topCount = 720;
      const sideCount = 520;
      const plateCount = 56;
      const mesh = new THREE.InstancedMesh(geo, mat, topCount + sideCount + plateCount);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const d = new THREE.Object3D();
      for (let i = 0; i < topCount; i++) {
        const a = rand(0, TAU);
        const rr = CAKE_R * 0.97 * Math.pow(Math.random(), 0.52);
        const y = CAKE_TOP + 0.03 + (1 - rr / CAKE_R) * rand(0.02, 0.1) + rand(0, 0.03);
        const flat = Math.random() < 0.85;
        d.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr);
        d.rotation.set(
          flat ? -Math.PI / 2 + rand(-0.14, 0.14) : rand(-0.5, 0.5),
          rand(0, TAU),
          rand(0, TAU)
        );
        const s = rand(0.03, 0.095) * (Math.random() < 0.12 ? 1.65 : 1);
        d.scale.set(s, s, s);
        d.updateMatrix();
        mesh.setMatrixAt(i, d.matrix);
        mesh.setColorAt(i, this.tmpColor.setHex(pick(STAR_COLORS)));
      }

      for (let i = 0; i < sideCount; i++) {
        const idx = topCount + i;
        const a = rand(0, TAU);
        const y = rand(CAKE_BOT + 0.08, CAKE_TOP - 0.06);
        const r = CAKE_R * 1.022;
        const x = Math.sin(a) * r;
        const z = Math.cos(a) * r;
        d.position.set(x, y, z);
        d.lookAt(x * 2, y, z * 2);
        d.rotateZ(rand(0, TAU));
        const s = rand(0.03, 0.1) * (Math.random() < 0.14 ? 1.7 : 1);
        d.scale.set(s, s, s);
        d.updateMatrix();
        mesh.setMatrixAt(idx, d.matrix);
        const sideCol = Math.random() < 0.64
          ? pick(STAR_COLORS)
          : pick([0xffd24a, 0xffe28a, 0xfff1b0, 0xffffff, 0xffb84a]);
        mesh.setColorAt(idx, this.tmpColor.setHex(sideCol));
      }

      for (let i = 0; i < plateCount; i++) {
        const idx = topCount + sideCount + i;
        const a = rand(0, TAU);
        const rr = rand(CAKE_R + 0.14, PLATE_R - 0.22);
        d.position.set(Math.sin(a) * rr, PLATE_Y + 0.045, Math.cos(a) * rr);
        d.rotation.set(-Math.PI / 2 + rand(-0.2, 0.2), rand(0, TAU), rand(0, TAU));
        const s = rand(0.035, 0.09);
        d.scale.set(s, s, s);
        d.updateMatrix();
        mesh.setMatrixAt(idx, d.matrix);
        mesh.setColorAt(idx, this.tmpColor.setHex(pick(STAR_COLORS)));
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      this.root.add(mesh);
      this.sprinkleMesh = mesh;
    }

    buildRoundConfetti() {
      const geo = new THREE.CircleGeometry(0.5, 12);
      const mat = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        toneMapped: false
      });
      const topN = 460;
      const sideN = 320;
      const plateN = 64;
      const mesh = new THREE.InstancedMesh(geo, mat, topN + sideN + plateN);
      const d = new THREE.Object3D();

      for (let i = 0; i < topN; i++) {
        const a = rand(0, TAU);
        const rr = CAKE_R * 0.96 * Math.pow(Math.random(), 0.5);
        d.position.set(Math.sin(a) * rr, CAKE_TOP + 0.035 + rand(0, 0.05), Math.cos(a) * rr);
        d.rotation.set(-Math.PI / 2 + rand(-0.25, 0.25), 0, rand(0, TAU));
        const s = rand(0.018, 0.055);
        d.scale.set(s, s, s);
        d.updateMatrix();
        mesh.setMatrixAt(i, d.matrix);
        mesh.setColorAt(i, this.tmpColor.setHex(pick(STAR_COLORS)));
      }
      for (let i = 0; i < sideN; i++) {
        const idx = topN + i;
        const a = rand(0, TAU);
        const y = rand(CAKE_BOT + 0.1, CAKE_TOP - 0.08);
        const r = CAKE_R * 1.025;
        const x = Math.sin(a) * r;
        const z = Math.cos(a) * r;
        d.position.set(x, y, z);
        d.lookAt(x * 2, y, z * 2);
        const s = rand(0.016, 0.05);
        d.scale.set(s, s, s);
        d.updateMatrix();
        mesh.setMatrixAt(idx, d.matrix);
        mesh.setColorAt(idx, this.tmpColor.setHex(pick(STAR_COLORS)));
      }
      for (let i = 0; i < plateN; i++) {
        const idx = topN + sideN + i;
        const a = rand(0, TAU);
        const rr = rand(CAKE_R + 0.12, PLATE_R - 0.18);
        d.position.set(Math.sin(a) * rr, PLATE_Y + 0.042, Math.cos(a) * rr);
        d.rotation.set(-Math.PI / 2, 0, rand(0, TAU));
        const s = rand(0.02, 0.05);
        d.scale.set(s, s, s);
        d.updateMatrix();
        mesh.setMatrixAt(idx, d.matrix);
        mesh.setColorAt(idx, this.tmpColor.setHex(pick(STAR_COLORS)));
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      this.root.add(mesh);
    }

    buildPlate() {
      // flat glowing lavender / purple luminous disc + concentric rings
      const plateMat = new THREE.MeshBasicMaterial({
        map: this.sprites.plate,
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
        side: THREE.DoubleSide
      });
      const plate = new THREE.Mesh(new THREE.CircleGeometry(PLATE_R, 96), plateMat);
      plate.rotation.x = -Math.PI / 2;
      plate.position.y = PLATE_Y + 0.02;
      this.root.add(plate);

      // soft underside glow disc
      const under = new THREE.Mesh(
        new THREE.CircleGeometry(PLATE_R * 1.08, 64),
        new THREE.MeshBasicMaterial({
          color: 0xffb0ea,
          transparent: true,
          opacity: 0.34,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );
      under.rotation.x = -Math.PI / 2;
      under.position.y = PLATE_Y + 0.005;
      this.root.add(under);

      // additive ring accents — thin, few
      for (const [rr, op] of [[0.6, 0.16], [0.88, 0.1]]) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(PLATE_R * rr, 0.008, 6, 120),
          new THREE.MeshBasicMaterial({
            color: 0xe8d8ff,
            transparent: true,
            opacity: op,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = PLATE_Y + 0.028;
        this.root.add(ring);
      }

      this.addGlow(0xffc0f0, [9.2, 2.8], new THREE.Vector3(0, PLATE_Y - 0.02, -0.2), 0.48);
      this.addGlow(0xffffff, [4.6, 1.55], new THREE.Vector3(0, PLATE_Y + 0.05, 0.2), 0.3);
      this.addGlow(0xff78d0, [3.8, 1.3], new THREE.Vector3(0.8, PLATE_Y + 0.02, 0.9), 0.24);
      this.addGlow(0x78d8ff, [6.4, 1.9], new THREE.Vector3(-0.4, PLATE_Y - 0.01, 0.5), 0.26);
      this.addGlow(0xffc060, [3.6, 1.2], new THREE.Vector3(-0.6, PLATE_Y + 0.04, -0.7), 0.2);
    }

    buildCandle() {
      // thicker lavender / purple stick (demo)
      const candleMat = new THREE.MeshPhysicalMaterial({
        color: 0xe4b8ff,
        roughness: 0.32,
        metalness: 0.06,
        clearcoat: 0.62,
        clearcoatRoughness: 0.28,
        emissive: 0xd070ff,
        emissiveIntensity: 1.45
      });
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.066, CANDLE_H, 32),
        candleMat
      );
      candle.position.y = CAKE_TOP + CANDLE_H * 0.5;
      this.root.add(candle);

      const waxPool = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.098, 0.026, 24),
        candleMat
      );
      waxPool.position.y = CAKE_TOP + CANDLE_H - 0.01;
      this.root.add(waxPool);

      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.09, 8),
        new THREE.MeshBasicMaterial({ color: 0x1e1412 })
      );
      wick.position.y = CAKE_TOP + CANDLE_H + 0.035;
      this.root.add(wick);

      // larger readable teardrop flame (示例 lit) — soft halo, not a sun bloom
      this.flameGroup = new THREE.Group();
      this.flameGroup.position.set(0, FLAME_Y, 0);
      this.root.add(this.flameGroup);

      // primary teardrop sprite
      const flameMat = new THREE.SpriteMaterial({
        map: this.sprites.flame,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const flameSprite = new THREE.Sprite(flameMat);
      flameSprite.scale.set(0.34, 0.78, 1);
      flameSprite.position.set(0, 0.12, 0.025);
      this.flameGroup.add(flameSprite);
      this.flameOrbs.push({
        s: flameSprite,
        bx: 0, by: 0.12, bz: 0.025,
        phase: 0.3,
        speed: 9.5,
        baseOp: 1,
        baseScale: 0.34,
        baseScaleY: 0.78,
        lift: 0.018,
        isMain: true
      });

      // warm core spark — scaled with main flame
      const core = this.addGlow(0xfff6d0, 0.16, new THREE.Vector3(0, 0.04, 0.035), 1, this.flameGroup);
      this.flameOrbs.push({
        s: core, bx: 0, by: 0.04, bz: 0.035, phase: 1.1, speed: 12,
        baseOp: 1, baseScale: 0.16, lift: 0.01
      });

      // warm halo that pools onto the frosting
      this.flameGlow = this.addGlow(0xffb060, 1.05, new THREE.Vector3(0, FLAME_Y + 0.08, 0.04), 0.68);
      this.flameBloom = this.addGlow(0xff70c8, 1.35, new THREE.Vector3(0, FLAME_Y + 0.14, 0), 0.32);
      this.flameHalo = this.addGlow(0xffe4a0, 0.62, new THREE.Vector3(0, FLAME_Y + 0.08, 0.05), 0.52);
      this.flameShaft = this.addGlow(0xffc070, [0.22, 0.86], new THREE.Vector3(0, FLAME_Y - 0.02, 0.03), 0.32);
      this.addGlow(0xffa060, 1.7, new THREE.Vector3(0, CAKE_TOP + 0.12, 0.15), 0.32);
      this.addGlow(0xff78d0, 1.35, new THREE.Vector3(0.35, CAKE_TOP + 0.22, -0.15), 0.2);
      this.addGlow(0xfff0c0, 1.15, new THREE.Vector3(-0.2, CAKE_TOP + 0.08, 0.28), 0.16);

      // keep a primary flame sprite handle for setCandleLit compatibility
      this.flame = this.flameGroup;

      for (let i = 0; i < 16; i++) {
        const mat = new THREE.SpriteMaterial({
          map: this.sprites.smoke,
          color: 0xd8d4ef,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false
        });
        const s = new THREE.Sprite(mat);
        s.scale.set(0.3, 0.3, 1);
        s.position.set(0, FLAME_Y, 0);
        s.visible = false;
        s.renderOrder = 35;
        this.root.add(s);
        this.smokes.push({ s, life: 0, maxLife: 1, vy: 0.35 });
      }
    }

    buildDome() {
      // very soft fresnel shell — open night look, not a heavy snow globe
      const glassMat = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: { value: 0.055 }
        },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vN = normalize(mat3(modelMatrix) * normal);
            vV = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 4.2);
            vec3 col = mix(vec3(1.0, 0.62, 0.86), vec3(0.55, 0.9, 1.0), fres);
            gl_FragColor = vec4(col, fres * uOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const dome = new THREE.Mesh(new THREE.SphereGeometry(DOME_R, 64, 40), glassMat);
      dome.position.y = DOME_Y;
      this.root.add(dome);
    }

    buildRings() {
      // TWO primary Saturn-like glitter belts (示例.mp4) + soft outer sparkle
      this.ringGroup = new THREE.Group();
      this.ringGroup.position.y = RING_Y;
      this.root.add(this.ringGroup);

      const defs = [
        { r: CAKE_R * 1.42, tiltX: 0.95, tiltZ: 0.16, speed: 0.3, color: 0xffe29a, op: 0.82, sparks: 520, size: 0.12 },
        { r: CAKE_R * 1.66, tiltX: 1.08, tiltZ: -0.2, speed: -0.22, color: 0xff78d4, op: 0.66, sparks: 400, size: 0.11 },
        { r: CAKE_R * 1.88, tiltX: 1.18, tiltZ: 0.1, speed: 0.18, color: 0x7af0ff, op: 0.52, sparks: 280, size: 0.1 }
      ];

      defs.forEach((d) => {
        const pivot = new THREE.Group();
        pivot.rotation.z = d.tiltZ;
        pivot.rotation.y = rand(0, TAU);

        const mat = new THREE.MeshBasicMaterial({
          color: d.color,
          transparent: true,
          opacity: d.op * 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(d.r, 0.005, 6, 320), mat);
        mesh.rotation.x = d.tiltX;
        pivot.add(mesh);

        const glowMat = new THREE.MeshBasicMaterial({
          color: d.color,
          transparent: true,
          opacity: d.op * 0.32,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const glow = new THREE.Mesh(new THREE.TorusGeometry(d.r, 0.042, 8, 180), glowMat);
        glow.rotation.x = d.tiltX;
        pivot.add(glow);

        // dense glitter dust along the ring
        const pos = new Float32Array(d.sparks * 3);
        const col = new Float32Array(d.sparks * 3);
        for (let i = 0; i < d.sparks; i++) {
          const a = (i / d.sparks) * TAU + rand(-0.012, 0.012);
          const rr = d.r + rand(-0.055, 0.055);
          const x = Math.cos(a) * rr;
          const z = Math.sin(a) * rr;
          const y = rand(-0.035, 0.035);
          pos[i * 3] = x;
          pos[i * 3 + 1] = y;
          pos[i * 3 + 2] = z;
          const c = new THREE.Color(pick([0xffffff, 0xfff2c0, 0xffd060, 0xff78d0, 0x7af0ff, 0xfff6ff, 0xc9a0ff, 0xff9a4a]));
          col[i * 3] = c.r;
          col[i * 3 + 1] = c.g;
          col[i * 3 + 2] = c.b;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const sparkMat = new THREE.PointsMaterial({
          map: this.sprites.glow,
          size: d.size,
          vertexColors: true,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          toneMapped: false
        });
        const sparks = new THREE.Points(geo, sparkMat);
        sparks.rotation.x = d.tiltX;
        pivot.add(sparks);

        this.ringGroup.add(pivot);
        this.rings.push({ pivot, mesh, glow, sparks, speed: d.speed, baseOp: d.op, color: d.color });
      });
    }

    buildBottomScript() {
      // glowing white cursive under / near plate (demo)
      const mat = new THREE.SpriteMaterial({
        map: this.sprites.text,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
        toneMapped: false
      });
      const script = new THREE.Sprite(mat);
      script.scale.set(4.4, 1.1, 1);
      script.position.set(0.15, PLATE_Y - 0.55, 1.15);
      script.renderOrder = 20;
      script.visible = false; // screen-space HTML .script matches 示例.mp4
      this.root.add(script);
      this.scriptSprite = script;

      const glowMat = new THREE.SpriteMaterial({
        map: this.sprites.text,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Sprite(glowMat);
      glow.visible = false;
      glow.scale.set(4.6, 1.2, 1);
      glow.position.copy(script.position);
      glow.position.y -= 0.02;
      glow.renderOrder = 19;
      this.root.add(glow);
      this.scriptGlow = glow;

      this.addGlow(0xffffff, [4.0, 1.0], new THREE.Vector3(0.15, PLATE_Y - 0.5, 1.15), 0.28);
    }

    buildOuterStars() {
      const N = this.narrow ? 130 : 250;
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const a = rand(0, TAU);
        const r = rand(DOME_R * 0.55, 9.2);
        pos[i * 3] = Math.sin(a) * r;
        pos[i * 3 + 1] = rand(-2.5, 5.2);
        pos[i * 3 + 2] = Math.cos(a) * r * 0.75;
        const c = new THREE.Color(pick(STAR_COLORS));
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      this.starMat = new THREE.PointsMaterial({
        map: this.sprites.star,
        size: 0.128,
        vertexColors: true,
        transparent: true,
        opacity: 0.94,
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        toneMapped: false
      });
      this.starField = new THREE.Points(geo, this.starMat);
      this.root.add(this.starField);
    }

    buildFloatingStars() {
      const N = this.narrow ? 168 : 320;
      const geo = new THREE.ShapeGeometry(starShape(0.5, 0.2));
      const mat = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
        opacity: 0.95
      });
      this.floatMesh = new THREE.InstancedMesh(geo, mat, N);
      this.floatMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      for (let i = 0; i < N; i++) {
        const r = rand(CAKE_R + 0.25, DOME_R * 0.95);
        const y = rand(PLATE_Y + 0.2, DOME_Y + DOME_R * 0.7);
        const a = rand(0, TAU);
        let s = rand(0.042, 0.16);
        if (Math.random() < 0.07) s *= 1.7;
        this.floaters.push({
          a, r, y, s,
          speed: rand(-0.16, 0.16) + (Math.random() < 0.5 ? 0.04 : -0.04),
          phase: rand(0, TAU),
          spin: rand(0, TAU),
          spinSpeed: rand(-0.7, 0.7)
        });
        this.floatMesh.setColorAt(i, this.tmpColor.setHex(pick(STAR_COLORS)));
      }
      if (this.floatMesh.instanceColor) this.floatMesh.instanceColor.needsUpdate = true;
      this.root.add(this.floatMesh);
    }

    buildFloatingConfetti() {
      const N = this.narrow ? 110 : 220;
      const geo = new THREE.CircleGeometry(0.5, 10);
      const mat = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
        opacity: 0.88
      });
      this.confettiMesh = new THREE.InstancedMesh(geo, mat, N);
      this.confettiMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < N; i++) {
        const a = rand(0, TAU);
        const r = rand(CAKE_R + 0.3, DOME_R * 0.9);
        const y = rand(PLATE_Y + 0.25, DOME_Y + DOME_R * 0.65);
        const s = rand(0.02, 0.08) * (Math.random() < 0.15 ? 1.8 : 1);
        this.confetti.push({
          a, r, y, s,
          speed: rand(-0.12, 0.12),
          phase: rand(0, TAU),
          spin: rand(0, TAU),
          spinSpeed: rand(-0.8, 0.8)
        });
        this.confettiMesh.setColorAt(i, this.tmpColor.setHex(pick(STAR_COLORS)));
      }
      if (this.confettiMesh.instanceColor) this.confettiMesh.instanceColor.needsUpdate = true;
      this.root.add(this.confettiMesh);
    }

    buildSceneBokeh() {
      // soft multi-color bokeh — a few large dream orbs, smaller ones may drift upward
      for (let i = 0; i < (this.narrow ? 90 : 160); i++) {
        const col = pick(BOKEH_COLORS);
        const size = Math.random() < 0.16 ? rand(0.95, 2.05)
          : Math.random() < 0.48 ? rand(0.34, 0.82)
          : rand(0.12, 0.36);
        const a = rand(0, TAU);
        const r = size > 0.9 ? rand(CAKE_R + 1.6, 7.8) : rand(CAKE_R + 0.35, 6.8);
        const y = rand(-1.5, 4.8);
        const op = size > 0.9 ? rand(0.16, 0.34) : rand(0.24, 0.52);
        const parent = Math.random() < 0.4 ? this.scene : this.root;
        const orb = this.addGlow(col, size, new THREE.Vector3(
          (parent === this.scene ? 1.78 : 0) + Math.sin(a) * r,
          y,
          Math.cos(a) * r * 0.82
        ), op, parent);
        this.bokehOrbs.push({
          s: orb,
          a, r, y,
          size,
          baseOp: op,
          phase: rand(0, TAU),
          speed: rand(-0.045, 0.045),
          bob: rand(0.28, 0.95),
          world: parent === this.scene,
          rise: size < 0.4 && Math.random() < 0.6 ? rand(0.05, 0.13) : 0
        });
      }
      // colored mist hugging the plate
      for (let i = 0; i < (this.narrow ? 16 : 26); i++) {
        const a = rand(0, TAU);
        const r = rand(0.4, PLATE_R * 1.4);
        const mist = this.addGlow(
          pick([0xffb0e8, 0x9fd4ff, 0xffd090, 0xd8a6ff, 0x7ef0ff, 0xfff4d8, 0xff88c0]),
          rand(1.5, 3.2),
          new THREE.Vector3(Math.sin(a) * r, PLATE_Y + rand(0.05, 0.6), Math.cos(a) * r),
          rand(0.12, 0.26)
        );
        this.bokehOrbs.push({
          s: mist, a, r, y: mist.position.y, size: mist.scale.x,
          baseOp: mist.material.opacity, phase: rand(0, TAU),
          speed: rand(-0.02, 0.02), bob: 0.4, world: false, rise: 0
        });
      }
    }

    buildStreaks() {
      // anamorphic diagonal light streaks across the night (示例.mp4)
      for (let i = 0; i < (this.narrow ? 14 : 28); i++) {
        const mat = new THREE.SpriteMaterial({
          map: this.sprites.streak,
          color: pick([0xffffff, 0xd8e8ff, 0xffe8c0, 0xffd0e8, 0xfff6df, 0xff90d0, 0x90e8ff]),
          transparent: true,
          opacity: rand(0.22, 0.5),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          rotation: rand(-1.05, -0.25)
        });
        const s = new THREE.Sprite(mat);
        const len = rand(2.4, 5.8);
        s.scale.set(len, rand(0.045, 0.15), 1);
        s.position.set(rand(-5.2, 5.8), rand(0.2, 5.0), rand(-4.0, 2.6));
        this.root.add(s);
        this.streaks.push({
          s,
          baseOp: mat.opacity,
          phase: rand(0, TAU),
          drift: rand(0.08, 0.28)
        });
      }
    }

    setCandleLit(lit) {
      if (lit === this.lit) return;
      this.lit = lit;
      if (!lit) {
        this.flameGroup.visible = true;
        this.smokeClock = 0;
        this.smokes.forEach((p, i) => {
          p.life = rand(1.4, 2.8);
          p.maxLife = p.life;
          p.vy = rand(0.38, 0.72);
          p.s.visible = true;
          p.s.material.opacity = 0.05;
          p.s.position.set(rand(-0.06, 0.06), FLAME_Y - 0.18 + i * 0.01, rand(-0.06, 0.06));
          p.s.scale.set(rand(0.28, 0.5), rand(0.28, 0.5), 1);
        });
        this.triggerBlowBurst();
      } else {
        if (this.burstSprites) {
          this.burstSprites.forEach((b) => {
            b.life = 0;
            b.s.visible = false;
          });
        }
        this.smokes.forEach((p) => {
          p.life = 0;
          p.s.visible = false;
          p.s.material.opacity = 0;
        });
      }
    }

    triggerBlowBurst() {
      // Rings smash open from tip, then colorful shards rain to fill the view (calm density)
      if (!this.burstSprites) {
        this.burstSprites = [];
        for (let i = 0; i < 320; i++) {
          const roll = Math.random();
          const kind = roll < 0.1 ? 'huge' : roll < 0.4 ? 'big' : roll < 0.72 ? 'orb' : 'shard';
          const col = pick(STAR_COLORS.concat(BOKEH_COLORS).concat([
            0xffffff, 0xffe8b0, 0xff90c8, 0x7be8ff, 0xffb070, 0xff6b9d, 0xc6a6ff, 0x6af0c0
          ]));
          const mat = new THREE.SpriteMaterial({
            map: this.sprites.glow, // round glowing ball texture only
            color: col,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
          });
          const s = new THREE.Sprite(mat);
          s.visible = false;
          s.renderOrder = 40;
          this.root.add(s);
          this.burstSprites.push({
            s,
            vx: 0, vy: 0, vz: 0,
            life: 0, maxLife: 1,
            size: 0.2,
            kind,
            drag: 0.985,
            smashT: 0
          });
        }
      }
      const tipY = FLAME_Y + 0.08;
      const n = this.burstSprites.length;
      this.burstSprites.forEach((b, i) => {
        // birth on expanding ring arcs — smash outward, then fall across the view
        const ring = i % 5;
        const a = (i / n) * TAU * 2.15 + rand(-0.12, 0.12) + ring * 0.31;
        const elev = rand(-0.55, 0.95);
        const baseSpeed = b.kind === 'huge' ? rand(1.6, 4.0)
          : b.kind === 'big' ? rand(2.4, 6.2)
          : b.kind === 'shard' ? rand(3.0, 7.6)
          : rand(2.6, 6.8);
        const cosE = Math.cos(elev);
        const sinE = Math.sin(elev);
        const birthR = 0.04 + ring * 0.05 + rand(0, 0.03);
        b.s.position.set(
          Math.cos(a) * birthR + rand(-0.01, 0.01),
          tipY + Math.sin(elev) * birthR * 0.35 + rand(-0.01, 0.04),
          Math.sin(a) * birthR + rand(-0.01, 0.01)
        );
        b.vx = Math.cos(a) * cosE * baseSpeed;
        b.vz = Math.sin(a) * cosE * baseSpeed;
        b.vy = sinE * baseSpeed * 0.7 + rand(0.2, 1.6);
        if (b.kind === 'huge') {
          b.vx *= 0.7;
          b.vz *= 0.7;
          b.vy *= 0.65;
        }
        b.smashT = 0.14 + ring * 0.03 + rand(0, 0.1);
        b.life = b.kind === 'huge' ? rand(1.1, 1.9)
          : b.kind === 'big' ? rand(1.0, 1.7)
          : rand(0.95, 1.6);
        b.maxLife = b.life;
        b.size = b.kind === 'huge' ? rand(0.34, 0.62)
          : b.kind === 'big' ? rand(0.2, 0.42)
          : b.kind === 'shard' ? rand(0.08, 0.2)
          : rand(0.1, 0.26);
        b.drag = b.kind === 'huge' ? 0.958 : b.kind === 'big' ? 0.964 : 0.97;
        b.s.scale.set(b.size * 0.55, b.size * 0.55, 1);
        b.s.material.opacity = b.kind === 'huge' ? rand(0.3, 0.5) : rand(0.42, 0.74);
        b.s.material.color.setHex(pick(STAR_COLORS.concat(BOKEH_COLORS).concat([
          0xffffff, 0xffe8b0, 0xff90c8, 0x7be8ff, 0xffb070, 0xff6b9d, 0xc6a6ff, 0x6af0c0, 0xffd27a
        ])));
        b.s.visible = true;
      });
      this.candleLight.intensity = 4.15;

      // Expanding smash rings from tip (then shards carry the page fill)
      if (!this.blowHaloRings) {
        this.blowHaloRings = [];
        for (let i = 0; i < 3; i++) {
          const mat = new THREE.SpriteMaterial({
            map: this.sprites.glow,
            color: pick([0xffd27a, 0xff7cd0, 0x7be8ff, 0xb28bff, 0x9dffd8]),
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
          });
          const s = new THREE.Sprite(mat);
          s.visible = false;
          s.renderOrder = 42;
          this.root.add(s);
          this.blowHaloRings.push({ s, life: 0, maxLife: 1, size0: 0.2, size1: 3 });
        }
      }
      this.blowHaloRings.forEach((h, i) => {
        h.life = rand(0.6, 0.9) + i * 0.06;
        h.maxLife = h.life;
        h.size0 = 0.1 + i * 0.03;
        h.size1 = 2.0 + i * 0.8; // wide smash, still no full-screen halo
        h.s.position.set(0, tipY, 0);
        h.s.scale.set(h.size0, h.size0 * 0.72, 1);
        h.s.material.opacity = 0.42 - i * 0.05;
        h.s.material.color.setHex(pick([0xffd27a, 0xff7cd0, 0x7be8ff, 0xb28bff, 0x9dffd8, 0xff9d6e, 0xffffff]));
        h.s.visible = true;
      });
    }

    toggleSpinDir() {
      this.spinDir = this.spinDir >= 0 ? -1 : 1;
      return this.spinDir;
    }

    startDrag(clientX) {
      this.dragging = true;
      this.lastDragX = clientX;
      this.dragAcc = 0;
      this.dragMoved = 0;
      this.dragInertia = 0;
    }

    moveDrag(clientX) {
      if (!this.dragging) return;
      const dx = clientX - this.lastDragX;
      this.lastDragX = clientX;
      this.dragAcc = dx * 0.018;
      this.dragMoved += Math.abs(dx);
      this.rootTurn += this.dragAcc;
    }

    endDrag() {
      if (!this.dragging) return;
      this.dragging = false;
      this.dragInertia = this.dragAcc * 0.92;
    }

    isDragGesture() {
      return this.dragMoved > 8;
    }

    wheelZoom(deltaY) {
      this.zoomTarget = Math.max(-2.0, Math.min(2.4, this.zoomTarget + deltaY * 0.005));
      this.zoomIdle = 2.6; // auto return to default after this many seconds idle
    }

    hitTestAt(cssX, cssY) {
      const rect = this.canvas.getBoundingClientRect();
      const minDim = Math.min(rect.width, rect.height) || 1;
      const flame = this.getFlameScreenPosition();
      if (flame.ok) {
        const dFlame = Math.hypot(cssX - flame.x, cssY - flame.y);
        if (dFlame < minDim * 0.1) return 'flame';
      }
      // Project cake body center (root local origin near mid cake)
      const mid = new THREE.Vector3(0, 0.15, 0);
      this.root.updateMatrixWorld(true);
      mid.applyMatrix4(this.root.matrixWorld);
      mid.project(this.camera);
      const bx = (mid.x * 0.5 + 0.5) * rect.width;
      const by = (-mid.y * 0.5 + 0.5) * rect.height;
      const dBody = Math.hypot(cssX - bx, cssY - by);
      // Prefer flame when both could match; body is a wider lower zone
      if (dBody < minDim * 0.24 && (!flame.ok || cssY > flame.y + minDim * 0.04)) {
        return 'body';
      }
      if (dBody < minDim * 0.18) return 'body';
      return null;
    }

    getFlameScreenPosition() {
      // Project candle flame tip from 3D root space → canvas CSS pixels
      const tip = new THREE.Vector3(0, FLAME_Y + 0.08, 0);
      this.root.updateMatrixWorld(true);
      tip.applyMatrix4(this.root.matrixWorld);
      tip.project(this.camera);
      const rect = this.canvas.getBoundingClientRect();
      const x = (tip.x * 0.5 + 0.5) * rect.width;
      const y = (-tip.y * 0.5 + 0.5) * rect.height;
      return {
        x,
        y,
        nx: tip.x * 0.5 + 0.5,
        ny: -tip.y * 0.5 + 0.5,
        ok: tip.z > -1 && tip.z < 1
      };
    }

    setFxMode(mode) {
      this.fxMode = mode;
      const look = {
        stars: { c: [0xffe29a, 0xff78d4, 0x7af0ff], op: [0.82, 0.66, 0.52], star: 0.94, size: 0.128 },
        snow: { c: [0xeaf6ff, 0xd4ecff, 0xffffff], op: [0.55, 0.42, 0.34], star: 0.62, size: 0.09 },
        meteor: { c: [0xffd27a, 0xfff4e0, 0xff8ec8], op: [0.86, 0.68, 0.52], star: 0.98, size: 0.14 },
        halo: { c: [0xffc56a, 0xff7ae0, 0xb48cff], op: [0.9, 0.72, 0.56], star: 0.96, size: 0.145 }
      };
      const cfg = look[mode] || look.stars;
      this.rings.forEach((r, i) => {
        const ci = cfg.c[i % cfg.c.length];
        const oi = cfg.op[i % cfg.op.length];
        r.mesh.material.color.setHex(ci);
        r.glow.material.color.setHex(ci);
        r.baseOp = oi;
        r.mesh.material.opacity = oi;
        r.glow.material.opacity = oi * 0.32;
      });
      this.starMat.opacity = cfg.star;
      this.starMat.size = cfg.size;
      if (this.flameGlow) this.flameGlow.material.opacity = mode === 'snow' ? 0.3 : 0.55;
    }

    pointer(x, y) {
      this.tx = x;
      this.ty = y;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      const aspect = w / h;
      if (aspect < 0.8) {
        this.baseZ = 10.0;
        this.baseY = 3.55;
      } else if (aspect < 1.02) {
        this.baseZ = 8.6;
        this.baseY = 3.2;
      } else {
        this.baseZ = 7.55;
        this.baseY = 2.9;
      }
      this.camera.updateProjectionMatrix();
    }

    loop(now) {
      const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
      this.last = now;
      if (!this.reduced) this.time += dt;
      const motion = !this.reduced;

      this.camX = motion ? lerp(this.camX, this.tx * 0.18, 0.03) : 0;
      this.camY = motion ? lerp(this.camY, this.ty * 0.08, 0.03) : 0;

      if (motion) {
        this.orbitAngle += dt * 0.14;
        if (!this.dragging) {
          if (Math.abs(this.dragInertia) > 0.0004) {
            this.rootTurn += this.dragInertia;
            this.dragInertia *= Math.pow(0.015, dt);
          } else {
            this.dragInertia = 0;
            this.rootTurn += dt * 0.2 * (this.spinDir || 1);
          }
        }
      }
      if (this.zoomIdle > 0) {
        this.zoomIdle -= dt;
        if (this.zoomIdle <= 0) this.zoomTarget = 0;
      }
      this.zoomOffset = lerp(this.zoomOffset, this.zoomTarget, 1 - Math.pow(0.0009, dt));
      const ox = Math.sin(this.orbitAngle) * 0.95 + this.camX;
      const oz = Math.cos(this.orbitAngle) * 0.7;
      this.camera.position.x = ox;
      this.camera.position.y = this.baseY + (motion ? this.camY + Math.cos(this.time * 0.17) * 0.03 : 0);
      this.camera.position.z = this.baseZ + oz + this.zoomOffset;
      this.camera.lookAt(this.lookTarget.x + this.camX * 0.12, this.lookTarget.y, this.lookTarget.z);

      this.root.rotation.y = motion
        ? this.rootTurn + this.camX * 0.035
        : this.rootTurn;
      this.root.position.x = 1.78;
      this.root.position.y = motion ? 0.04 + Math.sin(this.time * 0.48) * 0.012 : 0.04;
      const breathe = motion ? 1 + Math.sin(this.time * 0.5) * 0.0025 : 1;
      this.root.scale.set(breathe, breathe, breathe);

      this.flameLevel = lerp(this.flameLevel, this.lit ? 1 : 0, 1 - Math.pow(0.0008, dt));
      const flicker = motion
        ? 1 + Math.sin(this.time * 11.2) * 0.06 + Math.sin(this.time * 6.8 + 1.2) * 0.045
        : 1;

      if (this.flameLevel > 0.012) {
        this.flameGroup.visible = true;
        // 极轻上下摇曳 — slow vertical breathing on the whole flame
        this.flameGroup.position.y = FLAME_Y + (motion ? Math.sin(this.time * 1.35) * 0.008 : 0);
        this.flameOrbs.forEach((o) => {
          const wob = Math.sin(this.time * o.speed + o.phase);
          const wob2 = Math.sin(this.time * o.speed * 1.35 + o.phase * 1.7);
          const sway = o.isMain ? 0.012 : 0.018;
          o.s.position.x = o.bx + Math.sin(this.time * o.speed * 0.7 + o.phase) * sway;
          o.s.position.y = o.by + wob * (o.lift || 0.012) + wob2 * 0.004;
          o.s.position.z = o.bz + Math.cos(this.time * o.speed * 0.6 + o.phase) * (sway * 0.7);
          const sx = o.baseScale * (0.92 + 0.08 * wob) * (0.7 + 0.3 * this.flameLevel) * flicker;
          const syBase = o.baseScaleY != null ? o.baseScaleY : o.baseScale * 1.05;
          const sy = syBase * (0.94 + 0.1 * wob) * (0.7 + 0.3 * this.flameLevel) * flicker;
          o.s.scale.set(sx * (1 + wob2 * 0.03), sy * (1.02 + wob * 0.05), 1);
          o.s.material.opacity = o.baseOp * this.flameLevel * (0.82 + 0.18 * wob);
        });
      } else {
        this.flameGroup.visible = false;
      }
      this.candleLight.intensity = 5.2 * this.flameLevel * flicker + 0.1;
      this.candleLight.color.setHex(this.flameLevel > 0.5 ? 0xffa848 : 0xb070d0);
      if (this.flameGlow) this.flameGlow.material.opacity = 0.62 * this.flameLevel * (0.85 + 0.15 * flicker);
      if (this.flameBloom) this.flameBloom.material.opacity = 0.28 * this.flameLevel;
      if (this.flameHalo) this.flameHalo.material.opacity = 0.5 * this.flameLevel * flicker;
      if (this.flameShaft) this.flameShaft.material.opacity = 0.28 * this.flameLevel;

      this.rings.forEach((r, i) => {
        r.pivot.rotation.y += motion ? r.speed * dt : 0;
        const pulse = 0.86 + 0.14 * Math.sin(this.time * 1.25 + i * 0.8);
        r.mesh.material.opacity = r.baseOp * (this.flameLevel > 0.5 ? 1 : 0.72) * pulse;
        if (r.glow) r.glow.material.opacity = r.baseOp * 0.32 * pulse;
        if (r.sparks) r.sparks.material.opacity = 0.88 + 0.12 * Math.sin(this.time * 2.2 + i);
      });

      this.starField.rotation.y = motion ? this.time * 0.028 : 0;
      this.starMat.opacity =
        (this.fxMode === 'snow' ? 0.62 : this.fxMode === 'meteor' ? 0.98 : 0.94) *
        (this.flameLevel > 0.4 ? 1 : 0.72);

      for (let i = 0; i < this.floaters.length; i++) {
        const f = this.floaters[i];
        const a = f.a + this.time * f.speed;
        const bob = Math.sin(this.time * 0.52 + f.phase) * 0.12;
        const twinkle = 0.8 + 0.2 * Math.sin(this.time * 1.2 + f.phase);
        const breatheR = f.r * (1 + Math.sin(this.time * 0.21 + f.phase) * 0.04);
        const d = this.dummy;
        d.position.set(Math.sin(a) * breatheR, f.y + bob, Math.cos(a) * breatheR);
        d.quaternion.copy(this.camera.quaternion);
        d.rotateZ(f.spin + this.time * f.spinSpeed + Math.sin(this.time * 0.4 + f.phase) * 0.12);
        const s = f.s * twinkle;
        d.scale.set(s, s, s);
        d.updateMatrix();
        this.floatMesh.setMatrixAt(i, d.matrix);
      }
      this.floatMesh.instanceMatrix.needsUpdate = true;

      for (let i = 0; i < this.confetti.length; i++) {
        const f = this.confetti[i];
        const a = f.a + this.time * f.speed;
        const bob = Math.sin(this.time * 0.6 + f.phase) * 0.09;
        const breatheR = f.r * (1 + Math.sin(this.time * 0.18 + f.phase) * 0.03);
        const d = this.dummy;
        d.position.set(Math.sin(a) * breatheR, f.y + bob, Math.cos(a) * breatheR);
        d.quaternion.copy(this.camera.quaternion);
        d.rotateZ(f.spin + this.time * f.spinSpeed);
        const s = f.s * (0.9 + 0.1 * Math.sin(this.time + f.phase));
        d.scale.set(s, s, s);
        d.updateMatrix();
        this.confettiMesh.setMatrixAt(i, d.matrix);
      }
      this.confettiMesh.instanceMatrix.needsUpdate = true;

      // drift bokeh
      this.bokehOrbs.forEach((b) => {
        if (b.rise) {
          b.y += b.rise * dt;
          if (b.y > 5.4) b.y = -1.8;
        }
        const a = b.a + this.time * b.speed;
        const ox = b.world ? 1.78 : 0;
        b.s.position.x = ox + Math.sin(a) * b.r;
        b.s.position.z = Math.cos(a) * b.r * 0.85;
        b.s.position.y = b.y + Math.sin(this.time * b.bob + b.phase) * 0.18;
        b.s.material.opacity = b.baseOp * (0.72 + 0.28 * Math.sin(this.time * 0.8 + b.phase));
      });

      this.streaks.forEach((st) => {
        st.s.material.opacity = st.baseOp * (0.55 + 0.45 * Math.sin(this.time * st.drift + st.phase));
        st.s.position.x += Math.sin(this.time * 0.1 + st.phase) * dt * 0.05;
      });

      if (this.scriptSprite) {
        this.scriptSprite.material.opacity = 0.92 + 0.08 * Math.sin(this.time * 1.1);
      }
      if (this.scriptGlow) {
        this.scriptGlow.material.opacity = 0.45 + 0.15 * Math.sin(this.time * 1.1);
      }

      if (this.burstSprites) {
        this.burstSprites.forEach((b) => {
          if (b.life <= 0) return;
          b.life -= dt;
          if (b.life <= 0) {
            b.s.visible = false;
            return;
          }
          b.s.position.x += b.vx * dt;
          b.s.position.y += b.vy * dt;
          b.s.position.z += b.vz * dt;
          // 砸开 then 落满: brief outward smash, then stronger fall across the view
          if (b.smashT != null && b.smashT > 0) {
            b.smashT -= dt;
            b.vy -= 0.55 * dt;
            const drag = (b.drag || 0.985) + 0.008;
            b.vx *= Math.min(0.992, drag);
            b.vz *= Math.min(0.992, drag);
          } else {
            b.vy -= 2.35 * dt;
            const drag = b.drag || 0.985;
            b.vx *= drag;
            b.vz *= drag;
          }
          const k = b.life / b.maxLife;
          const grow = b.kind === 'huge' ? 1.55 : b.kind === 'big' ? 1.05 : b.kind === 'shard' ? 0.55 : 0.7;
          const sc = b.size * (0.7 + (1 - k) * grow);
          b.s.scale.set(sc, sc, 1);
          b.s.material.opacity = k * (b.kind === 'huge' ? 0.62 : b.kind === 'big' ? 0.78 : 0.88);
        });
      }

      if (this.blowHaloRings) {
        this.blowHaloRings.forEach((h) => {
          if (h.life <= 0) return;
          h.life -= dt;
          if (h.life <= 0) {
            h.s.visible = false;
            return;
          }
          const k = h.life / h.maxLife;
          const t = 1 - k;
          // fast smash expand early, then ease while shards rain
          const sc = h.size0 + (h.size1 - h.size0) * (1 - Math.pow(1 - t, 1.25));
          h.s.scale.set(sc, sc * 0.68, 1);
          h.s.material.opacity = k * 0.55;
          h.s.position.y += dt * 0.08;
        });
      }

      // Continuous tip smoke while candle is out (烟雾)
      if (!this.lit && motion) {
        this.smokeClock -= dt;
        if (this.smokeClock <= 0) {
          this.smokeClock = rand(0.12, 0.28);
          const idle = this.smokes.find((p) => p.life <= 0);
          if (idle) {
            idle.life = rand(1.6, 2.8);
            idle.maxLife = idle.life;
            idle.vy = rand(0.42, 0.85);
            idle.s.visible = true;
            idle.s.material.opacity = 0.08;
            idle.s.position.set(rand(-0.05, 0.05), FLAME_Y - 0.16, rand(-0.05, 0.05));
            idle.s.scale.set(rand(0.22, 0.38), rand(0.22, 0.38), 1);
          }
        }
      }

      this.smokes.forEach((p) => {
        if (p.life <= 0) return;
        p.life -= dt;
        if (p.life <= 0) {
          p.s.visible = false;
          p.s.material.opacity = 0;
          return;
        }
        p.s.position.y += dt * (p.vy || 0.45);
        p.s.position.x += Math.sin(this.time * 1.6 + p.maxLife) * dt * 0.06;
        p.s.position.z += Math.cos(this.time * 1.1 + p.maxLife) * dt * 0.03;
        const k = p.life / p.maxLife;
        p.s.material.opacity = Math.min(0.55, k * 0.48);
        p.s.scale.x += dt * 0.18;
        p.s.scale.y += dt * 0.2;
      });

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.loop);
    }
  }

  window.CakeScene = CakeScene;
})();
