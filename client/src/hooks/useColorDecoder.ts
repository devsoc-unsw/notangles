type DefaultColorsKeys = keyof typeof default_colors;

const default_colors = {
  'default-1': '#137786', // dark cyan
  'default-2': '#a843a4', // light purple
  'default-3': '#134e86', // light blue
  'default-4': '#138652', // light green
  'default-5': '#861313', // dark red
  'default-6': '#868413', // dark yellow
  'default-7': '#2e89ff', // dark blue
  'default-8': '#3323ad', // deep blue
};

const default_colors1 = {
  'default-1': '#FF5733', // vibrant orange
  'default-2': '#33FF57', // bright green
  'default-3': '#3357FF', // vivid blue
  'default-4': '#FF33A8', // hot pink
  'default-5': '#FFC300', // golden yellow
  'default-6': '#DAF7A6', // pastel green
  'default-7': '#900C3F', // deep maroon
  'default-8': '#581845', // dark purple
}

export const useColorDecoder = (assignedColor: string) => {
  return default_colors[assignedColor as DefaultColorsKeys] || assignedColor;
}

export const useColorsDecoder = (assignedColors: Record<string, string>) => {
  const decodedColors = Object.fromEntries(
    Object.entries(assignedColors).map(([key, color]) => {
      if (color in default_colors) {
        return [key, default_colors[color as DefaultColorsKeys]];
      }
      return [key, color];
    })
  );

  console.log('assignedColors', assignedColors);
  console.log('decodedColors', decodedColors);
  return decodedColors;
};