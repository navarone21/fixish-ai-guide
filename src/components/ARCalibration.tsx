interface ARCalibrationProps {
  pitch: number;
  roll: number;
  yaw: number;
}

export function ARCalibration({ pitch, roll, yaw }: ARCalibrationProps) {
  return (
    <div className="fixed top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
      <div>Pitch: {pitch.toFixed(1)}°</div>
      <div>Roll: {roll.toFixed(1)}°</div>
      <div>Yaw: {yaw.toFixed(1)}°</div>
      <p className="text-[10px] opacity-60 mt-1">IMU Stabilization Active</p>
    </div>
  );
}
