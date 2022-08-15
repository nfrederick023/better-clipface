/*
 * Function for video API
 */

/**
 * Updates a clip
 *
 * @async
 * @param {string} newClip The clip that will be updated
 * @returns {Promise<object>}
 */
export default async function updateClip(clipName: string) {
    const response = await fetch("/api/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clipName),
    });
    const data = await response.json();
    return await data || {};
}
