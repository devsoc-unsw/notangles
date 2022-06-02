export let year = '0000';
let termNumber = 1;
export let term = `T${termNumber}`;
export let termName = `Term ${termNumber}`;

// first monday of week 1 of the term
export let firstDayOfTerm = `0000-00-00`;

const REGULAR_TERM_STR_LEN = 2;

import { API_URL } from '../api/config';
import timeoutPromise from '../utils/timeoutPromise';

export const setAvailableTermDetails = async () => {
  try {
    const termDateFetch = await timeoutPromise(1000, fetch(`${API_URL.timetable}/startdate/notangles`));
    const termDateRes = await termDateFetch.text();
    const termIdFetch = await timeoutPromise(1000, fetch(`${API_URL.timetable}/availableterm`));

    let regexp = /(\d{2})\/(\d{2})\/(\d{4})/;

    let matched = termDateRes.match(regexp);
    if (matched != null) {
      year = matched[3];
    }

    firstDayOfTerm = termDateRes.replaceAll('/', '-');

    const termIdRes = await termIdFetch.text();
    if (termIdRes.length === REGULAR_TERM_STR_LEN) {
      // This is not a summer term.
      termNumber = parseInt(termIdRes.substring(1));
      term = `T${termNumber}`;
      termName = `Term ${termNumber}`;
    } else {
      // This is a summer term.
      termName = `Summer Term`;
      term = termIdRes;
      termNumber = 0; // This is a summer term.
    }

    return {
      term: term,
      termName: termName,
      year: year,
      firstDayOfTerm: firstDayOfTerm,
    };
  } catch (e) {
    console.log('Could not ping timetable scraper!');
  }
};

export const colors: string[] = [
  '#137786', // dark cyan
  '#a843a4', // light purple
  '#134e86', // light blue
  '#138652', // light green
  '#861313', // dark red
  '#868413', // dark yellow
  '#2e89ff', // dark blue
  '#3323ad', // deep blue
];

export const defaultStartTime: number = 9;
export const defaultEndTime: number = 18;

export const maxAddedCourses = 8;
