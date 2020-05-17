import { ClassWarnings, WarningTag } from '../../../../interfaces'
import { makeClassWarning, transformHtmlSpecials } from '../../../../helper'

interface GetLocationParams {
  data: string
  classID: number
  term: string
}

interface GetLocationReturn {
  location: string | false
  locationWarnings: ClassWarnings[]
}

/**
 * Extracts the location of a class
 * @param { string } data: Line which contains data about the location of the class
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetLocationReturn }: The location for the given timing of the class and any warnings associated with parsing issues
 */
const getLocation = ({
  data,
  classID,
  term,
}: GetLocationParams): GetLocationReturn => {
  let location: string | false = transformHtmlSpecials(data)
  const locationWarnings: ClassWarnings[] = []
  // Check if location exists
  const locationTesterRegex = /[A-Za-z]/
  if (!(location && locationTesterRegex.test(location))) {
    // Warning: Unknown location!!
    locationWarnings.push(
      makeClassWarning({
        classID: classID,
        term: term,
        errorKey: 'location',
        errorValue: location,
        tag: WarningTag.UnknownLocation,
      })
    )

    // Remove location.
    location = false
  }

  return { location, locationWarnings }
}

export { getLocation }
