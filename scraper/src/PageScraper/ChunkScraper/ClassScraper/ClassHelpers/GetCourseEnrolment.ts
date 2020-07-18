import { makeClassWarning } from './MakeClassWarning'
import { ClassWarnings, WarningTag } from '../../../../interfaces'

interface GetCourseEnrolmentParams {
  data: string
  classID: number
  term: string
}

interface GetCourseEnrolmentReturn {
  courseEnrolment: {
    enrolments: number
    capacity: number
  }
  enrolmentWarnings: ClassWarnings[]
}

/**
 * Extracts the course enrolment field, and checks that it is valid
 * @param { string } data: Line which contains the course enrolment field
 * @param { number } classID: The class id of the current class being parsed
 * @param { string } term: The term in which the class runs
 * @returns { GetCourseEnrolmentReturn }: Number of students enrolled in the course, total number of students allowed to take the course, and any warnings that were raised during parsing data
 */
const getCourseEnrolment = ({
  data,
  classID,
  term,
}: GetCourseEnrolmentParams): GetCourseEnrolmentReturn => {
  const enrolmentWarnings: ClassWarnings[] = []
  const enrAndCap = data.split('/')
  const courseEnrolment = {
    enrolments: parseInt(enrAndCap[0]),
    capacity: parseInt(enrAndCap[1]),
  }
  // Enrolments and capacity are both numbers and enrolment less than capacity
  // (Strict requirement)
  if (
    !courseEnrolment ||
    !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity > 0)
  ) {
    // Lax requirement
    if (
      !courseEnrolment ||
      !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity >= 0)
    ) {
      console.error(
        new Error(
          'Invalid Course Enrolment: ' +
            courseEnrolment.enrolments +
            ' ' +
            courseEnrolment.capacity
        )
      )
    } else if (courseEnrolment.capacity === 0) {
      // Zero capacity!!
      enrolmentWarnings.push(
        makeClassWarning({
          classID,
          term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
          tag: WarningTag.ZeroEnrolmentCapacity,
        })
      )
    } // Other error
    else {
      enrolmentWarnings.push(
        makeClassWarning({
          classID,
          term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
        })
      )
    }
  }

  return { courseEnrolment, enrolmentWarnings }
}

export { getCourseEnrolment }
