// api/upload.js
import { put } from "@vercel/blob";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: "Error parsing upload" });
      return;
    }

    const file = files.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const stream = fs.createReadStream(file.filepath);
    const blob = await put(`uploads/${file.originalFilename}`, stream, {
      access: "public",
    });

    res.status(200).json({ url: blob.url });
  });
}
