"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModuleManager {
    constructor(modules) {
        this.modules = modules;
    }
    beforeLoad() {
        this.forEach(module => module.beforeLoad());
    }
    onLoad() {
        this.forEach(module => module.onLoad());
    }
    onQuit() {
        this.forEach(module => module.onQuit());
    }
    forEach(callback) {
        this.modules.forEach(callback);
    }
}
exports.default = ModuleManager;
//# sourceMappingURL=module-manager.js.map