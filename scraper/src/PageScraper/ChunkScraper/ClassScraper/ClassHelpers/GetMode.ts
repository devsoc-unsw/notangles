/**
 * Extracts the mode of class delivery
 * @param { string } mode: Line which contains the mode field
 * @returns { string }: Mode of delivery for a class
 */
const getMode = (mode: string): string => {
  if (!mode || mode === ' ') {
    console.error(new Error('Invalid Mode: ' + mode))
  }

  return mode
}

export { getMode }
