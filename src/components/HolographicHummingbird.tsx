import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const HolographicHummingbird = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: -200, y: 0 });
  const animationTime = useRef(0);
  const animationRef = useRef<number>();
  const [phase, setPhase] = useState<'entering' | 'hovering' | 'exiting'>('entering');

  useEffect(() => {
    // Delay before hummingbird appears
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animate = () => {
      animationTime.current += 0.01;
      const t = animationTime.current;

      if (phase === 'entering') {
        // Fly in from left
        const progress = Math.min(t / 3, 1);
        setPosition({
          x: -200 + progress * 400,
          y: Math.sin(progress * Math.PI * 2) * 30,
        });

        if (progress >= 1) {
          setPhase('hovering');
          animationTime.current = 0;
        }
      } else if (phase === 'hovering') {
        // Hover in place with figure-8 motion
        setPosition({
          x: 200 + Math.sin(t * 2) * 30,
          y: Math.sin(t * 4) * 20,
        });

        if (t > 4) {
          setPhase('exiting');
          animationTime.current = 0;
        }
      } else if (phase === 'exiting') {
        // Fly out to right
        const progress = Math.min(t / 2, 1);
        setPosition({
          x: 200 + progress * 600,
          y: Math.sin(progress * Math.PI) * 40,
        });

        if (progress >= 1) {
          setPhase('entering');
          animationTime.current = 0;
          setPosition({ x: -200, y: 0 });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, phase]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        x: position.x,
        y: position.y,
        left: '30%',
        top: '25%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ duration: 1 }}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c6c3" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00fff2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00c6c3" stopOpacity="0.8" />
          </linearGradient>
          
          <filter id="holographicGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Holographic glow aura */}
        <ellipse cx="50" cy="50" rx="35" ry="25" fill="url(#holoGradient)" opacity="0.3">
          <animate
            attributeName="rx"
            values="35;40;35"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="25;30;25"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Left wing (holographic) */}
        <g filter="url(#holographicGlow)">
          <path
            d="M 40 45 Q 20 35 15 25 Q 10 15 20 12 Q 30 18 35 30 Q 38 40 40 45"
            fill="url(#holoGradient)"
            opacity="0.7"
            stroke="#00fff2"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 40 45; -20 40 45; 0 40 45"
              dur="0.2s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Right wing (holographic) */}
        <g filter="url(#holographicGlow)">
          <path
            d="M 60 45 Q 80 35 85 25 Q 90 15 80 12 Q 70 18 65 30 Q 62 40 60 45"
            fill="url(#holoGradient)"
            opacity="0.7"
            stroke="#00fff2"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 60 45; 20 60 45; 0 60 45"
              dur="0.2s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Body (holographic) */}
        <ellipse 
          cx="50" 
          cy="50" 
          rx="10" 
          ry="16" 
          fill="url(#holoGradient)" 
          filter="url(#holographicGlow)"
          stroke="#00fff2"
          strokeWidth="0.5"
        />

        {/* Head (holographic) */}
        <circle 
          cx="50" 
          cy="38" 
          r="7" 
          fill="url(#holoGradient)" 
          filter="url(#holographicGlow)"
          stroke="#00fff2"
          strokeWidth="0.5"
        />

        {/* Beak (holographic) */}
        <path
          d="M 50 35 L 48 26 L 50 33 L 52 26 Z"
          fill="#00fff2"
          opacity="0.8"
          filter="url(#holographicGlow)"
        />

        {/* Energy trail particles */}
        <circle cx="35" cy="50" r="2" fill="#00c6c3" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="48" r="1.5" fill="#00c6c3" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="25" cy="51" r="1" fill="#00fff2" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.9s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
};
