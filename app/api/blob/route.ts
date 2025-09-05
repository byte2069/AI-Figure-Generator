// app/api/blob/route.ts
import { handleUpload } from "@vercel/blob/client";

export const runtime = "edge";

export async function POST(request: Request) {
  // Let Vercel sign the upload and store it directly from the browser → Blob storage
  return handleUpload({
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["image/*"],
      maximumSizeInBytes: 15 * 1024 * 1024,
      access: "public",
    }),
    onUploadCompleted: async ({ blob }) => {
      // optional: console.log("Uploaded", blob.url);
    },
  });
}
