import { Chunk, ClassChunk, PageData } from '../interfaces'

/**
 * Parses the tables on the page, extracts the courses on the page as chunks
 * @param { HTMLElement[] } elements: List of table elements on the page that need to be parsed
 * @returns { PageData[] }: List of course chunks, classified as a pageData object
 */
const parsePage = (elements: HTMLElement[]): PageData[] => {
  /**
   * Extracts the tables on the page containing course data
   * @param { HTMLElement[] } courseTables: List of all the tables on the page
   * @returns { HTMLElement[][] }: List of elements that contain data about a course, group together so each list only contains chunks relevant to one course
   */
  const getCourseElements = (courseTables: HTMLElement[]): HTMLElement[][] => {
    const elementList: HTMLElement[][] = []
    const tableTagName: string = 'TABLE'

    for (const course of courseTables) {
      // Get every td which has more than 1 table
      const subtables = [...course.children].filter(
        (element: HTMLElement): element is HTMLElement =>
          element.tagName === tableTagName
      )
      if (subtables.length > 1) {
        elementList.push(subtables)
      }
    }

    return elementList
  }

  /**
   * Finds and extracts notes from the class chunk
   * Relies on the fact that notes follow "Class Notes" header
   * @param subtable: Table tag equivalent to a class chunk
   */
  const getClassNotes = (subtable: HTMLElement): string[] => {
    const notes = [
      ...subtable.querySelectorAll<HTMLElement>(
        'td.label[colspan="5"], font[color="red"]'
      ),
    ].map(note => note.innerText)
    const noteStartIndex = notes.indexOf('Class Notes')
    let noteCount = 0
    let classNotes: string[] = []
    if (noteStartIndex > -1) {
      noteCount = noteStartIndex > -1 ? notes.length - 1 - noteStartIndex : 0
      classNotes = noteCount > 0 ? notes.splice(noteStartIndex + 1) : []
    }

    return classNotes
  }

  interface GetClassTablesParams {
    subtables: NodeListOf<HTMLElement>
    dataClassSelector: string
  }

  /**
   * Extracts all the classChunks from the page
   * @param { NodeListOf<HTMLElement> } subtables: List of table elements that contain one class chunk each
   * @param { string } dataClassSelector: selector to extract elements with the data class
   * @returns { ClassChunk[] }: List of class chunks that were extracted
   */
  const getClassTables = ({
    subtables,
    dataClassSelector,
  }: GetClassTablesParams): ClassChunk[] => {
    // The table represents a classlist!! -> the split chunks are then each element of subtables...

    // const notes = getClassesNotes(subtables)
    const tablelist: ClassChunk[] = []
    for (const subtable of subtables) {
      // classNotes.push(getClassNotes(subtable))
      const data = [
        ...subtable.querySelectorAll<HTMLElement>(dataClassSelector),
      ].map((element: HTMLElement) => element.innerText)
      const notes = getClassNotes(subtable)
      tablelist.push({
        data: data.slice(0, data.length - notes.length),
        notes,
      })
    }
    return tablelist
  }

  interface GetCourseInfoChunkParams {
    courseInfoElement: HTMLElement
    dataClassSelector: string
  }

  /**
   * Extracts course info chunk from the page
   * @param { HTMLElement } courseInfoElement: The dom element that contains the courseInfo chunk
   * @param { string } dataClassSelector: selector to extract dom elements with the data class
   * @returns { Chunk }: Extracted courseInfo chunk
   */
  const getCourseInfoChunk = ({
    courseInfoElement,
    dataClassSelector,
  }: GetCourseInfoChunkParams): Chunk => {
    // This should be the course info table. --> get data elements
    return {
      data: [
        ...courseInfoElement.querySelectorAll<HTMLElement>(dataClassSelector),
      ].map(element => element.innerText),
    }
  }

  /**
   * Checks if the element contains a class chunk or not
   * @param { HTMLElement } element: Chunk to be checked
   * @returns { boolean }: true, if the element contains a class chunk, otherwise false
   */
  const hasClassChunk = (element: HTMLElement): boolean => {
    // If the table has any element with id top, then it is the classes table.
    const classQuery: string = 'a[href="#top"]'
    const classlist: HTMLElement = element.querySelector(classQuery)
    return classlist !== null
  }

  /**
   * Checks if the element has a note and no useful data
   * @param { HTMLElement } element: The dom element to be checked
   * @returns { boolean }: true, if the element has a note dom element, false otherwise
   */
  const isNoteElement = (element: HTMLElement): boolean => {
    const noteClassSelector: string = '.note'
    const note: HTMLElement = element.querySelector(noteClassSelector)
    return note !== null
  }

  /**
   * Checks if the subtables indicate that the parent might contain a course info chunk
   * @param { NodeListOf<HTMLElement> } subtables: The subtables that might be part of the table element that contains a courseInfoChunk
   * @returns { boolean }: true, if the parent contains a course info chunk, false otherwise
   */
  const hasCourseInfoChunk = (subtables: NodeListOf<HTMLElement>): boolean => {
    return subtables.length === 3
  }

  interface ExtractChunksReturn {
    courseInfoChunk?: Chunk
    classChunks?: ClassChunk[]
  }

  /**
   * Extracts the course info and class chunks (if present) from the element
   * @param { HTMLElement } element: Dom element to extract chunks from
   * @returns { ExtractChunksReturn }: The extracted course info and class chunks, if found
   */
  const extractChunks = (element: HTMLElement): ExtractChunksReturn => {
    const dataClassSelector: string = '.data'
    const pathToInnerTable: string = ':scope > tbody > tr > td > table'
    const subtables: NodeListOf<HTMLElement> = element.querySelectorAll(
      pathToInnerTable
    )

    if (hasClassChunk(element)) {
      return {
        classChunks: getClassTables({ subtables, dataClassSelector }),
      }
    } else if (isNoteElement(element)) {
      // The table is the summary table ---> skip!
    } else if (hasCourseInfoChunk(subtables)) {
      return {
        courseInfoChunk: getCourseInfoChunk({
          courseInfoElement: element,
          dataClassSelector,
        }),
      }
    }
    // Else -> other heading tables ---> skip!

    // Default
    return {}
  }

  /**
   * Extracts chunks from list of elements relating to a single course
   * @param { HTMLElement[]} elements: list of elements relating to a single course
   * @returns { PageData }: extracted courseInfo and courseClasses chunks, formatted as a PageData object
   */
  const parseCourse = (elements: HTMLElement[]): PageData => {
    const dataClassSelector: string = '.data'

    let courseClasses: ClassChunk[] = []
    let courseInfo: Chunk
    for (const element of elements) {
      // If there are any data fields inside the chunk, then categorize it
      const data: HTMLElement = element.querySelector(dataClassSelector)
      if (data) {
        const { classChunks, courseInfoChunk } = extractChunks(element)

        if (courseInfoChunk) {
          courseInfo = courseInfoChunk
        }

        if (classChunks?.length > 0) {
          courseClasses.push(...classChunks)
        }
      }
    }

    return { courseInfo, courseClasses }
  }

  const courseElements = getCourseElements(elements)
  const pageChunks: PageData[] = []

  for (const element of courseElements) {
    const { courseInfo, courseClasses } = parseCourse(element)

    if (courseClasses?.length > 0) {
      pageChunks.push({
        courseInfo,
        courseClasses,
      })
    } else {
      pageChunks.push({ courseInfo })
    }
  }
  return pageChunks
}

export { parsePage }
