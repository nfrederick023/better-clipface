/*
 * Function for video API
 */

import { Video } from "../interfaces";

/**
 * Updates a clip
 *
 * @async
 * @param {Video} newClip The clip that will be updated
 * @returns {Promise<object>}
 */
const updateClip = async (clip: Video): Promise<Response> => {
    const response = await fetch("/api/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clip),
    });
    return response;
};

export default updateClip;
