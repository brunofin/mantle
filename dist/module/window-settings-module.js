"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = __importDefault(require("../settings"));
const module_1 = __importDefault(require("./module"));
const settings = new settings_1.default("window");
class WindowSettingsModule extends module_1.default {
    constructor(app, window) {
        super();
        this.app = app;
        this.window = window;
    }
    beforeLoad() {
        let defaults = this.window.getBounds();
        this.window.setBounds(settings.get("bounds", defaults));
        if (settings.get("maximized", false)) {
            this.window.maximize();
        }
    }
    onQuit() {
        settings.set("maximized", this.window.isMaximized());
        if (!this.window.isMaximized()) {
            settings.set("bounds", this.window.getBounds());
        }
    }
}
exports.default = WindowSettingsModule;
//# sourceMappingURL=window-settings-module.js.map