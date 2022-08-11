const REGULAR_TERM_STR_LEN = 2;

import { useContext } from 'react';
import { API_URL } from '../api/config';
import timeoutPromise from '../utils/timeoutPromise';
import { AppContext } from '../context/AppContext';

export const getAvailableTermDetails = async () => {
  // These are invalid term strings that are initially set
  // and the api will replace them with valid ones and return them.
  let year = '0000';
  let termNumber = 1;
  let term = `T${termNumber}`;
  let termName = `Term ${termNumber}`;
  let firstDayOfTerm = `0000-00-00`;

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

// Calculate the hours difference between the user's timezone and the Australian timezone.
export const getTimeZoneOffset = (isConvertToLocalTimezone: boolean): number => {

  if (!isConvertToLocalTimezone) return 0;

  const localDate = new Date();
  const sydDate = new Date(localDate.toLocaleString('en-UK', { timeZone: "Australia/Sydney" }));
  const offset = ((sydDate.getHours() * 60 + sydDate.getMinutes()) - (localDate.getHours() * 60 + localDate.getMinutes())) / 60;

  return 14;
}

// Get the local time based on the calculated offset.
export const getLocalTime = (isConvertToLocalTimezone: boolean, time: number): number => {
  const offset = getTimeZoneOffset(isConvertToLocalTimezone);
  let newTime = time - offset;
  if (newTime < 0) {
    newTime = ((newTime % 24) + 24) % 24;
  }
  return newTime;
}

export const getDefaultStartTime = (isConvertToLocalTimezone: boolean): number => {
  return getLocalTime(isConvertToLocalTimezone, 9);
}

export const getDefaultEndTime = (isConvertToLocalTimezone: boolean): number => {
  return getLocalTime(isConvertToLocalTimezone, 18);
}

export const maxAddedCourses = 8;

export const weekdaysLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const weekdaysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const unknownErrorMessage = 'An unknown error has occurred, please hard refresh the page'
