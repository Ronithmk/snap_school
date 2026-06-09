const SIZE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /20\s*[x×]\s*30\s*cm/i, label: "20×30cm" },
  { pattern: /13\s*[x×]\s*18\s*cm/i, label: "13×18cm" },
  { pattern: /10\s*[x×]\s*15\s*cm/i, label: "10×15cm" },
  { pattern: /20\s*[x×]\s*24/i, label: "20×24" },
  { pattern: /16\s*[x×]\s*20/i, label: "16×20" },
  { pattern: /11\s*[x×]\s*14/i, label: "11×14" },
  { pattern: /10\s*[x×]\s*12/i, label: "10×12" },
  { pattern: /10\s*[x×]\s*15/i, label: "10×15" },
  { pattern: /8\s*[x×]\s*10/i, label: "8×10" },
  { pattern: /6\s*[x×]\s*8/i, label: "6×8" },
  { pattern: /5\s*[x×]\s*7/i, label: "5×7" },
  { pattern: /4\s*[x×]\s*6/i, label: "4×6" },
  { pattern: /3\s*[x×]\s*5/i, label: "3×5" },
  { pattern: /\ba5\b/i, label: "A5" },
  { pattern: /\ba4\b/i, label: "A4" },
  { pattern: /\ba3\b/i, label: "A3" },
  { pattern: /\ba2\b/i, label: "A2" },
  { pattern: /wallet|thumb(nail)?/i, label: "Wallet" },
  { pattern: /panoram/i, label: "Panoramic" },
  { pattern: /canvas/i, label: "Canvas" },
  { pattern: /poster/i, label: "Poster" },
  { pattern: /digital|download|soft[\s-]?copy/i, label: "Digital" },
  { pattern: /package|pack\b/i, label: "Package" },
];

export function extractPrintSize(itemName: string): string {
  for (const { pattern, label } of SIZE_PATTERNS) {
    if (pattern.test(itemName)) return label;
  }
  return "Other";
}

export const KNOWN_SIZES = [
  "4×6", "5×7", "6×8", "8×10", "10×12", "10×15", "11×14", "16×20", "20×24",
  "10×15cm", "13×18cm", "20×30cm",
  "A5", "A4", "A3", "A2",
  "Wallet", "Panoramic", "Canvas", "Poster", "Digital", "Package", "Other",
] as const;

export type PrintSize = typeof KNOWN_SIZES[number];

export function sizeOrder(size: string): number {
  const idx = KNOWN_SIZES.indexOf(size as PrintSize);
  return idx === -1 ? KNOWN_SIZES.length : idx;
}
