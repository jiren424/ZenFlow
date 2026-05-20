import { useEffect, useRef } from 'react';

/**
 * Composant GenerativeBackground
 * Affiche un arrière-plan animé avec des orbes de couleur fluides utilisant HTML5 Canvas.
 * S'adapte au thème (clair/sombre) pour une expérience zen et spectaculaire.
 */
export default function GenerativeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;

    // Définition des orbes
    interface Orb {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
    }

    const orbs: Orb[] = [];
    const orbCount = 12;

    const getColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        return [
          'rgba(14, 165, 233, 0.6)', // Cyan
          'rgba(168, 85, 247, 0.6)', // Purple
          'rgba(236, 72, 153, 0.6)', // Pink
          'rgba(34, 197, 94, 0.5)',  // Green
          'rgba(59, 130, 246, 0.6)', // Blue
        ];
      } else {
        return [
          'rgba(2, 132, 199, 0.4)',  // Blue
          'rgba(147, 51, 234, 0.4)', // Purple
          'rgba(219, 39, 119, 0.4)', // Pink
          'rgba(22, 163, 74, 0.3)',  // Green
          'rgba(37, 99, 235, 0.4)',  // Royal Blue
        ];
      }
    };

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const initOrbs = () => {
      const colors = getColors();
      orbs.length = 0;
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * (width * 0.4) + width * 0.2,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          color: colors[i % colors.length],
        });
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initOrbs();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      // Utilisation d'un fond légèrement teinté pour que les orbes se détachent mieux
      ctx.fillStyle = isDark ? '#0a0a0c' : '#fcfcfc'; 
      ctx.fillRect(0, 0, width, height);

      orbs.forEach((orb, i) => {
        // Mouvement oscillatoire
        const timeFactor = time * 0.0005;
        const xOffset = Math.sin(timeFactor + i) * 50;
        const yOffset = Math.cos(timeFactor + i * 1.5) * 50;

        orb.x += orb.vx;
        orb.y += orb.vy;

        // Limites souples
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        const currentX = orb.x + xOffset;
        const currentY = orb.y + yOffset;

        // Dessin de l'orbe
        const gradient = ctx.createRadialGradient(
          currentX, currentY, 0, 
          currentX, currentY, orb.radius
        );
        
        gradient.addColorStop(0, orb.color);
        const rgb = orb.color.match(/\d+,\s*\d+,\s*\d+/)?.[0] || '255, 255, 255';
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    const observer = new MutationObserver(() => {
      initOrbs();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] w-full h-full pointer-events-none"
      style={{ 
        filter: 'blur(50px)', // Flou optimal
        opacity: 0.95
      }}
    />
  );
}
