import { useState, useEffect, useCallback } from 'react';
import { getPalette, DEFAULT_PALETTE_ID, PALETTES } from '@hatchling/shared';
import type { ThemePalette } from '@hatchling/shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const STORAGE_KEY = 'hatchling_palette';

function applyPalette(palette: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', palette.colors.bg);
  root.style.setProperty('--color-surface', palette.colors.surface);
  root.style.setProperty('--color-border', palette.colors.border);
  root.style.setProperty('--color-text', palette.colors.text);
  root.style.setProperty('--color-text-muted', palette.colors.textMuted);
  root.style.setProperty('--color-accent', palette.colors.accent);
  root.style.setProperty('--color-accent-secondary', palette.colors.accentSecondary);
  root.style.setProperty('--color-success', palette.colors.success);
  root.style.setProperty('--color-warning', palette.colors.warning);
  root.style.setProperty('--color-danger', palette.colors.danger);
}

export function useTheme() {
  const { user } = useAuth();
  const [paletteId, setPaletteId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PALETTE_ID;
  });

  // Apply palette whenever it changes
  useEffect(() => {
    applyPalette(getPalette(paletteId));
  }, [paletteId]);

  // Load palette from Supabase on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('theme_palette')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.theme_palette) {
          setPaletteId(data.theme_palette);
          localStorage.setItem(STORAGE_KEY, data.theme_palette);
        }
      });
  }, [user]);

  const setTheme = useCallback(async (id: string) => {
    setPaletteId(id);
    localStorage.setItem(STORAGE_KEY, id);
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_palette: id })
        .eq('id', user.id);
    }
  }, [user]);

  return {
    paletteId,
    palette: getPalette(paletteId),
    palettes: PALETTES,
    setTheme,
  };
}
