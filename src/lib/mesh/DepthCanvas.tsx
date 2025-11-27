import { useRef, useEffect } from "react";

interface DepthCanvasProps {
  depthData: Uint16Array | Float32Array;
  width?: number;
  height?: number;
  showContours?: boolean;
  showMeasurements?: boolean;
  minDepth?: number;
  maxDepth?: number;
}

export function DepthCanvas({
  depthData,
  width = 640,
  height = 480,
  showContours = false,
  showMeasurements = false,
  minDepth = 0,
  maxDepth = 5000,
}: DepthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !depthData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Convert depth map to color-coded heatmap
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let i = 0; i < depthData.length; i++) {
      const depth = depthData[i];
      const normalized = Math.max(0, Math.min(1, (depth - minDepth) / (maxDepth - minDepth)));

      // Color mapping: blue (close) -> green -> yellow -> red (far)
      const pixelIndex = i * 4;
      if (normalized < 0.25) {
        // Blue to cyan
        const t = normalized / 0.25;
        pixels[pixelIndex] = 0;
        pixels[pixelIndex + 1] = Math.floor(t * 255);
        pixels[pixelIndex + 2] = 255;
      } else if (normalized < 0.5) {
        // Cyan to green
        const t = (normalized - 0.25) / 0.25;
        pixels[pixelIndex] = 0;
        pixels[pixelIndex + 1] = 255;
        pixels[pixelIndex + 2] = Math.floor((1 - t) * 255);
      } else if (normalized < 0.75) {
        // Green to yellow
        const t = (normalized - 0.5) / 0.25;
        pixels[pixelIndex] = Math.floor(t * 255);
        pixels[pixelIndex + 1] = 255;
        pixels[pixelIndex + 2] = 0;
      } else {
        // Yellow to red
        const t = (normalized - 0.75) / 0.25;
        pixels[pixelIndex] = 255;
        pixels[pixelIndex + 1] = Math.floor((1 - t) * 255);
        pixels[pixelIndex + 2] = 0;
      }
      pixels[pixelIndex + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw contours if enabled
    if (showContours) {
      drawContours(ctx, depthData, width, height, maxDepth);
    }

    // Draw measurements if enabled
    if (showMeasurements) {
      drawMeasurements(ctx, depthData, width, height);
    }
  }, [depthData, width, height, showContours, showMeasurements, minDepth, maxDepth]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <canvas ref={canvasRef} className="w-full h-auto" />
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Close</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Far</span>
        </div>
      </div>
    </div>
  );
}

function drawContours(
  ctx: CanvasRenderingContext2D,
  depthData: Uint16Array | Float32Array,
  width: number,
  height: number,
  maxDepth: number
) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;

  const threshold = 200; // Depth difference threshold for edge detection

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const depth = depthData[idx];

      const right = depthData[idx + 1];
      const down = depthData[idx + width];

      if (Math.abs(depth - right) > threshold || Math.abs(depth - down) > threshold) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function drawMeasurements(
  ctx: CanvasRenderingContext2D,
  depthData: Uint16Array | Float32Array,
  width: number,
  height: number
) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.font = "14px sans-serif";

  // Sample measurements at key points
  const samplePoints = [
    { x: width / 4, y: height / 4 },
    { x: (width * 3) / 4, y: height / 4 },
    { x: width / 2, y: height / 2 },
    { x: width / 4, y: (height * 3) / 4 },
    { x: (width * 3) / 4, y: (height * 3) / 4 },
  ];

  samplePoints.forEach(({ x, y }) => {
    const idx = Math.floor(y) * width + Math.floor(x);
    const depth = depthData[idx];
    const distanceCm = (depth / 10).toFixed(1);

    // Draw measurement marker
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(x + 10, y - 10, 70, 20);
    ctx.fillStyle = "white";
    ctx.fillText(`${distanceCm} cm`, x + 15, y + 3);
  });

  // Draw warning labels for danger zones
  const centerIdx = Math.floor(height / 2) * width + Math.floor(width / 2);
  const centerDepth = depthData[centerIdx];

  if (centerDepth < 300) {
    drawWarningLabel(ctx, width / 2, height / 2 - 50, "⚠️ TOO CLOSE", "red");
  }
}

function drawWarningLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.font = "bold 16px sans-serif";

  const metrics = ctx.measureText(text);
  const padding = 10;

  ctx.fillRect(x - metrics.width / 2 - padding, y - 15, metrics.width + padding * 2, 30);
  ctx.strokeRect(x - metrics.width / 2 - padding, y - 15, metrics.width + padding * 2, 30);

  ctx.fillStyle = "white";
  ctx.fillText(text, x - metrics.width / 2, y + 5);
}
