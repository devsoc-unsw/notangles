import { colors } from '../constants/timetable';

const defaultColor = colors[colors.length - 1];

/**
 * Assigns a unique color, chosen from a set of fixed colors, to each course code
 *
 * @param courseCodes An array containing course codes
 * @return An object that maps a color to each course code
 *
 * @example
 * const assignedColors = useColorMapper(selectedCourses.map(course => course.code))
 */
const useColorMapper = (courseCodes: string[], assignedColors: Record<string, string>): Record<string, string> => {
  const takenColors = new Set<string>();
  const newAssignedColors: Record<string, string> = {};

  courseCodes.forEach((course) => {
    let color;
    if (course in assignedColors) {
      color = assignedColors[course];
      newAssignedColors[course] = color || defaultColor;
    }

    if (!(course in newAssignedColors)) {
      // Previous logic
      color = colors.find((c) => !takenColors.has(c));
      
      // New logic (Apply in the future application)
      // Randomly assign a color that is not already taken
      // const availableColors = colors.filter((c) => !takenColors.has(c));
      // color = availableColors[Math.floor(Math.random() * availableColors.length)];
      // newAssignedColors[course] = color || defaultColor;
    }

    if (color) {
      takenColors.add(color);
    }
  });

  return newAssignedColors;
};

export default useColorMapper;
