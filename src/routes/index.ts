import express from "express";

import image from "./image";
import video from "./video";

const router = express.Router();

router.use("/image", image);
router.use("/video", video);

export default router;
