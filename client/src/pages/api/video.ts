/*
 * API route for downloading clips by name
 */

import { Request, Response } from "express";

import updateVideo from "../../services/video";

const useAuth = (async (req: Request, res: Response): Promise<void> => {

  if (req.method === "PUT") {
    const body = await updateVideo(req.body);

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

export default useAuth
