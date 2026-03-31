export interface CosmeticDef {
  id: number;
  name: string;
  category: 'hat' | 'accessory' | 'background' | 'effect';
  spritePath: string;
  price: number; // virtual currency in cents
  description: string;
}

export const COSMETICS: CosmeticDef[] = [
  // Hats (5)
  { id: 1, name: 'Top Hat', category: 'hat', spritePath: '/sprites/cosmetics/hat-tophat.png', price: 2000, description: 'A distinguished pixel top hat.' },
  { id: 2, name: 'Crown', category: 'hat', spritePath: '/sprites/cosmetics/hat-crown.png', price: 5000, description: 'A golden crown fit for a savings monarch.' },
  { id: 3, name: 'Party Hat', category: 'hat', spritePath: '/sprites/cosmetics/hat-party.png', price: 1500, description: 'Celebrate your self-control!' },
  { id: 4, name: 'Cowboy Hat', category: 'hat', spritePath: '/sprites/cosmetics/hat-cowboy.png', price: 3000, description: 'Yeehaw! Wrangle those impulse purchases.' },
  { id: 5, name: 'Wizard Hat', category: 'hat', spritePath: '/sprites/cosmetics/hat-wizard.png', price: 4000, description: 'Channel ancient frugality magic.' },

  // Accessories (5)
  { id: 6, name: 'Pixel Sunglasses', category: 'accessory', spritePath: '/sprites/cosmetics/acc-sunglasses.png', price: 1500, description: 'Too cool to impulse buy.' },
  { id: 7, name: 'Red Scarf', category: 'accessory', spritePath: '/sprites/cosmetics/acc-scarf.png', price: 2000, description: 'A warm scarf for cold turkey shopping bans.' },
  { id: 8, name: 'Bow Tie', category: 'accessory', spritePath: '/sprites/cosmetics/acc-bowtie.png', price: 1000, description: 'Dapper and debt-free.' },
  { id: 9, name: 'Cape', category: 'accessory', spritePath: '/sprites/cosmetics/acc-cape.png', price: 3500, description: 'Every savings hero needs a cape.' },
  { id: 10, name: 'Monocle', category: 'accessory', spritePath: '/sprites/cosmetics/acc-monocle.png', price: 2500, description: 'For inspecting deals with discernment.' },

  // Backgrounds (5)
  { id: 11, name: 'Pixel Meadow', category: 'background', spritePath: '/sprites/cosmetics/bg-meadow.png', price: 3000, description: 'A peaceful green meadow.' },
  { id: 12, name: 'Starry Night', category: 'background', spritePath: '/sprites/cosmetics/bg-stars.png', price: 4000, description: 'A sky full of savings stars.' },
  { id: 13, name: 'Ocean Waves', category: 'background', spritePath: '/sprites/cosmetics/bg-ocean.png', price: 3500, description: 'Calm waters of financial peace.' },
  { id: 14, name: 'Pixel Forest', category: 'background', spritePath: '/sprites/cosmetics/bg-forest.png', price: 3000, description: 'A lush forest of growing savings.' },
  { id: 15, name: 'Cozy Room', category: 'background', spritePath: '/sprites/cosmetics/bg-room.png', price: 5000, description: 'A warm room — no shopping needed.' },

  // Effects (5)
  { id: 16, name: 'Sparkles', category: 'effect', spritePath: '/sprites/cosmetics/fx-sparkles.png', price: 2000, description: 'Glittering particles of restraint.' },
  { id: 17, name: 'Hearts', category: 'effect', spritePath: '/sprites/cosmetics/fx-hearts.png', price: 2000, description: 'Love for your bank account.' },
  { id: 18, name: 'Fire Aura', category: 'effect', spritePath: '/sprites/cosmetics/fx-fire.png', price: 4500, description: 'Your savings streak is on fire!' },
  { id: 19, name: 'Bubbles', category: 'effect', spritePath: '/sprites/cosmetics/fx-bubbles.png', price: 1500, description: 'Floating bubbles of joy.' },
  { id: 20, name: 'Lightning', category: 'effect', spritePath: '/sprites/cosmetics/fx-lightning.png', price: 5000, description: 'Electrifying willpower.' },
];

export const COSMETIC_MAP = new Map(COSMETICS.map(c => [c.id, c]));
