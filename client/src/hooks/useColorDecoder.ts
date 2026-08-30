import { themes } from '../constants/theme';

const decodeColor = (assignedColor: string, preferredTheme: string) => {
  const themeObject = themes[preferredTheme as keyof typeof themes];
  if (assignedColor.startsWith('default-')) {
    // extract the number from the assigned colour key
    const colorNumber = parseInt(assignedColor.split('-')[1], 10) - 1;
    return themeObject.colors[colorNumber] || assignedColor;
  }
  return assignedColor;
};

/**
 * Decodes all colours using the `useColorDecoder` function.
 * Converts each colour to its corresponding color value in the current or preview theme.
 *
 * @param {string[]} colors A record of assigned colour keys (e.g., { event1: 'default-1' }).
 * @param {string} [previewTheme] An optional theme to use for decoding instead of the current theme.
 * @returns {string[]} A record of decoded colour values (e.g., { event1: 'oklch(0.8 0.1 200)' }).
 */
export const useColorsDecoder = (colors: string[], preferredTheme: string): string[] => {
  return colors.map((color) => decodeColor(color, preferredTheme));
};

/**
 * Converts an assigned colour to the corresponding colour value in the current or preview theme.
 * If the assigned colour is not found in the theme, it returns the original assigned colour.
 *
 * @param {string} assignedColor The assigned colour key (e.g., 'default-1').
 * @param {string} [previewTheme] An optional theme to use for decoding instead of the current theme.
 * @returns {string} The decoded colour value (e.g., an OKLCH colour string or the original assigned colour).
 */
export const useColorDecoder = (assignedColor: string, preferredTheme: string) => {
  return decodeColor(assignedColor, preferredTheme);
};
