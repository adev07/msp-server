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
exports.analyzeImage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const openai_1 = __importDefault(require("openai"));
// Configure OpenAI
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
/**
 * Analyze image with GPT-4o to detect computers and servers
 * @param {string} filePath
 * @returns {Promise<DetectionResult>}
 */
function analyzeWithGPT(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // 1) Read file & convert to base64
        const b64 = fs_1.default.readFileSync(filePath, { encoding: "base64" });
        const ext = path_1.default.extname(filePath).slice(1);
        const dataUrl = `data:image/${ext};base64,${b64}`;
        // 2) Send to GPT-4o
        const resp = yield openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are a computer and server detection assistant. Please analyze the image and count:
1. The number of computers (desktops, laptops, workstations)
2. The number of servers (rack-mounted servers, server towers)

Return ONLY a JSON object in this exact format:
{
  "computers": number,
  "servers": number
}

Do not include any other text or explanation. If you cannot detect any computers or servers, return:
{
  "computers": 0,
  "servers": 0
}`,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
            response_format: { type: "json_object" },
        });
        // 3) Clean up temp file
        fs_1.default.unlink(filePath, () => { });
        // 4) Parse the response
        const content = (_b = (_a = resp.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim();
        console.log("GPT-4o Response:", content);
        if (!content) {
            throw new Error("No response from GPT-4o");
        }
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
            throw new Error(`Failed to parse GPT-4o response: ${e.message}`);
        }
    });
}
/**
 * Upload and analyze an image
 * @param {MulterRequest} req - Express request object with file
 * @param {Response} res - Express response object
 */
const analyzeImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.file) {
        res.status(400).json({ error: "No image uploaded" });
        return;
    }
    try {
        const detectionResult = yield analyzeWithGPT(req.file.path);
        res.json(Object.assign({ success: true }, detectionResult));
    }
    catch (e) {
        console.error("GPT Vision Error:", e);
        res.status(500).json({
            error: "GPT vision analysis failed",
            details: ((_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) || (e === null || e === void 0 ? void 0 : e.message) || "Unknown error",
        });
    }
});
exports.analyzeImage = analyzeImage;
//# sourceMappingURL=image.js.map