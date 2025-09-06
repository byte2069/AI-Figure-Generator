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
      model: "google/nano-banana",
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

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response from Replicate:", text);
      res.status(resp.status).json({ error: "Replicate returned non-JSON", details: text });
      return;
    }

    if (!resp.ok) {
      res.status(resp.status).json({ error: data.error?.message || JSON.stringify(data) });
      return;
    }

    const out = data.output;
    const imageUrl = Array.isArray(out) ? out[0] : out;

    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
