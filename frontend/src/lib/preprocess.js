export function canvasToMnistFloat32(canvas) {
  const targetSize = 28;

  const off = document.createElement("canvas");
  off.width = targetSize;
  off.height = targetSize;
  const ctx = off.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, targetSize, targetSize);

  const img = ctx.getImageData(0, 0, targetSize, targetSize).data;

  const out = new Float32Array(targetSize * targetSize);
  for (let i = 0; i < targetSize * targetSize; i++) {
    const r = img[i * 4]; // 0..255
    out[i] = r / 255.0;
  }
  return out;
}
