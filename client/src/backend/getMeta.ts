/*
 * Exports a function for fetching clip metadata
 */

import { Clip } from "../shared/interfaces";
import config from "config";
import fs from "fs";
import path from "path";

const CLIPS_PATH: string = config.get("clips_path");

/**
 * Returns metadata for a clip
 *
 * @param {string} clipFileName The name of the clip including the file extension
 * @returns {object}
 */
const getMeta = async (clipId: string): Promise<Clip | void> => {
  const state = await JSON.parse(fs.readFileSync(path.join(CLIPS_PATH, "/assets/state.json")).toString());
  const currentClip: Clip = state.find((clip: Clip) => { return clip.id == clipId });
  if (!currentClip || !currentClip.name) {
    return;
  }

  return currentClip || null;
}

export default getMeta;
