/*
 * Function for video API
 */

import { Clip } from "./shared/interfaces";

/**
 * Updates a clip
 *
 * @async
 * @param {Clip} newClip The clip that will be updated
 * @returns {Promise<object>}
 */
const updateClip = async (clip: Clip): Promise<Response> => {
    const response = await fetch("/api/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clip),
    });
    return response;
}

export default updateClip;
