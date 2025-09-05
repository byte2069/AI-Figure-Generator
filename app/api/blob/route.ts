// app/api/blob/route.ts
import { handleUpload } from "@vercel/blob";

export const runtime = "edge";

export async function POST(request: Request) {
  return handleUpload({
    request,
    onBeforeGenerateToken: async () => {
      return {
        allowedContentTypes: ["image/*"],
        maximumSizeInBytes: 15 * 1024 * 1024, // 15MB
        access: "public",
      };
    },
    onUploadCompleted: async ({ blob }) => {
      console.log("Upload completed:", blob.url);
    },
  });
}
