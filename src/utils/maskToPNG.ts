export function convertMaskToPNG(mask: number[][]): string {
  if (!mask || mask.length === 0) return "";
  
  const canvas = document.createElement("canvas");
  const h = mask.length;
  const w = mask[0].length;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  
  const img = ctx.createImageData(w, h);

  let idx = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const value = mask[y][x] * 255;
      img.data[idx++] = 255; // R
      img.data[idx++] = 255; // G
      img.data[idx++] = 255; // B
      img.data[idx++] = value; // A (from mask)
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png").split(",")[1];
}
