/**
 * Extracts term field and checks that the format is a capital letter, followed by one or two capital letters or numbers
 * @param { string } data: Line that contains the term field
 * @returns { string }: The term that the class runs in
 */
const getTerm = (data: string): string => {
  let term: string
  const termFinderRegex = /^([A-Z][A-Z0-9][A-Z0-9]?).*/
  if (termFinderRegex.test(data)) {
    term = termFinderRegex.exec(data)[1]
  }

  return term
}

export { getTerm }
