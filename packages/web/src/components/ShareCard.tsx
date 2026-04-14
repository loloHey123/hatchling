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

    const style = getComputedStyle(document.documentElement);
    const cBg = style.getPropertyValue('--color-bg').trim() || '#1e1a20';
    const cSurface = style.getPropertyValue('--color-surface').trim() || '#28222e';
    const cBorder = style.getPropertyValue('--color-border').trim() || '#3a3040';
    const cText = style.getPropertyValue('--color-text').trim() || '#d8c8d0';
    const cTextMuted = style.getPropertyValue('--color-text-muted').trim() || '#8a7890';
    const cSuccess = style.getPropertyValue('--color-success').trim() || '#78c850';
    const cWarning = style.getPropertyValue('--color-warning').trim() || '#f8d030';

    // Background with rounded feel
    ctx.fillStyle = cBg;
    ctx.fillRect(0, 0, 600, 315);

    // Border
    ctx.strokeStyle = cBorder;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(2, 2, 596, 311, 16);
    ctx.stroke();

    ctx.textBaseline = 'top';

    // Title
    ctx.fillStyle = cText;
    ctx.font = 'bold 22px Nunito, sans-serif';
    ctx.fillText('🐣 Hatchling', 28, 28);

    // Subtitle
    ctx.fillStyle = cTextMuted;
    ctx.font = '13px Nunito, sans-serif';
    ctx.fillText('Turn impulse purchases into pixel friends', 28, 58);

    // Divider
    ctx.fillStyle = cBorder;
    ctx.fillRect(28, 82, 544, 1);

    // Stats
    const cRare = style.getPropertyValue('--color-rarity-rare').trim() || '#6890f0';
    const stats = [
      { icon: '💰', label: 'Total Saved', value: `$${(totalSaved / 100).toFixed(0)}`, color: cSuccess },
      { icon: '📖', label: 'Creatures', value: `${creaturesCollected}/${totalCreatures}`, color: cRare },
      { icon: '⭐', label: 'Best Streak', value: `${bestStreak}`, color: cWarning },
    ];

    stats.forEach((stat, i) => {
      const x = 28 + i * 190;
      const y = 100;

      ctx.fillStyle = cSurface;
      ctx.beginPath();
      ctx.roundRect(x, y, 170, 80, 10);
      ctx.fill();
      ctx.strokeStyle = cBorder;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '24px serif';
      ctx.fillText(stat.icon, x + 12, y + 14);

      ctx.fillStyle = cTextMuted;
      ctx.font = '11px Nunito, sans-serif';
      ctx.fillText(stat.label, x + 48, y + 18);

      ctx.fillStyle = stat.color;
      ctx.font = 'bold 24px Nunito, sans-serif';
      ctx.fillText(stat.value, x + 48, y + 40);
    });

    // Progress bar
    const barX = 28, barY = 200, barW = 544, barH = 18;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 9);
    ctx.fillStyle = cSurface;
    ctx.fill();
    const fillW = barW * (creaturesCollected / totalCreatures);
    if (fillW > 0) {
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(fillW, 18), barH, 9);
      ctx.fillStyle = cSuccess;
      ctx.fill();
    }

    ctx.fillStyle = cText;
    ctx.font = '12px Nunito, sans-serif';
    ctx.fillText(`Collection: ${Math.round((creaturesCollected / totalCreatures) * 100)}% complete`, barX + 8, barY + 30);

    // Footer
    ctx.fillStyle = cTextMuted;
    ctx.font = '10px Nunito, sans-serif';
    ctx.fillText('hatchling.app — Track your savings, collect pixel creatures', 28, 280);

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
      <h3 className="text-sm font-bold font-body mb-3">Share Your Progress</h3>
      <p className="text-xs text-theme-text-muted mb-4 font-body">Generate a shareable image card of your stats.</p>

      <canvas
        ref={canvasRef}
        className={`w-full max-w-[600px] border-2 border-theme-border rounded-card mb-4 ${generated ? '' : 'hidden'}`}
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
