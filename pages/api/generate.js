import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const { prompt, image } = req.body;

    const output = await replicate.run("google/nano-banana", {
      input: {
        prompt,
        image_input: image ? [image] : [],
        output_format: "jpg"
      }
    });

    res.status(200).json({ url: Array.isArray(output) ? output[0] : output });
  } catch (err) {
    console.error("❌ Replicate error:", err);
    res.status(500).json({ error: err.message });
  }
}