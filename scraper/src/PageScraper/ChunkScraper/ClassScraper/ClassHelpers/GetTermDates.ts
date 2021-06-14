interface GetTermDatesReturn {
  start: string
  end: string
}

/**
 * Gets the dates the class starts and ends. Also checks that the dates are in proper format
 * @param { string } data: Line which contains the dates during which the class runs
 * @returns { GetTermDatesReturn }: Start and end dates for the class
 */
const getTermDates = (data: string): GetTermDatesReturn => {
  const runDates = data.split(' - ')
  if (!runDates || runDates.length === 0) {
    console.error(
      new Error('Could not find start and end dates in: ' + runDates)
    )
  }
  const termDates = {
    start: runDates[0],
    end: runDates[1],
  }
  // Checking the format of the dates
  const dateCheckerRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/
  if (
    !(
      dateCheckerRegex.test(termDates.start) &&
      dateCheckerRegex.test(termDates.end)
    )
  ) {
    console.error(new Error('Invalid Date(s): ' + termDates))
  }

  return termDates
}

export { getTermDates }
