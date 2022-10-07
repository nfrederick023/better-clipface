/*
 * API route for downloading clips by name
 */

import * as mime from "mime-types";

import config from "config";
import fs from "fs";
import fse from 'fs-extra';
import path from "path";
import { useAuth } from "../../../backend/auth";

const CLIPS_PATH = config.get("clips_path");

export default useAuth(async (req, res) => {
  const clipId = req.query.id;
  const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));
  const clip = state.find((clip) => { return clip.id == clipId });
  const clipPath = path.join(CLIPS_PATH, clip.clipName);

  if (!fs.existsSync(clipPath)) {
    res.statusCode = 404;
    res.end();
    return;
  }

  serveVideo(req, res, clipPath);
});

/*
 * Serves a video using chunks
 *
 * Source: https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
 */
function serveVideo(req, res, videoPath) {
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": mime.lookup(videoPath),
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": mime.lookup(videoPath),
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}
