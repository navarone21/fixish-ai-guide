import { useEffect, useRef, useState } from 'react';

export const RepairWorkshopBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
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

    // Mechanical elements
    const gears = [
      { x: 200, y: 200, size: 80, rotation: 0, speed: 0.01, layer: 1 },
      { x: window.innerWidth - 250, y: 300, size: 120, rotation: Math.PI / 4, speed: -0.008, layer: 2 },
      { x: window.innerWidth / 2 - 200, y: window.innerHeight - 200, size: 100, rotation: 0, speed: 0.012, layer: 1 },
      { x: window.innerWidth - 200, y: window.innerHeight - 250, size: 70, rotation: 0, speed: -0.015, layer: 3 },
    ];

    const circuits = [
      { x: 400, y: window.innerHeight - 300, size: 150, opacity: 0.2, layer: 2 },
      { x: window.innerWidth - 400, y: 200, size: 130, opacity: 0.15, layer: 1 },
    ];

    const tools = [
      { type: 'wrench', x: 300, y: 150, size: 100, opacity: 0, fadeSpeed: 0.005, layer: 2 },
      { type: 'screwdriver', x: window.innerWidth - 350, y: window.innerHeight - 200, size: 90, opacity: 0, fadeSpeed: 0.006, layer: 1 },
      { type: 'roboticArm', x: window.innerWidth / 2 + 300, y: 250, size: 140, opacity: 0, fadeSpeed: 0.004, layer: 3 },
    ];

    // Spark particles
    const sparks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }> = [];

    // Welding flashes
    const flashes: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
    }> = [];

    let animationFrame = 0;

    const createSpark = () => {
      if (Math.random() > 0.97) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        for (let i = 0; i < 5; i++) {
          sparks.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 - 1,
            life: 30,
            maxLife: 30,
          });
        }
      }
    };

    const createFlash = () => {
      if (Math.random() > 0.99) {
        flashes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          opacity: 1,
        });
      }
    };

    const drawGear = (gear: typeof gears[0], parallax: number) => {
      ctx.save();
      ctx.translate(gear.x + mousePosition.x * parallax, gear.y + mousePosition.y * parallax);
      ctx.rotate(gear.rotation);
      
      ctx.strokeStyle = `rgba(0, 198, 195, ${0.2 / gear.layer})`;
      ctx.fillStyle = `rgba(0, 198, 195, ${0.05 / gear.layer})`;
      ctx.lineWidth = 2;

      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, gear.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, gear.size * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Teeth
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * gear.size * 0.85, Math.sin(angle) * gear.size * 0.85);
        ctx.lineTo(Math.cos(angle) * gear.size * 1.15, Math.sin(angle) * gear.size * 1.15);
        ctx.lineTo(Math.cos(angle + 0.1) * gear.size * 1.15, Math.sin(angle + 0.1) * gear.size * 1.15);
        ctx.lineTo(Math.cos(angle + 0.1) * gear.size * 0.85, Math.sin(angle + 0.1) * gear.size * 0.85);
        ctx.closePath();
        ctx.stroke();
      }

      // Holographic shimmer
      const shimmer = ctx.createRadialGradient(0, 0, 0, 0, 0, gear.size);
      shimmer.addColorStop(0, `rgba(255, 255, 255, ${0.1 / gear.layer})`);
      shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shimmer;
      ctx.fillRect(-gear.size, -gear.size, gear.size * 2, gear.size * 2);

      ctx.restore();
    };

    const drawCircuit = (circuit: typeof circuits[0], parallax: number) => {
      ctx.save();
      ctx.translate(circuit.x + mousePosition.x * parallax, circuit.y + mousePosition.y * parallax);
      
      ctx.strokeStyle = `rgba(0, 198, 195, ${circuit.opacity})`;
      ctx.lineWidth = 1.5;

      // Grid pattern
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * circuit.size * 0.15, -circuit.size * 0.5);
        ctx.lineTo(i * circuit.size * 0.15, circuit.size * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-circuit.size * 0.5, i * circuit.size * 0.15);
        ctx.lineTo(circuit.size * 0.5, i * circuit.size * 0.15);
        ctx.stroke();
      }

      // Component nodes
      const pulse = Math.sin(animationFrame * 0.05) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(0, 198, 195, ${circuit.opacity * 0.8 + pulse * 0.2})`;
      [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3], [0, 0]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px * circuit.size, py * circuit.size, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawWrench = (tool: typeof tools[0], parallax: number) => {
      ctx.save();
      ctx.translate(tool.x + mousePosition.x * parallax, tool.y + mousePosition.y * parallax);
      
      ctx.strokeStyle = `rgba(192, 192, 192, ${tool.opacity})`;
      ctx.fillStyle = `rgba(192, 192, 192, ${tool.opacity * 0.3})`;
      ctx.lineWidth = 2;

      // Handle
      ctx.beginPath();
      ctx.rect(-tool.size * 0.5, -tool.size * 0.08, tool.size * 0.7, tool.size * 0.16);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(tool.size * 0.3, 0, tool.size * 0.18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    const drawScrewdriver = (tool: typeof tools[0], parallax: number) => {
      ctx.save();
      ctx.translate(tool.x + mousePosition.x * parallax, tool.y + mousePosition.y * parallax);
      
      ctx.strokeStyle = `rgba(192, 192, 192, ${tool.opacity})`;
      ctx.fillStyle = `rgba(192, 192, 192, ${tool.opacity * 0.3})`;
      ctx.lineWidth = 2;

      // Handle
      ctx.beginPath();
      ctx.ellipse(-tool.size * 0.3, 0, tool.size * 0.2, tool.size * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shaft
      ctx.beginPath();
      ctx.rect(-tool.size * 0.1, -tool.size * 0.05, tool.size * 0.5, tool.size * 0.1);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const drawRoboticArm = (tool: typeof tools[0], parallax: number) => {
      ctx.save();
      ctx.translate(tool.x + mousePosition.x * parallax, tool.y + mousePosition.y * parallax);
      
      const angle = Math.sin(animationFrame * 0.02) * 0.3;
      
      ctx.strokeStyle = `rgba(0, 198, 195, ${tool.opacity})`;
      ctx.fillStyle = `rgba(0, 198, 195, ${tool.opacity * 0.2})`;
      ctx.lineWidth = 2;

      // Base
      ctx.beginPath();
      ctx.rect(-tool.size * 0.15, tool.size * 0.3, tool.size * 0.3, tool.size * 0.15);
      ctx.fill();
      ctx.stroke();

      // First segment
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.rect(-tool.size * 0.08, -tool.size * 0.3, tool.size * 0.16, tool.size * 0.6);
      ctx.fill();
      ctx.stroke();

      // Joint
      ctx.beginPath();
      ctx.arc(0, -tool.size * 0.3, tool.size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Second segment
      ctx.save();
      ctx.translate(0, -tool.size * 0.3);
      ctx.rotate(angle * -0.5);
      ctx.beginPath();
      ctx.rect(-tool.size * 0.06, -tool.size * 0.25, tool.size * 0.12, tool.size * 0.25);
      ctx.fill();
      ctx.stroke();

      // Gripper
      ctx.beginPath();
      ctx.moveTo(-tool.size * 0.08, -tool.size * 0.25);
      ctx.lineTo(-tool.size * 0.12, -tool.size * 0.3);
      ctx.moveTo(tool.size * 0.08, -tool.size * 0.25);
      ctx.lineTo(tool.size * 0.12, -tool.size * 0.3);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrame++;

      // Update and draw gears
      gears.forEach((gear) => {
        gear.rotation += gear.speed;
        const parallax = 0.3 / gear.layer;
        drawGear(gear, parallax);
      });

      // Draw circuits
      circuits.forEach((circuit) => {
        const parallax = 0.4 / circuit.layer;
        drawCircuit(circuit, parallax);
      });

      // Update and draw tools with fade in/out
      tools.forEach((tool) => {
        if (tool.opacity < 0.3 && Math.random() > 0.998) {
          tool.opacity = Math.min(tool.opacity + tool.fadeSpeed, 0.3);
        } else if (tool.opacity > 0) {
          tool.opacity = Math.max(tool.opacity - tool.fadeSpeed * 0.5, 0);
        }

        if (tool.opacity > 0) {
          const parallax = 0.5 / tool.layer;
          if (tool.type === 'wrench') drawWrench(tool, parallax);
          else if (tool.type === 'screwdriver') drawScrewdriver(tool, parallax);
          else if (tool.type === 'roboticArm') drawRoboticArm(tool, parallax);
        }
      });

      // Create and draw sparks
      createSpark();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.1; // Gravity
        spark.life--;

        if (spark.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        const alpha = spark.life / spark.maxLife;
        ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Spark trail
        ctx.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(spark.x - spark.vx * 2, spark.y - spark.vy * 2);
        ctx.stroke();
      }

      // Create and draw welding flashes
      createFlash();
      for (let i = flashes.length - 1; i >= 0; i--) {
        const flash = flashes[i];
        flash.radius += 4;
        flash.opacity -= 0.05;

        if (flash.opacity <= 0) {
          flashes.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
        gradient.addColorStop(0, `rgba(100, 200, 255, ${flash.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(0, 198, 195, ${flash.opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
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
