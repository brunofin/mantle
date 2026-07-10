import { BrowserWindow } from "electron";
import Module from "./module";
import { TargetConfig } from "../target-adapter";
export default class WhatsNewModule extends Module {
    private readonly window;
    private readonly config;
    private releases;
    private overlay;
    private readonly resizeOverlay;
    constructor(window: BrowserWindow, config: TargetConfig);
    beforeLoad(): void;
    private parseReleases;
    private getCurrentRelease;
    show(): void;
    private fitOverlay;
    private close;
    onLoad(): void;
    private markSeen;
}
//# sourceMappingURL=whatsnew-module.d.ts.map