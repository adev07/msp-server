"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const image_1 = __importDefault(require("./image"));
const video_1 = __importDefault(require("./video"));
const router = express_1.default.Router();
router.use("/image", image_1.default);
router.use("/video", video_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map