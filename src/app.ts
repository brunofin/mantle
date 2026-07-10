import {app, BrowserWindow, WebContentsView, ipcMain, LoadURLOptions} from "electron";
import path from "path";
import ModuleManager from "./module/module-manager";
import Module from "./module/module";
import Settings from "./settings";
import {TargetConfig} from "./target-adapter";

const DEFAULT_UA = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome.split('.')[0]}.0.0.0 Safari/537.36`;

export default class App {
  public readonly window: BrowserWindow;
  public quitting = false;
  public onTitleUpdate?: (title: string, explicitSet: boolean) => void;

  private readonly config: TargetConfig;
  private readonly moduleManager: ModuleManager;
  private readonly tabsView: WebContentsView;
  private readonly tabs: Array<WebContentsView>;
  private currentTab: WebContentsView | null = null;
  private activeTab: number = 0;
  private readonly tabsHeight: number = 48;
  private altArmed = false;
  private menuRevealed = false;
  private readonly menuSettings = new Settings("menu");
  private readonly loadURLOptions: LoadURLOptions;
  private readonly startHidden: boolean;

  constructor(config: TargetConfig, modulesFactory: (app: App) => Module[]) {
    this.config = config;
    this.startHidden = process.argv.includes("--start-hidden") || app.commandLine.hasSwitch("start-hidden");

    const ua = config.userAgent ?? DEFAULT_UA;
    this.loadURLOptions = {userAgent: ua};

    this.window = new BrowserWindow({
      title: config.name,
      width: config.windowDefaults?.width ?? 1100,
      height: config.windowDefaults?.height ?? 700,
      minWidth: config.windowDefaults?.minWidth ?? 650,
      minHeight: config.windowDefaults?.minHeight ?? 550,
      show: false,
    });

    this.window.on('resize', () => this.updateTabBarVisibility());

    this.moduleManager = new ModuleManager(modulesFactory(this));

    this.tabsView = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'tabsPreload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      }
    });

    this.tabs = new Array<WebContentsView>();
  }

  public init(preloadUrl?: string): BrowserWindow {
    this.moduleManager.beforeLoad();

    this.registerListeners();

    this.setupTabs();
    this.openTab(preloadUrl ?? this.config.defaultUrl);

    this.moduleManager.onLoad();

    if (!this.startHidden) {
      this.window.show();
    }

    return this.window;
  }

  public reload() {
    if (this.currentTab) {
      this.currentTab.webContents.reloadIgnoringCache();
    }
  }

  public openUrl(url: string) {
    const transform = this.config.hooks?.openUrlTransform;
    this.openTab(transform ? transform(url) : url);
  }

  public quit() {
    this.quitting = true;
    this.moduleManager.onQuit();
    app.quit();
  }

  private cleanTitle(title: string): string {
    if (this.config.title?.cleanPattern) {
      return title.replace(this.config.title.cleanPattern, '').trim();
    }
    return title;
  }

  private setupTabs() {
    this.tabsView.setBounds({x: 0, y: 0, width: this.window.getBounds().width, height: this.tabsHeight})
    this.tabsView.webContents.loadFile(path.join(__dirname, 'tabs.html'));
    this.window.contentView.addChildView(this.tabsView);
  }

  private updateTabBarVisibility() {
    const bounds = this.window.getBounds();
    const showTabs = this.tabs.length > 1;

    this.tabsView.setBounds({
      x: 0, y: 0,
      width: bounds.width,
      height: showTabs ? this.tabsHeight : 0,
    });

    for (const tab of this.tabs) {
      tab.setBounds({
        x: 0,
        y: showTabs ? this.tabsHeight : 0,
        width: bounds.width,
        height: showTabs ? bounds.height - this.tabsHeight : bounds.height,
      });
    }
  }

  private openTab(url: string) {
    const newContent = new WebContentsView({
      webPreferences: {
        preload: this.config.preloads.content,
        contextIsolation: false,
        spellcheck: true,
      }
    });

    newContent.webContents.loadURL(url, this.loadURLOptions);

    newContent.webContents.setWindowOpenHandler(details => {
      this.openTab(details.url);
      return {action: 'deny'};
    });

    newContent.webContents.on('page-title-updated', (_event, title, explicitSet) => {
      if (this.quitting) return;

      if (explicitSet && newContent === this.currentTab) {
        const cleaned = this.cleanTitle(title);
        this.window.setTitle(cleaned);
        this.onTitleUpdate?.(cleaned, explicitSet);
      }

      this.tabsView.webContents.send('update-tabs');
    });

    newContent.webContents.on('before-input-event', (event, input) => {
      const key = input.key.toUpperCase();

      if (key === 'ALT' && !input.control && !input.shift && !input.meta && !this.menuSettings.get("alwaysShow", false)) {
        if (input.type === 'keyDown') {
          this.altArmed = true;
          return;
        } else if (input.type === 'keyUp' && this.altArmed) {
          this.menuRevealed = !this.menuRevealed;
          this.window.autoHideMenuBar = !this.menuRevealed;
          this.window.setMenuBarVisibility(this.menuRevealed);
          this.altArmed = false;
          return;
        }
      }
      if (input.type === 'keyDown') this.altArmed = false;

      if (input.control && key === 'W') {
        this.window.hide();
        event.preventDefault();
      } else if (input.control && key === 'Q') {
        this.quit();
        event.preventDefault();
      } else if (input.control && key === 'R') {
        this.currentTab?.webContents.reloadIgnoringCache();
        event.preventDefault();
      } else if (key === 'F5') {
        this.currentTab?.webContents.reloadIgnoringCache();
        event.preventDefault();
      } else if (input.control && (key === '+' || key === '=')) {
        if (this.currentTab && this.currentTab.webContents.getZoomFactor() < 3)
          this.currentTab.webContents.zoomLevel += 1;
        event.preventDefault();
      } else if (input.control && key === '0') {
        this.currentTab?.webContents.setZoomLevel(0);
        event.preventDefault();
      } else if (input.control && key === '-') {
        if (this.currentTab && this.currentTab.webContents.getZoomFactor() > 0.5)
          this.currentTab.webContents.zoomLevel -= 1;
        event.preventDefault();
      }
    });

    this.tabs.push(newContent);
    this.updateTabBarVisibility();
    this.switchTab(this.tabs.length - 1);
    this.tabsView.webContents.send('update-tabs');
  }

  private switchTab(index: number) {
    const newTab = this.tabs[index];
    if (!newTab || newTab === this.currentTab) return;

    if (this.currentTab) {
      this.window.contentView.removeChildView(this.currentTab);
    }
    this.window.contentView.addChildView(newTab);
    this.currentTab = newTab;
    this.activeTab = index;

    this.window.setTitle(this.cleanTitle(newTab.webContents.getTitle()));
    this.tabsView.webContents.send('update-tabs');
  }

  private closeTab(index: number) {
    const tab = this.tabs[index];
    if (!tab) return;

    const wasActive = index === this.activeTab;

    if (this.tabs.length === 1) {
      this.openTab(this.config.defaultUrl);
      this.window.contentView.removeChildView(tab);
      this.tabs.splice(index, 1);
      this.activeTab = 0;
      this.currentTab = this.tabs[0];
      this.updateTabBarVisibility();
      this.tabsView.webContents.send('update-tabs');
      return;
    }

    if (wasActive) {
      const newIndex = index === 0 ? 1 : index - 1;
      this.switchTab(newIndex);
    } else {
      if (index < this.activeTab) {
        this.activeTab--;
      }
    }

    this.window.contentView.removeChildView(tab);
    this.tabs.splice(index, 1);
    this.updateTabBarVisibility();
    this.tabsView.webContents.send('update-tabs');
  }

  private registerListeners() {
    app.on('second-instance', () => {
      this.window.show();
      this.window.focus();
    });

    const notifyClick = this.config.hooks?.onNotificationClick ?? (() => this.window.show());
    ipcMain.on('notification-click', () => notifyClick());

    ipcMain.handle('get-tabs', () => {
      return this.tabs.map((tab, index) => ({
        title: this.cleanTitle(tab.webContents.getTitle()),
        index,
        active: index === this.activeTab,
      }));
    });

    ipcMain.on('switch-tab', (event, index) => {
      this.switchTab(index);
    });

    ipcMain.on('close-tab', (event, index) => {
      this.closeTab(index);
    });
  }
}
