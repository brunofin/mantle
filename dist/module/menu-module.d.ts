import { BrowserWindow } from "electron";
import App from "../app";
import Module from "./module";
import { TargetConfig } from "../target-adapter";
import SpellCheckModule from "./spellcheck-module";
import WhatsNewModule from "./whatsnew-module";
export default class MenuModule extends Module {
    private readonly app;
    private readonly window;
    private readonly config;
    private readonly spellcheck?;
    private readonly whatsnew?;
    constructor(app: App, window: BrowserWindow, config: TargetConfig, spellcheck?: SpellCheckModule | undefined, whatsnew?: WhatsNewModule | undefined);
    beforeLoad(): void;
    onLoad(): void;
    private buildMenu;
    private rebuildMenu;
    private getLanguageDisplayName;
    private buildLanguageSubmenu;
    private showLicenses;
}
//# sourceMappingURL=menu-module.d.ts.map