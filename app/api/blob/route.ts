// app/api/blob/route.ts
import { generateClientToken } from "@vercel/blob";

export const runtime = "edge";

export async function GET() {
  const token = await generateClientToken({
    allowedContentTypes: ["image/*"],
    maximumSizeInBytes: 15 * 1024 * 1024,
    access: "public",
  });
  return Response.json(token);
}
