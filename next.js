# AI Figure Generator — Next.js (App Router) + Replicate

This is a minimal, production‑ready(ish) web app that turns a text prompt into a toy/figure product photo (with optional "boxed packaging" style). It uses **Next.js 14 App Router** and **Replicate** (Flux schnell) on the server route.

---

## 0) Prereqs
- Node 18+
- A Replicate account + API token: https://replicate.com

```bash
npx create-next-app@latest ai-figure-gen --ts --eslint --app --src-dir false --tailwind false
cd ai-figure-gen
npm i replicate
```

Create `.env.local`:
```env
REPLICATE_API_TOKEN=YOUR_TOKEN_HERE
```

Start the dev server:
```bash
npm run dev
```

---

## 1) API route — `app/api/generate/route.ts`

```ts
// app/api/generate/route.ts
import Replicate from "replicate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing REPLICATE_API_TOKEN" }),
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      prompt,
      aspectRatio = "1:1",
      guidance = 3.5,
      steps = 28,
      boxed = true,
      imageUrl, // if provided → img2img
      strength = 0.55,
    } = body ?? {};

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400 }
      );
    }

    const style = [
      "collectible toy figure, 3D product render,",
      "studio lighting, photorealistic, sharp focus,",
      "transparent acrylic display base,",
      boxed ? "windowed retail box packaging beside figure," : "",
      "volumetric light, soft shadows, highly detailed"
    ]
      .filter(Boolean)
      .join(" ");

    const fullPrompt = `${prompt}, ${style}`;

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    let images: string[] = [];

    if (imageUrl) {
      // IMG-to-IMG via SDXL on Replicate
      const out = (await replicate.run(
        "stability-ai/sdxl",
        {
          input: {
            image: imageUrl, // public URL from Vercel Blob
            prompt: fullPrompt,
            strength, // 0..1 (how much to transform the source)
            scheduler: "K_EULER_ANCESTRAL",
            num_inference_steps: steps,
            guidance_scale: guidance,
            aspect_ratio: aspectRatio,
            output_format: "png",
          },
        }
      )) as string[];
      images = out;
    } else {
      // Text-to-Image (Flux schnell) — fast, high‑quality
      const out = (await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: fullPrompt,
            aspect_ratio: aspectRatio,
            num_outputs: 1,
            guidance,
            num_inference_steps: steps,
            output_format: "png",
          },
        }
      )) as string[];
      images = out;
    }

    return Response.json({ images });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err?.message || "Generation failed" }),
      { status: 500 }
    );
  }
}
```
ts
// app/api/generate/route.ts
import Replicate from "replicate";

export const runtime = "nodejs"; // ensures server runtime

