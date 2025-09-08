import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto đóng sidebar khi scroll trên mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sidebarOpen]);

  // Preview ảnh
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [prompt]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleRemoveImage = () => {
    setFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generate = async () => {
    setLoading(true);
    setResult("");

    let imageUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image: imageUrl }),
    });

    const data = await res.json();
    setResult(data.url);
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-result.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-neutral-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} setPrompt={setPrompt} />

      {/* Main content */}
      <div className="flex-1 flex flex-col font-sans">
        {/* ✅ Topbar mobile luôn sticky */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-neutral-800 rounded transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-semibold">AI Figure Generator</span>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 flex flex-col items-center justify-start py-12 px-4">
          {/* Header desktop */}
          <div className="text-center mb-10 hidden md:block">
            <h1 className="text-3xl font-bold text-white">AI Figure Generator</h1>
            <a
              href="https://datnh.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 mt-1 inline-block no-underline hover:text-gray-300"
            >
              by datnh.info
            </a>
          </div>

          {/* Prompt Box */}
          <div className="bg-neutral-800 rounded-3xl shadow-lg p-6 w-full max-w-3xl">
            <div className="flex flex-col gap-4">
              <textarea
                ref={textareaRef}
                placeholder="Start typing a prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base leading-relaxed resize-none"
              />

              {preview && (
                <div className="mt-2 flex justify-center">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="block h-auto w-auto max-h-72 rounded-xl"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/90"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-gray-400 hover:text-white text-sm flex items-center gap-1"
                  >
                    ＋ Add image
                  </label>
                </div>

                <button
                  onClick={generate}
                  disabled={(!prompt.trim() && !file) || loading}
                  className={`w-12 h-12 flex items-center justify-center rounded-full shadow transition
                    ${
                      (!prompt.trim() && !file) || loading
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-white hover:bg-gray-200 text-black"
                    }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && !result && (
            <div className="bg-neutral-800 rounded-2xl shadow-lg p-6 w-full max-w-3xl mt-6 text-center">
              <p className="text-sm text-gray-300 mb-3">Generating...</p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-white-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-neutral-800 rounded-3xl shadow-lg p-6 w-full max-w-3xl mt-10 text-center">
              <h2 className="text-base font-semibold text-white mb-4">Result</h2>
              <div className="relative inline-block">
                <img
                  src={result}
                  alt="AI result"
                  className="mx-auto rounded-xl shadow-lg"
                />
                <button
                  onClick={handleDownload}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
