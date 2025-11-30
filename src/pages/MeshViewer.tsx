// LABEL B — Required Imports
import { useEffect, useRef, useState } from "react";
import { MeshEngine } from "@/lib/meshEngine";
import { useFixish } from "@/contexts/FixishProvider";
import MainNav from "@/components/MainNav";

export default function MeshViewerPage() {
  // LABEL D — FIXISH State + Refs
  const { mesh } = useFixish();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<MeshEngine | null>(null);
  const [meshMeta, setMeshMeta] = useState<{ vertices: number; faces: number } | null>(null);

  // LABEL E — Initialize 3D Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const eng = new MeshEngine({
      canvas: canvasRef.current,
      onMeta: (meta) => setMeshMeta(meta)
    });

    setEngine(eng);

    return () => eng.dispose();
  }, []);

  // Load mesh data when available
  useEffect(() => {
    if (!engine || !mesh) return;

    // Parse mesh data if it's a string (JSON)
    let meshData: any = mesh;
    if (typeof mesh === "string") {
      try {
        meshData = JSON.parse(mesh);
      } catch (e) {
        console.error("Failed to parse mesh data:", e);
        return;
      }
    }

    if (meshData?.vertices && meshData?.faces) {
      engine.loadMesh(meshData as { vertices: number[][]; faces: number[][] });
    }
  }, [engine, mesh]);

  return (
    <div className="w-full h-screen bg-background text-foreground">
      <MainNav />

      <div className="mesh-viewer-container relative w-full h-[calc(100vh-64px)]">
        {/* Canvas where 3D appears */}
        <canvas 
          id="meshCanvas"
          ref={canvasRef} 
          className="mesh-canvas w-full h-full" 
        />

        {/* Mesh Info Panel */}
        <div className="mesh-info-panel absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Mesh Info</h2>
          <p className="text-sm text-muted-foreground">Vertices: {meshMeta?.vertices ?? "-"}</p>
          <p className="text-sm text-muted-foreground">Faces: {meshMeta?.faces ?? "-"}</p>
        </div>
      </div>
    </div>
  );
}
