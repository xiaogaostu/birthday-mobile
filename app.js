/* ============================================================
   生日贺卡 · 把星河送给你
   app.js — content, card heart, scene transitions, UI
   (night visuals live in fx.js / cake.js / sound.js)
   ============================================================ */
(() => {
  'use strict';

  /* ----------------------------------------------------------
     Content — change these to make it yours
     (页内“设置”按钮可直接修改，保存在 localStorage)
     ---------------------------------------------------------- */
  const CUSTOM_KEY = 'birthday_custom_v1';
  const CONFIG_DEFAULT = {
    name: '小高同学',
    letterTitle: '致特别的你：',
    letterSign: '祝福你的人',
    autoSound: true,
    letter: [
      '生日快乐！新的一岁到来，先给你一个大大的拥抱。',
      '有你在的日子，总是多了很多温暖和笑声。那些一起分享的开心和烦恼，都让平凡的日子变得闪闪发光。',
      '谢谢你一直以来的温柔和陪伴，不管遇到什么事，想到你就会觉得很安心。',
      '新的一岁，愿你所有的努力都有回报，所有的期待都能如愿，去喜欢的地方，见想见的人，做想做的事。',
      '最想对你说的还是那一句：希望你天天开心，永远幸福。'
    ]
  };
  const CONFIG = Object.assign({}, CONFIG_DEFAULT);

  // 读取用户自定义：优先 custom.js（随文件夹分发给朋友 = 成品），其次本机 localStorage
  (function applyCustomConfig() {
    let src = null;
    try {
      src = window.CUSTOM || JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null');
    } catch (e) { src = null; }
    if (!src || typeof src !== 'object') return;
    if (typeof src.name === 'string' && src.name.trim()) CONFIG.name = src.name.trim();
    if (typeof src.letterTitle === 'string' && src.letterTitle.trim()) CONFIG.letterTitle = src.letterTitle.trim();
    if (typeof src.letterSign === 'string' && src.letterSign.trim()) CONFIG.letterSign = src.letterSign.trim();
    if (Array.isArray(src.letter)) {
      const ls = src.letter.map(s => String(s).trim()).filter(Boolean);
      if (ls.length) CONFIG.letter = ls;
    }
  })();

  // 90 张卡片，每一张都有属于自己的祝福，不循环、不重复。
  const WISHES = [
    ['所有的期待都如愿', '今天也要开心呀'],
    ['愿你一直闪闪发光', '你值得所有美好'],
    ['生日快乐，不止今天', '而是岁岁年年'],
    ['把烦恼丢远一点', '只留下甜甜的事'],
    ['好运常在', '万事胜意'],
    ['岁岁平安', '喜乐无忧'],
    ['今天你最大', '想做什么都可以'],
    ['愿你被世界温柔以待', '也被我温柔以待'],
    ['今天，是属于你的日子', '闪闪发光地长大吧'],
    ['希望你天天开心', '永远幸福'],
    ['愿你每天都有好心情', '笑容比星星还亮'],
    ['新的一岁，继续快乐', '奔赴下一场热爱'],
    ['愿你眼里有光', '心里有爱'],
    ['所有美好都奔向你', '一个都不许少'],
    ['愿你自由又快乐', '永远做自己'],
    ['想要的都拥有', '得不到的都释怀'],
    ['被爱包围', '被温柔接住'],
    ['万事胜意，一切从欢', '日子滚烫又明亮'],
    ['平安喜乐，顺遂无忧', '每一步都走得踏实'],
    ['心想事成，好运加倍', '惊喜一件接一件'],
    ['永远可爱，永远被爱', '做最自在的小朋友'],
    ['奔赴热爱', '山海皆可平'],
    ['你是今天的主角', '也是每天的宝贝'],
    ['愿你日日有小确幸', '岁岁有小欢喜'],
    ['许个愿吧', '星星会替你实现'],
    ['愿你此生尽兴', '赤诚善良'],
    ['前程似锦', '未来可期'],
    ['愿你心中有光', '脚下有路'],
    ['今天的风', '都在替我说爱你'],
    ['新的一岁，万事顺意', '想去的地方都能抵达'],
    ['愿你笑起来像春天', '明亮又温柔'],
    ['把好运装进口袋', '把烦恼留在昨天'],
    ['愿你熬夜有人陪', '早起有早餐'],
    ['愿你想哭就哭想笑就笑', '永远不必勉强'],
    ['你比自己想象的更好', '也比昨天更勇敢'],
    ['愿你被偏爱', '也永远有底气'],
    ['生日快乐，我的宝贝', '今天要把蛋糕吃光'],
    ['愿你岁岁有今朝', '年年有今日'],
    ['愿你所行皆坦途', '所遇皆温柔'],
    ['愿你被生活轻轻抱住', '所有委屈都有出口'],
    ['今天不许皱眉', '只许收下满屏的喜欢'],
    ['愿你做喜欢的事', '爱想爱的人'],
    ['愿你拥有滚烫人生', '也有安静的小角落'],
    ['愿你一生清澈明朗', '做想做的事'],
    ['愿你有酒有诗', '也有热腾腾的饭'],
    ['愿你想去的地方', '都有人陪你看风景'],
    ['愿你以后的日子', '都是自己喜欢的模样'],
    ['愿你被星光眷顾', '也被清晨叫醒'],
    ['愿你的努力都有回响', '你的等待都有答案'],
    ['愿你手里有花', '心里有海'],
    ['愿你不慌不忙', '活成自己的光'],
    ['愿你不用很厉害', '也能被好好爱着'],
    ['愿你二十岁的风', '吹到八十岁还温柔'],
    ['愿你走远路也不怕', '回头总有人在'],
    ['愿你被岁月善待', '被时光偏爱'],
    ['愿你的每个明天', '都比今天更值得期待'],
    ['愿你眼里长着太阳', '笑里全是坦荡'],
    ['愿你天黑有灯', '下雨有伞'],
    ['愿你三餐四季', '都有人间烟火'],
    ['愿你心里的小女孩', '永远不必长大'],
    ['愿你被好运追着跑', '被快乐撞个满怀'],
    ['愿你有热爱可抵岁月长', '也有温柔可暖人间'],
    ['愿你每一次落泪', '都是喜极而泣'],
    ['愿你逢考必过', '逢山有路'],
    ['愿你工作顺利', '钱包鼓鼓'],
    ['愿你睡到自然醒', '醒来就有好消息'],
    ['愿你被世界认真对待', '也被自己好好珍惜'],
    ['愿你所念皆星河', '所愿皆成真'],
    ['愿你人见人爱', '花见花开'],
    ['愿你永远有说走就走的勇气', '也有等你回家的人'],
    ['愿你不被年龄定义', '永远鲜活明亮'],
    ['愿你的快乐不用假装', '你的难过有人接住'],
    ['愿你生活有光', '心里有糖'],
    ['愿你一路有歌', '一路有花'],
    ['愿你所到之处', '遍地阳光'],
    ['愿你此后人生', '尽是坦途和喜乐'],
    ['愿你被爱意包围', '被幸福点名'],
    ['愿你把日子过成诗', '把平凡过成礼物'],
    ['愿你眉眼带笑', '岁月不催'],
    ['愿你有前程可奔赴', '也有岁月可回头'],
    ['愿你所求皆如愿', '所行皆坦荡'],
    ['愿你春风得意', '万事顺心'],
    ['愿你的世界', '永远亮着一盏灯'],
    ['愿你被未来温柔以待', '也被现在好好拥抱'],
    ['愿你从今往后', '每一天都值得庆祝'],
    ['愿你拥有甜甜的恋爱', '也拥有自由'],
    ['愿你的善良带点锋芒', '温柔且有力量'],
    ['愿你永远热泪盈眶', '永远相信美好'],
    ['愿你有生之年', '天天开心'],
    ['愿你被这个世界', '偷偷爱着']
  ];

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  const day = $('#day');
  const night = $('#night');
  const deckEl = $('#cardDeck');
  const tiltEl = $('#cardTilt');
  const cardStage = $('#cardStage');
  const openBtn = $('#openBtn');
  const wallTitle = $('#wallTitle');
  const flash = $('#flash');
  const live = $('#live');
  const noteReader = $('#noteReader');
  const notePaper = $('#notePaper');
  const noteMain = $('#noteMain');
  const noteSub = $('#noteSub');
  const noteIndex = $('#noteIndex');
  const noteSave = $('#noteSave');
  const noteNext = $('#noteNext');
  const noteClose = $('#noteClose');
  const bgmEl = $('#bgm');

  const BGM_SRC = 'birthday-music.mp3';
  const BGM_VOLUME = .34;
  const SAVED_KEY = 'birthday.saved.v1';

  const CARDS = [];
  const CARD_BY_EL = new Map();
  const IS_NARROW = innerWidth < 700;
  // 手机少叠几圈，心形更清晰；桌面仍 90 张
  const CARD_COUNT = IS_NARROW ? 36 : 90;
  const SAVED = loadSaved();

  const state = {
    mode: 'intro',
    hovered: null,
    lockedUntil: 0,
    soundWanted: true, // 默认开启声音
    soundOn: true,     // UI 默认显示已开启；实际播出走手势/微信解锁
    bgmActive: false,
    candleLit: true,
    fxMode: 'stars',
    noteOpen: false,
    noteOpening: false,
    noteClosing: false,
    noteMode: 'heart'
  };

  let nightAPI = null;
  let resizeTimer = 0;
  let lastPointer = { x: 0, y: 0 };
  let ambient = null;
  let activeCard = null;
  let lastNoteFocus = null;
  let noteOpenTimer = 0;
  let noteAnim = null;
  let bgmUnavailable = false;
  let bgmFadeTimer = 0;
  let bgmWanted = false;

  /* ----------------------------------------------------------
     Build the card deck
     ---------------------------------------------------------- */
  function buildCards() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < CARD_COUNT; i++) {
      const wish = WISHES[i % WISHES.length];
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.tint = String(i % 4);
      el.dataset.index = String(i);
      el.style.zIndex = String(i + 1);
      el.style.setProperty('--bob', `${(-hash(i + 3) * 6).toFixed(2)}s`);
      el.setAttribute('aria-label', `第 ${i + 1} 张祝福：${wish[0]}，${wish[1]}`);

      const mainClass = wish[0].length > 8 ? 'card-main long' : 'card-main';
      el.innerHTML =
        '<div class="card-float"><article class="card-face">' +
          '<span class="card-heart" aria-hidden="true">♡</span>' +
          '<span class="card-x" aria-hidden="true">×</span>' +
          `<p class="${mainClass}">${wish[0]}</p>` +
          `<p class="card-sub">${wish[1]}</p>` +
        '</article></div>';

      frag.appendChild(el);
      const card = { el, idx: i, wish, baseZ: 0, baseIndex: i + 1, baseDuration: '', ring: -1 };
      CARDS.push(card);
      CARD_BY_EL.set(el, card);
    }
    deckEl.appendChild(frag);
    CARDS.forEach(paintSaved);
    // 每张卡直绑：touch/pointer/click 都按 card id 打开（华为 translate 命中常失效，配合 left/top 定位）
    CARDS.forEach((card) => {
      let tap = null;
      let touchOpenedAt = 0;
      const tryCardOpen = (e, fromTouch) => {
        if (card.el.classList.contains('heart-hidden') || card.ring === -1 && state.mode === 'heart') return;
        if (state.mode === 'intro') {
          if (e && e.preventDefault) e.preventDefault();
          goHeart();
          return;
        }
        if (state.mode !== 'heart' && state.mode !== 'wall') return;
        if (state.noteOpen || state.noteOpening) return;
        // 心形：关闭动画中也允许立刻点下一张
        if (state.noteClosing && state.mode !== 'heart') return;
        if (performance.now() - lastOpenAt < (state.mode === 'heart' ? 90 : 160)) return;
        if (e && e.preventDefault) e.preventDefault();
        if (fromTouch) touchOpenedAt = performance.now();
        lastOpenAt = performance.now();
        openNote(card);
      };
      card.el.addEventListener('touchstart', (e) => {
        if (!e.changedTouches || !e.changedTouches.length) return;
        const t = e.changedTouches[0];
        tap = { id: 'touch', x: t.clientX, y: t.clientY, moved: false };
      }, { passive: true });
      card.el.addEventListener('touchmove', (e) => {
        if (!tap || tap.id !== 'touch' || !e.changedTouches || !e.changedTouches.length) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - tap.x;
        const dy = t.clientY - tap.y;
        if (dx * dx + dy * dy > 160) tap.moved = true;
      }, { passive: true });
      card.el.addEventListener('touchend', (e) => {
        if (!e.changedTouches || !e.changedTouches.length) return;
        const moved = tap && tap.moved;
        tap = null;
        if (moved) return;
        if (performance.now() - touchOpenedAt < 280) return;
        tryCardOpen(e, true);
      }, { passive: false });
      card.el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') return; // touch 路径已处理，避免双计
        tap = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      }, { passive: true });
      card.el.addEventListener('pointermove', (e) => {
        if (!tap || tap.id !== e.pointerId) return;
        const dx = e.clientX - tap.x;
        const dy = e.clientY - tap.y;
        if (dx * dx + dy * dy > 160) tap.moved = true;
      }, { passive: true });
      card.el.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'touch') return;
        if (!tap || tap.id !== e.pointerId) return;
        const moved = tap.moved;
        tap = null;
        if (moved) return;
        tryCardOpen(e, e.pointerType === 'pen');
      });
      card.el.addEventListener('pointercancel', () => { tap = null; });
      card.el.addEventListener('click', (e) => {
        if (performance.now() - touchOpenedAt < 450) {
          e.preventDefault();
          return;
        }
        tryCardOpen(e, false);
      });
    });
  }

  function cardScale() {
    // 手机端原先 0.52 字几乎看不见；略放大保证可读可点
    if (innerWidth < 700) return 0.78;
    if (innerWidth < 1000) return 0.82;
    return 1;
  }

  function applyCardScale() {
    deckEl.style.setProperty('--cs', String(cardScale()));
  }

  function place(card, o) {
    const el = card.el;
    const s = o.s == null ? 1 : o.s;
    const r = o.r == null ? 0 : o.r;
    // 成心动画必须走 transform（translate3d + rotateZ 一起过渡）。left/top 只在 settle 后用于安卓命中。
    if (el.dataset.layoutPos === '1') {
      // 已 settle：继续用 left/top，保持可点
      el.style.transitionDelay = `${o.delay || 0}ms`;
      el.style.transitionDuration = o.duration ? `${o.duration}s` : '';
      el.style.setProperty('--x', '0px');
      el.style.setProperty('--y', '0px');
      el.style.setProperty('--z', `${(o.z || 0).toFixed(2)}px`);
      el.style.setProperty('--r', `${r.toFixed(2)}deg`);
      el.style.setProperty('--s', String(s));
      el.style.left = `${(o.x - 75).toFixed(2)}px`;
      el.style.top = `${(o.y - 42).toFixed(2)}px`;
      el.style.transform = `rotateZ(${r.toFixed(2)}deg) scale(calc(${s} * var(--cs, 1)))`;
    } else {
      el.style.left = '-75px';
      el.style.top = '-42px';
      el.style.transform = '';
      el.dataset.layoutPos = '0';
      // 旋转成心：先瞬时设起飞角，再过渡到切线角（与位移同步）
      if (o.spinFrom != null && o.duration) {
        el.style.transitionDuration = '0s';
        el.style.transitionDelay = '0ms';
        el.style.setProperty('--x', `${(card.lx != null ? card.lx : o.x).toFixed(2)}px`);
        el.style.setProperty('--y', `${(card.ly != null ? card.ly : o.y).toFixed(2)}px`);
        el.style.setProperty('--z', `${(o.z || 0).toFixed(2)}px`);
        el.style.setProperty('--r', `${o.spinFrom.toFixed(2)}deg`);
        el.style.setProperty('--s', String(card.ls != null ? card.ls : s));
        void el.offsetWidth; // 强制回流，确保浏览器记下起点
      }
      el.style.transitionDelay = `${o.delay || 0}ms`;
      el.style.transitionDuration = o.duration ? `${o.duration}s` : '';
      el.style.setProperty('--x', `${o.x.toFixed(2)}px`);
      el.style.setProperty('--y', `${o.y.toFixed(2)}px`);
      el.style.setProperty('--z', `${(o.z || 0).toFixed(2)}px`);
      el.style.setProperty('--r', `${r.toFixed(2)}deg`);
      el.style.setProperty('--s', String(s));
    }
    if (o.zIndex != null) el.style.zIndex = String(o.zIndex);
    if (o.opacity != null) el.style.opacity = String(o.opacity);
    el.style.filter = o.blur ? `blur(${o.blur}px)` : '';
    card.baseZ = o.z;
    card.baseDuration = o.duration ? `${o.duration}s` : '';
    if (o.zIndex != null) card.baseIndex = o.zIndex;
    card.lx = o.x;
    card.ly = o.y;
    card.ls = s;
    card.lr = r;
  }

  /** 成心动画结束后，无跳动地切到 left/top，方便安卓原生点击 */
  function settleHeartLayoutHits() {
    if (state.mode !== 'heart' || innerWidth >= 700) return;
    CARDS.forEach((card) => {
      if (!card || card.ring === -1 || !card.el) return;
      const el = card.el;
      const s = card.ls == null ? 1 : card.ls;
      const r = card.lr || 0;
      el.style.transitionDuration = '0s';
      el.style.transitionDelay = '0ms';
      el.style.left = `${(card.lx - 75).toFixed(2)}px`;
      el.style.top = `${(card.ly - 42).toFixed(2)}px`;
      el.style.setProperty('--x', '0px');
      el.style.setProperty('--y', '0px');
      el.style.transform = `rotateZ(${r.toFixed(2)}deg) scale(calc(${s} * var(--cs, 1)))`;
      el.dataset.layoutPos = '1';
    });
  }

  function layoutDeck(quick) {
    const n = CARDS.length;
    const mobile = innerWidth < 700;
    CARDS.forEach((card, i) => {
      const off = i - (n - 1);
      place(card, {
        x: off * (mobile ? 0.28 : 0.55),
        // 略抬高牌堆，但仍在艺术字下方留空（不挡住「生日快乐」）
        y: -off * (mobile ? 0.12 : 0.26) + (mobile ? 52 : 28),
        z: 0,
        r: off * (mobile ? 0.08 : 0.16),
        s: mobile ? 0.80 : 0.94,
        delay: quick || REDUCED ? 0 : i * 4,
        duration: quick ? 0.45 : null,
        zIndex: i + 1,
        opacity: null,
        blur: 0
      });
      card.ring = 0; // intro 可点进心形
    });
  }

  /* ----------------------------------------------------------
     Heart geometry
     ---------------------------------------------------------- */
  function heartBasePoints() {
    const N = 2400;
    const raw = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * TAU;
      // 经典心形参数曲线
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      raw.push({ x, y });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const mobile = innerWidth < 700;
    // 手机略收窄、略加高：两叶更匀、心尖更清晰，少贴边
    const W = Math.min(
      innerWidth * (mobile ? 0.86 : 0.58),
      innerHeight * (mobile ? 0.50 : 0.78),
      mobile ? 380 : 800
    );
    const H = W * (mobile ? 0.98 : 0.90);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const spanX = (maxX - minX) || 1;
    const spanY = (maxY - minY) || 1;
    // 心尖下移避开顶栏；桌面不挪
    const yNudge = mobile ? 38 : 0;
    // 轻微塑形：尖端拉长、顶叶略圆、强制左右关于 x=0 对称
    const tipStretch = mobile ? 1.10 : 1.05;
    const lobeRound = mobile ? 0.97 : 0.99;
    const lobeWiden = mobile ? 0.06 : 0.03;
    const pts = raw.map((p) => {
      let x = ((p.x - cx) / spanX) * W;
      let y = (-(p.y - cy) / spanY) * H; // 翻转后 +y 为心尖方向
      if (y >= 0) y *= tipStretch;
      else y *= lobeRound;
      const topness = clamp((-y) / (H * 0.5), 0, 1);
      x *= 1 + lobeWiden * topness;
      return { x, y: y + yNudge };
    });
    // 再做一次镜像平均，消除采样/塑形带来的左右差
    return pts.map((p, i) => {
      const m = pts[pts.length - 1 - i];
      return {
        x: (p.x - m.x) / 2,
        y: (p.y + m.y) / 2
      };
    });
  }

  function resampleClosed(points, count) {
    const n = points.length;
    const cum = [0];
    let total = 0;
    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];
      total += Math.hypot(b.x - a.x, b.y - a.y);
      cum.push(total);
    }
    if (total <= 0) return [];

    // 心尖 = 最大 y；从心尖起沿周长等分，左右自然对称
    let tipI = 0;
    for (let i = 1; i < n; i++) {
      if (points[i].y > points[tipI].y) tipI = i;
    }
    const tipArc = cum[tipI];

    const sampleAt = (arc) => {
      let target = arc % total;
      if (target < 0) target += total;
      let lo = 0;
      let hi = n;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      const i1 = Math.min(Math.max(lo, 1), n) - 1;
      const i2 = (i1 + 1) % n;
      const a0 = cum[i1];
      const a1 = cum[i1 + 1];
      const seg = a1 - a0 || 1;
      const f = (target - a0) / seg;
      const a = points[i1];
      const b = points[i2];
      return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) };
    };

    const out = [];
    for (let k = 0; k < count; k++) {
      const p = sampleAt(tipArc + (total * k) / count);
      out.push({ x: p.x, y: p.y, r: 0, frac: k / count });
    }
    // 镜像平均：消除残留左右偏差
    for (let k = 0; k < count; k++) {
      const a = out[k];
      const b = out[(count - k) % count];
      const x = (a.x - b.x) / 2;
      const y = (a.y + b.y) / 2;
      a.x = x;
      a.y = y;
    }
    out[0].x = 0;
    if (count % 2 === 0) out[count / 2].x = 0;

    for (let k = 0; k < count; k++) {
      const a = out[k];
      const b = out[(k + 1) % count];
      let r = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      while (r > 90) r -= 180;
      while (r < -90) r += 180;
      a.r = r;
    }
    return out;
  }

  function layoutHeart(quick) {
    const base = heartBasePoints();
    const mobile = innerWidth < 700;
    // 手机：偶数张/环距更匀，外形更干净；桌面仍三圈 90 张
    const rings = mobile ? [
      { n: 24, s: 1.0,  cardScale: 0.92, z: 0, opacity: 1, blur: 0 },
      { n: 14, s: 0.70, cardScale: 0.86, z: 0, opacity: 1, blur: 0 },
      { n: 6,  s: 0.40, cardScale: 0.80, z: 0, opacity: 1, blur: 0 }
    ] : [
      { n: 40, s: 1.0,  cardScale: 1.00, z: 0, opacity: 1, blur: 0 },
      { n: 30, s: 0.74, cardScale: 0.94, z: -64, opacity: 0.96, blur: 0.25 },
      { n: 20, s: 0.48, cardScale: 0.88, z: -128, opacity: 0.9, blur: 0.5 }
    ];
    let idx = 0;
    const jitterAmp = mobile ? 0.9 : 7;
    const rotAmp = mobile ? 0.45 : 3.2;
    rings.forEach((ring, ri) => {
      const pts = resampleClosed(base, ring.n);
      pts.forEach((p, pi) => {
        const card = CARDS[idx++];
        if (!card) return;
        const jx = (hash(idx * 1.7) - 0.5) * jitterAmp;
        const jy = (hash(idx * 3.3) - 0.5) * jitterAmp;
        const jr = (hash(idx * 5.9) - 0.5) * rotAmp;
        const scaleJitter = mobile
          ? 0.985 + hash(idx * 8.1) * 0.03
          : 0.97 + hash(idx * 8.1) * 0.06;
        const z = ring.z + (hash(idx * 2.4) - 0.5) * (mobile ? 1.5 : 10);
        // 外圈更高，重叠时优先点到看得见的外圈卡
        const zIndex = 2000 - ri * 400 + pi;
        // 成心：沿心缘切线旋转飞入（原版 r = 切线角），带绕心顺序 stagger，像旋转铺开
        // 额外 spinBoost 让牌从更大角度转入，避免「平移一下子到位」
        const spinBoost = quick || REDUCED ? 0 : ((pi % 2 === 0 ? 1 : -1) * (155 + ri * 40 + (pi % 7) * 12));
        place(card, {
          x: p.x * ring.s + jx,
          y: p.y * ring.s + jy,
          z,
          r: p.r + jr, // 恢复原版切线朝向（手机也旋转；settle 后再 left/top 保点击）
          s: ring.cardScale * scaleJitter,
          delay: quick || REDUCED ? 0 : (mobile
            ? p.frac * 980 + ri * 220 + (pi % 5) * 28
            : p.frac * 900 + ri * 200 + (pi % 5) * 24),
          duration: quick ? 0.45 : REDUCED ? 0.3 : (mobile ? 2.55 : 3.05),
          zIndex,
          opacity: ring.opacity,
          blur: cardScale() < 0.75 ? 0 : ring.blur,
          // 起飞前若已写入 spinFrom，place 内会先无过渡设好再飞向目标角
          spinFrom: quick || REDUCED ? null : (p.r + jr + spinBoost)
        });
        card.ring = ri;
        card.el.dataset.ring = String(ri);
        card.el.classList.remove('heart-hidden');
      });
    });
    // 若仍有多余卡片（例如桌面→手机缩放后），藏到场外
    while (idx < CARDS.length) {
      const card = CARDS[idx++];
      place(card, {
        x: 0, y: 0, z: -420, r: 0, s: 0.01,
        delay: 0, duration: quick ? 0.35 : 0.3,
        zIndex: 0, opacity: 0, blur: 0
      });
      card.ring = -1;
      card.el.dataset.ring = '';
      card.el.classList.add('heart-hidden');
    }
    tiltEl.style.setProperty('--tilt-x', '0deg');
    tiltEl.style.setProperty('--tilt-y', '0deg');
  }

  /* ----------------------------------------------------------
     Wish wall — a loose, deliberately messy scatter
     ---------------------------------------------------------- */
  function layoutWall(quick) {
    const n = CARDS.length;
    const w = innerWidth;
    const h = innerHeight;
    const mobile = w < 700;
    const cs = cardScale();
    // 手机也错乱散开，但绕开中心大信封；桌面保持原来的故意凌乱
    const baseScale = mobile ? 0.78 : h < 720 ? 0.84 : 1.02;
    const cardW = 150 * cs * baseScale;
    const cardH = 84 * cs * baseScale;
    const padX = clamp(w * (mobile ? 0.03 : 0.035), mobile ? 8 : 8, 30);
    const padY = clamp(h * (mobile ? 0.06 : 0.045), mobile ? 52 : 8, mobile ? 88 : 34);
    const startX = padX + cardW / 2 - w / 2;
    const endX = w - padX - cardW / 2 - w / 2;
    const startY = padY + cardH / 2 - h * 0.46;
    const endY = h - padY - cardH / 2 - h * 0.46;

    const cols = mobile ? 5 : 10;
    const rows = Math.ceil(n / cols);
    const stepX = cols > 1 ? (endX - startX) / (cols - 1) : 0;
    const stepY = rows > 1 ? (endY - startY) / (rows - 1) : 0;

    const order = [];
    for (let i = 0; i < n; i++) order.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(hash(i * 9.7 + 4) * (i + 1));
      const t = order[i]; order[i] = order[j]; order[j] = t;
    }

    // 卡片铺满整墙（含信封正下方）：信封 z 更高抢点击；撕开后底层卡片可点
    CARDS.forEach((card, i) => {
      const slot = order[i];
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const rowOffset = (row % 2 ? 1 : -1) * stepX * (mobile ? 0.18 : 0.12);
      const jx = (hash(i * 2.3 + 1.7) - 0.5) * stepX * (mobile ? 0.72 : 0.54);
      const jy = (hash(i * 6.1 + 2.9) - 0.5) * stepY * (mobile ? 0.62 : 0.46);
      let x = clamp(startX + col * stepX + rowOffset + jx, startX, endX);
      let y = clamp(startY + row * stepY + jy, startY, endY);


      const rot = mobile
        ? (hash(i * 4.7 + 3.1) - 0.5) * 28
          + (i % 5 === 0 ? (hash(i * 13.3) - 0.5) * 12 : 0)
        : (hash(i * 4.7 + 3.1) - 0.5) * 38
          + (i % 7 === 0 ? (hash(i * 13.3) - 0.5) * 20 : 0);
      const scale = baseScale * (mobile
        ? 0.88 + hash(i * 7.1) * 0.22
        : 0.9 + hash(i * 7.1) * 0.2);
      place(card, {
        x,
        y,
        z: mobile ? -10 + hash(i * 3.9) * 22 : -22 + hash(i * 3.9) * 44,
        r: rot,
        s: scale,
        delay: quick || REDUCED ? 0 : (mobile
          ? row * 35 + col * 12 + hash(i * 5.3 + 5.5) * 160
          : row * 95 + col * 18 + hash(i * 5.3 + 5.5) * 320),
        duration: quick ? 0.45 : REDUCED ? 0.3 : (mobile ? 1.05 : 2.55),
        zIndex: 100 + Math.floor(hash(i * 11.7) * (mobile ? 400 : 820)),
        opacity: 1,
        blur: 0
      });
      card.el.classList.remove('heart-hidden');
    });
    tiltEl.style.setProperty('--tilt-x', '0deg');
    tiltEl.style.setProperty('--tilt-y', '0deg');
  }

  /* ----------------------------------------------------------
     Intro placement — keep the open button clear of the script
     ---------------------------------------------------------- */
  function positionIntro() {
    const intro = $('.intro');
    const en = $('.calligraphy .en');
    if (!intro || !en) return;
    const enRect = en.getBoundingClientRect();
    if (!enRect.height) return;
    const dayRect = day.getBoundingClientRect();
    const gap = innerWidth < 700 ? 16 : 22;
    const margin = 12;
    const introH = intro.offsetHeight || 0;
    const desired = enRect.bottom - dayRect.top + gap;
    const maxTop = innerHeight - margin - introH;
    intro.style.top = `${Math.round(Math.max(margin, Math.min(desired, maxTop)))}px`;
  }

  /* ----------------------------------------------------------
     Card hover / hit testing (all three heart rings + wall)
     ---------------------------------------------------------- */
  function setHover(card) {
    if (state.noteOpen || state.noteOpening || state.noteClosing) card = null;
    if (state.hovered === card) return;
    if (state.hovered) {
      const prev = state.hovered;
      prev.el.classList.remove('hovered');
      prev.el.style.transitionDelay = '0ms';
      prev.el.style.transitionDuration = prev.baseDuration || '';
      prev.el.style.setProperty('--z', `${prev.baseZ.toFixed(2)}px`);
      prev.el.style.zIndex = String(prev.baseIndex);
    }
    state.hovered = null;
    if (!card) return;
    state.hovered = card;
    card.el.classList.add('hovered');
    card.el.style.transitionDelay = '0ms';
    card.el.style.transitionDuration = '.55s';
    card.el.style.setProperty('--z', `${(card.baseZ + 170).toFixed(2)}px`);
    card.el.style.zIndex = '9999';
  }

  function clearHover() {
    setHover(null);
  }

  function cardLayoutHit(card, x, y) {
    if (!card || card.lx == null || card.ly == null) return null;
    if (card.el.classList.contains('heart-hidden')) return null;
    if (card.ring === -1) return null;
    const deckRect = deckEl.getBoundingClientRect();
    const cs = cardScale();
    const s = (card.ls == null ? 1 : card.ls) * cs;
    let pad = innerWidth < 700 ? 34 : 12;
    if (innerWidth < 700 && card.ly < -20) pad += 20;
    // 边缘/心尖卡加大命中，减少点空
    if (innerWidth < 700) {
      const absX = Math.abs(card.lx || 0);
      const absY = Math.abs(card.ly || 0);
      if (absX > 110 || absY > 130) pad += 18;
      else if (absX > 70 || absY > 90) pad += 10;
    }
    const hw = 75 * s + pad;
    const hh = 42 * s + pad;
    const cx = deckRect.left + card.lx;
    const cy = deckRect.top + card.ly;
    // 逆旋转到卡片本地坐标（OBB），解决旋转后 AABB 对不齐
    const rad = ((card.lr || 0) * Math.PI) / 180;
    const dx = x - cx;
    const dy = y - cy;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    if (Math.abs(lx) > hw || Math.abs(ly) > hh) return null;
    const nx = lx / Math.max(hw, 1);
    const ny = ly / Math.max(hh, 1);
    return nx * nx + ny * ny;
  }

  function findCardAt(x, y) {
    let best = null;
    const consider = (card, preferBoost, distOverride) => {
      if (!card || !card.el) return;
      const node = card.el;
      if (node.classList.contains('heart-hidden') || card.ring === -1) return;
      const op = Number(node.style.opacity);
      if (node.style.opacity !== '' && op === 0) return;
      let dist = distOverride;
      if (dist == null) {
        // 优先 OBB；再退到 getBoundingClientRect
        const obb = cardLayoutHit(card, x, y);
        if (obb != null) {
          dist = obb;
        } else {
          const r = node.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const pad = innerWidth < 700 ? 30 : 10;
          if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return;
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const nx = (x - cx) / Math.max(r.width / 2, 1);
          const ny = (y - cy) / Math.max(r.height / 2, 1);
          dist = nx * nx + ny * ny;
        }
      }
      const z = Number(node.style.zIndex) || card.baseIndex || 0;
      // 重叠时强优先更高 z（看得见的那张）
      const score = dist - z * 0.002 - (preferBoost || 0);
      if (!best || score < best.score) best = { card, score };
    };

    for (let i = 0; i < CARDS.length; i++) {
      const d = cardLayoutHit(CARDS[i], x, y);
      if (d != null) consider(CARDS[i], 0.35, d);
    }

    let els = null;
    if (document.elementsFromPoint) els = document.elementsFromPoint(x, y);
    else if (document.elementFromPoint) {
      const one = document.elementFromPoint(x, y);
      els = one ? [one] : [];
    }
    if (els) {
      for (let i = 0; i < els.length; i++) {
        const node = els[i].closest && els[i].closest('.card');
        if (!node) continue;
        consider(CARD_BY_EL.get(node), 0.2);
      }
    }

    for (let i = 0; i < CARDS.length; i++) consider(CARDS[i], 0);

    return best ? best.card : null;
  }

  let lastOpenAt = 0;
  let touchTap = null;
  let envOpenLockUntil = 0;
  let envOpenTimer = 0;
  let nightWarming = false;
  let nightWarmTimer = 0;

  function tryOpenCardAt(clientX, clientY, evt) {
    if (state.mode !== 'heart' && state.mode !== 'wall') return false;
    if (state.noteOpen || state.noteOpening) return false;
    if (state.noteClosing && state.mode !== 'heart') return false;
    if (state.mode !== 'heart' && innerWidth >= 700 && performance.now() < state.lockedUntil) return false;
    const debounce = state.mode === 'heart' ? 90 : 160;
    if (performance.now() - lastOpenAt < debounce) return false;
    const direct = evt && evt.target && evt.target.closest && evt.target.closest('.card');
    const card = findCardAt(clientX, clientY)
      || (direct ? CARD_BY_EL.get(direct) : null);
    if (!card) return false;
    if (evt && evt.preventDefault) evt.preventDefault();
    lastOpenAt = performance.now();
    openNote(card);
    return true;
  }

  cardStage.addEventListener('pointermove', (e) => {
    if (state.mode !== 'heart' && state.mode !== 'wall') return;
    if (state.noteOpen || state.noteOpening) return;
    if (e.pointerType === 'touch') return;
    if (state.mode !== 'heart' && performance.now() < state.lockedUntil) return;
    setHover(findCardAt(e.clientX, e.clientY));
  }, { passive: true });

  cardStage.addEventListener('pointerleave', () => clearHover());

  cardStage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    if (state.mode !== 'heart' && state.mode !== 'wall' && state.mode !== 'intro') return;
    touchTap = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  }, { passive: true });

  cardStage.addEventListener('pointermove', (e) => {
    if (!touchTap || touchTap.id !== e.pointerId) return;
    const dx = e.clientX - touchTap.x;
    const dy = e.clientY - touchTap.y;
    if (dx * dx + dy * dy > 144) touchTap.moved = true;
  }, { passive: true });

  cardStage.addEventListener('pointerup', (e) => {
    if (!touchTap || touchTap.id !== e.pointerId) return;
    const tap = touchTap;
    touchTap = null;
    if (tap.moved) return;
    if (state.mode === 'intro') {
      const hit = findCardAt(e.clientX, e.clientY)
        || (e.target.closest && e.target.closest('.card') && CARD_BY_EL.get(e.target.closest('.card')));
      if (hit) {
        e.preventDefault();
        goHeart();
      }
      return;
    }
    tryOpenCardAt(e.clientX, e.clientY, e);
  });

  cardStage.addEventListener('pointercancel', (e) => {
    if (touchTap && touchTap.id === e.pointerId) touchTap = null;
  });

  // 华为等 WebView：transform 后单卡监听常 miss，舞台几何命中 + touchend 兜底
  cardStage.addEventListener('touchend', (e) => {
    if (state.mode !== 'heart' && state.mode !== 'wall') return;
    if (!e.changedTouches || !e.changedTouches.length) return;
    if (touchTap && touchTap.moved) { touchTap = null; return; }
    const t = e.changedTouches[0];
    touchTap = null;
    if (tryOpenCardAt(t.clientX, t.clientY, e)) {
      e.preventDefault();
    }
  }, { passive: false });

  cardStage.addEventListener('click', (e) => {
    if (state.mode === 'intro') {
      const direct = e.target.closest && e.target.closest('.card');
      if (direct) {
        e.preventDefault();
        goHeart();
      }
      return;
    }
    if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
    if (performance.now() - lastOpenAt < 110) {
      e.preventDefault();
      return;
    }
    tryOpenCardAt(e.clientX, e.clientY, e);
  });

  // 心形终极兜底：捕获阶段按坐标开卡，即使上层 chrome/错误 hit-test 也能点到
  const heartTapGuard = (clientX, clientY, e) => {
    if (state.mode !== 'heart') return false;
    if (state.noteOpen || state.noteOpening) return false;
    const t = e && e.target;
    if (t && t.closest && t.closest('#soundBtn, #settingsBtn, .settings, #heartNext, .hint-action, .note-reader, .letter')) {
      return false;
    }
    return tryOpenCardAt(clientX, clientY, e);
  };
  document.addEventListener('pointerup', (e) => {
    if (state.mode !== 'heart') return;
    if (e.pointerType === 'mouse') return;
    heartTapGuard(e.clientX, e.clientY, e);
  }, true);
  document.addEventListener('touchend', (e) => {
    if (state.mode !== 'heart') return;
    if (!e.changedTouches || !e.changedTouches.length) return;
    const t = e.changedTouches[0];
    if (heartTapGuard(t.clientX, t.clientY, e)) {
      e.preventDefault();
    }
  }, { capture: true, passive: false });
  document.addEventListener('click', (e) => {
    if (state.mode !== 'heart') return;
    if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
    heartTapGuard(e.clientX, e.clientY, e);
  }, true);

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = (e.clientY / innerHeight) * 2 - 1;
    lastPointer.x = nx;
    lastPointer.y = ny;
    if (!REDUCED && state.mode === 'heart' && !state.noteOpen) {
      tiltEl.style.setProperty('--tilt-x', `${(-ny * 4.5).toFixed(2)}deg`);
      tiltEl.style.setProperty('--tilt-y', `${(nx * 7).toFixed(2)}deg`);
    }
    if (nightAPI) nightAPI.pointer(nx, ny);
  }, { passive: true });

  /* ----------------------------------------------------------
     Note reader
     ---------------------------------------------------------- */
  function loadSaved() {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.filter(n => Number.isInteger(n)) : []);
    } catch (err) {
      return new Set();
    }
  }

  function persistSaved() {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(SAVED)));
    } catch (err) {
      /* file:// storage can be unavailable — it is only a convenience */
    }
  }

  function paintSaved(card) {
    if (!card) return;
    const on = SAVED.has(card.idx);
    card.el.classList.toggle('saved', on);
    const heart = card.el.querySelector('.card-heart');
    if (heart) heart.textContent = on ? '♥' : '♡';
  }

  function updateSaveUI(card) {
    const on = SAVED.has(card.idx);
    noteSave.textContent = on ? '已经收下啦 ♥' : '收下这句祝福 ♡';
    noteSave.classList.toggle('saved', on);
    noteSave.setAttribute('aria-pressed', String(on));
  }

  function fillNote(card) {
    noteMain.textContent = card.wish[0];
    noteSub.textContent = card.wish[1];
    noteIndex.textContent = `${String(card.idx + 1).padStart(2, '0')} / ${CARD_COUNT}`;
    noteNext.textContent = state.noteMode === 'wall'
      ? '带着祝福去看蛋糕 →'
      : '把祝福铺满整颗心 →';
    updateSaveUI(card);
    paintSaved(card);
  }

  function animateNoteIn(srcRect) {
    // 手机端 WAAPI fill:both 常卡在半透明缩放态，再叠 backdrop-filter 会整屏糊成半截
    if (REDUCED || innerWidth < 700) {
      try {
        if (noteAnim) noteAnim.cancel();
      } catch (err) { /* noop */ }
      noteAnim = null;
      notePaper.style.transform = '';
      notePaper.style.opacity = '';
      return;
    }
    try {
      const dst = notePaper.getBoundingClientRect();
      if (!dst.width || !dst.height) return;
      const dx = srcRect.left + srcRect.width / 2 - (dst.left + dst.width / 2);
      const dy = srcRect.top + srcRect.height / 2 - (dst.top + dst.height / 2);
      const fromScale = clamp(
        Math.min(srcRect.width / dst.width, srcRect.height / dst.height) * 1.06,
        .16, .52
      );
      const tilt = (hash((activeCard ? activeCard.idx : 0) + 7) - .5) * 9 - 1.5;
      const frames = [
        { transform: `translate(${dx}px, ${dy}px) scale(${fromScale}) rotate(${tilt}deg)`, opacity: 0 },
        { transform: `translate(${dx * .84}px, ${dy * .84}px) scale(${fromScale * 1.28}) rotate(${tilt * .6}deg)`, opacity: 1, offset: .22 },
        { transform: `translate(${dx * .34}px, ${dy * .34}px) scale(${fromScale + (1 - fromScale) * .58}) rotate(${tilt * .2}deg)`, opacity: 1, offset: .62 },
        { transform: 'translate(0px, 0px) scale(1.018) rotate(0deg)', opacity: 1, offset: .88 },
        { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 }
      ];
      if (noteAnim) {
        try { noteAnim.cancel(); } catch (err) { /* noop */ }
      }
      noteAnim = notePaper.animate(frames, {
        duration: REDUCED ? 170 : innerWidth < 700 ? 1080 : 1420,
        easing: 'cubic-bezier(.23, .72, .16, 1)',
        fill: 'both'
      });
      noteAnim.onfinish = () => {
        try { if (noteAnim) noteAnim.cancel(); } catch (err) { /* noop */ }
        noteAnim = null;
      };
    } catch (err) {
      /* older browsers simply get the CSS fade-in */
    }
  }

  function openNote(card) {
    if (!card) return;
    if (state.noteOpen || state.noteOpening) return;
    if (state.noteClosing && state.mode !== 'heart') return;
    if (state.mode !== 'heart' && state.mode !== 'wall') return;
    if (state.mode !== 'heart' && innerWidth >= 700 && performance.now() < state.lockedUntil) return;
    state.noteClosing = false;

    state.noteOpening = true;
    state.noteMode = state.mode;
    activeCard = card;
    lastNoteFocus = document.activeElement;
    const srcRect = card.el.getBoundingClientRect();
    const mobile = innerWidth < 700;
    // 手机点开不加 tapped 弹跳，避免和弹层叠在一起闪
    if (!mobile) card.el.classList.add('tapped');
    fillNote(card);
    clearHover();
    live.textContent = `第 ${card.idx + 1} 张祝福：${card.wish[0]}。`;

    const reveal = () => {
      state.noteOpening = false;
      state.noteOpen = true;
      lastOpenAt = performance.now();
      document.body.classList.add('note-open');
      notePaper.style.transform = '';
      notePaper.style.opacity = '1';
      noteReader.classList.add('open');
      noteReader.setAttribute('aria-hidden', 'false');
      if (!mobile) animateNoteIn(srcRect);
      setTimeout(() => {
        if (state.noteOpen) {
          try { noteClose.focus({ preventScroll: true }); } catch (err) { noteClose.focus(); }
        }
      }, mobile ? 0 : 380);
    };

    clearTimeout(noteOpenTimer);
    if (mobile || REDUCED) {
      // 同步打开，避免 setTimeout 空一帧造成闪白/闪黑
      reveal();
    } else {
      noteOpenTimer = setTimeout(reveal, 240);
    }
  }

  function closeNote(after) {
    if (state.noteOpening) {
      clearTimeout(noteOpenTimer);
      state.noteOpening = false;
      if (activeCard) activeCard.el.classList.remove('tapped');
      activeCard = null;
      if (after) after();
      return;
    }
    if (!state.noteOpen) {
      if (after) after();
      return;
    }

    state.noteOpen = false;
    const mobileClose = REDUCED || innerWidth < 700;
    state.noteClosing = !mobileClose; // 手机立即允许再点其它心形卡
    noteReader.classList.remove('open');
    document.body.classList.remove('note-open');
    if (noteReader.contains(document.activeElement)) {
      try { document.activeElement.blur(); } catch (err) { /* noop */ }
    }
    noteReader.setAttribute('aria-hidden', 'true');

    const card = activeCard;
    const dst = notePaper.getBoundingClientRect();
    const src = card ? card.el.getBoundingClientRect() : null;
    let frames;
    if (src && dst.width && dst.height) {
      const dx = src.left + src.width / 2 - (dst.left + dst.width / 2);
      const dy = src.top + src.height / 2 - (dst.top + dst.height / 2);
      const toScale = clamp(
        Math.min(src.width / dst.width, src.height / dst.height) * 1.04,
        .14, .5
      );
      frames = [
        { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${toScale}) rotate(-4deg)`, opacity: 0 }
      ];
    } else {
      frames = [{ opacity: 1 }, { opacity: 0 }];
    }

    const duration = mobileClose ? 120 : 620;
    if (mobileClose) {
      lastOpenAt = 0;
      if (activeCard) activeCard.el.classList.remove('tapped');
    }
    if (!REDUCED && innerWidth >= 700) {
      try {
        if (noteAnim) noteAnim.cancel();
        noteAnim = notePaper.animate(frames, {
          duration,
          easing: 'cubic-bezier(.4, 0, .72, .3)',
          fill: 'both'
        });
      } catch (err) {
        /* noop */
      }
    } else {
      try { if (noteAnim) noteAnim.cancel(); } catch (err) { /* noop */ }
      noteAnim = null;
      notePaper.style.transform = '';
      notePaper.style.opacity = '';
    }

    setTimeout(() => {
      try { if (noteAnim) noteAnim.cancel(); } catch (err) { /* noop */ }
      noteAnim = null;
      if (card) card.el.classList.remove('tapped');
      activeCard = null;
      state.noteClosing = false;
      if (lastNoteFocus && lastNoteFocus.focus) {
        try { lastNoteFocus.focus({ preventScroll: true }); } catch (err) { /* noop */ }
      }
      live.textContent = '祝福便利贴已经收起。';
      if (after) after();
    }, duration + 20);
  }

  function toggleSave() {
    if (!activeCard) return;
    const idx = activeCard.idx;
    if (SAVED.has(idx)) SAVED.delete(idx);
    else SAVED.add(idx);
    persistSaved();
    paintSaved(activeCard);
    updateSaveUI(activeCard);
    live.textContent = SAVED.has(idx) ? '这句祝福已经收下。' : '已取消收下这句祝福。';
  }

  /* ----------------------------------------------------------
     Scene transitions
     ---------------------------------------------------------- */
  function goHeart() {
    if (state.mode !== 'intro') return;
    state.mode = 'heart';
    const mobile = innerWidth < 700;
    // 旋转成心要播完：锁到动画中段，避免误触打乱
    state.lockedUntil = performance.now() + (REDUCED ? 80 : mobile ? 900 : 1600);
    day.classList.add('heart');
    document.body.classList.add('is-heart');
    document.body.classList.remove('is-wall');
    // 进入心形：清 settle，保留牌堆 --x/--y 作起点，强制走 CSS transform 旋转飞入
    CARDS.forEach((card, i) => {
      if (!card || !card.el) return;
      const el = card.el;
      el.dataset.layoutPos = '0';
      el.style.left = '-75px';
      el.style.top = '-42px';
      el.style.transform = '';
      el.style.transitionDuration = '0s';
      el.style.transitionDelay = '0ms';
      // 记住牌堆位姿为飞行起点（layoutDeck 已写入 card.lx/ly/lr）
      if (card.lx != null) el.style.setProperty('--x', `${card.lx.toFixed(2)}px`);
      if (card.ly != null) el.style.setProperty('--y', `${card.ly.toFixed(2)}px`);
      if (card.lr != null) el.style.setProperty('--r', `${card.lr.toFixed(2)}deg`);
      if (card.ls != null) el.style.setProperty('--s', String(card.ls));
    });
    // 回流一次，锁住牌堆起点再开启动画
    void deckEl.offsetWidth;
    clearTimeout(envOpenTimer);
    wallTitle.classList.remove('show', 'tear');
    wallTitle.style.pointerEvents = 'none';
    wallTitle.setAttribute('aria-hidden', 'true');
    lastOpenAt = 0;
    // 等最慢的一张：duration + max delay ≈ 2.55 + 0.98 + 0.44
    const formMs = REDUCED ? 400 : mobile ? 4200 : 4800;
    const runHeartLayout = () => {
      if (state.mode === 'heart') {
        layoutHeart(false);
        state.lockedUntil = performance.now() + (REDUCED ? 0 : mobile ? 600 : 900);
        lastOpenAt = 0;
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(runHeartLayout));
    setTimeout(() => {
      if (state.mode === 'heart' && CARDS[0] && CARDS[0].ring === -1) runHeartLayout();
    }, 160);
    day.classList.remove('heart-formed');
    setTimeout(() => {
      if (state.mode !== 'heart') return;
      CARDS.forEach(card => { card.el.style.transitionDelay = '0ms'; });
      settleHeartLayoutHits(); // 动画结束后再 left/top，安卓可点
      day.classList.add('heart-formed'); // 成心后提亮「生日快乐」
      lastOpenAt = 0;
    }, formMs);
    live.textContent = '心形祝福正在展开…轻触卡片，翻开写给你的话。';
    if (CONFIG.autoSound) startSound();
  }

  function goWall() {
    if (state.mode !== 'heart' || state.noteOpen || state.noteOpening || state.noteClosing) return;
    state.mode = 'wall';
    const mobile = innerWidth < 700;
    state.lockedUntil = performance.now() + (REDUCED ? 120 : mobile ? 60 : 1600);
    clearHover();
    day.classList.remove('heart', 'heart-formed');
    day.classList.add('wall');
    document.body.classList.remove('is-heart');
    document.body.classList.add('is-wall');
    clearTimeout(envOpenTimer);
    wallTitle.classList.remove('show', 'tear');
    wallTitle.style.pointerEvents = '';
    wallTitle.setAttribute('aria-hidden', 'true');
    layoutWall(false);
    lastOpenAt = 0;
    if (mobile && !REDUCED) {
      requestAnimationFrame(() => {
        if (state.mode === 'wall') state.lockedUntil = performance.now();
      });
    }
    setTimeout(() => {
      if (state.mode !== 'wall') return;
      wallTitle.classList.add('show');
      wallTitle.setAttribute('aria-hidden', 'false');
      state.lockedUntil = performance.now();
    }, mobile ? 160 : 1500);
    live.textContent = '满屏都是写给你的祝福。点小卡片读祝福，或轻触信封打开。';
    // 进墙面即预热蛋糕，撕信前尽量暖好，减少 thrash
    clearTimeout(nightWarmTimer);
    nightWarmTimer = setTimeout(() => {
      if (state.mode === 'wall') warmNightScene();
    }, mobile ? 220 : 500);
  }

  function ensureNightAPIShell() {
    if (nightAPI) return nightAPI;
    buildLetter();
    nightAPI = {
      fx: null,
      cake: null,
      pointer: (x, y) => {
        if (nightAPI.cake) nightAPI.cake.pointer(x, y);
        if (nightAPI.fx) nightAPI.fx.pointer(x, y);
      },
      resize: () => {
        clearTimeout(nightAPI._rz);
        nightAPI._rz = setTimeout(() => {
          try { if (nightAPI.fx) nightAPI.fx.resize(); } catch (e) { /* noop */ }
          try { if (nightAPI.cake) nightAPI.cake.resize(); } catch (e) { /* noop */ }
        }, 80);
      }
    };
    return nightAPI;
  }

  /** 撕信期间预热蛋糕/粒子，避免 goNight 瞬间同步卡顿 */
  function warmNightScene() {
    if (nightAPI && nightAPI.cake && nightAPI.fx) return;
    if (nightWarming) return;
    nightWarming = true;
    const api = ensureNightAPIShell();
    // 分帧构建：先粒子、再蛋糕，摊开主线程尖峰
    const afterFx = () => {
      try {
        if (!api.fx && window.ParticleField) {
          api.fx = new window.ParticleField($('#fx'));
          if (api.fx && state.fxMode) api.fx.setMode(state.fxMode);
        }
      } catch (err) {
        console.warn('[birthday] fx warm failed:', err);
      }
      requestAnimationFrame(() => {
        try {
          if (!api.cake && window.CakeScene) {
            api.cake = new window.CakeScene($('#cake'));
            if (api.cake && state.fxMode) api.cake.setFxMode(state.fxMode);
          }
          setActiveTab(state.fxMode);
        } catch (err) {
          console.warn('[birthday] cake warm failed:', err);
        } finally {
          nightWarming = false;
        }
      });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(afterFx);
    });
  }

  function initNight() {
    if (nightAPI && nightAPI.cake && nightAPI.fx) return;
    warmNightScene();
    // 若预热未完成，同步兜底（仍尽量只补缺的一侧）
    const api = ensureNightAPIShell();
    try {
      if (!api.fx && window.ParticleField) {
        api.fx = new window.ParticleField($('#fx'));
        if (api.fx) api.fx.setMode(state.fxMode);
      }
      if (!api.cake && window.CakeScene) {
        api.cake = new window.CakeScene($('#cake'));
        if (api.cake) api.cake.setFxMode(state.fxMode);
      }
      setActiveTab(state.fxMode);
    } catch (err) {
      console.warn('[birthday] night scene failed:', err);
    }
  }

  function goNight() {
    if (state.mode === 'night' || state.mode === 'transition') return;
    state.mode = 'transition';
    const fromTear = wallTitle.classList.contains('tear');
    // 预热若还没跑，立刻补上
    warmNightScene();

    const hideEnv = () => {
      wallTitle.classList.remove('show', 'tear');
      wallTitle.style.pointerEvents = '';
      wallTitle.setAttribute('aria-hidden', 'true');
    };

    // 先起雾，雾够厚再卸墙面/切场景，避免硬切
    flash.classList.add('dream', 'in');
    night.classList.add('dream-enter');
    live.textContent = '星雾散开，蛋糕慢慢出现…';

    // 雾盖住后再摘 body 状态类，减少样式抖
    setTimeout(() => {
      document.body.classList.remove('is-heart', 'is-wall');
    }, fromTear ? 520 : 180);

    // 信封/墙：留在雾下更久再收，不突然消失
    setTimeout(hideEnv, fromTear ? 1600 : 240);

    // 厚雾中淡入夜景（日景用长 opacity 过渡淡出）
    setTimeout(() => {
      day.classList.add('gone');
      night.classList.add('active');
      // 此时应已预热完；未完则轻量补齐
      if (!nightAPI || !nightAPI.cake || !nightAPI.fx) initNight();
      // 可见后再轻量 resize，避开切换帧尖峰
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try { if (nightAPI && nightAPI.resize) nightAPI.resize(); } catch (e) { /* noop */ }
        });
      });
    }, fromTear ? 1200 : 1000);

    // 雾缓慢散开
    setTimeout(() => {
      flash.classList.remove('in');
    }, fromTear ? 3400 : 3000);

    setTimeout(() => {
      flash.classList.remove('dream');
      night.classList.add('revealed');
      night.classList.remove('dream-enter');
      state.mode = 'night';
      live.textContent = '星空蛋糕。可以点击许个愿吹灭蜡烛，或打开一封信。';
      if (!localStorage.getItem('happy_wish_hint')) {
        setTimeout(() => {
          if (state.mode !== 'night') return;
          const hint = $('#firstHint');
          if (!hint) return;
          hint.classList.add('show');
          setTimeout(() => hint.classList.remove('show'), 5200);
          localStorage.setItem('happy_wish_hint', '1');
        }, 2800);
      }
    }, fromTear ? 5800 : 5200);
  }

  /* ----------------------------------------------------------
     Background music — real track first, generative fallback
     ---------------------------------------------------------- */
  function fadeBgm(target, ms, done) {
    if (!bgmEl) return;
    clearInterval(bgmFadeTimer);
    bgmFadeTimer = 0;
    const from = bgmEl.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      bgmEl.volume = clamp(from + (target - from) * k, 0, 1);
      if (k >= 1) {
        clearInterval(bgmFadeTimer);
        bgmFadeTimer = 0;
        bgmEl.volume = clamp(target, 0, 1);
        if (done) done();
      }
    };
    // setInterval, not rAF: background/occluded tabs pause rAF, which would
    // leave the music stuck at volume 0.
    bgmFadeTimer = setInterval(step, 32);
    step();
  }

  function markBgmUnavailable() {
    bgmUnavailable = true;
    bgmWanted = false;
  }

  function isWeChatUA() {
    return /MicroMessenger/i.test(navigator.userAgent || '');
  }

  /** 同步踢一次 play（必须落在用户手势栈里；微信尤其敏感） */
  function kickBgmPlaySync(opts) {
    // 关闭声音后，任何普通页面手势都不得重新启动音乐。
    if (!state.soundWanted || !bgmEl || bgmUnavailable) return null;
    try {
      if (!bgmEl.getAttribute('src') && !bgmEl.src) bgmEl.setAttribute('src', BGM_SRC);
      bgmEl.loop = true;
      bgmEl.setAttribute('playsinline', '');
      bgmEl.setAttribute('webkit-playsinline', '');
      if (opts && opts.muted) {
        bgmEl.muted = true;
        bgmEl.volume = 0;
      } else {
        // 手势内直接有声启动；音量可随后 fade
        if (bgmEl.volume < 0.01) bgmEl.volume = Math.max(0.01, BGM_VOLUME * 0.35);
        bgmEl.muted = false;
      }
      return bgmEl.play();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async function startBgm() {
    if (!state.soundWanted || !bgmEl || bgmUnavailable) return false;
    try {
      if (!bgmEl.getAttribute('src') && !bgmEl.src) bgmEl.setAttribute('src', BGM_SRC);
      bgmEl.loop = true;
      bgmEl.setAttribute('playsinline', '');
      bgmEl.setAttribute('webkit-playsinline', '');

      let playing = null;
      if (isWeChatUA()) {
        // 微信：先静音 play 占坑，再取消静音（常见可过策略）
        playing = kickBgmPlaySync({ muted: true });
        try {
          if (playing && playing.then) await playing;
        } catch (err1) {
          // 静音失败再试有声
          playing = kickBgmPlaySync({ muted: false });
          if (playing && playing.then) await playing;
        }
        bgmEl.muted = false;
        if (bgmEl.paused) {
          playing = kickBgmPlaySync({ muted: false });
          if (playing && playing.then) await playing;
        }
      } else {
        bgmEl.volume = 0;
        bgmEl.muted = false;
        playing = bgmEl.play();
        if (playing && playing.then) await playing;
      }

      if (!state.soundWanted) {
        stopBgm();
        return false;
      }
      if (bgmEl.error) {
        markBgmUnavailable();
        return false;
      }
      if (bgmEl.paused) return false;
      bgmWanted = true;
      bgmEl.muted = false;
      fadeBgm(BGM_VOLUME, isWeChatUA() ? 900 : 1800);
      return true;
    } catch (err) {
      if (bgmEl && bgmEl.error) markBgmUnavailable();
      return false;
    }
  }

  /** 微信 JSBridge：getNetworkType 回调里 play 是经典解锁 */
  function unlockBgmViaWeixinBridge() {
    const run = () => {
      if (!state.soundWanted) return;
      try {
        if (typeof WeixinJSBridge === 'undefined' || !WeixinJSBridge.invoke) {
          tryAutoBgm('weixin-ready').catch(() => {});
          return;
        }
        WeixinJSBridge.invoke('getNetworkType', {}, () => {
          // 回调内同步 play
          const p = kickBgmPlaySync({ muted: false });
          Promise.resolve(p).then(() => tryAutoBgm('weixin-bridge')).catch(() => {
            tryAutoBgm('weixin-bridge-retry').catch(() => {});
          });
        });
      } catch (err) {
        tryAutoBgm('weixin-bridge-err').catch(() => {});
      }
    };
    if (typeof WeixinJSBridge !== 'undefined') {
      run();
    } else {
      document.addEventListener('WeixinJSBridgeReady', run, false);
    }
  }

  function stopBgm() {
    if (!bgmEl) return;
    bgmWanted = false;
    if (bgmEl.paused) {
      bgmEl.volume = 0;
      return;
    }
    fadeBgm(0, 700, () => {
      if (!bgmWanted && bgmEl) {
        bgmEl.pause();
        bgmEl.volume = 0;
      }
    });
  }

  function ensureAmbient() {
    if (!ambient && window.AmbientSound) ambient = new window.AmbientSound();
    return ambient;
  }

  let sfxAmbient = null;
  function duckBgmBrief(ms) {
    if (!bgmEl || !state.bgmActive || !state.soundOn) return;
    try {
      fadeBgm(BGM_VOLUME * 0.26, 70);
      clearTimeout(duckBgmBrief._t);
      duckBgmBrief._t = setTimeout(() => {
        if (state.soundOn && state.bgmActive) fadeBgm(BGM_VOLUME, 520);
      }, ms == null ? 780 : ms);
    } catch (err) { /* noop */ }
  }

  function ensureSfxBusSync() {
    if (!window.AmbientSound) return null;
    if (!sfxAmbient) sfxAmbient = new window.AmbientSound();
    try {
      // ensure() has no await — creates AudioContext sync inside gesture
      sfxAmbient.ensure();
    } catch (err) { /* noop */ }
    if (typeof sfxAmbient.unlockSync === 'function') sfxAmbient.unlockSync();
    else if (sfxAmbient.ctx && sfxAmbient.ctx.state === 'suspended') {
      try { sfxAmbient.ctx.resume(); } catch (err) { /* noop */ }
    }
    return sfxAmbient;
  }

  async function ensureSfxBus() {
    return ensureSfxBusSync();
  }

  /** Sync tear SFX — must run inside user gesture (after WeChat/BGM unlock kick). */
  function playPaperTearSfx() {
    if (!state.soundWanted) return false;
    try {
      duckBgmBrief(1300);
      const bus = ensureSfxBusSync();
      if (!bus) return false;
      const ok = bus.playTear();
      updateSoundUI();
      return !!ok;
    } catch (err) {
      return false;
    }
  }

  async function playBlowSfx() {
    if (!state.soundWanted) return;
    try {
      duckBgmBrief(650);
      const bus = ensureSfxBusSync();
      if (!bus || typeof bus.playBlow !== 'function') return;
      await bus.playBlow();
    } catch (err) { /* noop */ }
  }

  async function playFxSwitchSfx() {
    if (!state.soundWanted) return;
    try {
      duckBgmBrief(420);
      const bus = ensureSfxBusSync();
      if (!bus || typeof bus.playFxSwitch !== 'function') return;
      await bus.playFxSwitch();
    } catch (err) { /* noop */ }
  }

  async function tryAutoBgm(reason) {
    try {
      if (!state.soundWanted) return false;
      if (state.soundOn && state.bgmActive) return true;
      const ok = await startSound();
      return !!ok;
    } catch (err) {
      return false;
    }
  }

  async function startSound() {
    // 只能由声音按钮显式开启；普通页面点击不能改变用户的静音选择。
    if (!state.soundWanted) return false;
    // Already playing BGM for real
    if (state.bgmActive && bgmEl && !bgmEl.paused && !bgmEl.muted) {
      state.soundOn = true;
      updateSoundUI();
      return true;
    }
    if (ambient && ambient.playing) {
      state.soundOn = true;
      updateSoundUI();
      return true;
    }
    // Prime WebAudio + SFX bus inside the user gesture
    const a = ensureAmbient();
    if (a) {
      Promise.resolve(a.ensure()).catch(() => { /* noop */ });
      if (a.ctx && a.ctx.state === 'suspended') {
        try {
          const p = a.ctx.resume();
          if (p && p.catch) p.catch(() => { /* noop */ });
        } catch (err) { /* noop */ }
      }
    }
    ensureSfxBusSync();
    const bgmOk = await startBgm();
    if (!state.soundWanted) {
      stopBgm();
      return false;
    }
    if (bgmOk) {
      // Keep a separate SFX AudioContext running; do NOT suspend sfxAmbient.
      // Only suspend the music-box pad context if it isn't the SFX bus.
      if (a && a !== sfxAmbient && a.ctx && a.ctx.state === 'running' && !a.playing) {
        try {
          const p = a.ctx.suspend();
          if (p && p.catch) p.catch(() => { /* noop */ });
        } catch (err) { /* noop */ }
      }
      state.soundOn = true;
      state.bgmActive = true;
      updateSoundUI();
      return true;
    }
    if (!a) return false;
    const ok = await a.start().catch(() => false);
    if (ok) {
      state.soundOn = true;
      state.bgmActive = false;
      updateSoundUI();
    }
    return ok;
  }

  function stopSound() {
    state.soundWanted = false;
    state.soundOn = false;
    state.bgmActive = false;
    if (ambient) ambient.stop();
    stopBgm();
    updateSoundUI();
  }

  if (bgmEl) {
    bgmEl.addEventListener('error', markBgmUnavailable);
    bgmEl.addEventListener('stalled', () => {
      if (!bgmWanted) return;
      if (bgmEl.error) markBgmUnavailable();
    });
  }

  /* ----------------------------------------------------------
     Letter
     ---------------------------------------------------------- */
  function buildLetter() {
    const body = $('#letterBody');
    body.innerHTML = '';
    CONFIG.letter.forEach(p => {
      const el = document.createElement('p');
      el.textContent = p;
      body.appendChild(el);
    });
    $('#letterTitle').textContent = CONFIG.letterTitle;
    $('.letter-sign').textContent = CONFIG.letterSign;
  }

  function openLetter() {
    const letter = $('#letter');
    lastNoteFocus = document.activeElement;
    // 强制重播：即使信已经开着，也重新触发一次弹出动画（每次吹灭都有“弹出”动作）
    letter.classList.remove('open');
    void letter.offsetWidth;
    letter.classList.add('open');
    letter.setAttribute('aria-hidden', 'false');
    const card = letter.querySelector('.letter-card');
    if (card) {
      try {
        card.scrollTop = 0;
        // next frame: smooth nudge so overflow content announces scrollability
        requestAnimationFrame(() => {
          try {
            if (card.scrollHeight > card.clientHeight + 8) {
              card.scrollTo({ top: Math.min(28, card.scrollHeight - card.clientHeight), behavior: 'smooth' });
              setTimeout(() => {
                try { card.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { card.scrollTop = 0; }
              }, 420);
            }
          } catch (e) { /* noop */ }
        });
      } catch (e) { /* noop */ }
    }
    setTimeout(() => $('#letterClose').focus(), 80);
    live.textContent = '一封信已经打开。';
  }

  function closeLetter() {
    const letter = $('#letter');
    letter.classList.remove('open');
    letter.setAttribute('aria-hidden', 'true');
    if (lastNoteFocus && lastNoteFocus.focus) lastNoteFocus.focus();
  }

  /* ----------------------------------------------------------
     Wax candle / effects
     ---------------------------------------------------------- */
  // 信封只在整个页面生命周期内“首次吹灭”时弹出一次，之后不再弹
  let letterShownOnce = false;

  function blowCandle() {
    if (!nightAPI) return;
    if (!state.candleLit) {
      // 蜡烛已灭：这次点击只是重新点亮（不再递信），再点一次蜡烛才是再次吹灭
      relightCandle();
      return;
    }
    state.candleLit = false;    night.classList.add('is-out');
    $('#blowText').textContent = '重新点亮蜡烛';
    $('#relightBtn').hidden = false;
    if (nightAPI.cake) nightAPI.cake.setCandleLit(false);

    let flamePos = null;
    if (nightAPI.cake && typeof nightAPI.cake.getFlameScreenPosition === 'function') {
      flamePos = nightAPI.cake.getFlameScreenPosition();
    }
    const rect = night.getBoundingClientRect();
    const fxOrigin = {
      x: flamePos && flamePos.ok ? flamePos.x : rect.width * 0.68,
      y: flamePos && flamePos.ok ? flamePos.y : rect.height * 0.38
    };
    playBlowSfx();
    if (nightAPI.fx && typeof nightAPI.fx.celebrateBlow === 'function') {
      nightAPI.fx.celebrateBlow(fxOrigin);
    }

    const flashEl = $('#blowBurst');
    if (flashEl) {
      flashEl.style.setProperty('--blow-x', fxOrigin.x.toFixed(1) + 'px');
      flashEl.style.setProperty('--blow-y', fxOrigin.y.toFixed(1) + 'px');
      flashEl.classList.remove('on');
      void flashEl.offsetWidth;
      flashEl.classList.add('on');
      clearTimeout(blowCandle._flashT);
      blowCandle._flashT = setTimeout(() => flashEl.classList.remove('on'), 2000);
    }
    $('#toast').classList.add('show');
    live.textContent = '愿望已送达。点一下蜡烛，可以重新点亮。';
    clearTimeout(blowCandle._t);
    blowCandle._t = setTimeout(() => $('#toast').classList.remove('show'), 6200);
    // 只有首次吹灭才把这封信递给你，之后（重新点亮再吹灭）不再弹出
    if (!letterShownOnce) {
      letterShownOnce = true;
      clearTimeout(blowCandle._letterT);
      blowCandle._letterT = setTimeout(() => { if (state.mode === 'night') openLetter(); }, 1400);
    }
  }

  function relightCandle() {
    state.candleLit = true;
    night.classList.remove('is-out');
    $('#blowText').textContent = '许个愿，吹灭蜡烛';
    $('#relightBtn').hidden = true;
    const flashEl = $('#blowBurst');
    if (flashEl) flashEl.classList.remove('on');
    $('#toast').classList.remove('show');
    if (nightAPI && nightAPI.cake) nightAPI.cake.setCandleLit(true);
    live.textContent = '蜡烛重新点亮了，再点一下蜡烛，可以再次吹灭、再看一遍那封信。';
  }

  function setActiveTab(mode) {
    const tabs = $$('#fxTabs .fx-tab');
    tabs.forEach(tab => {
      const on = tab.dataset.mode === mode;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', String(on));
    });
  }

  function setFxMode(mode) {
    const changed = mode !== state.fxMode;
    state.fxMode = mode;
    setActiveTab(mode);
    if (nightAPI) {
      if (nightAPI.fx) nightAPI.fx.setMode(mode);
      if (nightAPI.cake) nightAPI.cake.setFxMode(mode);
    }
    if (changed) playFxSwitchSfx();
    const names = { stars: '星河', snow: '小雪', meteor: '流星雨', halo: '梦幻光环' };
    live.textContent = `已切换到${names[mode] || '星河'}效果。`;
  }

  /* ----------------------------------------------------------
     UI bindings
     ---------------------------------------------------------- */
  function updateSoundUI() {
    const btn = $('#soundBtn');
    const on = !!state.soundWanted;
    state.soundOn = on; // UI 与「想要开声音」对齐
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? '声音已开启，点击关闭' : '声音已关闭，点击开启');
    $('#soundText').textContent = on ? '声音已开启' : '声音已关闭';
    btn.classList.toggle('on', on);
    btn.classList.toggle('off', !on);
  }

  const triggerOpen = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // 手势栈内同步 play（微信/安卓 WebView 必须）
    if (state.soundWanted) {
      kickBgmPlaySync({ muted: false });
      tryAutoBgm('intro-open');
    }
    if (state.mode === 'intro') goHeart();
  };
  openBtn.addEventListener('click', triggerOpen);
  openBtn.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    triggerOpen(e);
  });
  openBtn.addEventListener('touchend', (e) => {
    triggerOpen(e);
  }, { passive: false });
  // 封面任意空白轻触也可开启（卡片层已禁用点击）
  day.addEventListener('pointerup', (e) => {
    if (state.mode !== 'intro') return;
    if (e.target.closest && (e.target.closest('#openBtn') || e.target.closest('.settings-btn') || e.target.closest('#soundBtn') || e.target.closest('.settings'))) return;
    // 点在开场区域下半屏时开启
    if (e.clientY > innerHeight * 0.55) triggerOpen(e);
  });
  $('#heartNext').addEventListener('click', goWall);
  $('#wallNext').addEventListener('click', () => {
    if (state.mode === 'wall' && !state.noteOpen) goNight();
  });

  // 祝福墙信封：慢速撕开 + 撕纸音效 → 朦胧转入星空蛋糕
  const TEAR_MS = 2900; // 与 CSS 撕信编排 ~2.9s 对齐（更可读的撕痕）
  const openEnvelope = (e) => {
    if (state.mode !== 'wall') return;
    if (wallTitle.classList.contains('tear')) return;
    if (state.mode === 'transition' || state.mode === 'night') return;
    if (performance.now() < envOpenLockUntil) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    envOpenLockUntil = performance.now() + TEAR_MS + 2800;
    wallTitle.classList.add('show', 'tear');
    wallTitle.style.pointerEvents = 'none';
    wallTitle.setAttribute('aria-hidden', 'false');
    live.textContent = '撕开信封…';
    // 手势内：先解锁 BGM/微信，再立刻同步撕纸音（不要等 async，否则会丢手势音频权限）
    if (state.soundWanted) {
      kickBgmPlaySync({ muted: false });
      ensureSfxBusSync();
      playPaperTearSfx();
    }
    // BGM 异步跟上；若首发撕纸失败再补一次
    Promise.resolve(tryAutoBgm('tear')).then(() => {
      // WeChat 解锁后补强：若刚才没声，再撕一次短尾
      try {
        const bus = ensureSfxBusSync();
        if (bus && bus.ctx && bus.ctx.state === 'running') {
          // already played at gesture; optional soft reinforce only if buffer exists
        }
      } catch (err) { /* noop */ }
    }).catch(() => { /* noop */ });
    // 撕信中段开始预热蛋糕，结束时即可丝滑入场
    clearTimeout(nightWarmTimer);
    nightWarmTimer = setTimeout(() => {
      if (state.mode === 'wall' || state.mode === 'transition') warmNightScene();
    }, 60);
    clearTimeout(envOpenTimer);
    envOpenTimer = setTimeout(() => {
      if (state.mode !== 'wall') return;
      goNight();
    }, TEAR_MS);
  };
  wallTitle.addEventListener('click', openEnvelope);
  wallTitle.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    openEnvelope(e);
  });
  wallTitle.addEventListener('touchend', (e) => {
    if (performance.now() < envOpenLockUntil) {
      e.preventDefault();
      return;
    }
    openEnvelope(e);
  }, { passive: false });
  wallTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openEnvelope(e);
  });

  noteSave.addEventListener('click', toggleSave);
  noteNext.addEventListener('click', () => {
    const mode = state.noteMode;
    closeNote(() => {
      if (mode === 'heart') goWall();
      else if (mode === 'wall') goNight();
    });
  });
  noteClose.addEventListener('click', () => closeNote());
  $('#noteBackdrop').addEventListener('click', () => closeNote());

  $('#letterBtn').addEventListener('click', openLetter);
  $('#letterClose').addEventListener('click', closeLetter);
  $('#letterBackdrop').addEventListener('click', closeLetter);
  $('#blowBtn').addEventListener('click', blowCandle);
  $('#relightBtn').addEventListener('click', relightCandle);

  $('#fxTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.fx-tab');
    if (!tab) return;
    setFxMode(tab.dataset.mode);
  });

  // 蛋糕画布：拖拽旋转 · 滚轮缩放 · 点蜡烛吹灭 · 点蛋糕翻转 · 点星星许愿
  const cakeCanvas = $('#cake');
  let cakePointerDrag = false;

  cakeCanvas.addEventListener('pointerdown', (e) => {
    if (!nightAPI || !nightAPI.cake) return;
    cakePointerDrag = true;
    nightAPI.cake.startDrag(e.clientX);
  });
  window.addEventListener('pointermove', (e) => {
    if (cakePointerDrag && nightAPI && nightAPI.cake) {
      nightAPI.cake.moveDrag(e.clientX);
    }
  });
  window.addEventListener('pointerup', () => {
    if (cakePointerDrag) {
      if (nightAPI && nightAPI.cake) nightAPI.cake.endDrag();
      cakePointerDrag = false;
    }
  });
  cakeCanvas.addEventListener('wheel', (e) => {
    if (!nightAPI || !nightAPI.cake) return;
    e.preventDefault();
    nightAPI.cake.wheelZoom(e.deltaY);
  }, { passive: false });

  let cakeTaps = 0;
  let cakeTapTimer = 0;
  function tapCake() {
    if (nightAPI && nightAPI.cake && typeof nightAPI.cake.toggleSpinDir === 'function') {
      nightAPI.cake.toggleSpinDir();
    }
    cakeTaps += 1;
    clearTimeout(cakeTapTimer);
    cakeTapTimer = setTimeout(() => { cakeTaps = 0; }, 2200);
    if (cakeTaps >= 5) {
      cakeTaps = 0;
      if (nightAPI.fx && typeof nightAPI.fx.goldenBurst === 'function') nightAPI.fx.goldenBurst();
      flashWords('生日快乐 ✦');
      live.textContent = '彩蛋解锁：金色流星雨！';
    }
  }

  function wishTap(x, y) {
    if (nightAPI.fx && typeof nightAPI.fx.shootWish === 'function') {
      nightAPI.fx.shootWish(x, y);
    }
    spawnWishLine(x, y);
  }

  cakeCanvas.addEventListener('click', (e) => {
    if (!nightAPI || !nightAPI.cake) return;
    if (typeof nightAPI.cake.isDragGesture === 'function' && nightAPI.cake.isDragGesture()) return;
    const rect = cakeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = typeof nightAPI.cake.hitTestAt === 'function' ? nightAPI.cake.hitTestAt(x, y) : 'body';
    if (hit === 'flame') {
      blowCandle();
    } else if (hit === 'body') {
      tapCake();
    } else {
      wishTap(x, y);
    }
  });

  /* 许愿字幕：点击星星时上浮一句心愿 */
  const WISH_LINES = [
    '许一个温柔的愿望 ✦', '星河都听见了 ♡', '愿你万事胜意',
    '把星光收进心里', '好运正在赶来', '愿你的梦都发光'
  ];
  function spawnWishLine(x, y) {
    const el = document.createElement('div');
    el.className = 'wish-line';
    el.textContent = WISH_LINES[Math.floor(Math.random() * WISH_LINES.length)];
    const rect = night.getBoundingClientRect();
    el.style.left = (x / rect.width * 100).toFixed(1) + '%';
    el.style.top = Math.min(90, Math.max(6, y / rect.height * 100 - 6)).toFixed(1) + '%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* 彩蛋全屏闪字 */
  function flashWords(text) {
    const el = document.createElement('div');
    el.className = 'flash-words';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1900);
  }

  $('#soundBtn').addEventListener('click', () => {
    if (state.soundWanted) stopSound();
    else {
      state.soundWanted = true;
      updateSoundUI();
      kickBgmPlaySync({ muted: false });
      ensureSfxBusSync();
      startSound();
    }
  });

  /* ----------------------------------------------------------
     自定义设置（名字 / 一封信）
     ---------------------------------------------------------- */
  const settingsRoot = $('#settings');

  function applyConfigToPage() {
    const nameEl = $('.day-kicker b');
    if (nameEl) nameEl.textContent = CONFIG.name;
    if (typeof buildLetter === 'function') buildLetter();
  }

  function fillSettingsForm() {
    $('#setName').value = CONFIG.name;
    $('#setLetterTitle').value = CONFIG.letterTitle;
    $('#setLetterSign').value = CONFIG.letterSign;
    $('#setLetter').value = CONFIG.letter.join('\n');
  }

  function openSettings() {
    if (!settingsRoot) return;
    fillSettingsForm();
    settingsRoot.classList.add('open');
    settingsRoot.setAttribute('aria-hidden', 'false');
    lastNoteFocus = document.activeElement;
    setTimeout(() => { const i = $('#setName'); if (i && i.focus) i.focus(); }, 80);
  }

  function closeSettings() {
    if (!settingsRoot) return;
    settingsRoot.classList.remove('open');
    settingsRoot.setAttribute('aria-hidden', 'true');
    if (lastNoteFocus && lastNoteFocus.focus) lastNoteFocus.focus();
  }

  function notifySettings(msg) {
    const hint = $('#settingsHint');
    if (hint) hint.textContent = msg;
    live.textContent = msg;
  }

  function saveSettings() {
    const name = $('#setName').value.trim();
    const title = $('#setLetterTitle').value.trim();
    const sign = $('#setLetterSign').value.trim();
    const lines = $('#setLetter').value.split('\n').map(s => s.trim()).filter(Boolean);
    if (name) CONFIG.name = name;
    if (title) CONFIG.letterTitle = title;
    if (sign) CONFIG.letterSign = sign;
    if (lines.length) CONFIG.letter = lines;
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify({
        name: CONFIG.name,
        letterTitle: CONFIG.letterTitle,
        letterSign: CONFIG.letterSign,
        letter: CONFIG.letter
      }));
    } catch (e) { /* 存储失败不阻塞 */ }
    applyConfigToPage();
    closeSettings();
    notifySettings('设置已保存，已应用到整页。');
  }

  function resetSettings() {
    CONFIG.name = CONFIG_DEFAULT.name;
    CONFIG.letterTitle = CONFIG_DEFAULT.letterTitle;
    CONFIG.letterSign = CONFIG_DEFAULT.letterSign;
    CONFIG.letter = CONFIG_DEFAULT.letter.slice();
    try { localStorage.removeItem(CUSTOM_KEY); } catch (e) { /* noop */ }
    applyConfigToPage();
    fillSettingsForm();
    notifySettings('已恢复默认内容。');
  }

  function exportSettings() {
    const c = {
      name: CONFIG.name,
      letterTitle: CONFIG.letterTitle,
      letterSign: CONFIG.letterSign,
      letter: CONFIG.letter
    };
    const js = '/* 生日贺卡 · 成品配置 —— 由页面“设置 → 导出成品配置”生成\n' +
      '   把本文件放进生日贺卡文件夹（与 index.html 同目录），打开页面即为成品 */\n' +
      'window.CUSTOM = ' + JSON.stringify(c, null, 2) + ';\n';
    const blob = new Blob([js], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'custom.js';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
    notifySettings('已导出 custom.js：放进生日文件夹，朋友打开即成品。');
  }

  function importSettings(file) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const c = JSON.parse(rd.result);
        if (!c || typeof c !== 'object') throw new Error('bad');
        if (typeof c.name === 'string' && c.name.trim()) CONFIG.name = c.name.trim();
        if (typeof c.letterTitle === 'string' && c.letterTitle.trim()) CONFIG.letterTitle = c.letterTitle.trim();
        if (typeof c.letterSign === 'string' && c.letterSign.trim()) CONFIG.letterSign = c.letterSign.trim();
        if (Array.isArray(c.letter)) {
          const ls = c.letter.map(s => String(s).trim()).filter(Boolean);
          if (ls.length) CONFIG.letter = ls;
        }
        localStorage.setItem(CUSTOM_KEY, JSON.stringify({
          name: CONFIG.name,
          letterTitle: CONFIG.letterTitle,
          letterSign: CONFIG.letterSign,
          letter: CONFIG.letter
        }));
        applyConfigToPage();
        fillSettingsForm();
        notifySettings('配置已导入并生效。');
      } catch (e) {
        notifySettings('导入失败：文件不是有效的配置。');
      }
    };
    rd.readAsText(file);
  }

  $('#settingsBtn').addEventListener('click', openSettings);
  $('#settingsClose').addEventListener('click', closeSettings);
  $('#settingsBackdrop').addEventListener('click', closeSettings);
  $('#setSave').addEventListener('click', saveSettings);
  $('#setReset').addEventListener('click', resetSettings);
  $('#setExport').addEventListener('click', exportSettings);
  $('#setImport').addEventListener('click', () => { const f = $('#setImportFile'); if (f) f.click(); });
  $('#setImportFile').addEventListener('change', (e) => {
    importSettings(e.target.files && e.target.files[0]);
    e.target.value = '';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsRoot && settingsRoot.classList.contains('open')) closeSettings();
  });


  $('#replayBtn').addEventListener('click', () => {
    location.reload();
  });

  document.addEventListener('keydown', (e) => {
    const noteFocused = state.noteOpen || state.noteOpening;
    if (e.key === 'Escape') {
      if (noteFocused) {
        e.preventDefault();
        closeNote();
        return;
      }
      if ($('#letter').classList.contains('open')) closeLetter();
    }
    if ((e.key === 'b' || e.key === 'B') && state.mode === 'night') {
      blowCandle();
    }
    if (e.key === 'Tab' && state.noteOpen) {
      const focusables = [noteClose, noteSave, noteNext];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* resize */
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applyCardScale();
      if (state.mode === 'intro') layoutDeck(true);
      else if (state.mode === 'heart') layoutHeart(true);
      else if (state.mode === 'wall') layoutWall(true);
      positionIntro();
      if (nightAPI) nightAPI.resize();
    }, 180);
  });

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function boot() {
    buildCards();
    applyCardScale();
    layoutDeck(false);
    positionIntro();
    const nameEl = $('.day-kicker b');
    if (nameEl) nameEl.textContent = CONFIG.name;

    const ready = () => requestAnimationFrame(() => {
      day.classList.add('ready');
      positionIntro();
    });
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1400))]).then(ready);
      document.fonts.ready.then(positionIntro);
    } else {
      setTimeout(ready, 300);
    }

    // expose a small API for tinkering / testing
    window.birthday = {
      heart: goHeart,
      wall: goWall,
      night: goNight,
      blow: blowCandle,
      relight: relightCandle,
      letter: openLetter,
      fx: setFxMode,
      note: (i) => openNote(CARDS[clamp(Number(i) || 0, 0, CARDS.length - 1)]),
      closeNote,
      sound: { start: startSound, stop: stopSound },
      cards: CARDS,
      saved: SAVED,
      state
    };
  }

  boot();
  updateSoundUI(); // 默认声音开启态

  /* ----------------------------------------------------------
     BGM autoplay: try to start the moment the page opens.
     Browsers may block audio until the first user gesture, so we
     also arm a one-time first-interaction fallback.
     ---------------------------------------------------------- */
  (function autoplayBgm() {
    // 页面一开就尝试播 BGM；被拦则靠手势 / 微信 Bridge
    const kick = (why) => {
      tryAutoBgm(why || 'boot').catch(() => { /* noop */ });
    };
    kick('boot');
    setTimeout(() => kick('boot-400'), 400);
    setTimeout(() => kick('boot-1200'), 1200);
    setTimeout(() => kick('boot-2500'), 2500);

    // 微信内置浏览器专用解锁
    if (isWeChatUA()) {
      unlockBgmViaWeixinBridge();
      // 部分机型 Bridge 晚到：再轮询几次
      let wxTries = 0;
      const wxPoll = setInterval(() => {
        wxTries += 1;
        if (state.bgmActive || wxTries > 20) {
          clearInterval(wxPoll);
          return;
        }
        if (typeof WeixinJSBridge !== 'undefined') {
          unlockBgmViaWeixinBridge();
          clearInterval(wxPoll);
        }
      }, 300);
    }

    // 手势：一直挂到真正播起来（失败不卸监听）
    const onGesture = (ev) => {
      if (state.soundOn && state.bgmActive && bgmEl && !bgmEl.paused) {
        document.removeEventListener('touchstart', onGesture, true);
        document.removeEventListener('touchend', onGesture, true);
        document.removeEventListener('pointerdown', onGesture, true);
        document.removeEventListener('click', onGesture, true);
        return;
      }
      // 同步 play 抢在异步逻辑前；顺带解锁 SFX 总线（撕信封要用）
      if (!state.soundWanted) return;
      kickBgmPlaySync({ muted: false });
      ensureSfxBusSync();
      tryAutoBgm('gesture-' + (ev && ev.type ? ev.type : 'x')).catch(() => {});
    };
    document.addEventListener('touchstart', onGesture, { capture: true, passive: true });
    document.addEventListener('touchend', onGesture, { capture: true, passive: true });
    document.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
    document.addEventListener('click', onGesture, { capture: true });
    document.addEventListener('keydown', onGesture, { capture: true });

    // 页面从后台回前台再试（微信切回来常见）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && state.soundWanted && bgmWanted && bgmEl && bgmEl.paused) {
        kickBgmPlaySync({ muted: false });
        tryAutoBgm('visible').catch(() => {});
      }
    });
  })();
})();
