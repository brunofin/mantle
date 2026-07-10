"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
class Settings {
    constructor(section) {
        this.store = new electron_store_1.default();
        this.section = section + ".";
    }
    get(key, defaults = null) {
        return this.store.get(this.section + key, defaults);
    }
    set(key, value) {
        this.store.set(this.section + key, value);
    }
}
exports.default = Settings;
//# sourceMappingURL=settings.js.map