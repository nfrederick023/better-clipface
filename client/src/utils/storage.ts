import { Clip } from "./types";
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

const listClips = async (): Promise<Clip[]> => {
  let clips = glob.sync(`${getVideosPath()}/*.@(mkv|mp4|webm|mov|mpeg|avi|wmv|json)`);

  // Remove metadata files from the video list
  clips = clips.filter((clipPath) => !clipPath.endsWith(".json"));
  await cleanState();

  const clipDetails: Clip[] = [];
  for (const filePath of clips) {
    const clipState = await getVideoState(filePath);
    if (clipState) {
      clipDetails.push(
        clipState
      );
    }
  }

  createThumbnails(clipDetails);
  return clipDetails;
};

export const createThumbnails = async (clips: Clip[]): Promise<void> => {
  const thumbnails = fse.readdirSync(getThumbnailsPath());
  let oldThumbnails = thumbnails;

  clips.forEach(clip => {
    const thumbnailName = clip.id + ".jpg";
    oldThumbnails = oldThumbnails.filter(thumbnail => thumbnail === thumbnailName);
    console.log(oldThumbnails);
    if (!thumbnails.includes(thumbnailName)) {
      ffmpeg(clip.filePath)
        .screenshots({
          filename: clip.id + ".jpg",
          count: 1,
          folder: getThumbnailsPath(),
          size: "1920x1080"
        });
    }
  });
};

// removes any videos not found in state
export const cleanState = async (): Promise<void> => {
  const clipList = await getClipList();
  const files = fse.readdirSync(getVideosPath());
  await updateClipList(clipList.filter(clip => files.includes(clip.name)));
};

export const getVideoState = async (filePath: string): Promise<Clip | null> => {
  const videoName = path.basename(filePath);
  const videoStats = fse.statSync(filePath);
  const clipList = await getClipList();

  // check if the video already is persisted within the state
  const clipState = clipList.find((video) => { return video.name === videoName; });

  if (clipState) {
    return clipState;
  }

  // if not, create the state video and add persist it
  const id = parseInt((seedrandom(videoName + config.get("user_password"))() * 9e7 + 1e7).toString()).toString();
  const newClipState: Clip = {
    name: videoName,
    size: videoStats.size,
    saved: videoStats.mtimeMs,
    created: videoStats.birthtimeMs,
    filePath: filePath,
    title: "",
    description: "",
    requireAuth: false,
    isFavorite: false,
    id
  };
  clipList.push(newClipState);
  await updateClipList(clipList);
  return newClipState;
};

export const getClipListPath = (): string => {
  return getAssetsPath() + "clip_list.json";
};

export const getAssetsPath = (): string => {
  return CLIPS_PATH + "/assets/";
};

export const getThumbnailsPath = (): string => {
  return CLIPS_PATH + "/thumbnails/";
};

export const getVideosPath = (): string => {
  return CLIPS_PATH + "/videos/";
};

export const getClipList = async (): Promise<Clip[]> => {
  try {
    return await fse.readJSON(getClipListPath()) as Clip[];
  } catch (e) {
    return []; //if the state is not found return nothing
  }
};

export const updateClipList = async (newState: Clip[]): Promise<void> => {
  try {
    await fse.mkdir(getAssetsPath());
    await fse.writeJSON(getClipListPath(), newState);
  } catch (e) {
    return;
  }
};

export const updateClip = async (newClip: Clip): Promise<Clip | null | undefined> => {
  const clipList = await getClipList();
  // remove the old video object and add in the new one
  const newState = clipList.filter(function (clip: Clip) { return clip.id !== newClip.id; });
  newState.push(newClip);
  await updateClipList(newState);
  return newClip;
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
