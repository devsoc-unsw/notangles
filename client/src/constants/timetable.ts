const REGULAR_TERM_STR_LEN = 2;

import { API_URL } from '../api/config';
import timeoutPromise from '../utils/timeoutPromise';

export const getAvailableTermDetails = async () => {
  // These are invalid term strings that are initially set
  // and the api will replace them with valid ones and return them.
  let termData = {
    year: '',
    term: '',
    termNumber: '',
    termName: '',
    firstDayOfTerm: '',
  };

  if (localStorage.getItem('termData')) {
    termData = JSON.parse(localStorage.getItem('termData')!);
  }
  let year = termData.year || '0000';
  let termNumber = Number(termData.termNumber) || 1;
  let term = termData.termName || `T${termNumber}`;
  let termName = `Term ${termNumber}`;
  let firstDayOfTerm = termData.firstDayOfTerm || `0000-00-00`;

  try {
    const termDateFetch = await timeoutPromise(1000, fetch(`${API_URL.timetable}/startdate/notangles`));
    const termDateRes = await termDateFetch.text();
    const termIdFetch = await timeoutPromise(1000, fetch(`${API_URL.timetable}/availableterm`));

    let regexp = /(\d{2})\/(\d{2})\/(\d{4})/;

    let matched = termDateRes.match(regexp);
    if (matched != null) {
      year = matched[3];
    }

    const termDateSplit = termDateRes.split('/');
    firstDayOfTerm = termDateSplit.reverse().join('-');

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
    // Store the term details in local storage.
    localStorage.setItem(
      'termData',
      JSON.stringify({
        year: year,
        term: term,
        termNumber: termNumber,
        termName: termName,
        firstDayOfTerm: firstDayOfTerm,
      })
    );

    return {
      term: term,
      termName: termName,
      termNumber: termNumber,
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
