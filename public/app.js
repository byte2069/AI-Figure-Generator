// public/app.js
const promptEl = document.getElementById("prompt");
const imagesEl = document.getElementById("images");
const formatEl = document.getElementById("format");
const runBtn = document.getElementById("runBtn");
const resultEl = document.getElementById("result");
const previewEl = document.getElementById("preview");
const dropzone = document.getElementById("dropzone");

function resetResult(text = "Chưa có kết quả.") {
  resultEl.innerHTML = `<div class="placeholder">${text}</div>`;
}
resetResult();

function renderPreview(files) {
  previewEl.innerHTML = "";
  [...files].forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const div = document.createElement("div");
    div.className = "thumb";
    div.innerHTML = `<img src="${url}"/><button class="x" data-i="${idx}">✕</button>`;
    previewEl.appendChild(div);
  });
}

imagesEl.addEventListener("change", () => renderPreview(imagesEl.files));

previewEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.x");
  if (!btn) return;
  const i = +btn.dataset.i;
  const dt = new DataTransfer();
  [...imagesEl.files].forEach((f, idx) => { if (idx !== i) dt.items.add(f); });
  imagesEl.files = dt.files;
  renderPreview(imagesEl.files);
});

["dragenter","dragover"].forEach(ev => dropzone.addEventListener(ev, (e) => {
  e.preventDefault(); e.stopPropagation(); dropzone.style.borderColor = "#ffd54a";
}));
["dragleave","drop"].forEach(ev => dropzone.addEventListener(ev, (e) => {
  e.preventDefault(); e.stopPropagation(); dropzone.style.borderColor = "#31405d";
}));
dropzone.addEventListener("drop", (e) => {
  const dt = new DataTransfer();
  [...imagesEl.files, ...e.dataTransfer.files].forEach(f => dt.items.add(f));
  imagesEl.files = dt.files;
  renderPreview(imagesEl.files);
});

async function uploadToBlob(file) {
  const fd = new FormData();
  fd.append("file", file);
  const resp = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

runBtn.addEventListener("click", async () => {
  try {
    runBtn.disabled = true;
    resetResult("Đang upload & chạy model…");

    const files = [...imagesEl.files];
    const uploadedUrls = [];
    for (const f of files) {
      const url = await uploadToBlob(f);
      uploadedUrls.push(url);
    }

    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptEl.value,
        output_format: formatEl.value,
        images: uploadedUrls
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Request failed");

    if (data.imageUrl) {
      resultEl.innerHTML = `<img src="${data.imageUrl}" alt="result" />`;
    } else {
      resetResult("Không nhận được URL ảnh.");
    }
  } catch (err) {
    console.error(err);
    resetResult("Có lỗi xảy ra: " + (err.message || err));
  } finally {
    runBtn.disabled = false;
  }
});
