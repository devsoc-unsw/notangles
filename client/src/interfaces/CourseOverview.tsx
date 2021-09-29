export type CoursesList = CourseOverview[];
export interface CourseOverview {
  id: string
  code: string
  name: string
  online: boolean
  inPerson: boolean
}
