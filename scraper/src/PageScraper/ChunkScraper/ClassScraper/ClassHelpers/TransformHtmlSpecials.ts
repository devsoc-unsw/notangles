/**
 * Remove any html character entities (&nbsp, &amp etc) from the given string
 * At this point, it replaces 3 of them: &amp, &nbsp, &lt
 *
 * @param {string} string - The string to remove html characters from
 * @returns {string} string with html special characters replaced with english versions of said symbols
 * @example
 *    const clean = transformHtmlSpecials('&amp;') // 'and'
 */
const transformHtmlSpecials = (str: string) => {
  // &amp --> and
  let newstr = str.replace('&amp;', 'and')

  // &nbsp ---> nothing (as it appears in course enrolment when the course does not have one)
  newstr = newstr.replace('&nbsp;', '')

  // &lt --> < (less than), this could be changed to before??
  newstr = newstr.replace('&lt;', '<')

  // There was no greater than sign found, but if neccessary, can be added here

  return newstr
}

export { transformHtmlSpecials }
