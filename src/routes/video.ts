import express from "express";
import multer from "multer";
import { analyzeVideo } from "../controllers/video";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

router.post(
  "/analyze",
  upload.single("video"),
  analyzeVideo as express.RequestHandler
);

export default router;
