import { BrowserWindow } from 'electron';
import App from '../app';
import Module from './module';
export default class WindowSettingsModule extends Module {
    private readonly app;
    private readonly window;
    constructor(app: App, window: BrowserWindow);
    beforeLoad(): void;
    onQuit(): void;
}
//# sourceMappingURL=window-settings-module.d.ts.map