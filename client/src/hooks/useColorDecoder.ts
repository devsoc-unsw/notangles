import { themes } from "../constants/theme";

export const useColorDecoder = (assignedColor: string, p_theme?: string) => {
  // Get the current theme as from local storage
  let theme = localStorage.getItem('colorTheme') || 'theme-1';
  if (p_theme) {
    theme = p_theme;
  }

  const currentTheme = themes[theme as keyof typeof themes] || themes['theme-1'];
  return Object.prototype.hasOwnProperty.call(currentTheme, assignedColor) 
    ? currentTheme[assignedColor as keyof typeof currentTheme] 
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