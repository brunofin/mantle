export { default as App } from './app';
export { default as Settings } from './settings';
export { findIcon, getUnreadMessages } from './util';
export { TargetConfig, IconSet, AboutPanelOptions, HelpMenuItem } from './target-adapter';

export { default as Module } from './module/module';
export { default as ModuleManager } from './module/module-manager';
export { default as HotkeyModule } from './module/hotkey-module';
export { default as WindowSettingsModule } from './module/window-settings-module';
export { default as TrayModule } from './module/tray-module';
export { default as SpellCheckModule } from './module/spellcheck-module';
export { default as MenuModule } from './module/menu-module';
export { default as WhatsNewModule } from './module/whatsnew-module';

export { default as Fix } from './fix/fix';
export { default as Electron21Fix } from './fix/electron-21-fix';
