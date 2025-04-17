import { useContext } from "react";

import { themes } from "../constants/theme";
import { AppContext } from "../context/AppContext";

export const useColorDecoder = (assignedColor: string, p_theme?: string) => {
  const {
    currentTheme
  } = useContext(AppContext);

  let theme = currentTheme;

  if (p_theme) {
    theme = p_theme;
  }

  const mappedTheme = themes[theme as keyof typeof themes];
  return Object.prototype.hasOwnProperty.call(mappedTheme, assignedColor) 
    ? mappedTheme[assignedColor as keyof typeof mappedTheme] 
    : assignedColor;
}

export const useColorsDecoder = (assignedColors: Record<string, string>) => {
  const decodedColors = Object.fromEntries(
    Object.entries(assignedColors).map(([key, color]) => {
      const decodedColor = useColorDecoder(color);
      return [key, decodedColor];
    })
  );

  console.log('assignedColors', assignedColors);
  console.log('decodedColors', decodedColors);
  return decodedColors;
};