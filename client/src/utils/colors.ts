import { oklch2hex } from 'colorizr';

import { themes } from '../constants/theme';

export const colors: string[] = [
  'default-1',
  'default-2',
  'default-3',
  'default-4',
  'default-5',
  'default-6',
  'default-7',
  'default-8',
];

export const decodeColor = (assignedColor: string, preferredTheme: string) => {
  const themeObject = themes[preferredTheme as keyof typeof themes];
  if (assignedColor.startsWith('default-')) {
    // extract the number from the assigned colour key
    const colorNumber = parseInt(assignedColor.split('-')[1], 10) - 1;
    return themeObject.colors[colorNumber] || assignedColor;
  }
  return assignedColor;
};

export const leastUsedColor = (usedColors: string[]): string => {
  const colorCount: Record<string, number> = {};
  colors.forEach((color) => {
    colorCount[color] = 0;
  });

  usedColors.forEach((color) => {
    if (color in colorCount) {
      colorCount[color] += 1;
    }
  });

  return colors.reduce((a, b) => (colorCount[a] <= colorCount[b] ? a : b));
};

export const oklchToHex = (oklch: string): string => {
  const match = oklch.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!match) {
    return oklch;
  }

  const [, l, c, h] = match.map(parseFloat);
  return oklch2hex([l, c, h]);
};
