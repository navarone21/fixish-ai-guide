import { useEffect, useState } from "react";
import CameraManager from "@/lib/camera/CameraManager";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const mgr = CameraManager.getInstance();
        const list = await mgr.listCameras();
        setCameras(list);

        const stream = await mgr.startCamera();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Prefer rear/back camera, fallback to first available
        const active = list.find((d) => d.label.toLowerCase().includes("back"))
          || list.find((d) => d.label.toLowerCase().includes("rear"))
          || list[0];

        if (active) setActiveId(active.deviceId);
      } catch (error) {
        console.error("Failed to initialize camera:", error);
      }
    };

    load();

    return () => {
      const mgr = CameraManager.getInstance();
      mgr.stop();
    };
  }, [videoRef]);

  const switchCamera = async (deviceId: string) => {
    try {
      const mgr = CameraManager.getInstance();
      const stream = await mgr.switchCamera(deviceId);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActiveId(deviceId);
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  };

  return { cameras, activeId, switchCamera };
}
