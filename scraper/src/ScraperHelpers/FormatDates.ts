/**
 * Converts date strings into date objects
 *
 * @param {string[]} dates - list of census dates to be formatted to utc time
 * @returns {Date[]}
 * @example
 *    const formatted = formatDates(['01/27/2020']) // Date('01/27/2020')
 */
const formatDates = (dates: string[]): Date[] => {
  return dates.map(date => new Date(date + 'Z'))
}

export { formatDates }
