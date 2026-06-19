// This is the file for the Circles integration page
import { CourseData } from "../interfaces/Periods";
import getCourseInfo from "../api/getCourseInfo";

interface CirclesParams {
  term: string;
  year: number;
  courses: string[];
  source: string | null
}

export interface CirclesDataImport {
  courses: CourseData[];
  failedCourses: { code: string, error: string }[];
  term: string;
  year: number;
}

/**
 * Parses Circles import format with the following URL and search
 * Returns null if the URL does not contain a valid Circles import payload
 * 
 * Example format:
 * https://notangles.app/import?term=T1&year=2026&courses=COMP1511,COMP1521,MATH1131&source=circles
 */
const parseURLParams = (search: string): CirclesParams | null => {
  const params = new URLSearchParams(search);

  const term = params.get("term");
  const rawYear = params.get("year");
  const rawCourses = params.get("courses");

  if (!term || !rawYear || !rawCourses) {
    return null
  }

  // ...
  const year = parseInt(rawYear, 10);

  if (isNaN(year)) {
    return null
  }

  const courses = rawCourses?.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);

  if (courses.length <= 0) {
    return null
  }

  return { term, year, courses, source: params.get("source") }
}

export const circlesIntegration = () => {

}