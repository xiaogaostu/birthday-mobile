# 生日快乐 · 把星河送给你

一个可以直接双击打开、不需要构建工具的生日互动网页。白天是洒满阳光和落樱的卡片花园，90 张写满不同祝福的便利贴会飞成爱心，也能铺成一面错落的祝福墙；点开任意一张都能慢慢展开阅读。入夜后，一颗放在玻璃罩里的星河蛋糕会亮起蜡烛。

页面主体参考了 `示例.mp4` 的节奏与交互，蛋糕部分参考了 `cake.mp4` 的造型：深色星河淋面、密集彩色星星糖、玻璃圆罩、金色轨道、悬浮星星和高蜡烛。

## 怎么打开

直接双击 `index.html`，或者把它拖进浏览器窗口即可。

- 推荐 Chrome / Edge 最新版。
- 不需要 `npm install`，不需要本地服务器，`file://` 协议下即可运行。
- 所有依赖都已放在 `vendor/` 中，断网也能打开。
- 背景音乐会优先读取 `assets/birthday.mp3`（《生日快乐 (云村特别版)》— yihuik 苡慧），歌曲文件需要自行放入；没有该文件时会自动退回到 WebAudio 实时合成的音乐盒。浏览器通常要等首次点击后才允许播放，这是正常现象。

如果希望用本地服务器预览：

```powershell
cd D:\motion\projects\birthday-web
python -m http.server 8765
# 打开 http://localhost:8765
```

## 页面流程

1. **封面**：阳光、纸雕质感的背景、满屏飘落的花瓣和「生日快乐」书法字，点击「轻触开启惊喜」。
2. **卡片爱心**：90 张祝福卡片从扇形牌堆缓慢飞成三层爱心，鼠标移动时三层卡片都能浮起、倾斜和视差。
3. **翻开便利贴**：点击任意一张卡片，卡片先轻轻抬起，再慢慢展开成一张大便利贴。可以「收下这句祝福」，也可以直接关掉继续看别的；收下的祝福会在卡片角落亮起实心小爱心。
4. **祝福墙**：点击底部「把祝福铺满整颗心 →」，卡片以更慢、更错落的方式铺满全屏，旋转、缩放和前后层次都是随机散开的。祝福墙不会自动跳走，方便一张张慢慢读；读够了再点「带着祝福去看蛋糕 →」。
5. **星空蛋糕**：画面熄灭后进入夜晚，蜡烛点亮，玻璃罩内漂浮星星、金环和彩色纸屑。
6. **互动**：
   - 「许个愿，吹灭蜡烛」：火焰熄灭并冒烟，出现愿望送达提示；再点一次可以重新点亮。
   - 「给你的一封信」：打开私人信件弹窗，`Esc` 或点击遮罩关闭。
   - 「星河 / 小雪 / 流星雨 / 梦幻光环」：切换背景氛围。
   - 右上角「声音」：开启或关闭背景音乐（有真实歌曲时用歌曲，没有时用音乐盒）。
7. **移动端**：布局会自动收窄，卡片爱心、祝福墙、便利贴阅读器、蛋糕、底部控件都做了适配；提示文案会从「移动鼠标」变成「轻触屏幕」。

## 改成你自己的

### 1. 名字、信件、卡片祝福

打开 `app.js`，最上面就是这两个配置：

```js
const CONFIG = {
  name: '吴文同学',
  letterTitle: '致特别的你：',
  letterSign: '祝福你的人',
  autoSound: true,
  letter: [
    '生日快乐！……',
    // 每一段会变成一个 <p>
  ]
};

const WISHES = [
  ['所有的期待都如愿', '今天也要开心呀'],
  // [卡片主标题, 卡片副标题]
];
```

- `CONFIG.name` 会替换白天页头里的名字。
- `CONFIG.letter` 是信件的正文，每一项是一段。
- `WISHES` 现在有 90 组，对应 90 张卡片，按顺序一一对应，不会循环，也不会出现重复文案。
- `CONFIG.autoSound` 设为 `false` 后，进页面不会自动尝试播放音乐。
- 音乐文件放在 `assets/birthday.mp3`；详见 `assets/README.md`。

