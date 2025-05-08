import { oklch2hex } from 'colorizr';

export const oklchToHex = (oklch: string): string => {
  if (!oklch.startsWith('oklch(')) {
    return oklch;
  }

  const [l, c, h] = oklch
    .replace('oklch(', '')
    .replace(')', '')
    .split(' ')
    .map((v) => parseFloat(v.trim()));
  return oklch2hex([l, c, h]);
};
