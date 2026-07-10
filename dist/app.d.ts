import { BrowserWindow } from "electron";
import Module from "./module/module";
import { TargetConfig } from "./target-adapter";
export default class App {
    readonly window: BrowserWindow;
    quitting: boolean;
    onTitleUpdate?: (title: string, explicitSet: boolean) => void;
    private readonly config;
    private readonly moduleManager;
    private readonly tabsView;
    private readonly tabs;
    private currentTab;
    private activeTab;
    private readonly tabsHeight;
    private altArmed;
    private menuRevealed;
    private readonly menuSettings;
    private readonly loadURLOptions;
    private readonly startHidden;
    constructor(config: TargetConfig, modulesFactory: (app: App) => Module[]);
    init(preloadUrl?: string): BrowserWindow;
    reload(): void;
    openUrl(url: string): void;
    quit(): void;
    private cleanTitle;
    private setupTabs;
    private updateTabBarVisibility;
    private openTab;
    private switchTab;
    private closeTab;
    private registerListeners;
}
//# sourceMappingURL=app.d.ts.map