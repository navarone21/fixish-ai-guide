export default function DirectionalArrow({
  dir,
  x,
  y,
}: {
  dir: "up" | "down" | "left" | "right" | "rotate";
  x: number;
  y: number;
}) {
  let symbol = "↓";
  if (dir === "up") symbol = "↑";
  if (dir === "left") symbol = "←";
  if (dir === "right") symbol = "→";
  if (dir === "rotate") symbol = "⟳";

  return (
    <div
      className="absolute text-yellow-300 font-extrabold animate-bounce pointer-events-none"
      style={{
        fontSize: 45,
        left: x - 20,
        top: y - 20,
        zIndex: 45,
      }}
    >
      {symbol}
    </div>
  );
}
