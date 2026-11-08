'use strict';

const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('node:path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
const APP_ROOT = path.join(__dirname, '..');
let win = null;
let clickThrough = false;

const OVERLAY_CSS = `
  html, body, #app, .app { background: transparent !important; }
  body { background-color: transparent !important; }
  .day { background: transparent !important; }
  .day .aurora { opacity: 0 !important; background: none !important; }
  .night { background: transparent !important; }
  .night-bg, .night-rays, .night-vignette { opacity: 0 !important; }
  #boot-screen { background: transparent !important; background-image: none !important; backdrop-filter: none !important; }
  #birthday-desktop-controls { position:fixed; z-index:2147483647; top:18px; right:18px; display:flex; gap:8px; align-items:center; padding:8px; border:1px solid rgba(255,255,255,.28); border-radius:14px; background:rgba(12,15,30,.78); color:#fff; font:14px/1.2 system-ui,sans-serif; box-shadow:0 4px 24px #0005; backdrop-filter:blur(12px); }
  #birthday-desktop-controls button { border:0; border-radius:9px; padding:9px 12px; color:#fff; background:rgba(255,255,255,.16); font:inherit; cursor:pointer; }
  #birthday-desktop-controls button:hover { background:rgba(255,255,255,.3); }
  #birthday-desktop-controls .exit { background:#b8324a; }
  #birthday-desktop-reopen { position:fixed; z-index:2147483647; top:18px; right:18px; display:none; padding:10px 14px; border:1px solid #ffffff55; border-radius:12px; color:white; background:#171a2ddd; font:14px system-ui,sans-serif; cursor:pointer; }
`;

const CONTROL_SCRIPT = `
(() => {
 if (document.getElementById('birthday-desktop-controls')) return;
 const bar=document.createElement('div'); bar.id='birthday-desktop-controls';
 bar.innerHTML='<span style="padding:0 5px">生日特效</span><button id="bd-pause">暂停</button><button id="bd-hide">隐藏</button><button class="exit" id="bd-exit">退出</button>';
 const reopen=document.createElement('button'); reopen.id='birthday-desktop-reopen'; reopen.textContent='显示控制';
 document.body.append(bar,reopen);
 let paused=false;
 document.getElementById('bd-pause').addEventListener('click',()=>{
   paused=!paused;
   document.getAnimations().forEach(a=>{try{paused?a.pause():a.play()}catch{}});
   document.querySelectorAll('video').forEach(v=>{try{paused?v.pause():v.play()}catch{}});
   document.getElementById('bd-pause').textContent=paused?'继续':'暂停';
 });
 document.getElementById('bd-hide').addEventListener('click',()=>{bar.style.display='none';reopen.style.display='block'});
 reopen.addEventListener('click',()=>{bar.style.display='flex';reopen.style.display='none'});
 document.getElementById('bd-exit').addEventListener('click',()=>window.birthdayDesktop.exit());
})();
`;

function createWindow() {
 win = new BrowserWindow({
  show:false, fullscreen:true, frame:false, transparent:true, backgroundColor:'#00000000',
  hasShadow:false, resizable:false, movable:false, minimizable:false, maximizable:false,
  autoHideMenuBar:true, skipTaskbar:true, alwaysOnTop:true,
  webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}
 });
 win.setMenuBarVisibility(false);
 win.setAlwaysOnTop(true,'screen-saver');
 win.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});
 win.webContents.on('dom-ready',async()=>{
  try { await win.webContents.insertCSS(OVERLAY_CSS); await win.webContents.executeJavaScript("if(document.body){"+CONTROL_SCRIPT+"}else{document.addEventListener('DOMContentLoaded',()=>{"+CONTROL_SCRIPT+"},{once:true})}"); }
  catch(error){ console.error('[desktop] overlay setup failed:',error); }
 });
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file://'))event.preventDefault()});
 win.once('ready-to-show',()=>{if(!win||win.isDestroyed())return;win.setAlwaysOnTop(true,'screen-saver');win.show();win.focus()});
 win.on('closed',()=>{win=null});
 win.loadFile(path.join(APP_ROOT,'index.html'));
}
function registerShortcuts(){
 globalShortcut.register('CommandOrControl+Shift+Q',()=>app.quit());
 globalShortcut.register('CommandOrControl+Shift+P',()=>{if(!win||win.isDestroyed())return;clickThrough=!clickThrough;win.setIgnoreMouseEvents(clickThrough);if(!clickThrough)win.focus()});
 globalShortcut.register('CommandOrControl+Shift+M',()=>{if(win&&!win.isDestroyed())win.webContents.executeJavaScript("document.getElementById('birthday-desktop-controls').style.display='flex';document.getElementById('birthday-desktop-reopen').style.display='none'")});
}
ipcMain.on('birthday-desktop:exit',()=>app.quit());
const gotLock=app.requestSingleInstanceLock();
if(!gotLock) app.quit();
else {
 app.whenReady().then(()=>{app.setAppUserModelId('com.xiaogaostu.birthdaydesktop');createWindow();registerShortcuts()});
 app.on('activate',()=>{if(!win)createWindow()});
 app.on('will-quit',()=>globalShortcut.unregisterAll());
 app.on('window-all-closed',()=>app.quit());
}