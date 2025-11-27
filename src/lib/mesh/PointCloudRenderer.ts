import * as THREE from "three";

interface Intrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

interface PointCloudData {
  positions: Float32Array;
  colors?: Float32Array;
}

export class PointCloudRenderer {
  private pointCloud: THREE.Points | null = null;

  /**
   * Generate a 3D point cloud from a depth map
   */
  generatePointCloud(
    depthMap: Uint16Array | Float32Array,
    intrinsics: Intrinsics,
    colorData?: Uint8Array
  ): PointCloudData {
    const { fx, fy, cx, cy, width, height } = intrinsics;
    const positions: number[] = [];
    const colors: number[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const depth = depthMap[idx];

        // Skip invalid depth values
        if (depth === 0 || depth > 10000) continue;

        // Convert pixel + depth to 3D coordinates
        const z = depth / 1000.0; // Convert mm to meters
        const xWorld = ((x - cx) * z) / fx;
        const yWorld = ((y - cy) * z) / fy;

        positions.push(xWorld, yWorld, z);

        // Add color if available
        if (colorData) {
          const colorIdx = idx * 3;
          colors.push(
            colorData[colorIdx] / 255,
            colorData[colorIdx + 1] / 255,
            colorData[colorIdx + 2] / 255
          );
        } else {
          // Default gray color
          colors.push(0.5, 0.5, 0.5);
        }
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }

  /**
   * Create Three.js point cloud object
   */
  createThreePointCloud(data: PointCloudData): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));

    if (data.colors) {
      geometry.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
    }

    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      sizeAttenuation: true,
    });

    this.pointCloud = new THREE.Points(geometry, material);
    return this.pointCloud;
  }

  /**
   * Stream live point cloud updates
   */
  async *streamPointCloud(
    depthStreamUrl: string,
    intrinsics: Intrinsics
  ): AsyncGenerator<PointCloudData> {
    const ws = new WebSocket(depthStreamUrl);

    const queue: PointCloudData[] = [];
    let resolveNext: ((value: PointCloudData) => void) | null = null;

    ws.onmessage = (event) => {
      const depthData = new Uint16Array(event.data);
      const pointCloudData = this.generatePointCloud(depthData, intrinsics);

      if (resolveNext) {
        resolveNext(pointCloudData);
        resolveNext = null;
      } else {
        queue.push(pointCloudData);
      }
    };

    while (ws.readyState !== WebSocket.CLOSED) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        yield await new Promise<PointCloudData>((resolve) => {
          resolveNext = resolve;
        });
      }
    }
  }

  /**
   * Convert point cloud to mesh using basic algorithm
   */
  pointCloudToMesh(data: PointCloudData): THREE.Mesh {
    // Simple convex hull approach for demonstration
    // In production, use Poisson reconstruction or marching cubes
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      side: THREE.DoubleSide,
      flatShading: true,
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Remove outlier points from point cloud
   */
  removeOutliers(data: PointCloudData, threshold: number = 0.1): PointCloudData {
    const positions = data.positions;
    const filtered: number[] = [];
    const filteredColors: number[] = [];

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Skip points too far from origin (simple outlier detection)
      const distance = Math.sqrt(x * x + y * y + z * z);
      if (distance < threshold) continue;

      filtered.push(x, y, z);
      if (data.colors) {
        filteredColors.push(data.colors[i], data.colors[i + 1], data.colors[i + 2]);
      }
    }

    return {
      positions: new Float32Array(filtered),
      colors: data.colors ? new Float32Array(filteredColors) : undefined,
    };
  }

  /**
   * Apply smoothing to point cloud
   */
  smoothPointCloud(data: PointCloudData, radius: number = 0.05): PointCloudData {
    // Basic averaging smoothing
    const positions = data.positions;
    const smoothed = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      let sumX = x,
        sumY = y,
        sumZ = z;
      let count = 1;

      // Average with nearby points
      for (let j = 0; j < positions.length; j += 3) {
        if (i === j) continue;

        const dx = positions[j] - x;
        const dy = positions[j + 1] - y;
        const dz = positions[j + 2] - z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < radius) {
          sumX += positions[j];
          sumY += positions[j + 1];
          sumZ += positions[j + 2];
          count++;
        }
      }

      smoothed[i] = sumX / count;
      smoothed[i + 1] = sumY / count;
      smoothed[i + 2] = sumZ / count;
    }

    return {
      positions: smoothed,
      colors: data.colors,
    };
  }
}
