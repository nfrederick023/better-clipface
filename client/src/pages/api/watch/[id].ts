/*
 * API route for downloading clips by name
 */

import * as mime from "mime-types";

import { Request, Response } from "express";

import { Clip } from "../../../utils/types";
import { NodeHeaders } from "next/dist/server/web/types";
import { getClipList } from "../../../utils/storage";
import { isTokenValid } from "../../../utils/auth";
import config from "config";
import fs from "fs";
import path from "path";

const CLIPS_PATH: string = config.get("clips_path");

const getVideoByID = async (req: Request, res: Response): Promise<void> => {

  const getID = req.query.id as string;
  const clipId: string = getID.split(".")[0];
  const state = await getClipList();
  const video: Clip | undefined = state.find((clip: Clip) => { return clip.id === clipId; });

  if (video) {
    const clipPath = path.join(CLIPS_PATH, video.name);

    if (video.requireAuth && !(await isTokenValid(req))) {
      res.statusCode = 401;
      res.end(JSON.stringify("Unauthorized"));
      return;
    }

    if (!fs.existsSync(clipPath)) {
      res.statusCode = 404;
      res.end(JSON.stringify("Video not found in file path!"));
      return;
    }

    res.writeHead(200, { "Content-Type": "video/mp4", "Content-disposition": `attachment; filename=${video.name}` });
    fs.createReadStream(`${CLIPS_PATH}/${video.name}`).pipe(res);
    return;
    //serveVideo(req, res, clipPath);
  }

  res.statusCode = 404;
  res.end(JSON.stringify("Could not locate video!"));
  return;
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
};

export default getVideoByID;