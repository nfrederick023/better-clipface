/*
 * Function for checking login status
 */

import { AuthResponse } from "./shared/interfaces";

/**
 * Checks the login status with the API
 *
 * @async
 * @returns {Promise<object>}
 */
const checkLogin = async (): Promise<AuthResponse> => {
  const response = await fetch("/api/check-login");
  return await response.json();
}

export default checkLogin;