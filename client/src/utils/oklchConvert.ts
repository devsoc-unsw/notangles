import { formatHex, oklch } from 'culori';

export const oklchToHex = (oklchColor: string): string => {
  // slice off l c h
  const [l, c, h] = oklchColor.slice(6, -1).split(' ').map(Number);
  const formattedOklchColor = { mode: 'oklch', l: l, c: c, h: h };
  const parsedColor = oklch(formattedOklchColor);
  return parsedColor ? formatHex(parsedColor) : '#000000';
};
