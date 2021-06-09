import { ClassWarnings, WarningTag } from '../../../../interfaces'
import { makeClassWarning } from '../ClassHelpers/MakeClassWarning'

interface GetWeeksParams {
  data: string
  classID: number
  term: string
}

interface GetWeeksReturn {
  weeks: string
  weeksWarnings: ClassWarnings[]
}

/**
 * Extracts data about the weeks in which the class runs
 * @param { string } data: Line which contains data about the weeks the class runs in
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetWeeksReturn }: The weeks in the term that the course runs in, and any warnings that occured during parsing the data passed
 */
const getWeeks = ({ data, classID, term }: GetWeeksParams): GetWeeksReturn => {
  const weeks = data
  const weeksWarnings: ClassWarnings[] = []
  // Weeks is an alphanumeric string consisting of numbers, - and ,
  // (Strict requirement)
  let weeksTesterRegex = /^[0-9, <>-]+$/
  if (!weeksTesterRegex.test(weeks)) {
    weeksTesterRegex = /^[0-9A-Z, <>-]+$/
    if (!weeksTesterRegex.test(weeks)) {
      console.error(new Error('Invalid Weeks data: ' + weeks))
    } else {
      // Just warn -> Invalid/unknown weeks data.
      weeksWarnings.push(
        makeClassWarning({
          classID: classID,
          term: term,
          errorKey: 'weeks',
          errorValue: weeks,
          tag: WarningTag.UnknownDate_Weeks,
        })
      )
    }
  }

  return { weeks, weeksWarnings }
}

export { getWeeks }
