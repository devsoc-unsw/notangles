/**
 * Checks if the course needs permission of the school to enrol into the class/course
 * @param { string } data: Line which contains data about the consent field
 * @returns { boolean }: true if the course needs consent, else false
 */
const getNeedsConsent = (data: string): boolean => {
  const consentRegex = /[Nn]ot/
  return !consentRegex.test(data)
}

export { getNeedsConsent }
