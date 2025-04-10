const theme_1 = {
  'default-1': '#137786', // dark cyan
  'default-2': '#a843a4', // light purple
  'default-3': '#134e86', // light blue
  'default-4': '#138652', // light green
  'default-5': '#861313', // dark red
  'default-6': '#868413', // dark yellow
  'default-7': '#2e89ff', // dark blue
  'default-8': '#3323ad', // deep blue
};

const theme_2 = {
  'default-1': '#cdb4db',
  'default-2': '#ffc8dd',
  'default-3': '#ffafcc',
  'default-4': '#bde0fe',
  'default-5': '#a2d2ff',
  'default-6': '#b9fbc0',
  'default-7': '#ffe156',
  'default-8': '#ff677d',
};  

const themes = {
  'theme-1': theme_1,
  'theme-2': theme_2,
}

export const useColorDecoder = (assignedColor: string, p_theme?: string) => {
  // Get the current theme as from local storage
  let theme = localStorage.getItem('colorTheme') || 'theme-1';
  if (p_theme) {
    theme = p_theme;
  }

  const currentTheme = themes[theme as keyof typeof themes] || themes['theme-1'];
  return Object.prototype.hasOwnProperty.call(currentTheme, assignedColor) 
    ? currentTheme[assignedColor as keyof typeof theme_1] 
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