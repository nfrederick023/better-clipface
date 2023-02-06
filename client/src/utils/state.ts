import { Video } from "./interfaces";
import config from "config";
import fse from "fs-extra";
import path from "path";

const CLIPS_PATH: string = config.get("clips_path");

export const getState = async (): Promise<Video[]> => {
  try {
    return await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json")) as Video[];
  } catch (e) {
    return []; //if the state is not found return nothing
  }
};

export const updateState = async (newState: Video[]): Promise<void> => {
  try {
    // check if assets folder for state exsists. If not then create it.
    if (!await fse.pathExists(path.join(CLIPS_PATH, "/assets"))) {
      await fse.mkdir(path.join(CLIPS_PATH, "/assets"));
    }
    await fse.writeJSON(path.join(CLIPS_PATH, "/assets/state.json"), newState);
  } catch (e) {
    return;
  }
};

export const updateVideo = async (newVideo: Video): Promise<Video | null | undefined> => {
  const state = await getState();
  // remove the old video object and add in the new one
  const newState = state.filter(function (clip: Video) { return clip.id !== newVideo.id; });
  newState.push(newVideo);
  await updateState(newState);
  return newVideo;
};