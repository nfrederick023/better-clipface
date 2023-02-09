/*
 * API route for downloading clips by name
 */

import { Request, Response } from "express";

import { Clip } from "../../../utils/types";
import { getClipList } from "../../../utils/storage";
import { isTokenValid } from "../../../utils/auth";
import config from "config";
import fs from "fs";

const useAuth = (async (req: Request, res: Response): Promise<void> => {

  const clipId = req.query.id;

  const state = await getClipList();
  const video: Clip | undefined = state.find((clip: Clip) => { return clip.id === clipId; });

  if (video && req.method === "GET") {
    if (video.requireAuth && !(await isTokenValid(req))) {
      res.statusCode = 401;
      res.end(JSON.stringify("Unauthorized"));
      return;
    }

    const CLIPS_PATH: string | undefined = config.get("clips_path");
    res.writeHead(200, { "Content-Type": "image/jpeg", "Content-disposition": `attachment; filename=${video.id}.jpeg` });
    fs.createReadStream(`${CLIPS_PATH}/assets/thumbnails/${clipId}.jpg`).pipe(res);
    return;
  }

  res.statusCode = 404;
  res.end();
});

export default useAuth;
