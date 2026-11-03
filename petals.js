/* ============================================================
   petals.js — a soft, full-screen petal fall for the day scene
   Canvas 2D, no assets, respects prefers-reduced-motion.
   ============================================================ */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const PETAL_COLORS = [
    ['#fff3f7', '#ffd7e6', '#f7a9c6'],
    ['#fffaf0', '#ffe7cb', '#f4c39a'],
    ['#fff5fa', '#ffd1df', '#e99bb8'],
    ['#fffdf5', '#ffe9d6', '#f0c6a8'],
    ['#fdf3ff', '#f2d3f4', '#d9a8db'],
    ['#fff6f4', '#ffd9d4', '#eda9a5']
  ];

  function makeSprite(colors) {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 128;
    const g = c.getContext('2d');
    const w = 34;
    const h = 54;
    g.translate(48, 64);

    g.beginPath();
    g.moveTo(0, -h);
    g.bezierCurveTo(w * .95, -h * .34, w * .68, h * .62, 0, h);
    g.bezierCurveTo(-w * .68, h * .62, -w * .95, -h * .34, 0, -h);
    g.closePath();

    const grad = g.createLinearGradient(0, -h, 0, h);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(.5, colors[1]);
    grad.addColorStop(1, colors[2]);
    g.fillStyle = grad;
    g.shadowColor = 'rgba(142, 55, 90, .18)';
    g.shadowBlur = 12;
    g.fill();

    g.shadowBlur = 0;
    g.strokeStyle = 'rgba(255, 255, 255, .52)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(0, -h * .82);
    g.bezierCurveTo(w * .18, -h * .3, w * .14, h * .35, 0, h * .8);
    g.stroke();

    g.strokeStyle = 'rgba(174, 76, 108, .18)';
    g.lineWidth = .8;
    g.beginPath();
    g.moveTo(-w * .3, -h * .18);
    g.bezierCurveTo(-w * .12, -h * .06, -w * .1, h * .22, -w * .18, h * .54);
    g.stroke();

    return c;
  }

  class PetalField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.w = 0;
      this.h = 0;
      this.dpr = 1;
      this.petals = [];
      this.sprites = PETAL_COLORS.map(makeSprite);
      this.time = 0;
      this.last = performance.now();
      this.raf = 0;
      this.day = document.getElementById('day');
      this.active = true;
      this.motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this.reduced = !!(this.motion && this.motion.matches);

      this.resize();
      this.loop = this.loop.bind(this);
      if (this.reduced) this.draw();
      else this.start();

      window.addEventListener('resize', () => {
        this.resize();
        if (this.reduced) this.draw();
      });

      if (this.motion) {
        const onChange = (ev) => {
          this.reduced = ev.matches;
          if (this.reduced) {
            this.stop();
            this.draw();
          } else {
            this.start();
          }
        };
        if (this.motion.addEventListener) this.motion.addEventListener('change', onChange);
        else if (this.motion.addListener) this.motion.addListener(onChange);
      }

      if (this.day && window.MutationObserver) {
        new MutationObserver(() => {
          this.active = !this.day.classList.contains('gone');
          if (!this.active) this.stop();
          else if (!this.reduced) this.start();
        }).observe(this.day, { attributes: true, attributeFilter: ['class'] });
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop();
        else if (!this.reduced && this.active) this.start();
      });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width || innerWidth));
      const h = Math.max(1, Math.round(rect.height || innerHeight));
      const oldW = this.w;
      const oldH = this.h;
      this.w = w;
      this.h = h;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      if (!this.petals.length) {
        this.build();
      } else if (oldW && oldH) {
        const sx = w / oldW;
        const sy = h / oldH;
        this.petals.forEach(p => {
          p.x *= sx;
          p.y *= sy;
        });
      }
    }

    build() {
      const count = innerWidth < 700 ? 40 : innerWidth < 1000 ? 64 : 96;
      this.petals = [];
      for (let i = 0; i < count; i++) this.petals.push(this.makePetal(true));
    }

    makePetal(initial) {
      const depth = rand(.45, 1.15);
      return {
        x: rand(-20, this.w + 20),
        y: initial ? rand(-this.h * .12, this.h * 1.02) : rand(-this.h * .22, -20),
        r: rand(5.6, 12.6) * depth,
        depth,
        vy: rand(15, 43) * (.72 + depth * .42),
        sway: rand(7, 27),
        swaySpeed: rand(.35, 1.25),
        phase: rand(0, TAU),
        rot: rand(0, TAU),
        rotSpeed: rand(-.42, .42),
        flip: rand(0, TAU),
        flipSpeed: rand(.35, 1.05),
        alpha: rand(.55, .94),
        sprite: pick(this.sprites)
      };
    }

    start() {
      if (this.reduced || !this.active || this.raf) return;
      this.last = performance.now();
      // Draw one frame immediately. Some browsers pause rAF for occluded
      // windows; this keeps the petals visible instead of a blank layer.
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    }

    stop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    loop(now) {
      this.raf = 0;
      if (!this.active || document.hidden) return;
      const dt = Math.min(.05, (now - this.last) / 1000 || .016);
      this.last = now;
      this.time += dt;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    }

    update(dt) {
      for (const p of this.petals) {
        p.y += p.vy * dt;
        p.x += Math.sin(this.time * p.swaySpeed + p.phase) * p.sway * dt;
        p.rot += p.rotSpeed * dt;
        p.flip += p.flipSpeed * dt;
        if (p.y > this.h + 40) {
          p.y = rand(-80, -12);
          p.x = rand(-30, this.w + 30);
        }
        if (p.x < -70) p.x = this.w + 50;
        else if (p.x > this.w + 70) p.x = -50;
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'source-over';
      for (const p of this.petals) {
        const turn = Math.cos(p.flip);
        const sx = .28 + .72 * Math.abs(turn);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(sx, 1);
        ctx.globalAlpha = p.alpha * (.72 + .28 * Math.abs(turn));
        const w = p.r * 2.05;
        const h = p.r * 2.7;
        ctx.drawImage(p.sprite, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  const canvas = document.getElementById('petals');
  if (canvas) window.petalField = new PetalField(canvas);
})();
