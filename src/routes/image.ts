import express from "express";
import multer from "multer";

import { analyzeImage } from "../controllers/image";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route for image analysis - public endpoint
router.post(
  "/analyze",
  upload.single("image"),
  analyzeImage as express.RequestHandler
);

export default router;
