import { BrowserWindow, Menu, MenuItem, Tray } from "electron";
import { findIcon, getUnreadMessages } from "../util";
import App from "../app";
import Module from "./module";
import Settings from "../settings";
import { TargetConfig } from "../target-adapter";

const settings = new Settings("tray");

export default class TrayModule extends Module {

  private readonly tray: Tray;
  private readonly config: TargetConfig;

  constructor(
    private readonly app: App,
    private readonly window: BrowserWindow,
    config: TargetConfig
  ) {
    super();
    this.config = config;
    this.tray = new Tray(this.resolveIcon(false, settings.get("greyscale", false)));
  }

  public override onLoad() {
    this.updateMenu();
    this.registerListeners();
  }

  private resolveIcon(unread: boolean, greyscale: boolean): Electron.NativeImage {
    if (unread && greyscale) return findIcon(this.config.iconSet.greyscaleUnread ?? this.config.iconSet.unread ?? this.config.iconSet.default);
    if (unread) return findIcon(this.config.iconSet.unread ?? this.config.iconSet.default);
    if (greyscale) return findIcon(this.config.iconSet.greyscale ?? this.config.iconSet.default);
    return findIcon(this.config.iconSet.default);
  }

  private updateMenu(unread = getUnreadMessages(this.window.title, this.config.title?.unreadExtractor)) {
    const menu = Menu.buildFromTemplate([
      {
        label: this.window.isVisible() ? "Minimize to tray" : "Show " + this.config.name,
        click: () => this.onClickFirstItem(unread)
      },
      {
        label: settings.get("greyscale", false) ? "Use color icon" : "Use greyscale icon",
        click: () => {
          settings.set("greyscale", !settings.get("greyscale", false));

          this.tray.setImage(this.resolveIcon(unread !== 0, settings.get("greyscale", false)));

          this.updateMenu(unread);
        }
      },
      {
        label: "Quit " + this.config.name,
        click: () => this.app.quit()
      },
    ]);

    let tooltip = this.config.name;

    if (unread !== 0) {
      menu.insert(0, new MenuItem({
        label: (unread === Infinity ? "9+" : unread) + " unread notifications",
        enabled: false
      }));

      menu.insert(1, new MenuItem({ type: "separator" }));

      tooltip = tooltip + " - " + unread + " unread notifications";
    }

    this.tray.setContextMenu(menu);
    this.tray.setToolTip(tooltip);
  }

  private onClickFirstItem(unread = getUnreadMessages(this.window.title, this.config.title?.unreadExtractor)) {
    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.window.show();
      this.window.focus();
    }

    this.updateMenu(unread);
  }

  private registerListeners() {
    this.window.on("show", () => this.updateMenu());
    this.window.on("hide", () => this.updateMenu());

    this.window.on("close", event => {
      if (this.app.quitting) return;

      event.preventDefault();
      this.window.hide();
    });

    this.app.onTitleUpdate = (title, explicitSet) => {
      if (!explicitSet) return;

      const unread = getUnreadMessages(title, this.config.title?.unreadExtractor);

      this.updateMenu(unread);
      this.tray.setImage(this.resolveIcon(unread !== 0, settings.get("greyscale", false)));
    };

    this.tray.on("click", () => this.onClickFirstItem());
    this.tray.on("double-click", () => this.onClickFirstItem());
  }
}
