import { Career } from '../../../interfaces'

/**
 * Extracts the career from the line
 * @param data: Line that contains data about the career (see the career interface for more details)
 * @returns { Career }: The career that the course is aimed at
 */
const getCareer = (data: string): Career => {
  const career = <Career>data
  if (!(career && Object.values(Career).includes(career))) {
    const career2: Career = <Career>data.split(' ')[0]
    if (!(career2 && Object.values(Career).includes(career2))) {
      console.error(new Error('Invalid Career: ' + career))
    } else {
      console.log(
        'Warning: Career: "' +
          career +
          '" is not in the list of legitimate careers'
      )
    }
  }

  return career
}

export { getCareer }
