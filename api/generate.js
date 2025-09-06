// api/generate.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { prompt, output_format, images } = req.body;

    if (!process.env.REPLICATE_API_TOKEN) {
      res.status(500).json({ error: "Missing REPLICATE_API_TOKEN" });
      return;
    }

    if (!prompt && (!images || images.length === 0)) {
      res.status(400).json({ error: "Yêu cầu nhập prompt hoặc ít nhất 1 ảnh." });
      return;
    }

    const payload = {
      version: process.env.MODEL_VERSION || 
        "f0a9d34b12ad1c1cd76269a844b218ff4e64e128ddaba93e15891f47368958a0",
      input: {
        prompt: prompt || "",
        output_format: output_format || "jpg",
        ...(images && images.length > 0 ? { image_input: images } : {})
      }
    };

    const resp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      res.status(resp.status).json({ error: data.error?.message || "API call failed" });
      return;
    }

    const out = data.output;
    const imageUrl = Array.isArray(out) ? out[0] : out;

    res.status(200).json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
