/**
 * Extracts the name of the school that offers the course that is being parsed
 * @param school: Line that contains data about the school field
 * @returns { string }: The school that offers the current course
 */
const getSchool = (school: string): string => {
  // School is a string
  if (!school || school === ' ') {
    console.error(new Error('Invalid School: ' + school))
  }

  return school
}

export { getSchool }
