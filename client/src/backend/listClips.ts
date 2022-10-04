/*
 * Lists all clips
 *
 * This module should only be imported from server side code.
 */

import { Clip, MetaData } from "../shared/interfaces";

import config from "config";
import crypto from "crypto";
import fse from "fs-extra";
import glob from "glob";
import path from "path";

const CLIPS_PATH: string = config.get("clips_path");
const CLIPS_GLOB = `${CLIPS_PATH}/*.@(mkv|mp4|webm|mov|mpeg|avi|wmv|json)`;

const listClips = async (): Promise<Clip[]> => {
  let clips = glob.sync(CLIPS_GLOB).sort().reverse();
  const clipsMeta: { [key: string]: MetaData } = {};

  clips
    .filter((clipPath) => clipPath.endsWith(".json"))
    .forEach((metaPath: string) => {
      clipsMeta[path.basename(metaPath, ".json")] = JSON.parse(
        fse.readFileSync(metaPath).toString()
      );
    });

  // Remove the metadata files from the clip list
  clips = clips.filter((clipPath) => !clipPath.endsWith(".json"));

  const clipDetails: Clip[] = [];
  for (const filePath of clips) {
    const clipState = await getClipState(filePath, clipsMeta);
    if (clipState) {
      clipDetails.push(
        clipState
      )
    }
  }
  fse.writeFileSync(path.join(CLIPS_PATH, "/assets/state.json"), JSON.stringify(clipDetails));
  return clipDetails;
}

export async function getClipState(filePath: string, clipsMeta: { [key: string]: MetaData }): Promise<Clip | null> {
  const fileName = path.basename(filePath);
  const assetsFilePath = path.join(CLIPS_PATH, "/assets/state.json");
  const stats = fse.statSync(filePath);
  const meta: MetaData = clipsMeta[fileName] || {};
  let state: Clip[];

  try {
    state = JSON.parse(await (await fse.readFile(assetsFilePath)).toString());
  } catch (e) {
    state = [];
  }

  if (state.length) {
    const clipState = state.find((clip) => { return clip.clipName == fileName });
    if (clipState) {
      return clipState;
    }
  }

  const id = crypto.randomBytes(4).toString("hex");
  const newClipState: Clip = {
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
    return null;
  }
  return newClipState;
}


export default listClips;
