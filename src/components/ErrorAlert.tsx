export default function ErrorAlert({ errors }: { errors: string[] }) {
  if (!errors || !errors.length) return null;

  const latest = errors[errors.length - 1];

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 
                    bg-red-700 text-white px-4 py-2 rounded-lg
                    shadow-lg text-sm animate-pulse z-50">
      {latest}
    </div>
  );
}
