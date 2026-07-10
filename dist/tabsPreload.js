"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('tabsAPI', {
    getTabs: () => electron_1.ipcRenderer.invoke('get-tabs'),
    switchTab: (index) => electron_1.ipcRenderer.send('switch-tab', index),
    closeTab: (index) => electron_1.ipcRenderer.send('close-tab', index),
    onUpdateTabs: (callback) => electron_1.ipcRenderer.on('update-tabs', () => callback()),
});
//# sourceMappingURL=tabsPreload.js.map