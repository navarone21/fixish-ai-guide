interface CameraSwitchButtonProps {
  cameras: MediaDeviceInfo[];
  activeId: string | null;
  onSwitch: (deviceId: string) => void;
}

export default function CameraSwitchButton({ cameras, activeId, onSwitch }: CameraSwitchButtonProps) {
  if (!cameras.length) return null;

  return (
    <div className="absolute top-4 right-4 z-50">
      <select
        onChange={(e) => onSwitch(e.target.value)}
        value={activeId || ""}
        className="bg-background border border-border px-3 py-2 rounded-lg shadow-md text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
      >
        {cameras.map((cam) => (
          <option key={cam.deviceId} value={cam.deviceId}>
            {cam.label || "Camera"}
          </option>
        ))}
      </select>
    </div>
  );
}
