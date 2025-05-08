import express from "express";
import multer from "multer";
import { analyzeImage } from "../controllers/image";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Route for image analysis - public endpoint
router.post(
  "/analyze",
  upload.single("image"),
  analyzeImage as express.RequestHandler
);

export default router;
