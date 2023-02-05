/**
 * Handles authentication
 *
 * This module should only be imported from server code.
 */

import { Request } from "express";
import bcrypt from "bcrypt";
import config from "config";

/**
 * Checks authentication given a http.IncomingMessage object
 *
 * @async
 * @param {Request} req See https://nodejs.org/api/http.html
 * @returns {Promise<boolean>} Whether or not the user is authenticated
 */
const isAuthorized = async (req: Request): Promise<boolean> => {

  // Always succeed auth check when no user authentication has been configured
  if (!config.has("user_password")) {
    return true;
  }

  return !!(req.cookies?.authToken && (await checkHashedPassword("default", req.cookies?.authToken)));
};

/**
 * Checks if a hashed password is valid
 *
 * @async
 * @param {string} user
 * @param {string} password
 * @returns {Promise<(object|null)>} Resulting hash, or null if login failed
 */
export const checkHashedPassword = async (user: string, hashedPassword: string): Promise<boolean> => {
  if (user !== "default") {
    //throw "Logging in as non-default user is not yet supported";
  }

  const userPassword: string = config.get("user_password");

  return !!(await bcrypt.compare(userPassword, hashedPassword));
};

/**
 * Hashes a password using bcrypt
 *
 * @async
 * @param {string} password
 * @return {Promise<string>} The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();

  return await bcrypt.hash(password, salt);
};

export default isAuthorized;