### 2. 场景文案

`index.html` 里还有几处固定的场景文字，可以直接搜索替换：

- `<title>`：浏览器标签标题。
- `.day-kicker`：白天页头的小字。
- `.heart-hint`：爱心阶段的提示。
- `#wallTitle`：祝福墙标题。
- `#nightCopy`：夜晚左侧的大标题和副标题。
- `#toast`：吹蜡烛后的提示。
- `#sceneTitle`：夜间转场时短暂出现的标题。

蛋糕正面那行手写体在 `cake.js` 的 `makeTextTexture()` 里，搜索 `happy birthday` 即可替换；右下角的外部手写体在 `index.html` 的 `.script` 元素和 `styles.css` 的 `.script` 规则里。

### 3. 卡片数量

爱心由三层卡片组成：40 + 30 + 20 = 90 张。`app.js` 里的 `CARD_COUNT` 默认也是 90，`WISHES` 也正好准备了 90 组祝福。

如果只改 `CARD_COUNT`，爱心层不会自动重排多出来的卡片，`WISHES` 也会不够用。想改数量，请同时调整 `layoutHeart()` 中的 `rings` 数组，并补足 `WISHES` 的条目。

### 4. 蛋糕外观

蛋糕完全由 Three.js 程序化生成，没有外部模型或贴图。想调整外观，主要看 `cake.js`：

- `STAR_COLORS`、`NEBULA_COLORS`：糖针和星云的颜色。
- `makeGalaxyTexture()`：淋面纹理，包括星云、星尘、糖针和闪光。
- `makeTopTexture()`：蛋糕顶部的星星糖和中央暖光。
- `buildCandle()`：蜡烛颜色、粗细和高度；当前暖金色蜡烛在 `0xbe8530` 附近。
- `buildDome()`：玻璃罩半径 `2.65`、高度和透明度 `uOpacity: .36`。
- `buildRings()`：三个金色轨道的半径、高度和透明度。
- `buildStars()` / `buildFloatingStars()` / `buildDomeSparkles()`：蛋糕周围的星点、悬浮星星和玻璃罩内的光斑。
- `resize()`：不同屏幕比例下的相机距离和高度。

改完保存，刷新浏览器即可，不需要打包。

### 5. 字体和依赖

- `vendor/three.min.js`：Three.js r149。
- `vendor/ma-shan-zheng.woff2`：马善政毛笔字体，用于「生日快乐」书法字。
- `vendor/great-vibes.woff2`：Great Vibes 手写体，用于英文花体。

字体在 `styles.css` 的 `@font-face` 中声明；替换字体时保持文件名一致即可，或者同步修改 `@font-face` 的 `src`。

## 技术说明

### 画面结构

