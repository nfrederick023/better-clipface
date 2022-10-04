/*
 * API route for downloading clips by name
 */

import * as mime from "mime-types";

import { Request, Response } from "express";

import { Clip } from "../../../shared/interfaces";
import { NodeHeaders } from "next/dist/server/web/types";
import config from "config";
import fs from "fs";
import fse from "fs-extra";
import isAuthorized from "../../../backend/auth";
import path from "path";

const CLIPS_PATH: string = config.get("clips_path");

const getVideoByID = async (req: Request, res: Response): Promise<void> => {

  const clipId = req.query.id;
  const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));
  const clip: Clip = state.find((clip: Clip) => { return clip.id == clipId });
  const clipPath = path.join(CLIPS_PATH, clip.clipName);

  if (!fs.existsSync(clipPath)) {
    res.statusCode = 404;
    res.end();
    return;
  }

  if (clip.requireAuth && !isAuthorized(req)) {
    res.statusCode = 401;
    res.end();
    return;
  }

  serveVideo(req, res, clipPath);
};

/*
 * Serves a video using chunks
 *
 * Source: https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
 */
const serveVideo = (req: Request, res: Response, videoPath: string): void => {
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head: NodeHeaders = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize.toString(),
      "Content-Type": mime.lookup(videoPath) ? mime.lookup(videoPath).toString() : undefined,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head: NodeHeaders = {
      "Content-Length": fileSize.toString(),
      "Content-Type": mime.lookup(videoPath) ? mime.lookup(videoPath).toString() : undefined,
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}

export default getVideoByID;