import { useEffect, useState } from "react";

interface Props {
  message: string | null;
}

export default function GuidanceOverlay({ message }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 
                    bg-black/60 text-white text-sm font-medium rounded-xl 
                    shadow-lg backdrop-blur-md animate-in fade-in duration-300">
      {message}
    </div>
  );
}
