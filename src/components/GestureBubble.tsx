export default function GestureBubble({ gesture }: { gesture: string | null }) {
  if (!gesture) return null;

  return (
    <div className="absolute top-4 right-4 bg-black/60 text-white 
                    px-4 py-2 rounded-xl text-sm font-semibold z-50">
      ✋ Gesture: {gesture}
    </div>
  );
}
