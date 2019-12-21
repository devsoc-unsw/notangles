import { useState, useEffect } from 'react'
import { colours } from '../constants/timetable'

/**
 * Skeleton
 * 
 * @param year 
 * @param term 
 * @param courseCode 
 * @return 
 * 
 * @example
 * some example
 */
export const useColorMapper = (arr: string[]): Record<string, string> => {
  const [assignedColours, setAssignedColours] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    const takenColors = new Set<string>()
    const newAssignedColours: Record<string, string> = {}
    for (const item of arr) {
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
  }, [arr])

  return assignedColours
}
