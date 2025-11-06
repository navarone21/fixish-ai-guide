import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const AnimatedHummingbird = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationTime = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      animationTime.current += 0.01;
      const t = animationTime.current;

      // Figure-8 pattern
      const baseX = Math.sin(t * 0.7) * 150;
      const baseY = Math.sin(t * 1.4) * 80;

      // Add subtle cursor influence
      const influenceX = mousePosition.x * 0.3;
      const influenceY = mousePosition.y * 0.3;

      setPosition({
        x: baseX + influenceX,
        y: baseY + influenceY,
      });

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
    <motion.div
      className="absolute pointer-events-none"
      style={{
        x: position.x,
        y: position.y,
        left: '50%',
        top: '30%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="drop-shadow-lg"
      >
        {/* Hummingbird body */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00c6c3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#008f8d" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="glowGradient">
            <stop offset="0%" stopColor="#00c6c3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00c6c3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow effect */}
        <ellipse cx="60" cy="60" rx="40" ry="30" fill="url(#glowGradient)" opacity="0.5">
          <animate
            attributeName="rx"
            values="40;45;40"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="30;35;30"
            dur="1s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Left wing */}
        <path
          d="M 45 55 Q 25 45 20 35 Q 15 25 25 20 Q 35 25 40 35 Q 43 45 45 55"
          fill="url(#bodyGradient)"
          opacity="0.7"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 45 55; -15 45 55; 0 45 55"
            dur="0.3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Right wing */}
        <path
          d="M 75 55 Q 95 45 100 35 Q 105 25 95 20 Q 85 25 80 35 Q 77 45 75 55"
          fill="url(#bodyGradient)"
          opacity="0.7"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 75 55; 15 75 55; 0 75 55"
            dur="0.3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Body */}
        <ellipse cx="60" cy="60" rx="12" ry="20" fill="url(#bodyGradient)" />

        {/* Head */}
        <circle cx="60" cy="45" r="8" fill="url(#bodyGradient)" />

        {/* Beak */}
        <path
          d="M 60 42 L 58 32 L 60 40 L 62 32 Z"
          fill="#30343f"
        />

        {/* Eye */}
        <circle cx="62" cy="43" r="2" fill="#0c0d11" />
        <circle cx="62.5" cy="42.5" r="0.8" fill="#ffffff" opacity="0.8" />

        {/* Tail feathers */}
        <path
          d="M 60 75 Q 55 85 52 90 Q 55 88 60 80 Q 65 88 68 90 Q 65 85 60 75"
          fill="url(#bodyGradient)"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 60 75; -5 60 75; 5 60 75; 0 60 75"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Subtle shimmer effect */}
        <ellipse cx="65" cy="55" rx="4" ry="8" fill="#ffffff" opacity="0.2">
          <animate
            attributeName="opacity"
            values="0.2;0.4;0.2"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    </motion.div>
  );
};
