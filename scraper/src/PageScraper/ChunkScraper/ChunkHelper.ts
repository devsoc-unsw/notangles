/**
 * Checks if the current line is the term the course runs in or not
 * @param data: Line that might contain data about the Term field
 * @returns { boolean }: true if the line contains the term the course runs in, false otherwise
 */
const isTerm = (data: string): boolean => {
  // Term regex -> letter, letter or number, optional letter or number
  const termFinderRegex = /^[A-Z][A-Z0-9][A-Z0-9]?$/
  return termFinderRegex.test(data)
}

/**
 * Checks if the current line contains the census date
 * @param data: Line that might be the census date
 * @returns { boolean }: true if the line contains the census date, false otherwise
 */
const isCensusDate = (data: string): boolean => {
  // Look for the census dates in case there is no class to extract dates from
  const censusDateFinder = /^[0-9]+-[A-Z]+-[0-9]+$/
  return censusDateFinder.test(data)
}

export { isTerm, isCensusDate }
