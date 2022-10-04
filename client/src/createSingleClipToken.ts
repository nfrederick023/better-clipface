/*
 * Function for creating a single page token
 */


/**
 * Creates a single page token using the API
 *
 * @async
 * @param {string} clipName The clip name that the new token will be valid for
 * @returns {Promise<object>}
 */
const createSinglePageToken = async (clipName: string): Promise<Response> => {

  const response = await fetch("/api/create-single-clip-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clipName: clipName }),
  });

  const data = await response.json();

  return data["token"];
}

export default createSinglePageToken;