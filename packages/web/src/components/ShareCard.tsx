import { useRef, useState } from 'react';
import { PixelFrame } from './PixelFrame';
import { PixelButton } from './PixelButton';

interface ShareCardProps {
  totalSaved: number;
  creaturesCollected: number;
  totalCreatures: number;
  bestStreak: number;
}

export function ShareCard({ totalSaved, creaturesCollected, totalCreatures, bestStreak }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 315;

    // Background
    ctx.fillStyle = '#fefcd0';
    ctx.fillRect(0, 0, 600, 315);

    // Pixel border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 594, 309);

    // Inner decorative border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 576, 291);

    // Load pixel font (fallback to monospace)
    ctx.textBaseline = 'top';

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('🐣 Hatchling', 28, 28);

    // Subtitle
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.fillText('Turn impulse purchases into pixel friends', 28, 56);

    // Divider
    ctx.fillStyle = '#ddd';
    ctx.fillRect(28, 76, 544, 2);

    // Stats
    const stats = [
      { icon: '💰', label: 'Total Saved', value: `$${(totalSaved / 100).toFixed(0)}`, color: '#78c850' },
      { icon: '📖', label: 'Creatures', value: `${creaturesCollected}/${totalCreatures}`, color: '#6890f0' },
      { icon: '⭐', label: 'Best Streak', value: `${bestStreak}`, color: '#f8d030' },
    ];

    stats.forEach((stat, i) => {
      const x = 28 + i * 190;
      const y = 96;

      // Stat box
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, 170, 80);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 170, 80);

      // Icon
      ctx.font = '24px serif';
      ctx.fillText(stat.icon, x + 12, y + 12);

      // Label
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText(stat.label, x + 48, y + 16);

      // Value
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 22px monospace';
      ctx.fillText(stat.value, x + 48, y + 38);
    });

    // Footer
    ctx.fillStyle = '#aaa';
    ctx.font = '9px monospace';
    ctx.fillText('hatchling.app — Track your savings, collect pixel creatures', 28, 280);

    // Progress bar
    const barX = 28, barY = 200, barW = 544, barH = 20;
    ctx.fillStyle = '#eee';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#78c850';
    ctx.fillRect(barX, barY, barW * (creaturesCollected / totalCreatures), barH);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    // Progress text
    ctx.fillStyle = '#333';
    ctx.font = '10px monospace';
    ctx.fillText(`Pokédex: ${Math.round((creaturesCollected / totalCreatures) * 100)}% complete`, barX + 8, barY + 30);

    setGenerated(true);
  };

  const downloadCard = () => {
    if (!generated) generateCard();
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'hatchling-stats.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }, 100);
  };

  return (
    <PixelFrame>
      <h3 className="text-[10px] mb-3">Share Your Progress</h3>
      <p className="text-[8px] text-[#888] mb-4">Generate a shareable image card of your stats.</p>

      <canvas
        ref={canvasRef}
        className={`w-full max-w-[600px] border-2 border-[#333] mb-4 ${generated ? '' : 'hidden'}`}
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="flex gap-3">
        {!generated ? (
          <PixelButton onClick={generateCard} variant="secondary" size="sm">
            Preview Card
          </PixelButton>
        ) : (
          <PixelButton onClick={downloadCard} size="sm">
            Download Card 📤
          </PixelButton>
        )}
      </div>
    </PixelFrame>
  );
}
