import { useEffect, useRef, useState, useCallback } from "react";
import { useFixish } from "@/contexts/FixishProvider";

const FRAME_INTERVAL = 200; // match backend speed

export const useFixishCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { sendFrame, connect } = useFixish();

  const [isStreaming, setIsStreaming] = useState(false);
  const lastFrameTimeRef = useRef(0);

  // ----------------------------
  // START CAMERA
  // ----------------------------
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    setIsStreaming(true);
    connect(); // open WebSocket connection
  };

  // ----------------------------
  // STOP CAMERA
  // ----------------------------
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsStreaming(false);
  }, []);

  // ----------------------------
  // SEND FRAMES TO BACKEND
  // ----------------------------
  const sendLoop = useCallback(() => {
    if (!isStreaming) return;

    const now = Date.now();
    if (now - lastFrameTimeRef.current < FRAME_INTERVAL) {
      animationFrameRef.current = requestAnimationFrame(sendLoop);
      return;
    }

    lastFrameTimeRef.current = now;

    if (!videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(sendLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(sendLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Frame = canvas.toDataURL("image/jpeg", 0.8);
    sendFrame(base64Frame);

    animationFrameRef.current = requestAnimationFrame(sendLoop);
  }, [isStreaming, sendFrame]);

  useEffect(() => {
    if (isStreaming) {
      animationFrameRef.current = requestAnimationFrame(sendLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, sendLoop]);

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    isStreaming,
  };
};
