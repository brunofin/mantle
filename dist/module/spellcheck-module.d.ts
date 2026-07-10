import Module from "./module";
export default class SpellCheckModule extends Module {
    private _enabled;
    private _languages;
    constructor();
    beforeLoad(): void;
    get enabled(): boolean;
    get languages(): string[];
    setEnabled(val: boolean): void;
    setLanguages(langs: string[]): void;
    getAvailableLanguages(): string[];
    private apply;
}
//# sourceMappingURL=spellcheck-module.d.ts.map