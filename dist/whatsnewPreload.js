"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('whatsnewAPI', {
    onReleaseData: (callback) => {
        electron_1.ipcRenderer.on('release-data', (_event, data) => callback(data));
    },
    dismiss: () => {
        electron_1.ipcRenderer.send('whatsnew-dismiss');
    }
});
//# sourceMappingURL=whatsnewPreload.js.map