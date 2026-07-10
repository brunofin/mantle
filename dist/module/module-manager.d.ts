import Module from "./module";
export default class ModuleManager implements Module {
    private readonly modules;
    constructor(modules: Array<Module>);
    beforeLoad(): void;
    onLoad(): void;
    onQuit(): void;
    private forEach;
}
//# sourceMappingURL=module-manager.d.ts.map