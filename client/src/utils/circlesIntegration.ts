// This is the file for the Circles integration page
import { CourseData } from "../interfaces/Periods";
import getCourseInfo from "../api/getCourseInfo";
import storage from "./storage";

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
  hasConflict: boolean;
}

// using a key for the user's local browser data
// const CIRCLES_INTEGRATION_KEY = "not_circles_int"

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

  const year = parseInt(rawYear, 10);

  if (isNaN(year)) {
    return null
  }

  // implementing checks for valid course codes here...


  const courses = rawCourses?.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);

  if (courses.length <= 0) {
    return null
  }

  return { term, year, courses, source: params.get("source") }
}

/**
 * Prevents URL from being re-imported after a page refresh
 */
const stripParseURLParam = (): void => {
  const url = new URL(window.location.href);
  ["term", "year", "courses", "source"].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState({}, "", url.toString());
}

/**
 * Checks for conflicting timetable data
 */
export const hasConflictingTimetable = (): boolean => {
  const timetable = storage.get("timetables");

  if (!timetable || typeof timetable !== "object") {
    return false
  }

  return Object.values(timetable).some((t) => {
    if (!Array.isArray(t)) {
      return false
    }
    return t.some((entry: object) => entry && typeof entry === "object" && Object.keys(entry).length > 0);
  })

} 

export const circlesIntegration = async (isConvertToLocalTimezone: boolean): Promise<CirclesDataImport | null> => {
  const parsed = parseURLParams(window.location.search);

  if (!parsed) {
    return null
  }

  const { term, year, courses } = parsed;

  const result = await Promise.allSettled(
    courses.map((course) => getCourseInfo(term, course, year, isConvertToLocalTimezone))
  );

  const data: CirclesDataImport = {
    courses: [],
    failedCourses: [],
    term,
    year,
    hasConflict: hasConflictingTimetable(),
  }

  // const courseData: CourseData[] = [];
  // const failedCourses: { code: string, error: string }[] = [];

  result.forEach((res, index) => {
    if (res.status === "fulfilled") {
      data.courses.push(res.value);
    } else {
      data.failedCourses.push({ 
        code: courses[index], 
        error: res.reason instanceof Error ? res.reason.message : "Unknown Error"
      });
    }
  });

  stripParseURLParam();

  return data;
}
