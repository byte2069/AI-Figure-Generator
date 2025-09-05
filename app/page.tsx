"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export default function Page() {
  const [prompt, setPrompt] = useState(
    "a stylized figure wearing a black suit and red tie, crown on head, holding a baton, dynamic pose on a transparent stand, on a desk in front of a monitor"
  );
  const [boxed, setBoxed] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imgStrength, setImgStrength] = useState(0.55);
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
    if (f.size > 15 * 1024 * 1024) throw new Error("File > 15MB — hãy chọn ảnh nhỏ hơn.");
    // IMPORTANT: provide handleUploadUrl so the server can sign the upload
    const { url } = await upload(f.name, f, { access: "public", handleUploadUrl: "/api/blob" });
    return url;
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
        body: JSON.stringify({ prompt, boxed, imageUrl, strength: imgStrength }),
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
    <div style={{
      height: "100svh",
      display: "grid",
      gridTemplateRows: "60px 1fr",
      background: "#0b0d10",
      color: "#e8e9ea",
      fontFamily: "Inter, ui-sans-serif, system-ui",
      overflow: "hidden"
    }}>
      <header style={{display:"flex",alignItems:"center",gap:12,padding:"0 16px",borderBottom:"1px solid #1b2026",background:"linear-gradient(180deg,#0f1318,#0b0d10)"}}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>AI Figure Generator</div>
        <div style={{ opacity: 0.6 }}>Next.js • Replicate</div>
      </header>

      <main style={{display:"grid",gridTemplateColumns:"420px 1fr",gap:20,padding:16,overflow:"hidden"}}>
        <section style={{background:"#101317",border:"1px solid #1b2026",borderRadius:20,padding:16,overflow:"auto"}}>
          <label style={{ fontSize: 12, opacity: 0.85 }}>Prompt</label>
          <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} rows={8}
            style={{width:"100%",marginTop:8,padding:12,borderRadius:14,background:"#0b0d10",color:"#e8e9ea",border:"1px solid #1b2026",outline:"none",resize:"vertical"}}/>
          <div style={{ display:"grid", gap:12, marginTop:12 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input id="boxed" type="checkbox" checked={boxed} onChange={(e)=>setBoxed(e.target.checked)} />
              <label htmlFor="boxed">Add retail box next to figure</label>
            </div>

            <div>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Image to transform (optional)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange}
                style={{width:"100%",marginTop:6,padding:8,borderRadius:12,background:"#0b0d10",color:"#e8e9ea",border:"1px solid #1b2026"}}/>
              {imgPreview && <img src={imgPreview} alt="preview" style={{marginTop:8,width:"100%",borderRadius:14,border:"1px solid #1b2026"}} />}
              <div style={{ display:"grid", gap:6, marginTop:10 }}>
                <label style={{ fontSize: 12, opacity: 0.85 }}>Img strength: {imgStrength.toFixed(2)}</label>
                <input type="range" min={0} max={1} step={0.01} value={imgStrength} onChange={(e)=>setImgStrength(parseFloat(e.target.value))}/>
              </div>
            </div>

            <button onClick={generate} disabled={loading}
              style={{background:loading?"#2b323c":"#3b82f6",color:"white",border:0,borderRadius:14,padding:"12px 16px",cursor:loading?"not-allowed":"pointer",fontWeight:700,letterSpacing:0.2}}>
              {loading ? "Generating…" : "Generate"}
            </button>

            {error && <div style={{background:"#221214",color:"#ffb4b4",border:"1px solid #43282b",borderRadius:14,padding:12,fontSize:14}}>{error}</div>}
          </div>
        </section>

        <section style={{background:"#0b0d10",border:"1px solid #1b2026",borderRadius:20,padding:12,overflow:"auto"}}>
          {!images.length && !loading && (
            <div style={{opacity:0.6,border:"1px dashed #1b2026",borderRadius:16,padding:24,textAlign:"center"}}>Results will appear here.</div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:16}}>
            {images.map((src,i)=>(
              <figure key={i} style={{background:"#0f1318",border:"1px solid #1b2026",borderRadius:16,overflow:"hidden",boxShadow:"0 10px 24px rgba(0,0,0,.25)"}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`generation-${i}`} style={{width:"100%",display:"block"}}/>
                <figcaption style={{padding:10,fontSize:12,opacity:0.75}}>{prompt.slice(0,120)}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
