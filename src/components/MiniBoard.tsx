import React, { useRef, useEffect } from 'react';

interface MiniBoardProps {
  queens: number[];
  theme: 'dark' | 'light';
  size?: number;
}

export const MiniBoard: React.FC<MiniBoardProps> = React.memo(({
  queens,
  theme,
  size = 144,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = size / 8;

    const lightColor = theme === 'dark' ? '#334155' : '#fef3c7'; // slate-700 / amber-100
    const darkColor = theme === 'dark' ? '#0f172a' : '#92400e';  // slate-900 / amber-800
    const queenColor = theme === 'dark' ? '#fbbf24' : '#d97706'; // amber-400 / amber-600

    ctx.clearRect(0, 0, size, size);

    // Draw 8x8 checkerboard
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? lightColor : darkColor;
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }

    // Draw the 8 queens
    for (let r = 0; r < 8; r++) {
      const c = queens[r];
      if (c === undefined || c < 0 || c > 7) continue;

      const centerX = c * tileSize + tileSize / 2;
      const centerY = r * tileSize + tileSize / 2;
      const radius = tileSize * 0.32;

      // Outer glow / circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = queenColor;
      ctx.fill();

      // Crown crown details (center star / dot)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'dark' ? '#451a03' : '#fffbeb';
      ctx.fill();
    }
  }, [queens, theme, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg shadow-inner border border-slate-300 dark:border-slate-800"
    />
  );
});

MiniBoard.displayName = 'MiniBoard';

