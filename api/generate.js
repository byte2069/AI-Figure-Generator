// api/generate.js
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt, images } = req.body;

    const output = await replicate.run("google/nano-banana", {
      input: {
        text: prompt || "",
        image_input: images || [],
        output_format: "jpg",
      },
    });

    console.log("Replicate output:", output);

    let urls = [];
    if (Array.isArray(output)) {
      urls = output.filter(u => typeof u === "string" && u.startsWith("http"));
    } else if (typeof output === "string") {
      urls = [output];
    } else if (output && typeof output === "object") {
      urls = Object.values(output).filter(
        v => typeof v === "string" && v.startsWith("http")
      );
    }

    res.status(200).json({ urls });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
