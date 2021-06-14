interface GetTimeReturn {
  start: string
  end: string
}

/**
 * Extracts the start and end times of a class
 * @param { string } data: Line which contains data about the class timings
 * @returns { GetTimeReturn }: Start and end times for one instance of the class
 */
const getTime = (data: string): GetTimeReturn => {
  const times = data.split(' - ')
  if (!times || times.length === 0) {
    console.error(new Error('Could not find start and end times in: ' + times))
  }
  const time = { start: times[0], end: times[1] }
  // Checking the format of the dates
  const timeCheckerRegex = /^[0-9]{2}:[0-9]{2}$/
  if (!(timeCheckerRegex.test(time.start) && timeCheckerRegex.test(time.end))) {
    console.error(new Error('Invalid Time(s): ' + JSON.stringify(time)))
  }

  return time
}

export { getTime }
