export default function HazardAlert({ hazards }: { hazards: string[] }) {
  if (!hazards.length) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-600/80
                    text-white px-4 py-2 rounded-xl text-sm font-semibold 
                    animate-pulse z-50 pointer-events-none">
      {hazards[hazards.length - 1]}
    </div>
  );
}
