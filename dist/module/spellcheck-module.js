"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const module_1 = __importDefault(require("./module"));
const settings_1 = __importDefault(require("../settings"));
const settings = new settings_1.default("spellcheck");
class SpellCheckModule extends module_1.default {
    constructor() {
        super();
        const forcedOff = process.argv.includes("--disable-spellcheck");
        this._enabled = forcedOff ? false : settings.get("enabled", true);
        this._languages = settings.get("languages", []);
    }
    beforeLoad() {
        this.apply();
    }
    get enabled() {
        return this._enabled;
    }
    get languages() {
        return this._languages;
    }
    setEnabled(val) {
        this._enabled = val;
        settings.set("enabled", val);
        electron_1.session.defaultSession.spellCheckerEnabled = val;
    }
    setLanguages(langs) {
        this._languages = langs;
        settings.set("languages", langs);
        if (langs.length > 0) {
            try {
                electron_1.session.defaultSession.setSpellCheckerLanguages(langs);
            }
            catch (_a) {
            }
        }
    }
    getAvailableLanguages() {
        try {
            return electron_1.session.defaultSession.availableSpellCheckerLanguages;
        }
        catch (_a) {
            return [];
        }
    }
    apply() {
        electron_1.session.defaultSession.spellCheckerEnabled = this._enabled;
        if (this._languages.length > 0) {
            try {
                electron_1.session.defaultSession.setSpellCheckerLanguages(this._languages);
            }
            catch (_a) {
            }
        }
    }
}
exports.default = SpellCheckModule;
//# sourceMappingURL=spellcheck-module.js.map