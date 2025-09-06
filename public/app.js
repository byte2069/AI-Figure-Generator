// public/app.js
const promptEl = document.getElementById("prompt");
const imagesEl = document.getElementById("images");
const runBtn = document.getElementById("runBtn");
const resultEl = document.getElementById("result");
const previewEl = document.getElementById("preview");
const debugEl = document.getElementById("debug");

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
  const resp = await fetch("/api/upload", { method: "POST" });
  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    debugEl.textContent = "Upload API raw response: " + text;
    throw new Error("Upload API returned non-JSON.");
  }
  return data.url.split("?")[0];
}

function showSpinner() {
  resultEl.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Đang xử lý với Replicate...</p>
    </div>`;
}

runBtn.addEventListener("click", async () => {
  debugEl.textContent = "";
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
      debugEl.textContent = "Generate API raw response: " + text;
      throw new Error("Generate API returned non-JSON.");
    }
    if (!resp.ok) throw new Error(data.error || "Request failed");

    debugEl.textContent = "Raw output: " + JSON.stringify(data.raw || data, null, 2);

    if (data.urls && data.urls.length > 0) {
      resultEl.innerHTML = `
        <div class="gallery">
          ${data.urls.map(url => `<img src="${url}" class="result-img" alt="result" />`).join("")}
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
