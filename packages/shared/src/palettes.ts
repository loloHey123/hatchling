export interface ThemePalette {
  id: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSecondary: string;
    success: string;
    warning: string;
    danger: string;
  };
}

export const PALETTES: ThemePalette[] = [
  {
    id: 'sunset-garden',
    name: 'Sunset Garden',
    colors: {
      bg: '#1e1a20',
      surface: '#28222e',
      border: '#3a3040',
      text: '#d8c8d0',
      textMuted: '#8a7890',
      accent: '#f0a8a0',
      accentSecondary: '#a8d0a0',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'campfire',
    name: 'Campfire',
    colors: {
      bg: '#2a1f16',
      surface: '#352818',
      border: '#4a3828',
      text: '#d8c0a0',
      textMuted: '#8a7060',
      accent: '#f0a050',
      accentSecondary: '#70b0d8',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    colors: {
      bg: '#17201e',
      surface: '#1c2825',
      border: '#2a3a35',
      text: '#c0d8c8',
      textMuted: '#6a8a80',
      accent: '#e8c868',
      accentSecondary: '#88c8a0',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    colors: {
      bg: '#0f1520',
      surface: '#151d2a',
      border: '#243040',
      text: '#b8c8d8',
      textMuted: '#607088',
      accent: '#58a8e0',
      accentSecondary: '#a0d0e8',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    colors: {
      bg: '#201818',
      surface: '#2a2020',
      border: '#402e30',
      text: '#e0c8c8',
      textMuted: '#907070',
      accent: '#e87088',
      accentSecondary: '#f0b0b8',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'fossil',
    name: 'Fossil',
    colors: {
      bg: '#1a1a18',
      surface: '#242420',
      border: '#383830',
      text: '#c8c0b0',
      textMuted: '#888070',
      accent: '#c8a070',
      accentSecondary: '#a09078',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: {
      bg: '#0e0e1a',
      surface: '#161628',
      border: '#262640',
      text: '#c8c0e0',
      textMuted: '#706890',
      accent: '#60e0a0',
      accentSecondary: '#b080f0',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    colors: {
      bg: '#201810',
      surface: '#2a2018',
      border: '#403020',
      text: '#d8c8a0',
      textMuted: '#908060',
      accent: '#e0a030',
      accentSecondary: '#c87830',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
];

export const DEFAULT_PALETTE_ID = 'sunset-garden';

export function getPalette(id: string): ThemePalette {
  return PALETTES.find(p => p.id === id) ?? PALETTES[0];
}
