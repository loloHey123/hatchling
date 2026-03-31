export function extractKeywords(name: string): string[] {
  return name
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
}

export function parsePrice(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const match = cleaned.match(/(\d+\.?\d*)/);
  if (!match) return 0;
  return Math.round(parseFloat(match[1]) * 100);
}
