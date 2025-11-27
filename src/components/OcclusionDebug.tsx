import { convertMaskToPNG } from "@/utils/maskToPNG";

export default function OcclusionDebug({ mask }: { mask: number[][] | null }) {
  if (!mask) return null;

  return (
    <img
      src={`data:image/png;base64,${convertMaskToPNG(mask)}`}
      alt="Occlusion Debug"
      className="absolute top-0 left-0 opacity-30 pointer-events-none"
    />
  );
}
