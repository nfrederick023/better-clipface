/*
 * Exports a function for fetching clip metadata
 */

import * as mime from "mime-types";

import config from "config";
import fs from "fs";
import fse from 'fs-extra';
import path from "path";

const CLIPS_PATH = config.get("clips_path");

/**
 * Returns metadata for a clip
 *
 * @param {string} clipFileName The name of the clip including the file extension
 * @returns {object}
 */
export default async function getMeta(clipId) {
  const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));
  let clip = state.find((clip) => { return clip.id == clipId });
  if (!clip || !clip.name) {
    return;
  }
  const clipFullPath = path.join(CLIPS_PATH, clip.name);
  const stats = fs.statSync(clipFullPath);
  const clipBaseName = path.basename(clip.name, path.extname(clip.name));

  let meta = null;
  const metadataPath = path.join(CLIPS_PATH, clipBaseName + ".json");

  try {
    meta = JSON.parse(fs.readFileSync(metadataPath));
  } catch {
    meta = {};
  }

  return {
    name: clip.clipName,
    mime: mime.lookup(clip.clipName),
    size: stats.size,
    saved: stats.mtimeMs,
    created: stats.birthtimeMs,
    title: meta.title || null,
    description: meta.description || null,
    createdDate: meta.createdDate || null,
  };
}
