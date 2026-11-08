# Windows 桌面版

本目录把现有生日网页封装为 Electron 无边框透明全屏窗口。网页资源从本地文件加载，不启动浏览器，也不依赖网络。

## Windows 构建

需要 Windows 10/11、Node.js 20 或更高版本，以及 npm。

```powershell
npm install
npm run dist:win
```

生成的便携版 EXE 位于 `release/`，可直接发送给朋友双击运行。

如需传统安装包：

```powershell
npm run dist:win:installer
```

## 快捷键

- `Ctrl + Shift + Q`：退出程序。
- `Ctrl + Shift + P`：切换鼠标穿透。开启后鼠标操作会落到桌面；再次按下可恢复动画交互。
- 页面原有的 `Esc` 行为保留，用于关闭信件弹窗。

## 说明

- 程序使用 Electron 内嵌 Chromium，不会打开 Chrome/Edge 浏览器。
- 当前窗口覆盖主显示器，透明窗口与页面中的动画图层叠加。
- 页面原有日间/夜间背景层在桌面模式下被隐藏，保留花瓣、卡片、文字、蛋糕、星空粒子和页面交互。
- 仓库根目录现有的 `birthday-music.mp3` 会随 EXE 一起打包，并由原页面预加载播放；若音频文件不可用，页面仍可使用项目内置 WebAudio 音乐盒作为后备。
- WebGL/硬件加速由 Electron 默认启用，以支持 Three.js 蛋糕。少数显卡/驱动可能需要真机测试。
- 未签名 EXE 在部分 Windows 设备上可能出现 SmartScreen 提示；正式公开分发建议购买代码签名证书并签名。
- 需要在 Windows 环境执行构建，当前仓库提交的是可构建源代码，不是已编译的 EXE。
