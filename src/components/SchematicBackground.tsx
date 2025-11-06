import { useEffect, useRef } from 'react';
import repairBg from '@/assets/repair-background.jpg';

export const SchematicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Bouncing screw
    const screw = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 2,
      vy: 1.5,
      size: 40,
      rotation: 0,
    };

    const drawScrew = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.6)';
      ctx.fillStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 2.5;

      // Hex head
      const sides = 6;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * size * 0.5;
        const py = Math.sin(angle) * size * 0.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner hex detail
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * size * 0.25;
        const py = Math.sin(angle) * size * 0.25;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Thread shaft
      ctx.fillStyle = 'rgba(0, 198, 195, 0.25)';
      ctx.beginPath();
      ctx.rect(-size * 0.2, size * 0.5, size * 0.4, size * 1.2);
      ctx.fill();
      ctx.stroke();

      // Thread lines
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.4)';
      for (let i = 0; i < 6; i++) {
        const y = size * 0.6 + i * size * 0.18;
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, y);
        ctx.lineTo(size * 0.2, y);
        ctx.stroke();
      }

      // Glow effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
      gradient.addColorStop(0, 'rgba(0, 198, 195, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 198, 195, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update screw position
      screw.x += screw.vx;
      screw.y += screw.vy;

      // Bounce off edges
      if (screw.x <= screw.size || screw.x >= canvas.width - screw.size) {
        screw.vx *= -1;
        screw.rotation += Math.PI / 4;
      }
      if (screw.y <= screw.size || screw.y >= canvas.height - screw.size) {
        screw.vy *= -1;
        screw.rotation += Math.PI / 4;
      }

      // Rotate screw as it moves
      screw.rotation += 0.02;

      drawScrew(screw.x, screw.y, screw.size, screw.rotation);

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
  }, []);

  return (
    <>
      {/* Grayed out repair background image */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `url(${repairBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)',
          zIndex: 0,
        }}
      />
      
      {/* Bouncing screw animation */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  );
};
