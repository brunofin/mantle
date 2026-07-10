"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const settings_1 = __importDefault(require("../settings"));
const fix_1 = __importDefault(require("./fix"));
const settings = new settings_1.default("fixes");
class Electron21Fix extends fix_1.default {
    beforeLoad() {
        if (!settings.get("electron-21", false)) {
            console.info("Clearing storage data...");
            fs_1.default.rmSync(path_1.default.join(electron_1.app.getPath("userData"), "Service Worker"), {
                recursive: true,
                force: true
            });
            electron_1.session.defaultSession.clearStorageData();
            settings.set("electron-21", true);
        }
    }
}
exports.default = Electron21Fix;
//# sourceMappingURL=electron-21-fix.js.map