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

export default function LiveRepair() {
  const state = useFixishState();
  const guidance = useFixishGuidance();
  const world = useFixishWorld();
  const { videoRef, canvasRef, startCamera, stopCamera, isStreaming } = useFixishCamera();
  const { overlay } = useFixish();

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

          {/* ACTION ARROW */}
          {world?.task_state?.active_target_center && (
            <ActionArrow
              x={world.task_state.active_target_center.x}
              y={world.task_state.active_target_center.y}
            />
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
