import { useState, useRef, useEffect } from "react";
import { useFixishState } from "@/hooks/useFixishState";
import { useFixish } from "@/contexts/FixishProvider";
import { useFixishCamera } from "@/hooks/useFixishCamera";
import { useFixishGuidance } from "@/hooks/useFixishGuidance";
import { useFixishWorld } from "@/hooks/useFixishWorld";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import SafetyAlert from "@/components/SafetyAlert";
import InstructionsPanel from "@/components/InstructionsPanel";
import ObjectsPanel from "@/components/ObjectsPanel";
import MeshStatus from "@/components/MeshStatus";
import GuidanceOverlay from "@/components/GuidanceOverlay";
import AROverlayCanvas from "@/components/AROverlayCanvas";
import ActionArrow from "@/components/ActionArrow";
import StepGuidanceOverlay from "@/components/StepGuidanceOverlay";
import DirectionalArrow from "@/components/DirectionalArrow";
import ActionPath from "@/components/ActionPath";
import StepSequencePanel from "@/components/StepSequencePanel";
import DepthMapCanvas from "@/components/DepthMapCanvas";
import PointCloudViewer from "@/components/PointCloudViewer";
import MeshViewer from "@/components/MeshViewer";
import HazardAlert from "@/components/HazardAlert";
import { useFixishHazards } from "@/hooks/useFixishHazards";
import { useHandTracking } from "@/hooks/useHandTracking";
import GestureBubble from "@/components/GestureBubble";
import { FixishClient } from "@/lib/FixishClient";
import ToolHUD from "@/components/ToolHUD";
import ToolAlert from "@/components/ToolAlert";
import { useFixishTool } from "@/hooks/useFixishTool";
import StepCompletedBubble from "@/components/StepCompletedBubble";
import { useStepAutoCompletion } from "@/hooks/useStepAutoCompletion";
import OcclusionWarning from "@/components/OcclusionWarning";
import OcclusionDebug from "@/components/OcclusionDebug";
import { useOcclusionMask } from "@/hooks/useOcclusionMask";

export default function LiveRepair() {
  const state = useFixishState();
  const guidance = useFixishGuidance();
  const world = useFixishWorld();
  const { videoRef, canvasRef, startCamera, stopCamera, isStreaming } = useFixishCamera();
  const { overlay } = useFixish();
  const [viewMode, setViewMode] = useState<"camera" | "depth" | "pointcloud" | "mesh">("camera");
  const hazards = useFixishHazards();
  const tool = useFixishTool();
  const autoComplete = useStepAutoCompletion();
  const occlusionMask = useOcclusionMask();
  
  const handTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<string | null>(null);
  
  useEffect(() => {
    const client = FixishClient.getInstance();
    const unsub = client.subscribe("data", (data) => {
      if (data?.gesture) {
        setGesture(data.gesture);
      }
    });
    return () => unsub();
  }, []);
  
  useHandTracking(handTrackingVideoRef);

  const activeStep = world?.task_state?.active_step;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative w-full h-[calc(100vh-4rem)] bg-black">
          {/* CAMERA FEED */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <video ref={handTrackingVideoRef} className="hidden" />

          {/* AR OVERLAY */}
          {world && (
            <AROverlayCanvas
              world={world}
              width={window.innerWidth}
              height={window.innerHeight}
            />
          )}

          {overlay && (
            <img
              src={`data:image/jpeg;base64,${overlay}`}
              alt="AR Overlay"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90"
            />
          )}

          {/* GUIDANCE OVERLAY */}
          <GuidanceOverlay message={guidance} />
          
          {/* GESTURE DISPLAY */}
          <GestureBubble gesture={gesture} />
          
          {/* TOOL TRACKING */}
          <ToolHUD tool={tool} />
          <ToolAlert tool={tool} />
          
          {/* STEP COMPLETION */}
          <StepCompletedBubble visible={autoComplete} />
          
          {/* OCCLUSION WARNING */}
          <OcclusionWarning occluded={activeStep?.occluded} />
          
          {/* OCCLUSION DEBUG */}
          <OcclusionDebug mask={occlusionMask} />

          {/* ACTION ARROW */}
          {world?.task_state?.active_target_center && (
            <ActionArrow
              x={world.task_state.active_target_center.x}
              y={world.task_state.active_target_center.y}
            />
          )}

          {/* STEP GUIDANCE */}
          {activeStep?.bbox && (
            <StepGuidanceOverlay
              target={{
                x: activeStep.bbox[0],
                y: activeStep.bbox[1],
                w: activeStep.bbox[2],
                h: activeStep.bbox[3],
              }}
            />
          )}

          {/* DIRECTIONAL ARROW */}
          {activeStep?.direction && activeStep?.center && (
            <DirectionalArrow
              dir={activeStep.direction}
              x={activeStep.center.x}
              y={activeStep.center.y}
            />
          )}

          {/* ACTION PATH */}
          {activeStep?.path_points && (
            <ActionPath path={activeStep.path_points} />
          )}

          {/* VIEW MODE TOGGLE */}
          <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
            <button
              onClick={() => setViewMode("camera")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "camera"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => setViewMode("depth")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "depth"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Depth
            </button>
            <button
              onClick={() => setViewMode("pointcloud")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "pointcloud"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setViewMode("mesh")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "mesh"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Mesh
            </button>
          </div>

          {/* VIEW MODE DISPLAYS */}
          {viewMode === "depth" && world?.depth && (
            <DepthMapCanvas 
              depth={world.depth} 
              width={window.innerWidth} 
              height={window.innerHeight} 
            />
          )}

          {viewMode === "pointcloud" && world?.point_cloud && (
            <PointCloudViewer points={world.point_cloud} />
          )}

          {viewMode === "mesh" && world?.mesh && (
            <MeshViewer mesh={world.mesh} />
          )}

          {/* STATE OVERLAYS */}
          {state === "idle" && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
              <p className="text-xl font-bold text-white">Tap to begin scanning</p>
              <button
                onClick={isStreaming ? stopCamera : startCamera}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                {isStreaming ? "Stop Camera" : "Start Camera"}
              </button>
            </div>
          )}

          {state === "scanning" && (
            <div className="absolute top-4 left-4 text-sm px-3 py-1 bg-white/20 backdrop-blur-sm rounded-md text-white">
              Scanning… Move camera slowly.
            </div>
          )}

          {state === "analyzing" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-xl font-semibold text-white">Analyzing object… Hold still.</p>
            </div>
          )}

          {state === "generating_steps" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <p className="text-2xl animate-pulse text-white">Generating repair steps…</p>
            </div>
          )}

          {state === "instructing" && <InstructionsPanel />}

          {state === "awaiting_user_action" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <button className="px-5 py-3 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground font-bold transition-colors">
                Mark Step Complete
              </button>
            </div>
          )}

          {state === "paused" && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
              <p className="text-xl mb-4 text-white">Paused</p>
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground transition-colors">
                Resume
              </button>
            </div>
          )}

          {state === "error" && (
            <div className="absolute inset-0 bg-destructive/60 flex items-center justify-center">
              <p className="text-xl font-bold text-white">Error — please adjust camera or restart.</p>
            </div>
          )}

          {state === "completed" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <p className="text-3xl font-bold text-green-400">✔ Repair Completed!</p>
            </div>
          )}

          {/* Always show panels */}
          <ObjectsPanel />
          <SafetyAlert />
          <MeshStatus />
          <StepSequencePanel sequence={world?.task_state?.sequence} />
          <HazardAlert hazards={hazards} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
