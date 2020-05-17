import { ClassWarnings, Time } from '../../../interfaces'
import { getDays } from './TimeData/GetDays'
import { getTime } from './TimeData/GetTime'
import { getLocation } from './TimeData/GetLocation'
import { getWeeks } from './TimeData/GetWeeks'
import { getInstructor } from './TimeData/GetInstructor'

interface GetTimeDataParams {
  data: string[]
  index: number
  classID: number
  term: string
}

interface GetTimeDataReturn {
  dateList: Time[]
  timeDataWarnings: ClassWarnings[]
}

/**
 * Extracts all the times a class is offered through the term
 * @param { string[] } data: The ClassChunk that contains data about the class
 * @param { number } index: The index marking the start of the time data
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetTimeDataReturn }: Array of times during which the class runs, and any warnings representing data errors that were found
 */
const getTimeData = ({
  data,
  index,
  classID,
  term,
}: GetTimeDataParams): GetTimeDataReturn => {
  const timeDataWarnings: ClassWarnings[] = []

  // Any notes for the class (found later with dates)
  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Parse the date data
    // Days: There can be multiple days for a single time/class
    const days = getDays(data[index])
    index++

    // Start and end times
    const time = getTime(data[index])
    index++

    // location
    const { location, locationWarnings } = getLocation({
      data: data[index],
      classID,
      term,
    })
    timeDataWarnings.concat(locationWarnings)
    index++

    // weeks
    const { weeks, weeksWarnings } = getWeeks({
      data: data[index],
      classID,
      term,
    })
    timeDataWarnings.concat(weeksWarnings)
    index++

    // Instructor (if listed)
    const instructor = getInstructor(data[index])
    index++

    // Make copies for each day the class runs
    for (const day of days) {
      const timeData: Time = { day: day, time: time, weeks: weeks }
      if (location) {
        timeData.location = location
      }
      if (instructor) {
        timeData.instructor = instructor
      }
      dateList.push(timeData)
    }
  }

  return { dateList, timeDataWarnings }
}

export { getTimeData }
