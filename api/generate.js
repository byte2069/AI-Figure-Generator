// api/generate.js
import fetch from "node-fetch";

function extractStrings(obj) {
  let urls = [];
  if (typeof obj === "string") {
    urls.push(obj);
  } else if (Array.isArray(obj)) {
    for (const v of obj) {
      urls.push(...extractStrings(v));
    }
  } else if (obj && typeof obj === "object") {
    for (const v of Object.values(obj)) {
      urls.push(...extractStrings(v));
    }
  }
  return urls;
}

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

    const payload = {
      version: process.env.MODEL_VERSION || "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
      input: {
        text: prompt || "",   // FIX: use text instead of prompt
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

    console.log("Replicate raw output:", data.output);
    const imageUrls = extractStrings(data.output);
    console.log("Normalized imageUrls:", imageUrls);

    res.status(200).json({ imageUrls });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
