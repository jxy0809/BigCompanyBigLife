import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface EffectsCanvasHandle {
  spawnText: (x: number, y: number, text: string, color: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  velocity: number;
  life: number;
}

const EffectsCanvas = forwardRef<EffectsCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameIdRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    spawnText: (x, y, text, color) => {
      particlesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        text,
        color,
        velocity: 1 + Math.random() * 0.8,
        life: 1.0,
      });
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Filter dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      particlesRef.current.forEach(p => {
        p.y -= p.velocity;
        p.life -= 0.02; // Fade speed
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.font = "bold 16px 'Noto Sans SC', sans-serif";
        ctx.fillStyle = p.color;
        // Outline for readability
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      });

      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
});

export default EffectsCanvas;