/**
 * Extracts the name of the instructor (if listed)
 * @param { string } data: Line to be parsed
 * @returns { string }: Name of the instructor that might be listed
 */
const getInstructor = (data: string): string | false => {
  if (data && data !== '') {
    return data
  }
  return false
}

export { getInstructor }
