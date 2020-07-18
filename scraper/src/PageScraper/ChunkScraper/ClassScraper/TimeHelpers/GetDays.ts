import { Day } from '../../../../interfaces'

/**
 * Extracts all days the class runs on.
 * @param { string } data: Line which contains the data about the days on which the current class runs
 * @returns { Day[] }: Array of days which the class runs on
 */
const getDays = (data: string): Day[] => {
  const splitData = data.split(/, /)
  if (!splitData || splitData.length === 0) {
    console.error(new Error('Invalid days: ' + splitData))
  }

  const possibleDays = <Day[]>splitData
  const days: Day[] = []
  if (!possibleDays) {
    return days
  }

  for (const day of possibleDays) {
    if (day && Object.values(Day).includes(day)) {
      days.push(day)
    }
  }
  return days
}

export { getDays }
