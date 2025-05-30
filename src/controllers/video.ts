import { Request, Response } from "express";
import OpenAI from "openai";
import { createReadStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import ffmpeg from "fluent-ffmpeg";
import { execSync } from "child_process";
import { promisify } from "util";

try {
  const ffprobePath = execSync("which ffprobe").toString().trim();
  ffmpeg.setFfprobePath(ffprobePath);
} catch (err) {
  console.error("Could not find ffprobe:", err);
}

const ffprobe = promisify(ffmpeg.ffprobe);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DetectionResult {
  computers: number;
  servers: number;
}

/**
 * Get video duration in seconds
 * @param {string} videoPath
 * @returns {Promise<number>}
 */
async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const metadata = await ffprobe(videoPath);
    return (metadata as any).format.duration || 0;
  } catch (err) {
    console.error("Failed to get video duration:", err);
    return 0;
  }
}

/**
 * Extract a frame from video and convert to base64
 * @param {string} videoPath - Path to the video file
 * @returns {Promise<string>} Base64 encoded image
 */
async function extractFrame(videoPath: string): Promise<string> {
  const framePath = join(tmpdir(), `frame-${Date.now()}.jpg`);

  const metadata = await ffprobe(videoPath);
  const duration = (metadata as any).format.duration || 0;
  const hasVideoStream = (metadata as any).streams.some(
    (s: any) => s.codec_type === "video"
  );

  if (!hasVideoStream) {
    throw new Error("No video stream found in uploaded file.");
  }

  const timestamp = duration > 1 ? (duration / 2).toFixed(2) : "00:00:00.500";

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("start", (commandLine) => console.log("FFmpeg command:", commandLine))
      .on("error", reject)
      .on("end", async () => {
        try {
          const frameBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const stream = createReadStream(framePath);
            stream.on("data", (chunk: Buffer) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", reject);
          });

          await unlink(framePath);
          resolve(frameBuffer.toString("base64"));
        } catch (error) {
          reject(error);
        }
      })
      .screenshots({
        timestamps: [timestamp],
        filename: framePath.split("/").pop() || "frame.jpg",
        folder: tmpdir(),
        size: "1920x1080",
      });
  });
}

/**
 * Analyze video with GPT-4 Vision to detect computers and servers
 * @param {string} videoPath - Path to the temporary video file
 * @returns {Promise<DetectionResult>}
 */
async function analyzeWithGPT(videoPath: string): Promise<DetectionResult> {
  try {
    const frameBase64 = await extractFrame(videoPath);
    const dataUrl = `data:image/jpeg;base64,${frameBase64}`;

    const resp = await openai.chat.completions.create({
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

    const content = resp.choices[0].message?.content?.trim();
    console.log("GPT-4 Vision Response:", content);

    if (!content) throw new Error("No response from GPT-4 Vision");

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
      throw new Error(`Failed to parse GPT-4 Vision response: ${e.message}`);
    }
  } finally {
    try {
      await unlink(videoPath);
    } catch (error) {
      console.error("Error deleting temporary video file:", error);
    }
  }
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const analyzeVideo = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "No video uploaded" });
    return;
  }

  try {
    const tempPath = join(tmpdir(), `video-${Date.now()}.webm`);
    await writeFile(tempPath, file.buffer);

    const result = await analyzeWithGPT(tempPath);
    res.json({ success: true, result });
  } catch (e: any) {
    console.error("GPT Vision Error:", e);
    res.status(500).json({
      error: "GPT vision analysis failed",
      details: e?.response?.data || e?.message || "Unknown error",
    });
  }
};
