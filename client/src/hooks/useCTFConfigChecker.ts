import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import { useContext } from 'react';
import { CourseData, CreatedEvents, SelectedClasses } from '../interfaces/Periods';

import ctfconfig from '../constants/ctfconfig.json';

const compareObjects = (obj1: Record<string, any>, obj2: Record<string, any>): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!compareObjects(obj1[key], obj2[key])) {
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
};

const checkSelectedCourses = (selectedCourses: CourseData[]): boolean => {
  if (selectedCourses.length !== 3) {
    return false;
  }

  const configCourseCodes = ctfconfig.timetables.T22025[0].selectedCourses.map((course: any) => course.code);
  const configCourseSet = new Set(configCourseCodes);
  const selectedCourseCodes = selectedCourses.map((course: CourseData) => course.code);
  const isValid = selectedCourseCodes.every((courseCode) => configCourseSet.has(courseCode));

  return isValid;
};

const checkSelectedClasses = (selectClasses: SelectedClasses): boolean => {
  const configSelectedClasses = ctfconfig.timetables.T22025[0].selectedClasses;
  const configSelectedClassesNo = Object.fromEntries(
    Object.entries(configSelectedClasses).map(([key, value]) => [
      key,
      Object.fromEntries(Object.entries(value).map(([key, value]) => [key, value.classNo])),
    ]),
  );
  const selectedClassesNo = Object.fromEntries(
    Object.entries(selectClasses).map(([key, value]) => [
      key,
      Object.fromEntries(Object.entries(value).map(([key, value]) => [key, value?.classNo])),
    ]),
  );
  return compareObjects(configSelectedClassesNo, selectedClassesNo);
};

const checkCreatedEvents = (createdEvents: CreatedEvents): boolean => {
  const configCreatedEvents = ctfconfig.timetables.T22025[0].createdEvents;
  const configCreatedEventsNameTime = Object.fromEntries(
    Object.entries(configCreatedEvents).map(([key, value]) => [value.event.name, value.time]),
  );
  const createdEventsNameTime = Object.fromEntries(
    Object.entries(createdEvents).map(([key, value]) => [value.event.name, value.time]),
  );

  return compareObjects(configCreatedEventsNameTime, createdEventsNameTime);
};

const checkColorTheme = (currentTheme: string): boolean => {
  const configCurrentTheme = ctfconfig.currentTheme;
  if (currentTheme === configCurrentTheme) {
    return true;
  }
  return false;
};

const useCTFConfigChecker = () => {
  const { currentTheme } = useContext(AppContext);
  const { selectedCourses, selectedClasses, createdEvents } = useContext(CourseContext);

  return (
    checkColorTheme(currentTheme) &&
    checkSelectedCourses(selectedCourses) &&
    checkSelectedClasses(selectedClasses) &&
    checkCreatedEvents(createdEvents)
  );
};

export default useCTFConfigChecker;
