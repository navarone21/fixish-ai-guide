// LABEL B — Required Imports
import { useEffect, useRef, useState } from "react";
import { MeshEngine } from "@/lib/meshEngine";
import { useFixish } from "@/contexts/FixishProvider";

export default function MeshViewerPage() {
  // LABEL D — FIXISH State + Refs
  const { state, setState } = useFixish();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<MeshEngine | null>(null);

  // LABEL E — Initialize 3D Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const eng = new MeshEngine({
      canvas: canvasRef.current,
      onMeta: (meta) => setState("meshMeta", meta)
    });

    setEngine(eng);
  }, []);

  return (
    <div className="mesh-viewer">
      {/* LABEL C — Mesh Viewer UI Shell */}
      
      {/* Canvas where 3D appears */}
      <canvas ref={canvasRef} className="mesh-canvas" />

      {/* Info panel — will fill this later */}
      <div className="mesh-meta">
        <h2>Mesh Details</h2>
        <p>Vertices: {state.meshMeta?.vertices ?? "-"}</p>
        <p>Faces: {state.meshMeta?.faces ?? "-"}</p>
      </div>
    </div>
  );
}
