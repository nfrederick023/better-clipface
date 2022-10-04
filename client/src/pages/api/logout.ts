/**
 * Logout handler
 *
 * All this does is remove the auth cookie.
 */

import { Request, Response } from "express";

import config from "config";
import cookie from "cookie";

const logout = (req: Request, res: Response): void => {
  // Only POST is allowed on this route
  if (req.method != "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("authToken", "", {
      expires: new Date("1900-01-01"),
      httpOnly: true,
      sameSite: "strict",
      secure: config.get("secure_cookies"),
      path: "/",
    })
  );
  res.end("OK\n");
}

export default logout;