"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const image_1 = require("../controllers/image");
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({ dest: "uploads/" });
// Route for image analysis - public endpoint
router.post("/analyze", upload.single("image"), image_1.analyzeImage);
exports.default = router;
//# sourceMappingURL=image.js.map