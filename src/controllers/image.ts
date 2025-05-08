import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Configure OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DetectionResult {
  computers: number;
  servers: number;
}

/**
 * Analyze image with GPT-4o to detect computers and servers
 * @param {string} filePath
 * @returns {Promise<DetectionResult>}
 */
async function analyzeWithGPT(filePath: string): Promise<DetectionResult> {
  // 1) Read file & convert to base64
  const b64 = fs.readFileSync(filePath, { encoding: "base64" });
  const ext = path.extname(filePath).slice(1);
  const dataUrl = `data:image/${ext};base64,${b64}`;

  // 2) Send to GPT-4o
  const resp = await openai.chat.completions.create({
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
  fs.unlink(filePath, () => {});

  // 4) Parse the response
  const content = resp.choices[0].message?.content?.trim();
  console.log("GPT-4o Response:", content);

  if (!content) {
    throw new Error("No response from GPT-4o");
  }

  try {
    const result = JSON.parse(content);

    if (
      typeof result.computers !== "number" ||
      typeof result.servers !== "number"
    ) {
      throw new Error("Invalid response structure");
    }

    return result as DetectionResult;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.error("Raw Response:", content);
    throw new Error(`Failed to parse GPT-4o response: ${e.message}`);
  }
}

// Define the extended Request type with file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Upload and analyze an image
 * @param {MulterRequest} req - Express request object with file
 * @param {Response} res - Express response object
 */
export const analyzeImage = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No image uploaded" });
    return;
  }

  try {
    const detectionResult = await analyzeWithGPT(req.file.path);
    res.json({ success: true, ...detectionResult });
  } catch (e: any) {
    console.error("GPT Vision Error:", e);
    res.status(500).json({
      error: "GPT vision analysis failed",
      details: e?.response?.data || e?.message || "Unknown error",
    });
  }
};
