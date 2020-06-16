import { WarningTag, ClassWarnings } from '../../../../interfaces'

interface makeClassWarningParams {
  classID: number
  term: string
  errorKey: string
  errorValue: unknown
  tag?: WarningTag
}

/**
 * Takes in error details and returns its corresponding ClassWarnings
 *
 * @param {number} classID - ID of erroneous class
 * @param {string} term - Term in which the erroneous class is
 * @param {string} errorKey
 * @param {unknown} errorValue
 * @param {WarningTag} tag - A Warning tag for easier classification of the error
 * @returns { ClassWarnings }
 */
const makeClassWarning = ({
  classID,
  term,
  errorKey,
  errorValue,
  tag = WarningTag.Other,
}: makeClassWarningParams): ClassWarnings => {
  const warn: ClassWarnings = {
    tag: tag,
    classID: classID,
    term: term,
    error: {
      key: errorKey,
      value: errorValue,
    },
  }
  return warn
}

export { makeClassWarning }
