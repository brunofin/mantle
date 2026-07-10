import { app, session } from "electron";
import fs from "fs";
import path from "path";
import Settings from "../settings";
import Fix from "./fix";

const settings = new Settings("fixes");

export default class Electron21Fix extends Fix {

  public override beforeLoad() {
    if (!settings.get("electron-21", false)) {
      console.info("Clearing storage data...");

      fs.rmSync(path.join(app.getPath("userData"), "Service Worker"), {
        recursive: true,
        force: true
      });

      session.defaultSession.clearStorageData();

      settings.set("electron-21", true);
    }
  }
}
