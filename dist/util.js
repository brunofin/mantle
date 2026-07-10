"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findIcon = findIcon;
exports.getUnreadMessages = getUnreadMessages;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function findIcon(name) {
    let iconPath = fromDataDirs("icons/hicolor/512x512/apps/" + name);
    if (iconPath === null)
        iconPath = path_1.default.join("./data/icons/hicolor/512x512/apps/", name);
    return electron_1.nativeImage.createFromPath(iconPath);
}
function getUnreadMessages(title, extractor) {
    var _a, _b;
    if (extractor)
        return extractor(title);
    const matches = title === null || title === void 0 ? void 0 : title.match(/\((\d+)\)/);
    if (!matches)
        return (title === null || title === void 0 ? void 0 : title.startsWith("(9+)")) ? Infinity : 0;
    return Number.parseInt((_b = (_a = matches[0].match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '0');
}
function fromDataDirs(iconPath) {
    var _a;
    for (let dataDir of ((_a = process.env.XDG_DATA_DIRS) !== null && _a !== void 0 ? _a : '/usr/local/share:/usr/share').split(":")) {
        let fullPath = path_1.default.join(dataDir, iconPath);
        if (fs_1.default.existsSync(fullPath))
            return fullPath;
    }
    return null;
}
//# sourceMappingURL=util.js.map