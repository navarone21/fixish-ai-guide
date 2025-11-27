interface Step {
  description: string;
  completed: boolean;
}

interface Props {
  sequence: Step[] | null | undefined;
}

export default function StepSequencePanel({ sequence }: Props) {
  if (!sequence) return null;

  return (
    <div className="absolute bottom-0 w-full bg-black/40 backdrop-blur-xl text-white p-4 z-50 pointer-events-none">
      {sequence.map((step, i) => (
        <div
          key={i}
          className={`p-3 rounded-md mb-2 ${
            step.completed ? "bg-green-700/60" : "bg-white/10"
          }`}
        >
          <p className="text-sm">
            {i + 1}. {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
