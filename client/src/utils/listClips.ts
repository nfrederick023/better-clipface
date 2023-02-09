import { getState, updateState } from "./state";

import { Video } from "./interfaces";
import config from "config";
import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";
import fse from "fs-extra";
import glob from "glob";
import path from "path";
import pathToFfmpeg from "ffmpeg-static";
import seedrandom from "seedrandom";

ffmpeg.setFfprobePath(ffprobeStatic.path);
ffmpeg.setFfmpegPath(pathToFfmpeg ?? "");
// import jsmediatags from "jsmediatags";

const CLIPS_PATH: string = config.get("clips_path");
const CLIPS_GLOB = `${CLIPS_PATH}/*.@(mkv|mp4|webm|mov|mpeg|avi|wmv|json)`;

const listClips = async (): Promise<Video[]> => {
  let clips = glob.sync(CLIPS_GLOB);
  //const clipsMeta: { [key: string]: TagType } = {};

  // WIP code for updating/viewing metadata (eg video title)
  // clips.forEach((videoPath: string) => {

  //   console.log("running");

  //   jsmediatags.read(videoPath).then();
  // });

  // console.log(clipsMeta);
  // console.log(clips);

  // Remove metadata files from the video list
  clips = clips.filter((clipPath) => !clipPath.endsWith(".json"));

  const clipDetails: Video[] = [];
  for (const filePath of clips) {
    const clipState = await getVideoState(filePath);
    if (clipState) {
      clipDetails.push(
        clipState
      );
    }
  }
  return clipDetails;
};

export const getVideoState = async (filePath: string): Promise<Video | null> => {
  const videoName = path.basename(filePath);
  const videoStats = fse.statSync(filePath);
  const state = await getState();

  // check if the video already is persisted within the state
  const clipState = state.find((video) => { return video.name === videoName; });

  ffmpeg(filePath)
    .screenshots({
      filename: clipState?.id + ".jpg",
      count: 1,
      folder: config.get("clips_path") + "/assets/thumbnails/",
      size: "1920x1080"
    });

  if (clipState) {
    return clipState;
  }

  // if not, create the state video and add persist it
  const id = parseInt((seedrandom(videoName + config.get("user_password"))() * 9e7 + 1e7).toString()).toString();
  const newClipState: Video = {
    name: videoName,
    size: videoStats.size,
    saved: videoStats.mtimeMs,
    created: videoStats.birthtimeMs,
    title: "",
    description: "",
    requireAuth: false,
    isFavorite: false,
    id
  };
  state.push(newClipState);
  await updateState(state);
  return newClipState;
};

// const readMetadataAsync = async (file: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     jsmediatags.read(file, {
//       onSuccess: resolve,
//       onError: reject
//     });
//   });
// };

export default listClips;
