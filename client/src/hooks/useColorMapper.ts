import { useEffect, useContext } from 'react';
import { colors } from '../constants/timetable';
import { CourseContext } from '../context/CourseContext';

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
  const {assignedColors, setAssignedColors} = useContext(CourseContext);

  useEffect(() => {
    const takenColors = new Set<string>();
    const newAssignedColors: Record<string, string> = {};

    courseCodes.forEach((item) => {
      let color;
      // Conditional prevents user-set color from being overwritten
      if (item in assignedColors) {
        color = assignedColors[item];
      } else {
        color = colors.find((c) => !takenColors.has(c));
      }

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
