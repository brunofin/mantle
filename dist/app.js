"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const module_manager_1 = __importDefault(require("./module/module-manager"));
const settings_1 = __importDefault(require("./settings"));
const DEFAULT_UA = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome.split('.')[0]}.0.0.0 Safari/537.36`;
class App {
    constructor(config, modulesFactory) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.quitting = false;
        this.currentTab = null;
        this.activeTab = 0;
        this.tabsHeight = 48;
        this.altArmed = false;
        this.menuRevealed = false;
        this.menuSettings = new settings_1.default("menu");
        this.config = config;
        this.startHidden = process.argv.includes("--start-hidden") || electron_1.app.commandLine.hasSwitch("start-hidden");
        const ua = (_a = config.userAgent) !== null && _a !== void 0 ? _a : DEFAULT_UA;
        this.loadURLOptions = { userAgent: ua };
        this.window = new electron_1.BrowserWindow({
            title: config.name,
            width: (_c = (_b = config.windowDefaults) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : 1100,
            height: (_e = (_d = config.windowDefaults) === null || _d === void 0 ? void 0 : _d.height) !== null && _e !== void 0 ? _e : 700,
            minWidth: (_g = (_f = config.windowDefaults) === null || _f === void 0 ? void 0 : _f.minWidth) !== null && _g !== void 0 ? _g : 650,
            minHeight: (_j = (_h = config.windowDefaults) === null || _h === void 0 ? void 0 : _h.minHeight) !== null && _j !== void 0 ? _j : 550,
            show: false,
        });
        this.window.on('resize', () => this.updateTabBarVisibility());
        this.moduleManager = new module_manager_1.default(modulesFactory(this));
        this.tabsView = new electron_1.WebContentsView({
            webPreferences: {
                preload: path_1.default.join(__dirname, 'tabsPreload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            }
        });
        this.tabs = new Array();
    }
    init(preloadUrl) {
        this.moduleManager.beforeLoad();
        this.registerListeners();
        this.setupTabs();
        this.openTab(preloadUrl !== null && preloadUrl !== void 0 ? preloadUrl : this.config.defaultUrl);
        this.moduleManager.onLoad();
        if (!this.startHidden) {
            this.window.show();
        }
        return this.window;
    }
    reload() {
        if (this.currentTab) {
            this.currentTab.webContents.reloadIgnoringCache();
        }
    }
    openUrl(url) {
        var _a;
        const transform = (_a = this.config.hooks) === null || _a === void 0 ? void 0 : _a.openUrlTransform;
        this.openTab(transform ? transform(url) : url);
    }
    quit() {
        this.quitting = true;
        this.moduleManager.onQuit();
        electron_1.app.quit();
    }
    cleanTitle(title) {
        var _a;
        if ((_a = this.config.title) === null || _a === void 0 ? void 0 : _a.cleanPattern) {
            return title.replace(this.config.title.cleanPattern, '').trim();
        }
        return title;
    }
    setupTabs() {
        this.tabsView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.tabsHeight });
        this.tabsView.webContents.loadFile(path_1.default.join(__dirname, 'tabs.html'));
        this.window.contentView.addChildView(this.tabsView);
    }
    updateTabBarVisibility() {
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
    openTab(url) {
        const newContent = new electron_1.WebContentsView({
            webPreferences: {
                preload: this.config.preloads.content,
                contextIsolation: false,
                spellcheck: true,
            }
        });
        newContent.webContents.loadURL(url, this.loadURLOptions);
        newContent.webContents.setWindowOpenHandler(details => {
            this.openTab(details.url);
            return { action: 'deny' };
        });
        newContent.webContents.on('page-title-updated', (_event, title, explicitSet) => {
            var _a;
            if (this.quitting)
                return;
            if (explicitSet && newContent === this.currentTab) {
                const cleaned = this.cleanTitle(title);
                this.window.setTitle(cleaned);
                (_a = this.onTitleUpdate) === null || _a === void 0 ? void 0 : _a.call(this, cleaned, explicitSet);
            }
            this.tabsView.webContents.send('update-tabs');
        });
        newContent.webContents.on('before-input-event', (event, input) => {
            var _a, _b, _c;
            const key = input.key.toUpperCase();
            if (key === 'ALT' && !input.control && !input.shift && !input.meta && !this.menuSettings.get("alwaysShow", false)) {
                if (input.type === 'keyDown') {
                    this.altArmed = true;
                    return;
                }
                else if (input.type === 'keyUp' && this.altArmed) {
                    this.menuRevealed = !this.menuRevealed;
                    this.window.autoHideMenuBar = !this.menuRevealed;
                    this.window.setMenuBarVisibility(this.menuRevealed);
                    this.altArmed = false;
                    return;
                }
            }
            if (input.type === 'keyDown')
                this.altArmed = false;
            if (input.control && key === 'W') {
                this.window.hide();
                event.preventDefault();
            }
            else if (input.control && key === 'Q') {
                this.quit();
                event.preventDefault();
            }
            else if (input.control && key === 'R') {
                (_a = this.currentTab) === null || _a === void 0 ? void 0 : _a.webContents.reloadIgnoringCache();
                event.preventDefault();
            }
            else if (key === 'F5') {
                (_b = this.currentTab) === null || _b === void 0 ? void 0 : _b.webContents.reloadIgnoringCache();
                event.preventDefault();
            }
            else if (input.control && (key === '+' || key === '=')) {
                if (this.currentTab && this.currentTab.webContents.getZoomFactor() < 3)
                    this.currentTab.webContents.zoomLevel += 1;
                event.preventDefault();
            }
            else if (input.control && key === '0') {
                (_c = this.currentTab) === null || _c === void 0 ? void 0 : _c.webContents.setZoomLevel(0);
                event.preventDefault();
            }
            else if (input.control && key === '-') {
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
    switchTab(index) {
        const newTab = this.tabs[index];
        if (!newTab || newTab === this.currentTab)
            return;
        if (this.currentTab) {
            this.window.contentView.removeChildView(this.currentTab);
        }
        this.window.contentView.addChildView(newTab);
        this.currentTab = newTab;
        this.activeTab = index;
        this.window.setTitle(this.cleanTitle(newTab.webContents.getTitle()));
        this.tabsView.webContents.send('update-tabs');
    }
    closeTab(index) {
        const tab = this.tabs[index];
        if (!tab)
            return;
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
        }
        else {
            if (index < this.activeTab) {
                this.activeTab--;
            }
        }
        this.window.contentView.removeChildView(tab);
        this.tabs.splice(index, 1);
        this.updateTabBarVisibility();
        this.tabsView.webContents.send('update-tabs');
    }
    registerListeners() {
        var _a, _b;
        electron_1.app.on('second-instance', () => {
            this.window.show();
            this.window.focus();
        });
        const notifyClick = (_b = (_a = this.config.hooks) === null || _a === void 0 ? void 0 : _a.onNotificationClick) !== null && _b !== void 0 ? _b : (() => this.window.show());
        electron_1.ipcMain.on('notification-click', () => notifyClick());
        electron_1.ipcMain.handle('get-tabs', () => {
            return this.tabs.map((tab, index) => ({
                title: this.cleanTitle(tab.webContents.getTitle()),
                index,
                active: index === this.activeTab,
            }));
        });
        electron_1.ipcMain.on('switch-tab', (event, index) => {
            this.switchTab(index);
        });
        electron_1.ipcMain.on('close-tab', (event, index) => {
            this.closeTab(index);
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map