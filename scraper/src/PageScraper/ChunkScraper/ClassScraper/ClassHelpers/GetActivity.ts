/**
 * Extracts the activity field, makes sure that it exists
 * @param { string } data:  Line which contains the activity field
 * @returns { string }: Type of activity the class is
 */
const getActivity = (data: string): string => {
  const activity = data
  if (!activity) {
    console.error(new Error('Unknown activity: ' + activity))
  }

  return activity
}

export { getActivity }
