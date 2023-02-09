/*
 * API route for downloading clips by name
 */

import { Request, Response } from "express";

import { isTokenValid } from "../../utils/auth";
import { updateClip } from "../../utils/state";

const useAuth = (async (req: Request, res: Response): Promise<void> => {

  if (!(await isTokenValid(req))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method === "PUT") {
    const body = await updateClip(req.body);

    if (body) {
      res.statusCode = 200;
      res.end(JSON.stringify(body));
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify("Error updating video"));
    }
    return;
  }

  res.statusCode = 404;
  res.end();
});

export default useAuth;
