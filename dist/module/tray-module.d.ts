import { BrowserWindow } from "electron";
import App from "../app";
import Module from "./module";
import { TargetConfig } from "../target-adapter";
export default class TrayModule extends Module {
    private readonly app;
    private readonly window;
    private readonly tray;
    private readonly config;
    constructor(app: App, window: BrowserWindow, config: TargetConfig);
    onLoad(): void;
    private resolveIcon;
    private updateMenu;
    private onClickFirstItem;
    private registerListeners;
}
//# sourceMappingURL=tray-module.d.ts.map