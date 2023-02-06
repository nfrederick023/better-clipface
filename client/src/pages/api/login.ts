/**
 * Login handler
 */

import { Request, Response } from "express";

import { hashPassword } from "../../utils/auth";
import config from "config";

const login = async (req: Request, res: Response): Promise<undefined> => {
  // Only POST is allowed on this route
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }
  if (!config.get("user_password")) {
    res.statusCode = 400;
    res.end("User authentication not configured\n");
    return;
  }

  const userPassword: string = config.get("user_password");

  if (req.body && "password" in req.body) {
    if (userPassword === req.body["password"]) {

      const hashedPassword = await hashPassword(userPassword);
      res.statusCode = 200;
      res.end(JSON.stringify({ authToken: hashedPassword }));
      return;

    }
  }

  res.statusCode = 400;
  res.end("Invalid password\n");
  return;
};

export default login;