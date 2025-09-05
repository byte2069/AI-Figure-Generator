"use client";

import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("a cute chibi ninja figure on a clear stand");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    try {
      setLoading(true);
      setError(null);
      setImages([]);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, boxed: true, aspectRatio: "1:1" }),
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
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>AI Figure Generator</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: "#3b82f6",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: "red" }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`gen-${i}`}
            style={{ maxWidth: "100%", border: "1px solid #ddd", borderRadius: 8 }}
          />
        ))}
      </div>
    </main>
  );
}
