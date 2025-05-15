import express from "express";
import multer from "multer";
import { analyzeImages } from "../controllers/image";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/analyze",
  upload.array("images", 10),
  analyzeImages as express.RequestHandler
);

export default router;
