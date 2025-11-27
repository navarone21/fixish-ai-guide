import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

interface MeshData {
  vertices: number[][];
  faces: number[][];
}

interface Props {
  mesh: MeshData | null;
}

export default function MeshViewer({ mesh }: Props) {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();

    if (mesh?.vertices && mesh?.faces) {
      const vertices = new Float32Array(mesh.vertices.flat());
      const indices = new Uint32Array(mesh.faces.flat());

      geom.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices, 3)
      );
      geom.setIndex(new THREE.BufferAttribute(indices, 1));
      geom.computeVertexNormals();
    }

    return geom;
  }, [mesh]);

  if (!mesh) return null;

  return (
    <div className="absolute inset-0 bg-black z-30">
      <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} />
        <OrbitControls enableDamping dampingFactor={0.05} />

        <mesh>
          <primitive object={geometry} />
          <meshStandardMaterial 
            color="#00ffaa" 
            wireframe={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  );
}
