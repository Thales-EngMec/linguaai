const Groq = require("groq-sdk");
const { Readable } = require("stream");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Parse multipart manually (no extra deps)
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers["content-type"] || "";
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) return reject(new Error("No boundary"));
      const boundary = "--" + boundaryMatch[1];
      const parts = [];
      const bodyStr = body.toString("binary");
      const boundaryParts = bodyStr.split(boundary);
      for (const part of boundaryParts) {
        if (!part || part === "--\r\n" || part === "--") continue;
        const [headerSection, ...bodyParts] = part.split("\r\n\r\n");
        if (!headerSection || bodyParts.length === 0) continue;
        const bodyContent = bodyParts.join("\r\n\r\n").replace(/\r\n$/, "");
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);
        const contentTypeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/i);
        if (nameMatch) {
          parts.push({
            name: nameMatch[1],
            filename: filenameMatch ? filenameMatch[1] : null,
            contentType: contentTypeMatch ? contentTypeMatch[1].trim() : null,
            data: Buffer.from(bodyContent, "binary"),
          });
        }
      }
      resolve(parts);
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const parts = await parseMultipart(req);
    const audioPart = parts.find((p) => p.name === "audio");
    if (!audioPart) return res.status(400).json({ error: "No audio field" });

    // Groq Whisper expects a File-like object
    const audioBuffer = audioPart.data;
    const filename = audioPart.filename || "audio.webm";

    // Create a File-compatible object for Groq SDK
    const file = new File([audioBuffer], filename, {
      type: audioPart.contentType || "audio/webm",
    });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "json",
    });

    return res.status(200).json({ text: transcription.text || "" });
  } catch (err) {
    console.error("Transcribe error:", err);
    return res.status(500).json({ error: err.message || "Transcription failed" });
  }
};