export async function POST(req: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing REPLICATE_API_TOKEN" }),
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      prompt,
      aspectRatio = "1:1",
      guidance = 3.5,
      steps = 28,
      boxed = true,
    } = body ?? {};

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400 }
      );
    }

    const style = [
      "collectible toy figure, 3D product render,",
      "studio lighting, photorealistic, sharp focus,",
      "transparent acrylic display base,",
      boxed ? "windowed retail box packaging beside figure," : "",
      "volumetric light, soft shadows, highly detailed"
    ]
      .filter(Boolean)
      .join(" ");

    const fullPrompt = `${prompt}, ${style}`;

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // Using Flux schnell for fast, high‑quality generations.
    // You can switch models (e.g., stability-ai/sdxl) without changing the UI.
    const output = (await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: fullPrompt,
          aspect_ratio: aspectRatio,
          num_outputs: 1,
          guidance,
          num_inference_steps: steps,
          output_format: "png",
        },
      }
    )) as string[];

    return Response.json({ images: output });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err?.message || "Generation failed" }),
      { status: 500 }
    );
  }
}
```

---

## 2) UI — `app/page.tsx`

```tsx
// app/page.tsx
"use client";
import { useState, useRef } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState(
    "a stylized figure wearing a black suit and red tie, crown on head, holding a baton, dynamic pose on a transparent stand, on a desk in front of a monitor"
  );
  const [boxed, setBoxed] = useState(true);
  const [aspect, setAspect] = useState("1:1");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // img-to-img
  const [imgStrength, setImgStrength] = useState(0.55); // 0..1 (how much to transform)
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setImgPreview(null);
    const reader = new FileReader();
    reader.onload = () => setImgPreview(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function uploadIfNeeded(): Promise<string | undefined> {
    const f = fileRef.current?.files?.[0];
    if (!f) return undefined;
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url as string; // public URL (Vercel Blob)
  }

  async function generate() {
    try {
      setLoading(true);
      setError(null);
      setImages([]);

      const imageUrl = await uploadIfNeeded();

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          boxed,
          aspectRatio: aspect,
          imageUrl, // if present → img2img
          strength: imgStrength,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setImages(data.images || []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: "#0b0d10",
        color: "#e8e9ea",
        fontFamily: "Inter, ui-sans-serif, system-ui",
      }}
      className="p-6"
    >
      <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>AI Figure Generator</h1>
        <span style={{ opacity: 0.6 }}>| Next.js + Replicate</span>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 24, marginTop: 16 }}>
        {/* Controls */}
        <div
          style={{
            background: "#101317",
            border: "1px solid #1b2026",
            borderRadius: 16,
            padding: 16,
            position: "sticky",
            top: 16,
            height: "fit-content",
          }}
        >
          <label style={{ fontSize: 13, opacity: 0.85 }}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 12,
              borderRadius: 12,
              background: "#0b0d10",
              color: "#e8e9ea",
              border: "1px solid #1b2026",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                id="boxed"
                type="checkbox"
                checked={boxed}
                onChange={(e) => setBoxed(e.target.checked)}
              />
              <label htmlFor="boxed">Add retail box next to figure</label>
            </div>

            <div>
              <label style={{ fontSize: 13, opacity: 0.85 }}>Aspect ratio</label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "#0b0d10",
                  color: "#e8e9ea",
                  border: "1px solid #1b2026",
                }}
              >
                <option value="1:1">1:1</option>
                <option value="3:4">3:4</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
              </select>
            </div>

            {/* Img-to-Img */}
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13, opacity: 0.85 }}>Image to transform (optional)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  borderRadius: 12,
                  background: "#0b0d10",
                  color: "#e8e9ea",
                  border: "1px solid #1b2026",
                }}
              />
              {imgPreview && (
                <img
                  src={imgPreview}
                  alt="preview"
                  style={{ marginTop: 8, width: "100%", borderRadius: 12, border: "1px solid #1b2026" }}
                />)
              }
              <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                <label style={{ fontSize: 13, opacity: 0.85 }}>
                  Img strength: {imgStrength.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={imgStrength}
                  onChange={(e) => setImgStrength(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              style={{
                background: loading ? "#2b323c" : "#3b82f6",
                color: "white",
                border: 0,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Generating…" : "Generate"}
            </button>

            {error && (
              <div
                style={{
                  background: "#221214",
                  color: "#ffb4b4",
                  border: "1px solid #43282b",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Tip: With an input image, lower strength keeps more of the original; higher strength makes it more like the prompt.
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div style={{ display: "grid", gap: 16 }}>
          {!images.length && !loading && (
            <div
              style={{
                opacity: 0.6,
                border: "1px dashed #1b2026",
                borderRadius: 16,
                padding: 24,
              }}
            >
              Results will appear here.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {images.map((src, i) => (
              <figure
                key={i}
                style={{
                  background: "#0b0d10",
                  border: "1px solid #1b2026",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`generation-${i}`} style={{ width: "100%", display: "block" }} />
                <figcaption style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>
                  {prompt.slice(0, 120)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```


---

## 3) Prompt presets (optional)
You can add a dropdown with presets like:
- **Figure on desk**: "on a matte black desk, in front of a dual‑monitor setup"
- **Boxed product shot**: "white backdrop, floating dust motes, softbox lighting"
- **Unboxed close‑up**: "bokeh background, 85mm lens, f/1.8"

---

## 4) Notes & Extensions
- **Image‑to‑Image**: Swap the model for an SDXL img2img or Flux + IP‑Adapter model on Replicate if you want to transform your own character sketch into a figure photo.
- **Queue & Rate limits**: Put a simple Redis queue (Upstash) around the API to smooth bursts; log usage per IP.
- **Safety**: Validate prompts on the server; reject NSFW.
- **Downloads**: Add a route that streams images and writes an `Content-Disposition` header for one‑click save.
- **Costs**: Cache by hashing the final prompt string; serve cached URLs from KV to avoid duplicate generations.
- **Your PHP admin**: Expose a POST `/api/generate` here and call it from your existing PHP dashboard to store results and captions.


---

## 3) Upload route (Vercel Blob) — `app/api/upload/route.ts`

```ts
// app/api/upload/route.ts
import { put } from "@vercel/blob";

export const runtime = "edge"; // fast upload

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return Response.json({ url: blob.url });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Upload failed" }), { status: 500 });
  }
}
```

> Cài thêm gói:
```bash
npm i @vercel/blob
```

---

## 4) Prompt presets (optional)
(giữ nguyên như phần trước)

---

## 5) Deploy nhanh lên Vercel

### Cách A — qua Dashboard (GUI)
1. Push code lên GitHub (hoặc GitLab/Bitbucket).
2. Vào https://vercel.com → **Add New… → Project → Import** repo.
3. Vercel tự nhận **Framework = Next.js**. Giữ build mặc định:
   - Build Command: `next build`
   - Install Command: `npm install`
   - Output Directory: `.vercel/output` (mặc định của Next App Router)
4. Ở tab **Environment Variables**, thêm:
   - `REPLICATE_API_TOKEN = <token của bạn>`
5. **Deploy**. Sau 1–2 phút sẽ có URL dạng `https://ai-figure-gen.vercel.app`.

> Lưu ý: API route đã set `export const runtime = "nodejs";` nên chạy trên serverless Node runtime của Vercel ổn định.

### Cách B — qua Vercel CLI (nhanh & local test)
```bash
npm i -g vercel
vercel login
vercel  # lần đầu: trả lời theo prompt (Project name, scope, link to repo...)

# Thêm biến môi trường (môi trường Production)
vercel env add REPLICATE_API_TOKEN production
# Dán token khi CLI hỏi

# Deploy bản production
vercel deploy --prod
```

### (Tuỳ chọn) `vercel.json`
Không bắt buộc, nhưng bạn có thể thêm file `vercel.json` để cố định một số cấu hình:
```json
{
  "build": { "env": { "NEXT_TELEMETRY_DISABLED": "1" } },
  "functions": {
    "app/api/generate/route.ts": { "memory": 1024, "maxDuration": 30 }
  }
}
```

### (Tuỳ chọn) `next.config.js` cho `next/image`
UI hiện dùng thẻ `<img>`, nếu chuyển sang `next/image`, nhớ whitelisting domain nguồn ảnh (ví dụ Replicate CDN):
```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' }
    ]
  }
}
```

### Kiểm thử sau deploy
- Mở trang, nhập prompt, nhấn **Generate** → xem ảnh hiển thị.
- Nếu lỗi 500 `Missing REPLICATE_API_TOKEN` → kiểm tra biến môi trường trên Vercel (Production) và **Redeploy**.
- Nếu 403/401 từ Replicate → kiểm tra token còn hiệu lực, hoặc model id đúng (`black-forest-labs/flux-schnell`).
- Nếu chậm/429 → thêm queue đơn giản hoặc giảm `steps`/`guidance` trong API route.

### Nâng cấp production
- Bật **Protect Environment Variables** trên Vercel.
- Bật **Server logs** và **Request tracing** để theo dõi lỗi API.
- Dùng **KV/Edge Config** để cache kết quả theo hash của prompt.
