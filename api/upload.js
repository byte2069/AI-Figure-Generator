// api/upload.js
import { createUploadUrl } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { url } = await createUploadUrl({
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json({ url });
  } catch (err) {
    console.error("Upload URL error:", err);
    res.status(500).json({ error: err.message });
  }
}
