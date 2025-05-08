import express from "express";

import image from "./image";

const router = express.Router();

router.use("/image", image);

export default router;