- **白天场景**：纯 CSS 渐变、噪点、光晕、纸雕卡片和 Canvas 花瓣，没有图片素材。
- **花瓣**：`petals.js` 用 Canvas 2D 绘制 26–48 片带渐变、翻转和横向摆动的花瓣；尺寸随屏幕变化，切到后台会暂停，夜里会随白天场景一起隐藏。
- **卡片爱心**：用参数方程采样经典心形曲线，重采样成 90 个点，再按 1.0 / 0.73 / 0.48 三圈缩放排布。每张卡片是一个 CSS 3D 变换的 `div`，通过 `translate3d`、`rotateZ`、`scale` 和 `transition-delay` 做缓慢的飞行动画。
- **命中检测**：鼠标移动和点击不再依赖最上层的那张卡，而是用 `document.elementsFromPoint()` 找出指针下所有卡片，再选离指针最近的一张。这样被外圈挡住的内圈卡片也能浮起、也能点开。
- **祝福墙**：把 90 张卡片打散到带随机扰动、行错位、随机旋转、随机缩放和随机 z-index 的网格上；不再自动跳转，由底部按钮或便利贴里的按钮继续。
- **便利贴阅读器**：点击卡片后先播放“抬起”动画，再用 Web Animations API 做一次慢速 FLIP 展开，纸张从卡片位置生长到屏幕中央；关闭时反向收回。支持 `Esc`、遮罩点击、焦点循环和「收下祝福」。
- **夜晚背景**：Canvas 2D 绘制星空、散景光斑、流星和光环；`fx.js` 中四种模式共用一套粒子系统。
- **蛋糕**：Three.js 程序化生成圆柱蛋糕体、星空淋面、顶部糖针、玻璃罩、金色轨道和蜡烛；玻璃罩使用自定义 fresnel 着色器，只让边缘反光，不遮挡内部。
- **音乐**：优先播放 `assets/birthday.mp3` 并循环，带 1.8 秒淡入；文件不存在、加载失败或格式不支持时，退回 `sound.js` 的 WebAudio 振荡器音乐盒。声音开关会同时管理两者。
- **减少动态**：页面响应 `prefers-reduced-motion: reduce`。CSS 动画会停止；花瓣只画一帧静态画面；卡片飞行和便利贴展开会缩短；`fx.js` 会冻结为一帧静态星空；`cake.js` 会锁住相机漂移、旋转、呼吸和烛火抖动，只保留吹蜡烛时的必要反馈。

### 文件结构

```
birthday-web/
├─ index.html          页面结构、场景文案、脚本加载顺序
├─ styles.css          全部样式、响应式布局、字体声明、减少动态
├─ app.js              内容配置、卡片排布、命中检测、便利贴阅读器、场景切换
├─ petals.js           Canvas 2D 满屏花瓣
├─ fx.js               2D 星空 / 小雪 / 流星雨 / 光环粒子
├─ cake.js             Three.js 星河蛋糕、玻璃罩、蜡烛、糖针
├─ sound.js            WebAudio 音乐盒（真实 BGM 缺失时的后备）
├─ README.md
├─ assets/
│  ├─ README.md        背景音乐放置说明
│  └─ birthday.mp3     自行放入的目标歌曲（可选）
└─ vendor/
   ├─ three.min.js
   ├─ ma-shan-zheng.woff2
   ├─ great-vibes.woff2
   └─ LICENSES.md
```

### 兼容性与性能

- 桌面端优先设计，移动端在 375 × 667 及以上尺寸做了适配。
- 星空、蛋糕和粒子都按 `devicePixelRatio` 限制在 2 倍以内，避免高分屏过度渲染。
- 蛋糕使用实例化网格绘制几百颗星星糖，避免为每颗糖单独创建 draw call。
- 如果设备性能较弱，可以优先减少 `buildStarSprinkles()` 中的 `topCount` / `sideCount`，或降低 `buildDomeSparkles()` 的粒子数量。
- 如果浏览器禁用 WebGL，页面仍会保留夜晚文字和 2D 星空，只是没有 3D 蛋糕。

### 调试

`app.js` 末尾暴露了一个小对象，方便在控制台快速跳转：

```js
birthday.heart();     // 进入爱心
birthday.wall();      // 进入祝福墙
birthday.night();     // 直接进入夜晚
birthday.blow();      // 吹蜡烛 / 重新点亮
birthday.relight();   // 重新点亮
birthday.letter();    // 打开信件
birthday.note(12);    // 打开第 13 张便利贴
birthday.closeNote(); // 收起便利贴
birthday.fx('snow');  // 切换效果：stars / snow / meteor / halo
birthday.sound.start(); // 手动开始背景音乐
```

## 素材与许可

- Three.js r149：MIT License，版权归 Three.js Authors。
- 马善政毛笔字体（Ma Shan Zheng）：SIL Open Font License 1.1。
- Great Vibes：SIL Open Font License 1.1。

完整许可见 `vendor/LICENSES.md`。页面中的程序化贴图、粒子、花瓣和音乐盒均由代码实时生成，不包含第三方图片或音频素材；`assets/birthday.mp3` 需要使用者自行合法获取，仓库不会附带受版权保护的歌曲。
