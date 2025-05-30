"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeVideo = void 0;
const openai_1 = __importDefault(require("openai"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const os_1 = require("os");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const child_process_1 = require("child_process");
const util_1 = require("util");
// Set ffprobe path dynamically
try {
    const ffprobePath = (0, child_process_1.execSync)("which ffprobe").toString().trim();
    fluent_ffmpeg_1.default.setFfprobePath(ffprobePath);
}
catch (err) {
    console.error("Could not find ffprobe:", err);
}
// Promisify ffprobe
const ffprobe = (0, util_1.promisify)(fluent_ffmpeg_1.default.ffprobe);
// Configure OpenAI
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
/**
 * Get video duration in seconds
 * @param {string} videoPath
 * @returns {Promise<number>}
 */
function getVideoDuration(videoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const metadata = yield ffprobe(videoPath);
            return metadata.format.duration || 0;
        }
        catch (err) {
            console.error("Failed to get video duration:", err);
            return 0;
        }
    });
}
/**
 * Extract a frame from video and convert to base64
 * @param {string} videoPath - Path to the video file
 * @returns {Promise<string>} Base64 encoded image
 */
function extractFrame(videoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const framePath = (0, path_1.join)((0, os_1.tmpdir)(), `frame-${Date.now()}.jpg`);
        // Check video metadata
        const metadata = yield ffprobe(videoPath);
        const duration = metadata.format.duration || 0;
        const hasVideoStream = metadata.streams.some((s) => s.codec_type === "video");
        if (!hasVideoStream) {
            throw new Error("No video stream found in uploaded file.");
        }
        // Use a safe default timestamp
        const timestamp = duration > 1 ? (duration / 2).toFixed(2) : "00:00:00.500";
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(videoPath)
                .on("start", (commandLine) => console.log("FFmpeg command:", commandLine))
                .on("error", reject)
                .on("end", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const frameBuffer = yield new Promise((resolve, reject) => {
                        const chunks = [];
                        const stream = (0, fs_1.createReadStream)(framePath);
                        stream.on("data", (chunk) => chunks.push(chunk));
                        stream.on("end", () => resolve(Buffer.concat(chunks)));
                        stream.on("error", reject);
                    });
                    yield (0, promises_1.unlink)(framePath);
                    resolve(frameBuffer.toString("base64"));
                }
                catch (error) {
                    reject(error);
                }
            }))
                .screenshots({
                timestamps: [timestamp],
                filename: framePath.split("/").pop() || "frame.jpg",
                folder: (0, os_1.tmpdir)(),
                size: "1920x1080", // use max resolution from your source
            });
        });
    });
}
/**
 * Analyze video with GPT-4 Vision to detect computers and servers
 * @param {string} videoPath - Path to the temporary video file
 * @returns {Promise<DetectionResult>}
 */
function analyzeWithGPT(videoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const frameBase64 = yield extractFrame(videoPath);
            const dataUrl = `data:image/jpeg;base64,${frameBase64}`;
            const resp = yield openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `
              You are an expert in visual recognition of IT infrastructure from camera images.
              
              Analyze this image and count:
              1. Computers – include desktops, laptops, monitors with towers, or all-in-one PCs.
              2. Servers – include rack-mounted servers (in server racks), or standalone tower servers.
              
              Only return a JSON object with this exact structure:
              {
                "computers": number,
                "servers": number
              }
              
              DO NOT explain or include any other text.
              If unsure, return 0 for both.
              `,
                            },
                            {
                                type: "image_url",
                                image_url: { url: dataUrl },
                            },
                        ],
                    },
                ],
                max_tokens: 300,
                response_format: { type: "json_object" },
            });
            const content = (_b = (_a = resp.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim();
            console.log("GPT-4 Vision Response:", content);
            if (!content)
                throw new Error("No response from GPT-4 Vision");
            try {
                const result = JSON.parse(content);
                if (typeof result.computers !== "number" ||
                    typeof result.servers !== "number") {
                    throw new Error("Invalid response structure");
                }
                return result;
            }
            catch (e) {
                console.error("JSON Parse Error:", e);
                console.error("Raw Response:", content);
                throw new Error(`Failed to parse GPT-4 Vision response: ${e.message}`);
            }
        }
        finally {
            try {
                yield (0, promises_1.unlink)(videoPath);
            }
            catch (error) {
                console.error("Error deleting temporary video file:", error);
            }
        }
    });
}
/**
 * Express route handler to upload and analyze a video
 */
const analyzeVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = req.file;
    if (!file) {
        res.status(400).json({ error: "No video uploaded" });
        return;
    }
    try {
        const tempPath = (0, path_1.join)((0, os_1.tmpdir)(), `video-${Date.now()}.webm`);
        yield (0, promises_1.writeFile)(tempPath, file.buffer);
        const result = yield analyzeWithGPT(tempPath);
        res.json({ success: true, result });
    }
    catch (e) {
        console.error("GPT Vision Error:", e);
        res.status(500).json({
            error: "GPT vision analysis failed",
            details: ((_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) || (e === null || e === void 0 ? void 0 : e.message) || "Unknown error",
        });
    }
});
exports.analyzeVideo = analyzeVideo;
//# sourceMappingURL=video.js.map