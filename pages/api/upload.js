import { IncomingForm } from "formidable";
import fs from "fs";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Parse error:", err);
      return res.status(500).json({ error: "Upload parse error" });
    }

    try {
      let file = files.file;
      if (Array.isArray(file)) file = file[0];

      if (!file || !file.filepath) {
        console.error("❌ File not found:", file);
        return res.status(400).json({ error: "No file uploaded" });
      }

      const data = await fs.promises.readFile(file.filepath);
      const filename = `uploads/${Date.now()}-${file.originalFilename}`;

      const { url } = await put(filename, data, {
        access: "public",
        contentType: file.mimetype || "image/jpeg",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({ url });
    } catch (e) {
      console.error("❌ Upload error:", e);
      return res.status(500).json({ error: e.message });
    }
  });
}