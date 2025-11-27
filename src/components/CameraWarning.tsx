export default function CameraWarning({ alive }: { alive: boolean }) {
  if (alive) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600 
                    text-white px-4 py-2 rounded-lg shadow z-50">
      ⚠ Camera stalled — switching to backup.
    </div>
  );
}
