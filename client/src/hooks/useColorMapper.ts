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
const useColorMapper = (courseCodes: string[]): void => {
  const {assignedColors, setAssignedColors} = useContext(CourseContext);

  useEffect(() => {
    const takenColors = new Set<string>();
    
    // Do a filter to remove any courses that have since been deleted
    const newAssignedColors: Record<string, string> = {};
    Object.entries(assignedColors).forEach(e => {
      const [key, value] = e;
      if (courseCodes.includes(key)) {
        newAssignedColors[key] = value;
        takenColors.add(value); 
      }
    }) 

    courseCodes.forEach((course) => {
      let color;

      if (!(course in newAssignedColors)) {
        color = colors.find((c) => !takenColors.has(c));
        newAssignedColors[course] = color || defaultColor;
        
        if (color) {
          takenColors.add(color);
        }
      }
    });

    if (JSON.stringify(assignedColors) !== JSON.stringify(newAssignedColors)) {
      setAssignedColors(newAssignedColors);
    }
  }, [courseCodes]);
};

export default useColorMapper;
