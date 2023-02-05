import { getState, updateState } from "./state";

import { Video } from "../constants/interfaces";

const updateVideo = async (newVideo: Video): Promise<Video | null | undefined> => {
  const state = await getState();
  // remove the old video object and add in the new one
  const newState = state.filter(function (clip: Video) { return clip.id !== newVideo.id; });
  newState.push(newVideo);
  await updateState(newState);
  return newVideo;
};

export default updateVideo;

