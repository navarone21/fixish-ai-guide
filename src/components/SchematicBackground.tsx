import { useEffect, useRef } from 'react';

export const SchematicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Tool and device outlines
    const schematics = [
      { type: 'gear', x: 100, y: 150, size: 60, rotation: 0, speed: 0.01 },
      { type: 'wrench', x: window.innerWidth - 200, y: 200, size: 80, rotation: 0, speed: 0.005 },
      { type: 'circuit', x: 300, y: window.innerHeight - 200, size: 100, rotation: 0, speed: 0.008 },
      { type: 'gear', x: window.innerWidth - 150, y: window.innerHeight - 150, size: 50, rotation: 0, speed: -0.012 },
    ];

    // Data flow particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // Circuit path nodes
    const circuitNodes: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 8; i++) {
      circuitNodes.push({
        x: (window.innerWidth / 9) * (i + 1),
        y: Math.random() * window.innerHeight,
      });
    }

    let animationFrame = 0;

    const drawGear = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Outer circle
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Teeth
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * size * 0.8, Math.sin(angle) * size * 0.8);
        ctx.lineTo(Math.cos(angle) * size * 1.1, Math.sin(angle) * size * 1.1);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawWrench = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.25)';
      ctx.lineWidth = 2;

      // Handle
      ctx.beginPath();
      ctx.moveTo(-size * 0.6, 0);
      ctx.lineTo(size * 0.3, 0);
      ctx.stroke();

      // Wrench head
      ctx.beginPath();
      ctx.arc(size * 0.4, 0, size * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.3, -size * 0.1);
      ctx.lineTo(size * 0.5, -size * 0.15);
      ctx.lineTo(size * 0.5, size * 0.15);
      ctx.lineTo(size * 0.3, size * 0.1);
      ctx.stroke();

      ctx.restore();
    };

    const drawCircuitBoard = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.2)';
      ctx.lineWidth = 1.5;

      // Grid pattern
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size * 0.2, -size * 0.4);
        ctx.lineTo(i * size * 0.2, size * 0.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-size * 0.4, i * size * 0.2);
        ctx.lineTo(size * 0.4, i * size * 0.2);
        ctx.stroke();
      }

      // Component nodes
      const pulse = Math.sin(animationFrame * 0.05) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(0, 198, 195, ${0.4 + pulse * 0.3})`;
      [
        [-0.3, -0.3],
        [0.3, -0.3],
        [-0.3, 0.3],
        [0.3, 0.3],
        [0, 0],
      ].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px * size, py * size, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(248, 249, 250, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animationFrame++;

      // Draw and animate schematics
      schematics.forEach((schematic) => {
        schematic.rotation += schematic.speed;

        if (schematic.type === 'gear') {
          drawGear(schematic.x, schematic.y, schematic.size, schematic.rotation);
        } else if (schematic.type === 'wrench') {
          drawWrench(schematic.x, schematic.y, schematic.size, schematic.rotation);
        } else if (schematic.type === 'circuit') {
          drawCircuitBoard(schematic.x, schematic.y, schematic.size);
        }
      });

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Particle glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `rgba(0, 198, 195, ${particle.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 198, 195, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(0, 198, 195, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw circuit paths with data flow
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.lineDashOffset = -animationFrame * 0.5;

      for (let i = 0; i < circuitNodes.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(circuitNodes[i].x, circuitNodes[i].y);
        ctx.lineTo(circuitNodes[i + 1].x, circuitNodes[i + 1].y);
        ctx.stroke();

        // Pulsing data point
        if (animationFrame % 60 < 30) {
          const progress = ((animationFrame % 60) / 60);
          const px = circuitNodes[i].x + (circuitNodes[i + 1].x - circuitNodes[i].x) * progress;
          const py = circuitNodes[i].y + (circuitNodes[i + 1].y - circuitNodes[i].y) * progress;
          
          ctx.fillStyle = 'rgba(0, 198, 195, 0.8)';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();

          // Glow around data point
          const pointGlow = ctx.createRadialGradient(px, py, 0, px, py, 10);
          pointGlow.addColorStop(0, 'rgba(0, 198, 195, 0.6)');
          pointGlow.addColorStop(1, 'rgba(0, 198, 195, 0)');
          ctx.fillStyle = pointGlow;
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.setLineDash([]);

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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 0 }}
    />
  );
};
