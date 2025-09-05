// app/api/upload/route.ts
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, { access: "public" });
    return Response.json({ url: blob.url });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Upload failed" }), { status: 500 });
  }
}
