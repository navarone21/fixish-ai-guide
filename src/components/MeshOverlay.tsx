import React from "react";
import MeshViewer from "./MeshViewer";

interface Props {
  mesh: any;
}

export default function MeshOverlay({ mesh }: Props) {
  // Parse mesh data if it's a string (base64/JSON)
  let meshData = mesh;
  
  if (typeof mesh === "string") {
    try {
      meshData = JSON.parse(mesh);
    } catch {
      // If parsing fails, assume it's already in correct format or needs different handling
      meshData = null;
    }
  }

  if (!meshData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-xl mb-2">Invalid mesh data format</p>
          <p className="text-sm">Waiting for valid mesh reconstruction...</p>
        </div>
      </div>
    );
  }

  return <MeshViewer mesh={meshData} />;
}
