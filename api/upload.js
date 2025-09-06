// api/upload.js
export const config = {
  api: { bodyParser: false },
};

import fs from "fs";
import formidable from "formidable";
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Upload parse error:", err);
        return res.status(500).json({ error: "Upload failed" });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const blob = await put(file.originalFilename, fs.createReadStream(file.filepath), {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      res.status(200).json({ url: blob.url });
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
}
