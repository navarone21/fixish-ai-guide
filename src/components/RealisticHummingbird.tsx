import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import hummingbirdImg from '@/assets/hummingbird-realistic.png';

export const RealisticHummingbird = () => {
  const [position, setPosition] = useState({ x: -200, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationTime = useRef(0);
  const animationRef = useRef<number>();
  const trailRef = useRef<Array<{ x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setMousePosition({
        x: ((e.clientX - centerX) / centerX) * 15,
        y: ((e.clientY - centerY) / centerY) * 15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      animationTime.current += 0.008;
      const t = animationTime.current;

      // Smooth figure-8 flight path
      const pathX = Math.sin(t * 0.8) * 250 + Math.cos(t * 0.4) * 100;
      const pathY = Math.sin(t * 1.6) * 120 + Math.sin(t * 0.6) * 60;

      // Subtle cursor influence
      const influenceX = mousePosition.x * 0.4;
      const influenceY = mousePosition.y * 0.4;

      const newX = pathX + influenceX;
      const newY = pathY + influenceY;

      setPosition({ x: newX, y: newY });

      // Update trail
      trailRef.current.unshift({ x: newX, y: newY, opacity: 0.6 });
      if (trailRef.current.length > 15) {
        trailRef.current.pop();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <>
      {/* Particle trail */}
      {trailRef.current.map((point, index) => (
        <motion.div
          key={`trail-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '35%',
            x: point.x,
            y: point.y,
            width: 8 - index * 0.4,
            height: 8 - index * 0.4,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0, 198, 195, ${point.opacity - index * 0.04}) 0%, rgba(0, 198, 195, 0) 70%)`,
            boxShadow: `0 0 ${12 - index}px rgba(0, 198, 195, ${point.opacity - index * 0.04})`,
          }}
        />
      ))}

      {/* Hummingbird */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          x: position.x,
          y: position.y,
          left: '50%',
          top: '35%',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotateZ: Math.sin(animationTime.current * 2) * 5,
        }}
        transition={{ 
          opacity: { duration: 1.5 },
          scale: { duration: 1 },
          rotateZ: { duration: 0.3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="relative">
          {/* Glow effect */}
          <div
            className="absolute inset-0 blur-xl opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(0, 198, 195, 0.6) 0%, rgba(0, 198, 195, 0) 70%)',
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Hummingbird image with motion blur effect */}
          <img
            src={hummingbirdImg}
            alt="Hummingbird"
            className="relative w-32 h-32 object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(0, 198, 195, 0.6)) contrast(1.1) saturate(1.2)',
            }}
          />

          {/* Wing blur overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 198, 195, 0.3) 0%, transparent 60%)',
              animation: 'wing-flap 0.15s ease-in-out infinite',
            }}
          />
        </div>
      </motion.div>

      <style>{`
        @keyframes wing-flap {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50% { opacity: 0.5; transform: scaleX(1.1); }
        }
      `}</style>
    </>
  );
};
