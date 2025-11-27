import { useFeatureStore } from "../lib/stores/features";

const featuresList = [
  { key: "detection", label: "Object Detection" },
  { key: "depth", label: "Depth Analysis" },
  { key: "pointCloud", label: "Point Cloud" },
  { key: "mesh", label: "3D Mesh" },
  { key: "multiObject", label: "Multi-Object Tracking" },
  { key: "arOverlay", label: "AR Overlay" },
  { key: "replay", label: "Step Replay" },
  { key: "timewarp", label: "Timewarp Timeline" },
  { key: "voice", label: "Voice Instructions" },
  { key: "beginnerMode", label: "Beginner Mode" },
  { key: "expertMode", label: "Expert Mode" },
  { key: "autoRetry", label: "Auto Retry Engine" },
  { key: "chatOnly", label: "Chat Only Mode" },
];

export default function FeatureTogglePanel() {
  const { toggle, ...states } = useFeatureStore();

  return (
    <div className="p-4 rounded-xl bg-[#101010] border border-[#333]">
      <h2 className="text-xl font-bold mb-3">Feature Controls</h2>

      <div className="grid grid-cols-2 gap-2">
        {featuresList.map((feat) => (
          <button
            key={feat.key}
            className={`p-2 rounded-lg text-sm border ${
              states[feat.key]
                ? "bg-green-600 border-green-500"
                : "bg-red-700 border-red-500"
            }`}
            onClick={() => toggle(feat.key as any)}
          >
            {feat.label}: {states[feat.key] ? "ON" : "OFF"}
          </button>
        ))}
      </div>
    </div>
  );
}
