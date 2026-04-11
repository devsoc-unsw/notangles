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

/**
 * Converts an oklch() color string to a hex string.
 * Returns the input unchanged if it is not in oklch format (e.g. already a hex string).
 * Throws if the string looks like oklch but is malformed.
 */
export const oklchToHex = (color: string): string => {
  if (!color.startsWith('oklch(')) {
    return color;
  }
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(color);
  if (!match) {
    throw new Error(`Malformed oklch color string: "${color}"`);
  }

  const [, l, c, h] = match.map(parseFloat);
  return oklch2hex([l, c, h]);
};
