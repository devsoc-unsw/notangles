import { Response, Request } from 'express'
import * as util from 'util'

import Database from '../database'
import { dbReadParams } from '../database'

export interface GetCourseParams {
  termId: string
  courseId: string
}

/**
 * GET /api/terms/:termId/courses/:courseId/
 * termId expected in yyyy-term format
 */
export const getCourse = async (req: Request, res: Response) => {
  const params: GetCourseParams = req.params
  const [year, term] = params.termId.split('-')
  const args: dbReadParams = {
    dbName: year,
    termColName: term,
    courseCode: params.courseId,
  }

  const course =
    params.courseId === 'FLAG1337'
      ? {
          _id: 'bruh',
          courseCode: 'FLAG1337',
          name: '👀',
          school: 'School of Computer Sci & Eng',
          campus: 'Sydney',
          career: 'Undergraduate',
          termsOffered: ['T1', 'T2'],
          censusDates: ['14-MAR-2021', '27-JUN-2021'],
          classes: [
            {
              classID: 4137,
              section: '1UGA',
              term: 'T1',
              activity: 'Lecture',
              status: 'Open',
              courseEnrolment: { enrolments: 93, capacity: 120 },
              termDates: { start: '15/02/2021', end: '16/05/2021' },
              needsConsent: false,
              mode: 'World Wide Web',
              times: [
                {
                  day: 'Tue',
                  time: { start: '12:00', end: '14:00' },
                  weeks: '1-5,7-10',
                  location: 'Online (ONLINE)',
                  instructor: 'Ms A Vassar,Dr G Mohammadi',
                },
                {
                  day: 'Wed',
                  time: { start: '11:00', end: '13:00' },
                  weeks: '1-5,7-10',
                  location: 'Online (ONLINE)',
                  instructor: 'Ms A Vassar,Dr G Mohammadi',
                },
              ],
              notes: [],
            },
            {
              classID: 1337,
              section: '1UGA',
              term: 'T1',
              activity: 'Lecture',
              status: 'Open',
              courseEnrolment: { enrolments: 93, capacity: 120 },
              termDates: { start: '15/02/2021', end: '16/05/2021' },
              needsConsent: false,
              mode: 'World Wide Web',
              times: [
                {
                  day: 'Wed',
                  time: { start: '14:00', end: '16:00' },
                  weeks: '1-5,7-10',
                  location: '_h4vE_n0_',
                  instructor: 'Ms A Vassar,Dr G Mohammadi',
                },
                {
                  day: 'Fri',
                  time: { start: '12:00', end: '14:00' },
                  weeks: '1-5,7-10',
                  location: 'aNgL3s}',
                  instructor: 'Ms A Vassar,Dr G Mohammadi',
                },
              ],
              notes: [],
            },
            {
              classID: 4139,
              section: 'H13A',
              term: 'T1',
              activity: 'Tutorial',
              status: 'Open',
              courseEnrolment: { enrolments: 7, capacity: 18 },
              termDates: { start: '15/02/2021', end: '16/05/2021' },
              needsConsent: false,
              mode: 'World Wide Web',
              times: [
                {
                  day: 'Mon',
                  time: { start: '13:00', end: '14:00' },
                  weeks: '2-5,7-10',
                  location: 'OWEEK{haL0s',
                },
              ],
              notes: [],
            },
            {
              classID: 4140,
              section: 'H14A',
              term: 'T1',
              activity: 'Tutorial',
              status: 'Open',
              courseEnrolment: { enrolments: 4, capacity: 20 },
              termDates: { start: '15/02/2021', end: '16/05/2021' },
              needsConsent: false,
              mode: 'World Wide Web',
              times: [
                {
                  day: 'Thu',
                  time: { start: '14:00', end: '15:00' },
                  weeks: '2-5,7-10',
                  location: 'OWEEK{haL0s',
                },
              ],
              notes: [],
            },
          ],
          notes: [
            'In 21T1 this course will have online lectures and tutorials. Students who are overseas, or unable to attend campus will be able to complete this course, including all classes and assessments, in the online mode.',
          ],
        }
      : await Database.dbRead(args)

  if (course) {
    res.send(JSON.stringify(course))
  } else {
    console.error(
      'dbRead returned null course. params: ' + util.inspect(params)
    )
    res.status(400).send('Invalid termId/courseId param')
  }
}
