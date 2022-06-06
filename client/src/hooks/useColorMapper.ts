import { useState, useEffect } from 'react';
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
const useColorMapper = (courseCodes: string[]): Record<string, string> => {
  const [assignedColors, setAssignedColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const takenColors = new Set<string>();
    const newAssignedColors: Record<string, string> = {};

    courseCodes.forEach((item) => {
      const color = colors.find((c) => !takenColors.has(c));
      newAssignedColors[item] = color || defaultColor;
      if (color) {
        takenColors.add(color);
      }
    });

    if (JSON.stringify(assignedColors) !== JSON.stringify(newAssignedColors)) {
      setAssignedColors(newAssignedColors);
    }
  }, [courseCodes]);

  return assignedColors;
};

export default useColorMapper;
