/**
 * Handles authentication
 *
 * This module should only be imported from server code.
 */

import bcrypt from "bcrypt";
import config from "config";
import cookie from "cookie";
import fse from 'fs-extra';
import path from "path";

const CLIPS_PATH = config.get("clips_path");
/**
 * Middleware for handling authentication
 *
 * If no authentication is configured, this wrapper does nothing.
 *
 * @param {function} handler
 * @returns {function}
 */
export function useAuth(handler) {
  const wrapper = async (req, res) => {
    try {
      if (await checkAuth(req)) {
        return handler(req, res);
      } else {
        res.statusCode = 401;
        res.end();
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  return wrapper;
}

/**
 * Checks authentication given a http.IncomingMessage object
 *
 * @async
 * @param {IncomingMessage} req See https://nodejs.org/api/http.html
 * @returns {Promise<boolean>} Whether or not the user is authenticated
 */
export async function checkAuth(req) {
  // Fetches the auth token (the hashed user password) from the cookie, or
  // null if none is found
  const getAuthToken = () => {
    const rawCookie = req.cookies.authToken;
    return rawCookie || null;
  };

  // Always succeed auth check when no user authentication has been configured
  if (!config.has("user_password")) {
    return true;
  }

  const authToken = getAuthToken();

  return authToken && (await checkHashedPassword("default", authToken));
}

/**
 * Checks if a hashed password is valid
 *
 * @async
 * @param {string} user
 * @param {string} password
 * @returns {Promise<(object|null)>} Resulting hash, or null if login failed
 */
export async function checkHashedPassword(user, hashedPassword) {
  if (user != "default") {
    //throw "Logging in as non-default user is not yet supported";
  }

  const userPassword = config.get("user_password");

  return await bcrypt.compare(userPassword, hashedPassword);
}

/**
 * Hashes a password using bcrypt
 *
 * @async
 * @param {string} password
 * @return {Promise<string>} The hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt();

  return await bcrypt.hash(password, salt);
}

/**
 * Helper for fetching the token from a http.IncomingMessage object
 *
 * @param {http.IncomingMessage} req
 * @returns {string|null}
 */
export function getToken(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.searchParams.has("token")) {
    // Token is Base64 encoded
    try {
      return Buffer.from(url.searchParams.get("token"), "base64").toString();
    } catch (e) {
      //console.error("Failed to get token from query params:", e);
      return null;
    }
  }

  return null;
}
