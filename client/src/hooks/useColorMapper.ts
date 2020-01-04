import { useState, useEffect } from 'react'
import { colours } from '../constants/timetable'

/**
 * Assigns a unique color, chosen from a set of fixed colors, to each course code
 * 
 * @param courseCodes An array containing course codes
 * @return An object that maps a color to each course code
 * 
 * @example
 * const assignedColors = useColorMapper(selectedCourses.map(course => course.courseCode))
 */
export const useColorMapper = (courseCodes: string[]): Record<string, string> => {
  const [assignedColours, setAssignedColours] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    const takenColors = new Set<string>()
    const newAssignedColours: Record<string, string> = {}
    for (const item of courseCodes) {
      const color =
        item in assignedColours
          ? assignedColours[item]
          : colours.find(c => !takenColors.has(c))
      newAssignedColours[item] = color || 'orange'
      if (color) {
        takenColors.add(color)
      }
    }

    if (
      JSON.stringify(assignedColours) !== JSON.stringify(newAssignedColours)
    ) {
      setAssignedColours(newAssignedColours)
    }
  }, [courseCodes])

  return assignedColours
}
