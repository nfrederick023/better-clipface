/**
 * Login handler
 */

import config from "config";

import { hashPassword } from "../../backend/auth";

export default async function login(req, res) {
  // Only POST is allowed on this route
  if (req.method != "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  if (!config.has("user_password")) {
    res.statusCode = 400;
    res.end("User authentication not configured\n");
    return;
  }

  const userPassword = config.get("user_password");

  if (req.body && "password" in req.body) {
    if (userPassword == req.body["password"]) {

      const hashedPassword = await hashPassword(userPassword);
      res.statusCode = 200;
      res.end(JSON.stringify({ authToken: hashedPassword }));
      return;

    }
  }

  res.statusCode = 400;
  res.end("Invalid password\n");
  return;
}
