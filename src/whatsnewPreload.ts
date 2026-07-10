import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('whatsnewAPI', {
  onReleaseData: (callback: (data: {appName: string; version: string; date: string; items: string[]; allReleases: Array<{version: string; date: string; items: string[]}>}) => void) => {
    ipcRenderer.on('release-data', (_event, data) => callback(data));
  },
  dismiss: () => {
    ipcRenderer.send('whatsnew-dismiss');
  }
});
