import { useState } from "react";
import { detectImage } from "../lib/api";

export function useDetection() {
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const runDetection = async (file) => {
    setLoading(true);
    setDetections(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const result = await detectImage(file);
      setDetections(result.detections || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, detections, imageSrc, runDetection };
}
