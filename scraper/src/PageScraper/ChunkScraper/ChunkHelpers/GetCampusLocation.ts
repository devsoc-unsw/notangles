/**
 * Extracts data about which campus the course runs at
 * @param campus: Line that contains data about the campus location
 * @returns { string }: The campus location that was found
 */
const getCampusLocation = (campus: string): string => {
  if (!campus || campus === ' ') {
    console.error(new Error('Invalid Campus: ' + campus))
  }

  return campus
}

export { getCampusLocation }
