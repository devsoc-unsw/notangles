import { ClassChunk, ClassesByTerm, ClassWarnings } from '../../interfaces'
import { parseClassChunk } from '../ChunkScraper/ClassScraper/ClassScraper'
import { getTermFromClass } from './GetTermFromClass'

interface GetClassesByTermReturn {
  classes: ClassesByTerm
  classWarnings: ClassWarnings[]
}

/**
 * Convert class chunks into class objects and classify them into terms
 * @param { Chunk[] } courseClasses: List of raw class chunks
 * @returns { GetClassesByTermReturn }: Parsed class objects, along with any warnings that occured during parsing
 */
const getClassesByTerm = (
  courseClasses: ClassChunk[]
): GetClassesByTermReturn => {
  const classes: ClassesByTerm = {
    Summer: [],
    T1: [],
    T2: [],
    T3: [],
    S1: [],
    S2: [],
    Other: [],
  }
  const classWarnings: ClassWarnings[] = []
  for (const courseClass of courseClasses) {
    const parsedClassChunk = parseClassChunk({
      chunk: courseClass,
    })
    if (parsedClassChunk) {
      classes[
        getTermFromClass({
          cls: parsedClassChunk.classData,
        })
      ].push(parsedClassChunk.classData)

      classWarnings.push(...parsedClassChunk.warnings)
    }
  }

  return { classes, classWarnings }
}

export { getClassesByTerm }
