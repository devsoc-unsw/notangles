/**
 * Extracts and checks data about the section of the class
 * @param { string } data: Line that contains data about the section of the class
 * @returns { string }: Section "number" of the class
 */
const getSection = (data: string): string => {
  const section = data
  const sectionChecker = /^[A-Z0-9]{0,4}$/
  if (!sectionChecker.test(section)) {
    console.error(new Error('Invalid Section: ' + section))
  }

  return section
}

export { getSection }
