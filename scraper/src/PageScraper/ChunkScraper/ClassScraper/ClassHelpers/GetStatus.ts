import { Status } from '../../../../interfaces'

/**
 * Extracts the status field, makes sure that it exists and is one of the fields described in the enum Status interfaces.ts
 * @param { string } data: Line which contains the status field
 * @returns { Status }: Status of the class (check the Status enum for more details)
 */
const getStatus = (data: string): Status => {
  const status = <Status>data
  if (!Object.values(Status).includes(status)) {
    console.error(new Error('Invalid Status: ' + status))
  }

  return status
}

export { getStatus }
