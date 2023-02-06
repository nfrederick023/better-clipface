/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const config = require("config");
const fse = require("fs-extra");
const path = require("path");

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

module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    pageTitle: config.get("page_title"),
    hasPassword: config.get("user_password")
  },
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  }
};
