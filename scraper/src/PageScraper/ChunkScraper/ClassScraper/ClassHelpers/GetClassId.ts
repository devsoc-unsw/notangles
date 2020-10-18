/**
 * Extracts classID (numeric) from the line.
 * Then checks that it is either a 4 or 5 digit number
 * @param { string } data: Line that contains the classId
 * @returns { number }: ClassID of the class
 */
const getClassId = (data: string): number => {
  const classID = parseInt(data)
  const classIDChecker = /^[0-9]{4,5}$/
  if (!classIDChecker.test(data)) {
    console.error(new Error('Invalid Class Id: ' + classID))
  }

  return classID
}

export { getClassId }
