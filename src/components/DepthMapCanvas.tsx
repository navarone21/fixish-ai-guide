import { useEffect, useRef } from "react";

interface Props {
  depth: number[]; // flat array of depth values
  width: number;
  height: number;
}

export default function DepthMapCanvas({ depth, width, height }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!depth || !ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = ctx.createImageData(width, height);

    // Normalize depth
    const max = Math.max(...depth);
    const min = Math.min(...depth);

    depth.forEach((d, i) => {
      const norm = (d - min) / (max - min + 0.00001);

      // Heatmap: blue → green → red
      const r = Math.min(255, norm * 255);
      const g = Math.min(255, (1 - Math.abs(norm - 0.5) * 2) * 255);
      const b = Math.min(255, (1 - norm) * 255);

      const idx = i * 4;
      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = 255;
    });

    ctx.putImageData(img, 0, 0);
  }, [depth, width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
}
