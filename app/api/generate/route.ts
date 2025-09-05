// app/api/generate/route.ts
import Replicate from "replicate";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ error: "Missing REPLICATE_API_TOKEN" }), { status: 500 });
    }
    const body = await req.json();
    const { prompt, guidance = 3.5, steps = 28, boxed = true, imageUrl, strength = 0.55 } = body ?? {};
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
    }

    const style = [
      "collectible toy figure, 3D product render,",
      "studio lighting, photorealistic, sharp focus,",
      "transparent acrylic display base,",
      boxed ? "windowed retail box packaging beside figure," : "",
      "volumetric light, soft shadows, highly detailed",
    ].filter(Boolean).join(" ");

    const fullPrompt = `${prompt}, ${style}`;
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    let images: string[] = [];
    if (imageUrl) {
      const out = (await replicate.run("stability-ai/sdxl", {
        input: {
          image: imageUrl,
          prompt: fullPrompt,
          strength,
          scheduler: "K_EULER_ANCESTRAL",
          num_inference_steps: steps,
          guidance_scale: guidance,
          aspect_ratio: "1:1",
          output_format: "png",
        },
      })) as string[];
      images = out;
    } else {
      const out = (await replicate.run("black-forest-labs/flux-schnell", {
        input: {
          prompt: fullPrompt,
          aspect_ratio: "1:1",
          num_outputs: 1,
          guidance,
          num_inference_steps: steps,
          output_format: "png",
        },
      })) as string[];
      images = out;
    }

    return Response.json({ images });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err?.message || "Generation failed" }), { status: 500 });
  }
}
