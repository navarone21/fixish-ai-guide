import { motion } from "framer-motion";

interface HeartbeatBackgroundProps {
  isActive?: boolean;
  intensity?: 'idle' | 'processing' | 'active';
}

export function HeartbeatBackground({ isActive = false, intensity = 'idle' }: HeartbeatBackgroundProps) {
  const pulseScale = intensity === 'processing' ? [1, 1.15, 1] : intensity === 'active' ? [1, 1.08, 1] : [1, 1.03, 1];
  const pulseDuration = intensity === 'processing' ? 1.5 : intensity === 'active' ? 3 : 6;
  const gridOpacity = intensity === 'processing' ? 0.08 : intensity === 'active' ? 0.06 : 0.03;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated grid - pulses with activity */}
      <motion.div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
        animate={isActive ? { 
          opacity: [0.5, 1, 0.5],
        } : {}}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Center radial glow - heartbeat */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)' }}
        animate={{ 
          scale: pulseScale, 
          opacity: intensity === 'processing' ? [0.4, 0.8, 0.4] : [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary ring pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: pulseDuration * 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Floating particles - respond to activity */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{ 
            left: `${10 + (i * 8) % 80}%`, 
            top: `${15 + (i * 13) % 70}%` 
          }}
          animate={{ 
            y: [0, -40 - (i % 3) * 20, 0],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            opacity: intensity === 'processing' ? [0.3, 0.8, 0.3] : [0.15, 0.4, 0.15],
            scale: intensity === 'processing' ? [1, 1.5, 1] : [1, 1.2, 1]
          }}
          transition={{ 
            duration: 3 + (i % 4), 
            repeat: Infinity, 
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Corner accent glows */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96"
        style={{ background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.04) 0%, transparent 60%)' }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96"
        style={{ background: 'radial-gradient(circle at bottom left, hsl(var(--primary) / 0.03) 0%, transparent 60%)' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Scan line effect when processing */}
      {intensity === 'processing' && (
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}
