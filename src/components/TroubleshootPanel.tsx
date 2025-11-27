interface TroubleshootData {
  tips?: string[];
  micro_steps?: { text: string }[];
}

export default function TroubleshootPanel({ trouble }: { trouble: TroubleshootData | null }) {
  if (!trouble) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-xl z-50 shadow-lg">
      <h2 className="text-xl font-bold mb-2">Let's Fix This</h2>

      {trouble.tips && trouble.tips.length > 0 && (
        <ul className="mb-3">
          {trouble.tips.map((t, i) => (
            <li key={i} className="text-sm opacity-90">• {t}</li>
          ))}
        </ul>
      )}

      {trouble.micro_steps && trouble.micro_steps.length > 0 && (
        <div className="mt-2">
          <h3 className="font-semibold mb-1 text-blue-300">Try this:</h3>
          <ul className="space-y-1">
            {trouble.micro_steps.map((s, i) => (
              <li key={i} className="text-sm text-blue-200">→ {s.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
