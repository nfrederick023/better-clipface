/*
 * Lists all clips
 *
 * This module should only be imported from server side code.
 */
import fs from "fs";
import path from "path";
import glob from "glob";
import config from "config";
import crypto from "crypto";
const fse = require('fs-extra');

const CLIPS_PATH = config.get("clips_path");
const CLIPS_GLOB = `${CLIPS_PATH}/*.@(mkv|mp4|webm|mov|mpeg|avi|wmv|json)`;

export default async function listClips() {
  let clips = glob.sync(CLIPS_GLOB).sort().reverse();
  const clipsMeta = {};

  clips
    .filter((clipPath) => clipPath.endsWith(".json"))
    .forEach((metaPath) => {
      clipsMeta[path.basename(metaPath, ".json")] = JSON.parse(
        fs.readFileSync(metaPath)
      );
    });

  // Remove the metadata files from the clip list
  clips = clips.filter((clipPath) => !clipPath.endsWith(".json"));

  const clipDetails = [];
  for (const filePath of clips) {
    clipDetails.push({
      ...await getClipState(filePath, clipsMeta)
    })
  }
  await fse.writeJSON(path.join(CLIPS_PATH, "/assets/state.json"), clipDetails);
  return clipDetails;
}

export async function getClipState(filePath, clipsMeta) {
  const fileName = path.basename(filePath);
  const assetsFilePath = path.join(CLIPS_PATH, "/assets/state.json");
  const stats = fs.statSync(filePath);
  const meta = clipsMeta[fileName] || {};
  let state;

  try {
    state = await fse.readJSON(assetsFilePath);
  } catch (e) {
    state = [];
  };

  if (state.length) {
    const clipState = state.find((clip) => { return clip.clipName == fileName });
    if (clipState) {
      return clipState;
    }
  }

  const id = crypto.randomBytes(4).toString('hex');
  const newClipState = {
    name: fileName,
    size: stats.size,
    saved: stats.mtimeMs,
    created: stats.birthtimeMs,
    title: meta.title || null,
    description: meta.description || null,
    clipName: fileName,
    requireAuth: false,
    isFavorite: false,
    id
  }

  state.push(newClipState);
  try {
    if (!await fse.pathExists(path.join(CLIPS_PATH, "/assets"))) {
      await fse.mkdir(path.join(CLIPS_PATH, "/assets"));
    }
    await fse.writeJSON(assetsFilePath, state);
  } catch (e) {
    console.log(e);
  }
  return newClipState;
}
