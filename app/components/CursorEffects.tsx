'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

export default function CursorEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const rippleRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = mouseRef.current;
      mouseRef.current.prevX = x;
      mouseRef.current.prevY = y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Calculate velocity for particle generation
      const dx = mouseRef.current.x - mouseRef.current.prevX;
      const dy = mouseRef.current.y - mouseRef.current.prevY;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      // Generate particles based on velocity
      if (velocity > 2) {
        for (let i = 0; i < Math.min(velocity / 10, 3); i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 20,
            y: e.clientY + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            maxLife: 1,
            hue: 200 + Math.random() * 60, // Blue to purple
          });
        }
      }
    };

    // Click handler for ripple effect
    const handleClick = (e: MouseEvent) => {
      rippleRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        alpha: 0.8,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw cursor glow
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        50
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(
        mouseRef.current.x - 50,
        mouseRef.current.y - 50,
        100,
        100
      );

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;

        if (particle.life <= 0) return false;

        const alpha = particle.life;
        const size = 2 + (1 - particle.life) * 2;

        // Draw particle with glow
        const particleGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          size * 3
        );
        particleGradient.addColorStop(
          0,
          `hsla(${particle.hue}, 100%, 70%, ${alpha})`
        );
        particleGradient.addColorStop(
          0.5,
          `hsla(${particle.hue}, 100%, 60%, ${alpha * 0.5})`
        );
        particleGradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);

        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Update and draw ripples
      rippleRef.current = rippleRef.current.filter((ripple) => {
        ripple.radius += 4;
        ripple.alpha -= 0.015;

        if (ripple.alpha <= 0) return false;

        // Holographic ripple effect
        ctx.strokeStyle = `rgba(139, 92, 246, ${ripple.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(167, 139, 250, ${ripple.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius - 2, 0, Math.PI * 2);
        ctx.stroke();

        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
