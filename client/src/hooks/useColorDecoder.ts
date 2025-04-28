import { useContext } from "react";

import { themes } from "../constants/theme";
import { AppContext } from "../context/AppContext";

export const useColorDecoder = (assignedColor: string, previewTheme?: string) => {
  const {
    currentTheme
  } = useContext(AppContext);

  const theme = previewTheme ?? currentTheme;

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
  
  return decodedColors;
};
