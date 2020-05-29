interface reverseDayAndMonthParams {
  date: string
  delimiter: string
}

/**
 * Reverses the day and month order of the date so that it can be
 * robustly formated into a Date object using the formatDates() method
 *
 * @param {string} date - Date whose day and month is to be reversed
 * @param {string} delimiter - delimiter separating date fields
 * @returns {string}
 * @example
 *    const rev = reverseDayAndMonth({date: '27/01/2020', delimiter: '/'}) // '01/27/2020'
 */
const reverseDayAndMonth = ({
  date,
  delimiter,
}: reverseDayAndMonthParams): string => {
  const splitDate = date.split(delimiter)
  return [splitDate[1], splitDate[0], splitDate[2]].join(delimiter)
}

export { reverseDayAndMonth }
