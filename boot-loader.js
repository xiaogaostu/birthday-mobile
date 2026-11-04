/*! boot-loader.js — preload all assets, then start the original app (copy only) */
(function () {
  'use strict';

  var screenEl = document.getElementById('boot-screen');
  var fillEl = document.getElementById('boot-bar-fill');
  var pctEl = document.getElementById('boot-pct');
  var tipEl = document.getElementById('boot-tip');
  var appEl = document.getElementById('app');
  var bgmEl = document.getElementById('bgm');

  var ASSETS = [
    { url: 'styles.css?v=20261104m', type: 'css', weight: 2 },
    { url: 'vendor/ma-shan-zheng.woff2', type: 'font', weight: 8 },
    { url: 'vendor/great-vibes.woff2', type: 'font', weight: 1 },
    { url: 'birthday-music.mp3', type: 'audio', weight: 18 },
    { url: 'vendor/three.min.js', type: 'script', weight: 6 },
    { url: 'petals.js?v=20261104i', type: 'script', weight: 1 },
    { url: 'fx.js?v=20261104m', type: 'script', weight: 1 },
    { url: 'cake.js?v=20261104m', type: 'script', weight: 2 },
    { url: 'sound.js?v=20261104i', type: 'script', weight: 1 },
    { url: 'app.js?v=20261104i', type: 'script', weight: 2 },
    { url: 'custom.js?v=20261104i', type: 'script', weight: 1, optional: true }
  ];

  var totalWeight = ASSETS.reduce(function (s, a) { return s + a.weight; }, 0);
  var doneWeight = 0;
  var blobs = Object.create(null);
  var minShownAt = Date.now() + 650;

  function setProgress(extra) {
    var pct = Math.max(0, Math.min(100, Math.round((doneWeight / totalWeight) * 100)));
    if (fillEl) fillEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%' + (extra ? ' · ' + extra : '');
  }

  function bump(weight, label) {
    doneWeight += weight;
    setProgress(label || '');
  }

  function fetchBuffer(url) {
    return fetch(url, { cache: 'force-cache' }).then(function (res) {
      if (!res.ok) throw new Error(url + ' ' + res.status);
      return res.arrayBuffer().then(function (buf) {
        return { url: url, buf: buf, type: res.headers.get('content-type') || '' };
      });
    });
  }

  function loadOne(asset) {
    return fetchBuffer(asset.url).then(function (pack) {
      blobs[asset.url] = pack;
      bump(asset.weight, asset.url.split('/').pop());
      return pack;
    }).catch(function (err) {
      if (asset.optional) {
        bump(asset.weight, '跳过自定义');
        return null;
      }
      throw err;
    });
  }

  function objectUrl(url, mime) {
    var pack = blobs[url];
    if (!pack) return url;
    var type = mime || pack.type || 'application/octet-stream';
    return URL.createObjectURL(new Blob([pack.buf], { type: type }));
  }

  function injectStylesheet(url) {
    // Keep real URL so @font-face relative paths still resolve; fonts were
    // already warmed into HTTP cache by fetch().
    return new Promise(function (resolve, reject) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = function () { resolve(); };
      link.onerror = function () { reject(new Error('css ' + url)); };
      document.head.appendChild(link);
    });
  }

  function injectScript(url) {
    return new Promise(function (resolve, reject) {
      var pack = blobs[url];
      if (!pack) {
        // optional missing
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = objectUrl(url, 'text/javascript');
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('js ' + url)); };
      document.body.appendChild(s);
    });
  }

  function waitFonts() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return Promise.race([
      document.fonts.ready,
      new Promise(function (r) { setTimeout(r, 2500); })
    ]);
  }

  function waitMinTime() {
    var left = minShownAt - Date.now();
    if (left <= 0) return Promise.resolve();
    return new Promise(function (r) { setTimeout(r, left); });
  }

  function reveal() {
    if (appEl) appEl.classList.remove('boot-pending');
    if (screenEl) {
      screenEl.setAttribute('aria-busy', 'false');
      screenEl.classList.add('is-done');
      setTimeout(function () {
        if (screenEl && screenEl.parentNode) screenEl.parentNode.removeChild(screenEl);
      }, 700);
    }
  }

  setProgress('准备中');

  // Parallel download, ordered inject.
  Promise.all(ASSETS.map(loadOne))
    .then(function () {
      if (tipEl) tipEl.textContent = '资源已就绪，正在唤醒星河…';
      // Attach audio from preloaded bytes so playback won't re-download.
      if (bgmEl && blobs['birthday-music.mp3']) {
        bgmEl.src = objectUrl('birthday-music.mp3', 'audio/mpeg');
        try { bgmEl.load(); } catch (e) { /* noop */ }
      }
      return injectStylesheet('styles.css?v=20261104m');
    })
    .then(function () {
      // Fonts are referenced by CSS @font-face; force decode if possible.
      var fontLoads = [];
      if (document.fonts && document.fonts.load) {
        fontLoads.push(document.fonts.load('400 48px "Ma Shan Zheng"'));
        fontLoads.push(document.fonts.load('400 48px "Great Vibes"'));
      }
      return Promise.all(fontLoads).catch(function () { /* noop */ });
    })
    .then(waitFonts)
    .then(function () {
      var order = [
        'custom.js?v=20261104i',
        'vendor/three.min.js',
        'petals.js?v=20261104i',
        'fx.js?v=20261104m',
        'cake.js?v=20261104m',
        'sound.js?v=20261104i',
        'app.js?v=20261104i'
      ];
      var chain = Promise.resolve();
      order.forEach(function (url) {
        chain = chain.then(function () { return injectScript(url); });
      });
      return chain;
    })
    .then(waitMinTime)
    .then(reveal)
    .catch(function (err) {
      console.error('[boot]', err);
      if (pctEl) pctEl.textContent = '加载失败，请刷新重试';
      if (tipEl) tipEl.textContent = String(err && err.message ? err.message : err);
      // Still try to reveal so user is not stuck forever on optional failures already handled.
    });
})();
