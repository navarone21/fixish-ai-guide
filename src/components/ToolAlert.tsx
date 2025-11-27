export default function ToolAlert({ tool }: { tool: any }) {
  if (!tool || !tool.alerts?.length) return null;

  const alert = tool.alerts[tool.alerts.length - 1];

  return (
    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 
        bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold z-50 animate-pulse">
      {alert}
    </div>
  );
}
