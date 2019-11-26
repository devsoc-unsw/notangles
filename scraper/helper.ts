/**
 * Remove any html character entities from the given string
 * At this point, it only looks for 3 of them as more are not necessary
 * @param string The string to remove html characters from
 */
const removeHtmlSpecials = (string: string) => {
  // &amp --> and
  let newstr = string.replace('&amp;', 'and')

  // &nbsp ---> nothing (as it appears in course enrolment when the course does not have one)
  newstr = newstr.replace('&nbsp;', '')

  // &lt --> < (less than), this could be changed to before??
  newstr = newstr.replace('&lt;', '<')

  // There was no greater than sign found, but if neccessary, can be added here

  return newstr
}

/**
 * Converts dates into date objects
 * @param dateList: list of census dates to be formatted to utc time
 */
const formatDates = (dateList: string[]): Date[] => {
  return dateList.map(date => new Date(date + 'Z'))
}

/**
 * Reverses the day and month order of the date so that it can be
 * robustly formated into a Date object using the formatDates() method
 * @param date: Date whose day and month is to be reversed
 * @param delimiter: delimiter separating date fiels
 */
const reverseDayAndMonth = (date: string, delimiter: string): string => {
  const splitDate = date.split(delimiter)
  return [splitDate[1], splitDate[0], splitDate[2]].join(delimiter)
}

/**
 * Returns a list of keys for an object
 * @param obj: Object to return a list of keys for
 */
const keysOf = <T extends {}>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[]

export { removeHtmlSpecials, formatDates, reverseDayAndMonth, keysOf }
