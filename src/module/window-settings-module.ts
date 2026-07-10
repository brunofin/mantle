import { BrowserWindow } from 'electron';
import Settings from '../settings';
import App from '../app';
import Module from './module';

const settings = new Settings("window");

export default class WindowSettingsModule extends Module {

  constructor(
    private readonly app: App,
    private readonly window: BrowserWindow
  ) {
    super();
  }

  public override beforeLoad(){
    let defaults = this.window.getBounds();
    this.window.setBounds(settings.get("bounds", defaults));

    if (settings.get("maximized", false)) {
      this.window.maximize();
    }
  }

  public override onQuit() {
    settings.set("maximized", this.window.isMaximized());

    if (!this.window.isMaximized()) {
      settings.set("bounds", this.window.getBounds());
    }
  }
}
