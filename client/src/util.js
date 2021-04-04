/**
 * Returns the full URL of the named clip
 *
 * This function can only be run in the browser, as it formats the URL using
 * the current location.
 *
 * @param {string} clipName
 * @returns {URL}
 */
export function formatClipURL(clipName) {
  return new URL(
    `/watch/${encodeURIComponent(clipName)}`,
    `${location.protocol}//${location.host}`
  );
}

/**
 * Resolves the public URL for the current page
 *
 * This is needed to resolve public URLs for server side rendering, since we
 * don't have access to the value of the browser address bar.
 *
 * By default this function uses the path and "Host" header from the incoming
 * request to determine the current URL, and HTTP is assumed. However, the
 * host and protocol can be overridden with the X-Forwarded-Host and
 * X-Forwarded-Proto headers.
 *
 * In the future this function will also apply any "Public URL" override
 * configured in the config file.
 *
 * @param {http.IncomingRequest} req
 * @returns {URL}
 */
export function getPublicURL(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const hostname = req.headers["x-forwarded-host"] || req.headers["host"];

  // TODO: Allow config override

  return new URL(req.url, `${protocol}://${hostname}`);
}
