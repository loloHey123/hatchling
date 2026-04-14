import type { SpriteDefinition } from '@hatchling/shared';

interface PixelSpriteProps {
  sprite: SpriteDefinition;
  scale?: number;
  className?: string;
}

export function PixelSprite({ sprite, scale = 1, className = '' }: PixelSpriteProps) {
  const px = sprite.pixelSize * scale;
  const w = sprite.width * px;
  const h = sprite.height * px;

  // Rescale the box-shadow values by the scale factor
  const scaledPixels = scale === 1
    ? sprite.pixels
    : sprite.pixels.replace(
        /(\d+)px/g,
        (_, num) => `${Number(num) * scale}px`
      );

  return (
    <div
      className={`relative ${className}`}
      style={{ width: w, height: h, imageRendering: 'pixelated' as const }}
    >
      <div
        style={{
          position: 'absolute',
          width: px,
          height: px,
          boxShadow: scaledPixels,
        }}
      />
    </div>
  );
}
