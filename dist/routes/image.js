"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const image_1 = require("../controllers/image"); // ✅ Imports the image analysis controller
const router = express_1.default.Router();
// ✅ Use in-memory storage for uploaded images (no disk writes)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// ✅ POST route at /analyze, expects an array of images (max 10)
// ✅ `upload.array("images", 10)` handles `multipart/form-data` for up to 10 files with key `images`
router.post("/analyze", upload.array("images", 10), image_1.analyzeImages // ✅ Safe cast to match Express handler signature
);
exports.default = router;
//# sourceMappingURL=image.js.map