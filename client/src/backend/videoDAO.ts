/*
 * Lists all clips
 *
 * This module should only be imported from server side code.
 */

import { Clip } from "../shared/interfaces";
import config from "config";
import fse from "fs-extra";
import path from "path";

const CLIPS_PATH: string = config.get("clips_path");

const updateVideo = async (newClip: Clip): Promise<Clip | null | undefined> => {

    try {
        const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));

        if (state.length) {
            const newState = state.filter(function (clip: Clip) { return clip.id != newClip.id });

            if (newState.length < state.length) {
                newState.push(newClip);
                await fse.writeJSON(path.join(CLIPS_PATH, "/assets/state.json"), newState);
                return newClip;
            }
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

export default updateVideo;

