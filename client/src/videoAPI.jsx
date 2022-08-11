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
export default async function updateClip(newClip) {
    const response = await fetch("/api/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClip),
    });
    const data = await response.json();
    return await data || {};
}
