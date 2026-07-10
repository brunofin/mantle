import { BrowserWindow } from "electron";
import App from "../app";
import Module from "./module";
interface ClickAction {
    control?: boolean;
    keys: Array<string>;
    action: () => void;
}
export default class HotkeyModule extends Module {
    private readonly app;
    private readonly window;
    private readonly actions;
    constructor(app: App, window: BrowserWindow);
    beforeLoad(): void;
    add(...clickActions: Array<ClickAction>): void;
    private onInput;
    private registerHotkeys;
    private registerListeners;
}
export {};
//# sourceMappingURL=hotkey-module.d.ts.map