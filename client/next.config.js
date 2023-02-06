/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import config from "config";
import fse from "fs-extra";
import path from "path";

// backs up state on startup
(async function main () {
  try {
    const CLIPS_PATH = config.get("clips_path");

    if (await fse.pathExists(path.join(CLIPS_PATH, "/assets"))) {
      const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));
      await fse.writeJSON(path.join(CLIPS_PATH, "/assets/state_backup.json"), state);
    }
  } catch (e) {
    console.log("Error Backing Up State: " + e);
  }
})();

export const publicRuntimeConfig = {
  // Will be available on both server and client
  pageTitle: config.get("page_title"),
};

export const compiler = {
  // ssr and displayName are configured by default
  styledComponents: true,
};
