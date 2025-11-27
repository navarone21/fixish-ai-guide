export default function StepCompletedBubble({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 
        bg-green-600 text-white px-4 py-3 rounded-xl text-lg
        animate-bounce shadow-xl z-50">
      ✅ Step Completed!
    </div>
  );
}
