export default function OcclusionWarning({ occluded }: { occluded: boolean }) {
  if (!occluded) return null;

  return (
    <div className="absolute top-4 left-4 bg-yellow-600 px-3 py-2 text-white rounded-lg text-xs z-50">
      ⚠ Object temporarily blocked — move camera slightly
    </div>
  );
}
