import { useContext } from 'react';

import { themes } from '../constants/theme';
import { AppContext } from '../context/AppContext';

/**
 * Converts an assigned colour to the corresponding colour value in the current or preview theme.
 * If the assigned colour is not found in the theme, it returns the original assigned colour.
 *
 * @param {string} assignedColor The assigned colour key (e.g., 'default-1').
 * @param {string} [previewTheme]  An optioal theme to use for decoding instead of the current theme.
 * @returns {string} The decoded colour value (e.g., an OKLCH colour string or the original assigned colour).
 */
export const useColorDecoder = (assignedColor: string, previewTheme?: string) => {
  const { currentTheme } = useContext(AppContext);

  const theme = previewTheme ?? currentTheme;

  const mappedTheme = themes[theme as keyof typeof themes];
  return Object.prototype.hasOwnProperty.call(mappedTheme, assignedColor)
    ? mappedTheme[assignedColor as keyof typeof mappedTheme]
    : assignedColor;
};

/**
 * Decodes all assigned colours using the `useColorDecoder` function.
 * Converts each assigned colour key to its corresponding color value in the current or preview theme.
 *
 * @param {Record<string, string>} assignedColors A record of assigned colour keys (e.g., { event1: 'default-1' }).
 * @param {string} [previewTheme] An optional theme to use for decoding instead of the current theme.
 * @returns {Record<string, string>} A record of decoded colour values (e.g., { event1: 'oklch(0.8 0.1 200)' }).
 */
export const useColorsDecoder = (assignedColors: Record<string, string>, previewTheme?: string) => {
  const decodedColors = Object.fromEntries(
    Object.entries(assignedColors).map(([key, color]) => {
      const decodedColor = useColorDecoder(color, previewTheme);
      return [key, decodedColor];
    }),
  );

  return decodedColors;
};
