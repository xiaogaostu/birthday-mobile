/* ============================================================
   sound.js — a tiny generative music box (WebAudio, no assets)
   ============================================================ */
(() => {
  'use strict';

  class AmbientSound {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.delay = null;
      this.playing = false;
      this.timer = 0;
      this.notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    }

    async ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const ctx = new AC();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 18;
      comp.ratio.value = 3;
      comp.attack.value = .01;
      comp.release.value = .4;
      master.connect(comp);
      comp.connect(ctx.destination);
      this.master = master;

      // Dedicated SFX bus → destination (never ducked with pad master)
      const sfx = ctx.createGain();
      sfx.gain.value = 1;
      sfx.connect(ctx.destination);
      this.sfxGain = sfx;
      this._tearBuf = null;

      const delay = ctx.createDelay(1.2);
      delay.delayTime.value = .42;
      const fb = ctx.createGain();
      fb.gain.value = .3;
      const wet = ctx.createGain();
      wet.gain.value = .26;
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(master);
      this.delay = delay;

      // warm pad
      const padBus = ctx.createGain();
      padBus.gain.value = .05;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 620;
      filter.Q.value = .4;
      padBus.connect(filter);
      filter.connect(master);

      [130.81, 196.0, 261.63].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.detune.value = (i - 1) * 4;
        const g = ctx.createGain();
        g.gain.value = i === 2 ? .12 : .2;
        osc.connect(g);
        g.connect(padBus);
        osc.start();

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = .05 + i * .013;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2.5 + i;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        lfo.start();
      });
      return true;
    }

    async start() {
      const ok = await this.ensure();
      if (!ok) return false;
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      if (this.playing) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setTargetAtTime(.14, this.ctx.currentTime, .6);
        return true;
      }
      this.playing = true;
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(.14, now + 1.8);
      this.chime(now + .35);
      this.schedule();
      return true;
    }

    stop() {
      if (!this.ctx) return;
      this.playing = false;
      clearTimeout(this.timer);
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(.0001, now + .7);
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.playing) return;
      const wait = 2800 + Math.random() * 3200;
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        this.chime();
        this.schedule();
      }, wait);
    }

    _sfxOut() {
      return this.sfxGain || this.master || (this.ctx && this.ctx.destination);
    }

    _buildTearBuffer() {
      if (this._tearBuf || !this.ctx) return this._tearBuf;
      const ctx = this.ctx;
      const duration = 1.35;
      const rate = ctx.sampleRate;
      const n = Math.floor(rate * duration);
      const buffer = ctx.createBuffer(1, n, rate);
      const data = buffer.getChannelData(0);
      const bursts = [0.01, 0.1, 0.22, 0.36, 0.5, 0.66, 0.82, 0.98, 1.12];
      for (let i = 0; i < n; i++) {
        const t = i / rate;
        let env = 0;
        for (let b = 0; b < bursts.length; b++) {
          const d = t - bursts[b];
          if (d >= 0 && d < 0.18) {
            const peak = 0.7 + (b % 2) * 0.28;
            env += Math.exp(-d * (18 + b * 2.2)) * peak;
          }
        }
        if (t > 0.03 && t < 1.2) env += 0.07 * Math.random();
        data[i] = (Math.random() * 2 - 1) * Math.min(1.35, env);
      }
      this._tearBuf = buffer;
      return buffer;
    }

    /** Resume AudioContext inside user gesture (sync kick). */
    unlockSync() {
      if (!this.ctx) {
        // ensure() is async but has no await — runs sync
        try { this.ensure(); } catch (err) { /* noop */ }
      }
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') {
        try { this.ctx.resume(); } catch (err) { /* noop */ }
      }
      this._buildTearBuffer();
      return true;
    }

    /**
     * Paper-tear SFX — loud, routes to sfxGain→destination (not pad master).
     * Safe to call synchronously inside a tap/tear gesture after unlockSync().
     */
    playTear() {
      if (!this.unlockSync()) return false;
      const ctx = this.ctx;
      const buffer = this._buildTearBuffer();
      if (!buffer) return false;
      const now = ctx.currentTime;
      const duration = buffer.duration;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 380;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 0.65;
      bp.frequency.setValueAtTime(2100, now);
      bp.frequency.exponentialRampToValueAtTime(650, now + duration);
      const g = ctx.createGain();
      // Louder tear — clearly audible over BGM
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.95, now + 0.02);
      g.gain.setValueAtTime(0.78, now + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      src.connect(hp);
      hp.connect(bp);
      bp.connect(g);
      g.connect(this._sfxOut());
      src.start(now);
      src.stop(now + duration + 0.05);
      return true;
    }

    async playTearAsync() {
      await this.ensure();
      return this.playTear();
    }

    /** Soft whoosh + tiny chime when candle is blown. */
    async playBlow() {
      await this.ensure();
      if (!this.unlockSync()) return false;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const duration = 0.55;
      const rate = ctx.sampleRate;
      const n = Math.floor(rate * duration);
      const buffer = ctx.createBuffer(1, n, rate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < n; i++) {
        const t = i / rate;
        const env = Math.exp(-t * 6.5) * (1 - t / duration);
        data[i] = (Math.random() * 2 - 1) * env * 0.9;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(900, now);
      bp.frequency.exponentialRampToValueAtTime(280, now + duration);
      bp.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.55, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      src.connect(bp);
      bp.connect(g);
      g.connect(this._sfxOut());
      src.start(now);
      src.stop(now + duration + 0.04);
      // soft sparkle ping
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.22);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, now + 0.04);
      og.gain.exponentialRampToValueAtTime(0.045, now + 0.06);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(og);
      og.connect(this._sfxOut());
      osc.start(now + 0.04);
      osc.stop(now + 0.45);
      return true;
    }

    /** Tiny tick/chime when switching FX tabs. */
    async playFxSwitch() {
      await this.ensure();
      if (!this.unlockSync()) return false;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const freqs = [659.25, 783.99, 987.77];
      freqs.forEach((f, i) => {
        const t = now + i * 0.035;
        const osc = ctx.createOscillator();
        osc.type = i === 2 ? 'triangle' : 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.038 - i * 0.008, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osc.connect(g);
        g.connect(this._sfxOut());
        osc.start(t);
        osc.stop(t + 0.32);
      });
      return true;
    }

    chime(when) {
      if (!this.ctx || !this.playing) return;
      const ctx = this.ctx;
      const t = when == null ? ctx.currentTime + .02 : when;
      const freq = this.notes[Math.floor(Math.random() * this.notes.length)];
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.065, t + .025);
      g.gain.exponentialRampToValueAtTime(.0001, t + 3.6);
      osc.connect(g);
      g.connect(this.master);
      if (this.delay) g.connect(this.delay);
      osc.start(t);
      osc.stop(t + 3.8);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 2.001;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(.0001, t);
      g2.gain.exponentialRampToValueAtTime(.018, t + .04);
      g2.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
      osc2.connect(g2);
      g2.connect(this.master);
      osc2.start(t);
      osc2.stop(t + 2.4);
    }
  }

  window.AmbientSound = AmbientSound;
})();
