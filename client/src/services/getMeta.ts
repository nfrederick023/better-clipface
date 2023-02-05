import { Video } from "../constants/interfaces";
import { getState } from "./state";

/**
 * Returns metadata for a video
 *
 * @param {string} clipId The ID of the video 
 * @returns {Promise<Video | void>}
 */
const getMeta = async (clipId: string): Promise<Video | void> => {
  const state = await getState();
  return state.find((clip: Video) => { return clip.id === clipId; });
};

export default getMeta;
