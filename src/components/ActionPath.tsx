export default function ActionPath({ path }: { path: { x: number; y: number }[] }) {
  return (
    <>
      {path.map((p, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            width: 10,
            height: 10,
            left: p.x - 5,
            top: p.y - 5,
            zIndex: 35,
            opacity: i / path.length,
          }}
        />
      ))}
    </>
  );
}
