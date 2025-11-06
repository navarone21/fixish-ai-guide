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

    // AI particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // Neural network nodes
    const nodes: Array<{ x: number; y: number; pulsePhase: number }> = [];
    for (let i = 0; i < 8; i++) {
      nodes.push({
        x: (canvas.width / 9) * (i + 1),
        y: Math.random() * canvas.height,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrame = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(248, 249, 250, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animationFrame++;

      // Draw AI particles
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

      // Draw AI neural network connections
      ctx.strokeStyle = 'rgba(0, 198, 195, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 10]);
      ctx.lineDashOffset = -animationFrame * 0.5;

      nodes.forEach((node1, i) => {
        if (i < nodes.length - 1) {
          const node2 = nodes[i + 1];
          ctx.beginPath();
          ctx.moveTo(node1.x, node1.y);
          ctx.lineTo(node2.x, node2.y);
          ctx.stroke();

          // Data pulse traveling along connection
          if (animationFrame % 60 < 40) {
            const progress = ((animationFrame % 60) / 60);
            const px = node1.x + (node2.x - node1.x) * progress;
            const py = node1.y + (node2.y - node1.y) * progress;
            
            ctx.fillStyle = 'rgba(0, 198, 195, 0.8)';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();

            const pulseGlow = ctx.createRadialGradient(px, py, 0, px, py, 15);
            pulseGlow.addColorStop(0, 'rgba(0, 198, 195, 0.6)');
            pulseGlow.addColorStop(1, 'rgba(0, 198, 195, 0)');
            ctx.fillStyle = pulseGlow;
            ctx.beginPath();
            ctx.arc(px, py, 15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw neural network nodes
      nodes.forEach((node) => {
        node.pulsePhase += 0.02;
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;

        // Outer glow
        const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
        nodeGlow.addColorStop(0, `rgba(0, 198, 195, ${0.4 * pulse})`);
        nodeGlow.addColorStop(1, 'rgba(0, 198, 195, 0)');
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Core node
        ctx.fillStyle = `rgba(0, 198, 195, ${0.6 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = `rgba(0, 198, 195, ${0.8 * pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.setLineDash([]);

      // Draw connections between nearby particles (AI network effect)
      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 3).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = 0.15 * (1 - distance / 120);
            ctx.strokeStyle = `rgba(0, 198, 195, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

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
      
      {/* AI elements animation */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  );
};
