/**
 * Check each extracted note
 * @param { string[] } notes: Raw notes array
 * @returns { string [] }: All the valid notes found on the page
 */
const parseNotes = (notes: string[]): string[] => {
  const cleanNotes: string[] = []
  for (const note of notes) {
    if (note) {
      cleanNotes.push(note)
    }
  }
  return cleanNotes
}

export { parseNotes }
