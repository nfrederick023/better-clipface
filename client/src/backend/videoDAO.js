/*
 * Lists all clips
 *
 * This module should only be imported from server side code.
 */
import path from "path";
import config from "config";
const fse = require('fs-extra');

const CLIPS_PATH = config.get("clips_path");

export async function updateVideo(newClip) {

    try {
        const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));

        if (state.length) {
            const newState = state.filter(function (clip) { return clip.id != newClip.id });

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
    };
}

