import { useEffect, useRef, useState } from 'react';

export const EnergyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Light particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      phase: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Energy waves
    const waves: Array<{
      y: number;
      amplitude: number;
      frequency: number;
      speed: number;
      offset: number;
    }> = [
      { y: canvas.height * 0.3, amplitude: 40, frequency: 0.003, speed: 0.02, offset: 0 },
      { y: canvas.height * 0.5, amplitude: 60, frequency: 0.002, speed: 0.015, offset: Math.PI },
      { y: canvas.height * 0.7, amplitude: 50, frequency: 0.0025, speed: 0.018, offset: Math.PI / 2 },
    ];

    // Neural pulses
    const pulses: Array<{ x: number; y: number; radius: number; maxRadius: number; opacity: number }> = [];

    let animationFrame = 0;

    const createPulse = () => {
      if (Math.random() > 0.98) {
        pulses.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: 100 + Math.random() * 100,
          opacity: 0.5,
        });
      }
    };

    const drawWave = (wave: typeof waves[0]) => {
      ctx.beginPath();
      ctx.moveTo(0, wave.y);

      for (let x = 0; x <= canvas.width; x += 5) {
        const y = wave.y + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = 'rgba(0, 198, 195, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gradient fill below wave
      const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude);
      gradient.addColorStop(0, 'rgba(0, 198, 195, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 198, 195, 0)');
      ctx.fillStyle = gradient;
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrame++;

      // Apply parallax offset
      ctx.save();
      ctx.translate(mousePosition.x * 0.3, mousePosition.y * 0.3);

      // Update and draw waves
      waves.forEach((wave) => {
        wave.offset += wave.speed;
        drawWave(wave);
      });

      ctx.restore();

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.phase += 0.02;

        const breathe = Math.sin(particle.phase) * 0.3 + 0.7;

        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4 * breathe
        );
        gradient.addColorStop(0, `rgba(0, 198, 195, ${particle.opacity * breathe})`);
        gradient.addColorStop(0.5, `rgba(0, 198, 195, ${particle.opacity * 0.5 * breathe})`);
        gradient.addColorStop(1, 'rgba(0, 198, 195, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4 * breathe, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(0, 198, 195, ${particle.opacity + 0.3})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * breathe, 0, Math.PI * 2);
        ctx.fill();
      });

      // Create and update neural pulses
      createPulse();
      
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += 2;
        pulse.opacity -= 0.01;

        if (pulse.opacity <= 0 || pulse.radius >= pulse.maxRadius) {
          pulses.splice(i, 1);
          continue;
        }

        // Draw expanding ring
        ctx.strokeStyle = `rgba(0, 198, 195, ${pulse.opacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        const pulseGradient = ctx.createRadialGradient(
          pulse.x, pulse.y, 0,
          pulse.x, pulse.y, pulse.radius
        );
        pulseGradient.addColorStop(0, `rgba(0, 198, 195, ${pulse.opacity * 0.3})`);
        pulseGradient.addColorStop(1, 'rgba(0, 198, 195, 0)');
        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
