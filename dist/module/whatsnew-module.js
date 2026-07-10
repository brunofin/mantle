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
const settings = new settings_1.default("whatsnew");
class WhatsNewModule extends module_1.default {
    constructor(window, config) {
        super();
        this.window = window;
        this.config = config;
        this.releases = [];
        this.overlay = null;
        this.resizeOverlay = () => this.fitOverlay();
        this.parseReleases();
    }
    beforeLoad() {
        electron_1.ipcMain.on('whatsnew-dismiss', () => {
            this.markSeen(electron_1.app.getVersion());
            this.close();
        });
    }
    parseReleases() {
        if (!this.config.appdataPath)
            return;
        const base = electron_1.app.isPackaged ? (0, path_1.join)(process.resourcesPath, "..") : electron_1.app.getAppPath();
        let content;
        try {
            content = (0, fs_1.readFileSync)((0, path_1.join)(base, this.config.appdataPath), "utf-8");
        }
        catch (_a) {
            return;
        }
        const releaseRegex = /<release\s+version="([^"]+)"\s+date="([^"]+)"(?:\s*\/>|>([\s\S]*?)<\/release>)/g;
        let match;
        while ((match = releaseRegex.exec(content)) !== null) {
            const version = match[1];
            const date = match[2];
            const desc = match[3] || "";
            const items = [];
            const pRegex = /<p>([\s\S]*?)<\/p>/g;
            let pMatch;
            while ((pMatch = pRegex.exec(desc)) !== null) {
                items.push(pMatch[1].trim());
            }
            this.releases.push({ version, date, items });
        }
    }
    getCurrentRelease() {
        var _a;
        const currentVersion = electron_1.app.getVersion();
        return (_a = this.releases.find(r => r.version === currentVersion)) !== null && _a !== void 0 ? _a : null;
    }
    show() {
        if (this.overlay) {
            return;
        }
        const release = this.getCurrentRelease();
        if (!release)
            return;
        this.overlay = new electron_1.WebContentsView({
            webPreferences: {
                preload: (0, path_1.join)(__dirname, '..', 'whatsnewPreload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                transparent: true,
            }
        });
        this.overlay.setBackgroundColor('#00000000');
        this.overlay.webContents.loadFile((0, path_1.join)(__dirname, '..', 'whatsnew.html'));
        const allReleases = [...this.releases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.overlay.webContents.on('did-finish-load', () => {
            var _a;
            const data = {
                appName: this.config.name,
                version: release.version,
                date: release.date,
                items: release.items,
                allReleases,
            };
            (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.webContents.send('release-data', data);
        });
        this.window.contentView.addChildView(this.overlay);
        this.fitOverlay();
        this.window.on('resize', this.resizeOverlay);
    }
    fitOverlay() {
        if (!this.overlay)
            return;
        const { width, height } = this.window.getContentBounds();
        this.overlay.setBounds({ x: 0, y: 0, width, height });
    }
    close() {
        if (!this.overlay)
            return;
        this.window.off('resize', this.resizeOverlay);
        this.window.contentView.removeChildView(this.overlay);
        this.overlay = null;
    }
    onLoad() {
        const release = this.getCurrentRelease();
        if (!release)
            return;
        const seen = settings.get("seenVersions", []);
        if (seen.includes(release.version))
            return;
        setImmediate(() => this.show());
    }
    markSeen(version) {
        const seen = settings.get("seenVersions", []);
        if (!seen.includes(version)) {
            seen.push(version);
            settings.set("seenVersions", seen);
        }
    }
}
exports.default = WhatsNewModule;
//# sourceMappingURL=whatsnew-module.js.map