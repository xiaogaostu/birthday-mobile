'use strict';

const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('node:path');

const APP_ROOT = path.join(__dirname, '..');
let win = null;
let clickThrough = false;

const OVERLAY_CSS = `
  html, body, #app, .app { background: transparent !important; }
  body { background-color: transparent !important; }
  .day { background: transparent !important; }
  .night { background: transparent !important; }
  .night-bg, .night-rays, .night-vignette { opacity: 0 !important; }
  #boot-screen {
    background: transparent !important;
    background-image: none !important;
    backdrop-filter: none !important;
  }
`;

function createWindow() {
  win = new BrowserWindow({
    show: false,
    fullscreen: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  win.setMenuBarVisibility(false);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.webContents.on('dom-ready', async () => {
    try {
      await win.webContents.insertCSS(OVERLAY_CSS);
    } catch (error) {
      console.error('[desktop] overlay stylesheet failed:', error);
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });

  win.once('ready-to-show', () => {
    if (!win || win.isDestroyed()) return;
    win.setAlwaysOnTop(true, 'screen-saver');
    win.show();
    win.focus();
  });

  win.on('closed', () => {
    win = null;
  });

  win.loadFile(path.join(APP_ROOT, 'index.html'));
}

function registerShortcuts() {
  // Keep the original page's Escape behavior (it closes its letter dialog).
  // Ctrl+Shift+Q is the explicit desktop-app exit shortcut.
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());

  // Toggle click-through so the desktop can be used without closing the effect.
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (!win || win.isDestroyed()) return;
    clickThrough = !clickThrough;
    win.setIgnoreMouseEvents(clickThrough);
    if (!clickThrough) win.focus();
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    app.setAppUserModelId('com.xiaogaostu.birthdaydesktop');
    createWindow();
    registerShortcuts();
  });

  app.on('activate', () => {
    if (!win) createWindow();
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
