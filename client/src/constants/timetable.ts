import { API_URL } from '../api/config';
import NetworkError from '../interfaces/NetworkError';
import timeoutPromise from '../utils/timeoutPromise';

const REGULAR_TERM_STR_LEN = 2;

/**
 * @returns The details of the latest term there is data for
 */
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
    console.log(termDateRes)

    // testing how to get prev/current term data --> can potentially make use of freerooms api
    // startdate/freerooms gets the start date of the current term
    // /currentterm can be used to get the current terms id
    const prevTermDate = await timeoutPromise(1000, fetch(`${API_URL.timetable}/startdate/freerooms`));
    const prevTermRes = await prevTermDate.text();
    const prevTermId = await timeoutPromise(1000, fetch(`${API_URL.timetable}/currentterm`));
    const prevTermIdRes = await prevTermId.text();
    console.log(prevTermRes);
    console.log(prevTermIdRes);
    let regexp = /(\d{2})\/(\d{2})\/(\d{4})/;

    const matched = termDateRes.match(regexp);
    if (matched != null) {
      year = matched[3];
    }

    let prevYear = ''
    matched = prevTermRes.match(regexp);
    if (matched != null) {
      prevYear = matched[3]
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

    const prevDateSplit = prevTermRes.split('/');
    let prevFirstDate = prevDateSplit.reverse().join('-');
    let prevTermName = `Summer Term`;
    let prevTermNum = 0;
    let prevTerm = `T${prevTermNum}`;

    if (prevTermIdRes.length === REGULAR_TERM_STR_LEN) {
      // This is not a summer term.
      prevTermNum = parseInt(prevTermIdRes.substring(1));
      prevTerm = `T${prevTermNum}`;
      prevTermName = `Term ${prevTermNum}`;
    } else {
      // This is a summer term.
      prevTermName = `Summer Term`;
      prevTerm = termIdRes;
      prevTermNum = 0; // This is a summer term.
    }

    const termsData = {
      prevTerm: { year: prevYear, term: prevTerm, termName: prevTermName }, newTerm: { year: year, term: term, termName: termName }
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
        termsData: termsData
      })
    );

    return {
      term: term,
      termName: termName,
      termNumber: termNumber,
      year: year,
      firstDayOfTerm: firstDayOfTerm,
      termsData: termsData
    };
  } catch (e) {
    throw new NetworkError('Could not connect to timetable scraper!');
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

/**
 * @param isConvertToLocalTimezone Boolean for whether to convert to user's local timezone
 * @returns A number which represents the hour offset between Sydney timezone and the user's local timezone.
 */
export const getTimeZoneOffset = (isConvertToLocalTimezone: boolean): number => {
  if (!isConvertToLocalTimezone) return 0;

  const localDate = new Date();
  const sydDate = localDate.toLocaleString('en-UK', { timeZone: 'Australia/Sydney' });

  // Get the date and time of the Sydney timezone.
  const [date, time] = sydDate.split(', ');

  // Get the specific day, month and year of the Sydney timezone to convert the string
  // to a YYYY-MM-DD format to be created into a Date object.
  const [day, month, year] = date.split('/');
  const formattedSydDate = new Date(`${year}-${month}-${day}T${time}`);

  const offset =
    (formattedSydDate.getHours() * 60 +
      formattedSydDate.getMinutes() -
      (localDate.getHours() * 60 + localDate.getMinutes())) /
    60;

  return offset;
};

/**
 * @param isConvertToLocalTimezone Boolean for whether to convert to user's local timezone
 * @param time The original time to be converted.
 * @returns The new converted time (according to the user's local timezone).
 */
export const getLocalTime = (isConvertToLocalTimezone: boolean, time: number): number => {
  const offset = getTimeZoneOffset(isConvertToLocalTimezone);
  let newTime = time - offset;
  if (newTime < 0) {
    newTime = ((newTime % 24) + 24) % 24;
  }
  return newTime;
};

/**
 * @param isConvertToLocalTimezone Whether to convert the start time to the user's local timezone
 * @returns The default start time of the timetable (9am Sydney time)
 */
export const getDefaultStartTime = (isConvertToLocalTimezone: boolean): number => {
  return getLocalTime(isConvertToLocalTimezone, 9);
};

/**
 * @param isConvertToLocalTimezone Whether to convert the end time to the user's local timezone
 * @returns The default end time of the timetable (6pm Sydney time)
 */
export const getDefaultEndTime = (isConvertToLocalTimezone: boolean): number => {
  return getLocalTime(isConvertToLocalTimezone, 18);
};

export const timetableWidth = 1100;
export const rowHeight = 60;
export const classMargin = 1;
export const headerPadding = 10;

export const maxAddedCourses = 8;

export const daysLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const daysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const weekdaysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr'];

export const unknownErrorMessage = 'An unknown error has occurred, please hard refresh the page';

export const invalidYearFormat = '0000';
