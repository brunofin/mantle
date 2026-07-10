"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
const module_1 = __importDefault(require("./module"));
const settings_1 = __importDefault(require("../settings"));
const settings = new settings_1.default("menu");
class MenuModule extends module_1.default {
    constructor(app, window, config, spellcheck, whatsnew) {
        super();
        this.app = app;
        this.window = window;
        this.config = config;
        this.spellcheck = spellcheck;
        this.whatsnew = whatsnew;
    }
    beforeLoad() {
        var _a;
        if (this.config.aboutPanel) {
            electron_1.app.setAboutPanelOptions({
                applicationName: this.config.aboutPanel.applicationName,
                applicationVersion: electron_1.app.getVersion(),
                website: this.config.aboutPanel.website,
                iconPath: this.config.aboutPanel.iconPath,
            });
        }
        const alwaysShow = settings.get("alwaysShow", (_a = this.config.showMenuBar) !== null && _a !== void 0 ? _a : false);
        this.window.setAutoHideMenuBar(!alwaysShow);
        this.window.setMenuBarVisibility(alwaysShow);
    }
    onLoad() {
        const menu = this.buildMenu();
        electron_1.Menu.setApplicationMenu(menu);
    }
    buildMenu() {
        var _a;
        const alwaysShow = settings.get("alwaysShow", (_a = this.config.showMenuBar) !== null && _a !== void 0 ? _a : false);
        const helpItems = [];
        if (this.whatsnew) {
            helpItems.push({
                label: "What's New",
                click: () => { var _a; return (_a = this.whatsnew) === null || _a === void 0 ? void 0 : _a.show(); }
            });
        }
        if (this.config.aboutPanel) {
            helpItems.push({
                label: "About " + this.config.name,
                click: () => electron_1.app.showAboutPanel()
            });
        }
        if (this.config.aboutPanel) {
            helpItems.push({
                label: "Release Notes",
                click: () => electron_1.shell.openExternal(this.config.aboutPanel.website + "/releases")
            });
        }
        if (this.config.appdataPath) {
            helpItems.push({ type: "separator" });
            helpItems.push({
                label: "Open-Source Licenses",
                click: () => this.showLicenses()
            });
        }
        if (this.config.helpMenuItems && this.config.helpMenuItems.length > 0) {
            helpItems.push({ type: "separator" });
            for (const item of this.config.helpMenuItems) {
                helpItems.push({ label: item.label, click: item.click });
            }
        }
        const template = [
            {
                label: "File",
                submenu: [
                    {
                        label: "Quit",
                        accelerator: "CmdOrCtrl+Q",
                        click: () => this.app.quit()
                    }
                ]
            },
            {
                label: "Edit",
                submenu: [
                    { role: "undo" },
                    { role: "redo" },
                    { type: "separator" },
                    { role: "cut" },
                    { role: "copy" },
                    { role: "paste" },
                    { role: "selectAll" }
                ]
            },
            {
                label: "View",
                submenu: [
                    {
                        label: "Reload",
                        accelerator: "CmdOrCtrl+R",
                        click: () => this.app.reload()
                    },
                    {
                        label: "Force Reload",
                        accelerator: "CmdOrCtrl+Shift+R",
                        click: () => this.app.reload()
                    },
                    { type: "separator" },
                    { role: "zoomIn" },
                    { role: "zoomOut" },
                    { role: "resetZoom" },
                    ...(this.spellcheck ? [
                        { type: "separator" },
                        {
                            label: "Spell Check",
                            type: "checkbox",
                            checked: this.spellcheck.enabled,
                            click: (menuItem) => {
                                this.spellcheck.setEnabled(menuItem.checked);
                            }
                        },
                        {
                            label: "Spell Check Languages",
                            submenu: this.buildLanguageSubmenu()
                        },
                    ] : []),
                    { type: "separator" },
                    {
                        label: "Always Show Menu Bar",
                        type: "checkbox",
                        checked: alwaysShow,
                        click: (menuItem) => {
                            const show = menuItem.checked;
                            settings.set("alwaysShow", show);
                            this.window.setAutoHideMenuBar(!show);
                            this.window.setMenuBarVisibility(show);
                        }
                    }
                ]
            },
            {
                label: "Help",
                submenu: helpItems.length > 0 ? helpItems : [{ label: "No help available", enabled: false }]
            }
        ];
        return electron_1.Menu.buildFromTemplate(template);
    }
    rebuildMenu() {
        electron_1.Menu.setApplicationMenu(this.buildMenu());
    }
    getLanguageDisplayName(code) {
        var _a;
        try {
            return (_a = new Intl.DisplayNames("en", { type: "language" }).of(code)) !== null && _a !== void 0 ? _a : code;
        }
        catch (_b) {
            return code;
        }
    }
    buildLanguageSubmenu() {
        if (!this.spellcheck)
            return [];
        const available = this.spellcheck.getAvailableLanguages().sort((a, b) => this.getLanguageDisplayName(a).localeCompare(this.getLanguageDisplayName(b)));
        if (available.length === 0) {
            return [{
                    label: "No languages available",
                    enabled: false
                }];
        }
        const current = this.spellcheck.languages;
        return available.map(code => ({
            label: this.getLanguageDisplayName(code),
            type: "checkbox",
            checked: current.includes(code),
            click: () => {
                const langs = [...current];
                const idx = langs.indexOf(code);
                if (idx >= 0) {
                    langs.splice(idx, 1);
                }
                else {
                    langs.push(code);
                }
                this.spellcheck.setLanguages(langs);
                this.rebuildMenu();
            }
        }));
    }
    showLicenses() {
        const base = electron_1.app.isPackaged ? (0, path_1.join)(process.resourcesPath, "..") : electron_1.app.getAppPath();
        const licensePath = this.config.appdataPath
            ? (0, path_1.join)(base, this.config.appdataPath)
            : (0, path_1.join)(base, "data", "third-party-notices.txt");
        let content;
        try {
            content = (0, fs_1.readFileSync)(licensePath, "utf-8");
        }
        catch (_a) {
            content = "Third-party notices file not found.";
        }
        electron_1.dialog.showMessageBox(this.window, {
            type: "info",
            title: "Open-Source Licenses",
            message: "Third-Party Notices",
            detail: content,
            buttons: ["OK"]
        });
    }
}
exports.default = MenuModule;
//# sourceMappingURL=menu-module.js.map