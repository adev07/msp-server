import { Request, Response } from "express";
import OpenAI from "openai";

// Configure OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DetectionResult {
  computers: number;
  servers: number;
}

/**
 * Analyze image with GPT-4o to detect computers and servers
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} mimeType - The MIME type of the image
 * @returns {Promise<DetectionResult>}
 */
async function analyzeWithGPT(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DetectionResult> {
  const b64 = fileBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${b64}`;

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
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const content = resp.choices[0].message?.content?.trim();
  console.log("GPT-4o Response:", content);

  if (!content) throw new Error("No response from GPT-4o");

  try {
    const result = JSON.parse(content);

    if (
      typeof result.computers !== "number" ||
      typeof result.servers !== "number"
    ) {
      throw new Error("Invalid response structure");
    }

    return result as DetectionResult;
  } catch (e: any) {
    console.error("JSON Parse Error:", e);
    console.error("Raw Response:", content);
    throw new Error(`Failed to parse GPT-4o response: ${e.message}`);
  }
}

// Define extended Request type
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

/**
 * Upload and analyze multiple images
 * @param {MulterRequest} req - Express request object with files
 * @param {Response} res - Express response object
 */
export const analyzeImages = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  const files = req.files;

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No images uploaded" });
    return;
  }

  try {
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await analyzeWithGPT(file.buffer, file.mimetype);
          return { filename: file.originalname, ...result };
        } catch (err: any) {
          console.error(`Error analyzing ${file.originalname}:`, err.message);
          return {
            filename: file.originalname,
            error: "Failed to analyze image",
            details: err?.message || "Unknown error",
          };
        }
      })
    );

    res.json({ success: true, results });
  } catch (e: any) {
    console.error("GPT Vision Error:", e);
    res.status(500).json({
      error: "GPT vision analysis failed",
      details: e?.response?.data || e?.message || "Unknown error",
    });
  }
};
