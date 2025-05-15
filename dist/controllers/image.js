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
exports.analyzeImages = void 0;
const openai_1 = __importDefault(require("openai"));
// Configure OpenAI
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
/**
 * Analyze image with GPT-4o to detect computers and servers
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} mimeType - The MIME type of the image
 * @returns {Promise<DetectionResult>}
 */
function analyzeWithGPT(fileBuffer, mimeType) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const b64 = fileBuffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${b64}`;
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
                            image_url: { url: dataUrl },
                        },
                    ],
                },
            ],
            max_tokens: 300,
            response_format: { type: "json_object" },
        });
        const content = (_b = (_a = resp.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim();
        console.log("GPT-4o Response:", content);
        if (!content)
            throw new Error("No response from GPT-4o");
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
 * Upload and analyze multiple images
 * @param {MulterRequest} req - Express request object with files
 * @param {Response} res - Express response object
 */
const analyzeImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const files = req.files;
    if (!files || files.length === 0) {
        res.status(400).json({ error: "No images uploaded" });
        return;
    }
    try {
        const results = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield analyzeWithGPT(file.buffer, file.mimetype);
                return Object.assign({ filename: file.originalname }, result);
            }
            catch (err) {
                console.error(`Error analyzing ${file.originalname}:`, err.message);
                return {
                    filename: file.originalname,
                    error: "Failed to analyze image",
                    details: (err === null || err === void 0 ? void 0 : err.message) || "Unknown error",
                };
            }
        })));
        res.json({ success: true, results });
    }
    catch (e) {
        console.error("GPT Vision Error:", e);
        res.status(500).json({
            error: "GPT vision analysis failed",
            details: ((_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) || (e === null || e === void 0 ? void 0 : e.message) || "Unknown error",
        });
    }
});
exports.analyzeImages = analyzeImages;
//# sourceMappingURL=image.js.map