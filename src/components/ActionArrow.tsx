export default function ActionArrow({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute text-red-400 pointer-events-none"
      style={{
        top: y - 40,
        left: x - 20,
        fontSize: 40,
        fontWeight: "bold",
        animation: "bounce 1s infinite"
      }}
    >
      ↓
    </div>
  );
}
