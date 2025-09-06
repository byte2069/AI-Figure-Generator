// public/app.js
const promptEl = document.getElementById("prompt");
const imagesEl = document.getElementById("images");
const runBtn = document.getElementById("runBtn");
const resultEl = document.getElementById("result");
const previewEl = document.getElementById("preview");

function resetResult(text = "Kết quả sẽ hiển thị ở đây") {
  resultEl.innerHTML = `<div class="placeholder">${text}</div>`;
}
resetResult();

imagesEl.addEventListener("change", () => {
  previewEl.innerHTML = "";
  [...imagesEl.files].forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.src = url;
    previewEl.appendChild(img);
  });
});

async function uploadToBlob(file) {
  const fd = new FormData();
  fd.append("file", file);
  const resp = await fetch("/api/upload", { method: "POST", body: fd });
  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Upload API returned non-JSON: " + text);
  }
  if (!resp.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

function showSpinner() {
  resultEl.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Đang xử lý với Replicate...</p>
    </div>`;
}

runBtn.addEventListener("click", async () => {
  try {
    runBtn.disabled = true;
    showSpinner();
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
        images: uploadedUrls
      })
    });
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Generate API returned non-JSON: " + text);
    }
    if (!resp.ok) throw new Error(data.error || "Request failed");
    if (data.imagesBase64 && data.imagesBase64.length > 0) {
      resultEl.innerHTML = `
        <div class="gallery">
          ${data.imagesBase64.map(b64 => `<img src="${b64}" class="result-img" alt="result" />`).join("")}
        </div>`;
    } else {
      resetResult("Không nhận được ảnh.");
    }
  } catch (err) {
    console.error(err);
    resetResult("Có lỗi xảy ra: " + (err.message || err));
  } finally {
    runBtn.disabled = false;
  }
});
