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

    // Enhanced repair tool schematics
    const schematics = [
      { type: 'screwdriver', x: 150, y: 180, size: 80, rotation: 0.3, speed: 0.003 },
      { type: 'wrench', x: window.innerWidth - 200, y: 200, size: 90, rotation: -0.5, speed: 0.004 },
      { type: 'gear', x: 200, y: window.innerHeight - 250, size: 70, rotation: 0, speed: 0.015 },
      { type: 'bolt', x: window.innerWidth - 180, y: window.innerHeight - 200, size: 40, rotation: 0, speed: -0.02 },
      { type: 'pliers', x: window.innerWidth / 2 - 300, y: 250, size: 85, rotation: 0.8, speed: 0.002 },
      { type: 'circuit', x: window.innerWidth / 2 + 250, y: window.innerHeight - 300, size: 110, rotation: 0, speed: 0.006 },
      { type: 'gear', x: window.innerWidth - 280, y: 350, size: 55, rotation: 0, speed: -0.018 },
      { type: 'spring', x: 280, y: window.innerHeight / 2, size: 60, rotation: 0, speed: 0.008 },
      { type: 'ruler', x: window.innerWidth / 2 + 100, y: 180, size: 100, rotation: 0.4, speed: 0.001 },
    ];

    // Enhanced data flow particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    // Measurement indicators
    const measurements = [
      { x: 350, y: 400, width: 120, label: '45°' },
      { x: window.innerWidth - 380, y: 450, width: 80, label: '10mm' },
      { x: window.innerWidth / 2, y: window.innerHeight - 150, width: 100, label: '5V' },
    ];

    let animationFrame = 0;

    const drawGear = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      // Gear teeth with more detail
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * size * 0.85, Math.sin(angle) * size * 0.85);
        ctx.lineTo(Math.cos(angle) * size * 1.15, Math.sin(angle) * size * 1.15);
        ctx.lineTo(Math.cos(angle + 0.1) * size * 1.15, Math.sin(angle + 0.1) * size * 1.15);
        ctx.lineTo(Math.cos(angle + 0.1) * size * 0.85, Math.sin(angle + 0.1) * size * 0.85);
        ctx.closePath();
        ctx.stroke();
      }

      // Center hole
      ctx.fillStyle = 'rgba(0, 198, 195, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawScrewdriver = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 2;

      // Handle
      ctx.beginPath();
      ctx.ellipse(-size * 0.4, 0, size * 0.25, size * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 198, 195, 0.15)';
      ctx.fill();

      // Shaft
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, -size * 0.08);
      ctx.lineTo(size * 0.4, -size * 0.05);
      ctx.lineTo(size * 0.4, size * 0.05);
      ctx.lineTo(-size * 0.15, size * 0.08);
      ctx.closePath();
      ctx.stroke();

      // Tip (flathead)
      ctx.beginPath();
      ctx.moveTo(size * 0.4, -size * 0.05);
      ctx.lineTo(size * 0.5, -size * 0.03);
      ctx.lineTo(size * 0.5, size * 0.03);
      ctx.lineTo(size * 0.4, size * 0.05);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 198, 195, 0.2)';
      ctx.fill();

      ctx.restore();
    };

    const drawWrench = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 2.5;

      // Handle
      ctx.beginPath();
      ctx.moveTo(-size * 0.6, -size * 0.08);
      ctx.lineTo(size * 0.2, -size * 0.08);
      ctx.lineTo(size * 0.2, size * 0.08);
      ctx.lineTo(-size * 0.6, size * 0.08);
      ctx.closePath();
      ctx.stroke();

      // Jaw opening
      ctx.beginPath();
      ctx.arc(size * 0.35, 0, size * 0.18, 0, Math.PI * 2);
      ctx.stroke();

      // Adjustable jaw
      ctx.beginPath();
      ctx.moveTo(size * 0.2, -size * 0.12);
      ctx.lineTo(size * 0.45, -size * 0.18);
      ctx.lineTo(size * 0.5, -size * 0.1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.2, size * 0.12);
      ctx.lineTo(size * 0.45, size * 0.18);
      ctx.lineTo(size * 0.5, size * 0.1);
      ctx.stroke();

      ctx.restore();
    };

    const drawPliers = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 2;

      // Upper jaw
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, -size * 0.05);
      ctx.lineTo(size * 0.3, -size * 0.05);
      ctx.lineTo(size * 0.4, -size * 0.15);
      ctx.lineTo(size * 0.5, -size * 0.1);
      ctx.stroke();

      // Lower jaw
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, size * 0.05);
      ctx.lineTo(size * 0.3, size * 0.05);
      ctx.lineTo(size * 0.4, size * 0.15);
      ctx.lineTo(size * 0.5, size * 0.1);
      ctx.stroke();

      // Pivot point
      ctx.fillStyle = 'rgba(0, 198, 195, 0.4)';
      ctx.beginPath();
      ctx.arc(size * 0.3, 0, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Handles
      ctx.beginPath();
      ctx.arc(-size * 0.4, -size * 0.05, size * 0.12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-size * 0.4, size * 0.05, size * 0.12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    const drawBolt = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.35)';
      ctx.lineWidth = 2;

      // Hex head
      const sides = 6;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * size * 0.4;
        const py = Math.sin(angle) * size * 0.4;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Thread shaft
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, size * 0.4);
      ctx.lineTo(-size * 0.15, size * 0.9);
      ctx.lineTo(size * 0.15, size * 0.9);
      ctx.lineTo(size * 0.15, size * 0.4);
      ctx.stroke();

      // Thread lines
      for (let i = 0; i < 5; i++) {
        const y = size * 0.5 + i * size * 0.1;
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, y);
        ctx.lineTo(size * 0.15, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawSpring = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 2;

      // Spring coils
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const y = (i / 10) * size - size / 2;
        const x = Math.sin(i * Math.PI) * size * 0.3;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();
    };

    const drawRuler = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.25)';
      ctx.lineWidth = 2;

      // Main body
      ctx.beginPath();
      ctx.rect(-size * 0.5, -size * 0.1, size, size * 0.2);
      ctx.stroke();

      // Measurement marks
      for (let i = 0; i <= 10; i++) {
        const x = -size * 0.5 + (i / 10) * size;
        const markHeight = i % 5 === 0 ? size * 0.15 : size * 0.1;
        ctx.beginPath();
        ctx.moveTo(x, -size * 0.1);
        ctx.lineTo(x, -size * 0.1 - markHeight);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawCircuitBoard = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.25)';
      ctx.lineWidth = 1.5;

      // Grid pattern
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size * 0.15, -size * 0.5);
        ctx.lineTo(i * size * 0.15, size * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-size * 0.5, i * size * 0.15);
        ctx.lineTo(size * 0.5, i * size * 0.15);
        ctx.stroke();
      }

      // Component nodes with pulsing
      const pulse = Math.sin(animationFrame * 0.05) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(0, 198, 195, ${0.4 + pulse * 0.3})`;
      const nodes = [
        [-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35],
        [0, 0], [-0.2, 0], [0.2, 0], [0, -0.2], [0, 0.2]
      ];
      nodes.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px * size, py * size, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Node glow
        const glow = ctx.createRadialGradient(px * size, py * size, 0, px * size, py * size, 8);
        glow.addColorStop(0, `rgba(0, 198, 195, ${0.3 * pulse})`);
        glow.addColorStop(1, 'rgba(0, 198, 195, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px * size, py * size, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawMeasurement = (x: number, y: number, width: number, label: string) => {
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.3)';
      ctx.lineWidth = 1;
      
      // Measurement line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();

      // End markers
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.moveTo(x + width, y - 5);
      ctx.lineTo(x + width, y + 5);
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(0, 198, 195, 0.6)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + width / 2, y - 10);
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(248, 249, 250, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animationFrame++;

      // Draw and animate schematics
      schematics.forEach((schematic) => {
        schematic.rotation += schematic.speed;

        switch (schematic.type) {
          case 'gear':
            drawGear(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'wrench':
            drawWrench(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'screwdriver':
            drawScrewdriver(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'pliers':
            drawPliers(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'bolt':
            drawBolt(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'spring':
            drawSpring(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'ruler':
            drawRuler(schematic.x, schematic.y, schematic.size, schematic.rotation);
            break;
          case 'circuit':
            drawCircuitBoard(schematic.x, schematic.y, schematic.size);
            break;
        }
      });

      // Draw measurements
      measurements.forEach((m) => {
        drawMeasurement(m.x, m.y, m.width, m.label);
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

        ctx.fillStyle = `rgba(0, 198, 195, ${particle.opacity + 0.2})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw enhanced connections with data flow
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.lineDashOffset = -animationFrame * 0.5;

      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 4).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Traveling data point
            if (animationFrame % 60 < 30) {
              const progress = ((animationFrame % 60) / 60);
              const px = p1.x + (p2.x - p1.x) * progress;
              const py = p1.y + (p2.y - p1.y) * progress;
              
              ctx.fillStyle = 'rgba(0, 198, 195, 0.9)';
              ctx.beginPath();
              ctx.arc(px, py, 3, 0, Math.PI * 2);
              ctx.fill();

              const pointGlow = ctx.createRadialGradient(px, py, 0, px, py, 12);
              pointGlow.addColorStop(0, 'rgba(0, 198, 195, 0.6)');
              pointGlow.addColorStop(1, 'rgba(0, 198, 195, 0)');
              ctx.fillStyle = pointGlow;
              ctx.beginPath();
              ctx.arc(px, py, 12, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      });

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
