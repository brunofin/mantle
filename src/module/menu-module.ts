import { app, BrowserWindow, dialog, Menu, MenuItemConstructorOptions, shell } from "electron";
import { readFileSync } from "fs";
import { join } from "path";
import App from "../app";
import Module from "./module";
import Settings from "../settings";
import { TargetConfig } from "../target-adapter";
import SpellCheckModule from "./spellcheck-module";
import WhatsNewModule from "./whatsnew-module";

const settings = new Settings("menu");

export default class MenuModule extends Module {

  constructor(
    private readonly app: App,
    private readonly window: BrowserWindow,
    private readonly config: TargetConfig,
    private readonly spellcheck?: SpellCheckModule,
    private readonly whatsnew?: WhatsNewModule,
  ) {
    super();
  }

  public override beforeLoad() {
    if (this.config.aboutPanel) {
      app.setAboutPanelOptions({
        applicationName: this.config.aboutPanel.applicationName,
        applicationVersion: app.getVersion(),
        website: this.config.aboutPanel.website,
        iconPath: this.config.aboutPanel.iconPath,
      });
    }

    const alwaysShow = settings.get("alwaysShow", this.config.showMenuBar ?? false);
    this.window.setAutoHideMenuBar(!alwaysShow);
    this.window.setMenuBarVisibility(alwaysShow);
  }

  public override onLoad() {
    const menu = this.buildMenu();
    Menu.setApplicationMenu(menu);
  }

  private buildMenu(): Menu {
    const alwaysShow = settings.get("alwaysShow", this.config.showMenuBar ?? false);

    const helpItems: MenuItemConstructorOptions[] = [];

    if (this.whatsnew) {
      helpItems.push({
        label: "What's New",
        click: () => this.whatsnew?.show()
      });
    }

    if (this.config.aboutPanel) {
      helpItems.push({
        label: "About " + this.config.name,
        click: () => app.showAboutPanel()
      });
    }

    if (this.config.aboutPanel) {
      helpItems.push({
        label: "Release Notes",
        click: () => shell.openExternal(this.config.aboutPanel!.website + "/releases")
      });
    }

    if (this.config.appdataPath) {
      helpItems.push({ type: "separator" });
      helpItems.push({
        label: "Open-Source Licenses",
        click: () => this.showLicenses()
      });
    }

    if (this.config.helpMenuItems && this.config.helpMenuItems.length > 0) {
      helpItems.push({ type: "separator" });
      for (const item of this.config.helpMenuItems) {
        helpItems.push({ label: item.label, click: item.click });
      }
    }

    const template: MenuItemConstructorOptions[] = [
      {
        label: "File",
        submenu: [
          {
            label: "Quit",
            accelerator: "CmdOrCtrl+Q",
            click: () => this.app.quit()
          }
        ]
      },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" }
        ]
      },
      {
        label: "View",
        submenu: [
          {
            label: "Reload",
            accelerator: "CmdOrCtrl+R",
            click: () => this.app.reload()
          },
          {
            label: "Force Reload",
            accelerator: "CmdOrCtrl+Shift+R",
            click: () => this.app.reload()
          },
          { type: "separator" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { role: "resetZoom" },
          ...(this.spellcheck ? [
            { type: "separator" as const },
            {
              label: "Spell Check",
              type: "checkbox" as const,
              checked: this.spellcheck.enabled,
              click: (menuItem: Electron.MenuItem) => {
                this.spellcheck!.setEnabled(menuItem.checked);
              }
            },
            {
              label: "Spell Check Languages",
              submenu: this.buildLanguageSubmenu()
            },
          ] : []),
          { type: "separator" },
          {
            label: "Always Show Menu Bar",
            type: "checkbox",
            checked: alwaysShow,
            click: (menuItem) => {
              const show = menuItem.checked;
              settings.set("alwaysShow", show);
              this.window.setAutoHideMenuBar(!show);
              this.window.setMenuBarVisibility(show);
            }
          }
        ]
      },
      {
        label: "Help",
        submenu: helpItems.length > 0 ? helpItems : [{ label: "No help available", enabled: false }]
      }
    ];

    return Menu.buildFromTemplate(template);
  }

  private rebuildMenu() {
    Menu.setApplicationMenu(this.buildMenu());
  }

  private getLanguageDisplayName(code: string): string {
    try {
      return new Intl.DisplayNames("en", {type: "language"}).of(code) ?? code;
    } catch {
      return code;
    }
  }

  private buildLanguageSubmenu(): MenuItemConstructorOptions[] {
    if (!this.spellcheck) return [];

    const available = this.spellcheck.getAvailableLanguages().sort(
      (a, b) => this.getLanguageDisplayName(a).localeCompare(this.getLanguageDisplayName(b))
    );

    if (available.length === 0) {
      return [{
        label: "No languages available",
        enabled: false
      }];
    }

    const current = this.spellcheck.languages;

    return available.map(code => ({
      label: this.getLanguageDisplayName(code),
      type: "checkbox" as const,
      checked: current.includes(code),
      click: () => {
        const langs = [...current];
        const idx = langs.indexOf(code);
        if (idx >= 0) {
          langs.splice(idx, 1);
        } else {
          langs.push(code);
        }
        this.spellcheck!.setLanguages(langs);
        this.rebuildMenu();
      }
    }));
  }

  private showLicenses() {
    const base = app.isPackaged ? join(process.resourcesPath, "..") : app.getAppPath();
    const licensePath = this.config.appdataPath
      ? join(base, this.config.appdataPath)
      : join(base, "data", "third-party-notices.txt");
    let content: string;
    try {
      content = readFileSync(licensePath, "utf-8");
    } catch {
      content = "Third-party notices file not found.";
    }
    dialog.showMessageBox(this.window, {
      type: "info",
      title: "Open-Source Licenses",
      message: "Third-Party Notices",
      detail: content,
      buttons: ["OK"]
    });
  }
}
