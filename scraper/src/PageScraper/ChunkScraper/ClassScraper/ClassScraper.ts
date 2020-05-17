import { Class, ClassWarnings, ClassChunk } from '../../../interfaces'

import { getClassId } from './ClassData/GetClassId'
import { getSection } from './ClassData/GetSection'
import { getTerm } from './ClassData/GetTerm'
import { getActivity } from './ClassData/GetActivity'
import { getStatus } from './ClassData/GetStatus'
import { getCourseEnrolment } from './ClassData/GetCourseEnrolment'
import { getTermDates } from './ClassData/GetTermDates'
import { getMode } from './ClassData/GetMode'
import { getNeedsConsent } from './ClassData/GetNeedsConsent'
import { getTimeData } from './TimeData'

/**
 * Checks if the class activity is simply course enrolment
 * @param { string } data: Line which contains the activity field
 * @returns { boolean }: True if the class activity is course enrolment, false otherwise
 */
const isCourseEnrolment = (data: string): boolean => {
  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  return courseEnrolmentChecker.test(data)
}

/**
 * @interface: Indices of all the data that can be extracted from a class chunk
 */
interface ClassChunkIndices {
  classID: number
  section: number
  term: number
  activity: number
  status: number
  courseEnrolment: number
  termDates: number
  meetingDates?: number
  censusDate?: number
  mode: number
  consent: number
  timesStartIndex: number
}

/**
 * @constant { ClassChunkIndices }: Default indices which represent which index to grab data from
 */
const defaultParseIndices: ClassChunkIndices = {
  classID: 0,
  section: 1,
  term: 2,
  activity: 3,
  status: 4,
  courseEnrolment: 5,
  termDates: 6,
  mode: 9,
  consent: 10,
  timesStartIndex: 11,
}

interface parseClassChunkParams {
  chunk: ClassChunk
  parseIndices?: ClassChunkIndices
}

interface parseClassChunkSuccess {
  classData: Class
  warnings: ClassWarnings[]
}

type parseClassChunkReturn = parseClassChunkSuccess | false

/**
 * Parses data from the data array into a class object
 * @param { ClassChunk } data: array of text from elements with a data class
 * from a class chunk
 * @returns { classData: Class, warnings: ClassWarnings[] }: The data that has been scraped, formatted as a class object
 * @returns { false }: Scraping aborted as data chunk does not contain relevant class data (as it is a course enrolment chunk)
 */
const parseClassChunk = ({
  chunk,
  parseIndices = defaultParseIndices,
}: parseClassChunkParams): parseClassChunkReturn => {
  const data = chunk.data
  const warnings: ClassWarnings[] = []

  const classID = getClassId(data[parseIndices.classID])
  const section = getSection(data[parseIndices.section])
  const term = getTerm(data[parseIndices.term])

  // Check if the class is actually course enrolment
  // which is not needed
  // It is simply a special activity so incrementing the index is not required
  if (isCourseEnrolment(data[parseIndices.activity])) {
    // Abort
    return false
  }

  const activity = getActivity(data[parseIndices.activity])
  const status = getStatus(data[parseIndices.status])
  const { courseEnrolment, enrolmentWarnings } = getCourseEnrolment({
    data: data[parseIndices.courseEnrolment],
    classID,
    term,
  })
  warnings.concat(enrolmentWarnings)

  // Start and end dates can be used to classify each term code
  const termDates = getTermDates(data[parseIndices.termDates])
  const mode = getMode(data[parseIndices.mode])
  const needsConsent = getNeedsConsent(data[parseIndices.consent])
  const { dateList, timeDataWarnings } = getTimeData({
    data,
    index: parseIndices.timesStartIndex,
    classID,
    term,
  })
  warnings.concat(timeDataWarnings)

  const classData: Class = {
    classID,
    section,
    term,
    activity,
    status,
    courseEnrolment,
    termDates,
    needsConsent,
    mode,
    times: dateList,
    notes: chunk.notes,
  }

  return { classData, warnings }
}

export { parseClassChunk }
