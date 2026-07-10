export default class Settings {
    private readonly store;
    private readonly section;
    constructor(section: string);
    get(key: string, defaults?: any): any;
    set(key: string, value: any): void;
}
//# sourceMappingURL=settings.d.ts.map