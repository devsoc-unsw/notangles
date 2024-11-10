import { gql } from '@apollo/client';
import { isWithinInterval, parse } from 'date-fns';

import { client } from '../api/config';
import NetworkError from '../interfaces/NetworkError';
import { Term, TermDataList } from '../interfaces/Periods';

function sortTerms(terms: Term[]): Term[] {
  const termOrder: Record<string, number> = { U1: 0, T1: 1, T2: 2, T3: 3 };

  return terms.sort((a: Term, b: Term) => {
    if (!a || !b) return 0;
    const yearA = parseInt(a.slice(2));
    const yearB = parseInt(b.slice(2));
    const termA = a.slice(0, 2);
    const termB = b.slice(0, 2);

    if (yearA !== yearB) {
      return yearA - yearB;
    }

    return termOrder[termA] - termOrder[termB];
  });
}

const GET_CLASSES = gql`
  query MyQuery {
    classes(where: { term: { _in: ["T1", "T2", "T3", "U1"] } }, distinct_on: offering_period) {
      term
      offering_period
    }
  }
`;

interface TermInfoFetch {
  term: string;
  offering_period: string;
}

interface TermDateDetails {
  startDate: Date;
  endDate: Date;
}

const parseTermOfferingPeriods = (termInfo: TermInfoFetch): TermDateDetails => {
  const [unParsedStartDate, unParsedEndDate] = termInfo.offering_period.split(' - ');
  const startDate = parse(unParsedStartDate, 'dd/MM/yyyy', new Date());
  const endDate = parse(unParsedEndDate, 'dd/MM/yyyy', new Date());
  return { startDate, endDate };
};

const constructTermDetailsMap = async (): Promise<Map<Term, TermDateDetails>> => {
  const termInfoMap = new Map<Term, TermDateDetails>();
  const availableTermData = await client.query<{ classes: TermInfoFetch[] }>({ query: GET_CLASSES });
  availableTermData.data.classes.map((cls: TermInfoFetch) => {
    const termOfferingPeriods = parseTermOfferingPeriods(cls);
    const termKey: Term = (cls.term + termOfferingPeriods.startDate.getFullYear()) as Term;
    termInfoMap.set(termKey!, termOfferingPeriods);
  });

  return termInfoMap;
};

/**
 * @param termInfoMap
 * @param todaysDate The current date to retrieve the latest term from
 * @returns the term data for the latest term
 */
const get_current_term = async (
  termInfoMap: Map<Term, TermDateDetails>,
  todaysDate: Date = new Date(),
): Promise<Term> => {
  const keys_term = sortTerms(Array.from(termInfoMap.keys()));
  for (let currTermIndex = 0; currTermIndex < keys_term.length; currTermIndex++) {
    if (!keys_term[currTermIndex]) continue;
    const currTermVal = termInfoMap.get(keys_term[currTermIndex])!;
    if (isWithinInterval(todaysDate, { start: currTermVal.startDate, end: currTermVal.endDate })) {
      return keys_term[currTermIndex];
    }

    if (
      currTermIndex > 0 &&
      isWithinInterval(todaysDate, {
        start: termInfoMap.get(keys_term[currTermIndex - 1])!.endDate,
        end: currTermVal.startDate,
      })
    ) {
      return keys_term[currTermIndex];
    }
  }
  return undefined;
};

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

  const year = termData.year || '0000';
  const termNumber = Number(termData.termNumber) || 1;
  let firstDayOfTerm = termData.firstDayOfTerm || `0000-00-00`;

  const parseTermData = (termId: string) => {
    let termNum;
    let term = termData.termName || `T${termNumber}`;
    let termName = `Term ${termNumber}`;

    if (termId === 'U1') {
      termName = `Summer Term`;
      term = termId;
      termNum = 0;
    } else {
      termNum = parseInt(termId.substring(1));
      term = `T${termNum}`;
      termName = `Term ${termNum}`;
    }

    return { term: term, termName: termName, termNum: termNum };
  };

  try {
    const termMapInfo = await constructTermDetailsMap();
    const currTermId = await get_current_term(termMapInfo);
    firstDayOfTerm =
      termMapInfo.get(currTermId)?.startDate?.toLocaleDateString().split('/').reverse().join('-') || 'default-date';

    const termsData: TermDataList = sortTerms(Array.from(termMapInfo.keys()));
    // Store the term details in local storage.
    localStorage.setItem(
      'termData',
      JSON.stringify({
        year: year,
        term: termsData.term,
        termNumber: newTerm.termNum,
        termName: newTerm.termName,
        firstDayOfTerm: firstDayOfTerm,
        termsData: termsData,
      }),
    );

    return {
      year: year,
      term: newTerm.term,
      termNumber: newTerm.termNum,
      termName: newTerm.termName,
      firstDayOfTerm: firstDayOfTerm,
      termsData: termsData,
    };
  } catch (e) {
    console.log(e);
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
