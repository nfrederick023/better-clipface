/*
 * API route for downloading clips by name
 */

import { useAuth } from "../../backend/auth";
import { updateVideo } from "../../backend/videoDAO";

export default useAuth(async (req, res) => {

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
