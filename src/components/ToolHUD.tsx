export default function ToolHUD({ tool }: { tool: any }) {
  if (!tool || !tool.tool_data) return null;

  const data = tool.tool_data;

  return (
    <div className="absolute top-20 left-4 bg-black/40 text-white 
                    p-2 rounded-lg text-xs z-50">
      <p>Tool: {data.tool_name}</p>
      {"angle" in data && <p>Angle: {Math.round(data.angle)}°</p>}
      {"torque_detected" in data && (
        <p>Torque: {data.torque_detected ? "Yes" : "No"}</p>
      )}
    </div>
  );
}
