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

export { isCensusDate }
