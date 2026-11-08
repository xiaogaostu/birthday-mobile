'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('birthdayDesktop', Object.freeze({ exit: () => ipcRenderer.send('birthday-desktop:exit') }));