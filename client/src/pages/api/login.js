/**
 * Login handler
 */

import cookie from "cookie";
import config from "config";

import { hashPassword } from "../../backend/auth";
import { booleanify } from "../../util";

export default function login(req, res) {
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
  const useSecureCookies = booleanify(config.get("secure_cookies"));

  if (req.body && "password" in req.body) {
    if (userPassword == req.body["password"]) {

      hashPassword(userPassword).then((hashedPassword) => {
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("auth", hashedPassword, {
            httpOnly: true,
            sameSite: "Strict",
            secure: useSecureCookies,
            path: "/",
            maxAge: 31536000, // One year
          })
        );
        res.end("OK\n");
      });

      return;
    }
  }

  res.statusCode = 400;
  res.end("Invalid password\n");
}
