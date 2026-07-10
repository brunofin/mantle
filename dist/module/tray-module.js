"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const util_1 = require("../util");
const module_1 = __importDefault(require("./module"));
const settings_1 = __importDefault(require("../settings"));
const settings = new settings_1.default("tray");
class TrayModule extends module_1.default {
    constructor(app, window, config) {
        super();
        this.app = app;
        this.window = window;
        this.config = config;
        this.tray = new electron_1.Tray(this.resolveIcon(false, settings.get("greyscale", false)));
    }
    onLoad() {
        this.updateMenu();
        this.registerListeners();
    }
    resolveIcon(unread, greyscale) {
        var _a, _b, _c, _d;
        if (unread && greyscale)
            return (0, util_1.findIcon)((_b = (_a = this.config.iconSet.greyscaleUnread) !== null && _a !== void 0 ? _a : this.config.iconSet.unread) !== null && _b !== void 0 ? _b : this.config.iconSet.default);
        if (unread)
            return (0, util_1.findIcon)((_c = this.config.iconSet.unread) !== null && _c !== void 0 ? _c : this.config.iconSet.default);
        if (greyscale)
            return (0, util_1.findIcon)((_d = this.config.iconSet.greyscale) !== null && _d !== void 0 ? _d : this.config.iconSet.default);
        return (0, util_1.findIcon)(this.config.iconSet.default);
    }
    updateMenu(unread) {
        var _a;
        if (unread === void 0) { unread = (0, util_1.getUnreadMessages)(this.window.title, (_a = this.config.title) === null || _a === void 0 ? void 0 : _a.unreadExtractor); }
        const menu = electron_1.Menu.buildFromTemplate([
            {
                label: this.window.isVisible() ? "Minimize to tray" : "Show " + this.config.name,
                click: () => this.onClickFirstItem(unread)
            },
            {
                label: settings.get("greyscale", false) ? "Use color icon" : "Use greyscale icon",
                click: () => {
                    settings.set("greyscale", !settings.get("greyscale", false));
                    this.tray.setImage(this.resolveIcon(unread !== 0, settings.get("greyscale", false)));
                    this.updateMenu(unread);
                }
            },
            {
                label: "Quit " + this.config.name,
                click: () => this.app.quit()
            },
        ]);
        let tooltip = this.config.name;
        if (unread !== 0) {
            menu.insert(0, new electron_1.MenuItem({
                label: (unread === Infinity ? "9+" : unread) + " unread notifications",
                enabled: false
            }));
            menu.insert(1, new electron_1.MenuItem({ type: "separator" }));
            tooltip = tooltip + " - " + unread + " unread notifications";
        }
        this.tray.setContextMenu(menu);
        this.tray.setToolTip(tooltip);
    }
    onClickFirstItem(unread) {
        var _a;
        if (unread === void 0) { unread = (0, util_1.getUnreadMessages)(this.window.title, (_a = this.config.title) === null || _a === void 0 ? void 0 : _a.unreadExtractor); }
        if (this.window.isVisible()) {
            this.window.hide();
        }
        else {
            this.window.show();
            this.window.focus();
        }
        this.updateMenu(unread);
    }
    registerListeners() {
        this.window.on("show", () => this.updateMenu());
        this.window.on("hide", () => this.updateMenu());
        this.window.on("close", event => {
            if (this.app.quitting)
                return;
            event.preventDefault();
            this.window.hide();
        });
        this.app.onTitleUpdate = (title, explicitSet) => {
            var _a;
            if (!explicitSet)
                return;
            const unread = (0, util_1.getUnreadMessages)(title, (_a = this.config.title) === null || _a === void 0 ? void 0 : _a.unreadExtractor);
            this.updateMenu(unread);
            this.tray.setImage(this.resolveIcon(unread !== 0, settings.get("greyscale", false)));
        };
        this.tray.on("click", () => this.onClickFirstItem());
        this.tray.on("double-click", () => this.onClickFirstItem());
    }
}
exports.default = TrayModule;
//# sourceMappingURL=tray-module.js.map