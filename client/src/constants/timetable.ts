import { gql } from '@apollo/client';
import { addWeeks, isWithinInterval, parse, startOfWeek } from 'date-fns';

import { client } from '../api/config';
import NetworkError from '../interfaces/NetworkError';
import { TermDataMap } from '../interfaces/Periods';

type Term = string;
const SUPPORTED_TERMS = ['U1', 'T1', 'T2', 'T3'];

const prevTermIdx = (currIdx: number) => {
  return Math.max(0, --currIdx);
};

const nextTermIdx = (currIdx: number) => {
  return currIdx + 1 >= SUPPORTED_TERMS.length ? 0 : ++currIdx;
};

const getTermId = (currTerm: Term): number => {
  return SUPPORTED_TERMS.findIndex((ct) => ct === currTerm);
};

const GET_CLASSES = gql`
  query MyQuery {
    classes(distinct_on: term, where: { term: { _in: ["T1", "T2", "T3", "U1"] } }) {
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

// TODO: remove
const TERM_INFO_MAP = new Map<string, TermDateDetails>();

const parseTermOfferingPeriods = (termInfo: TermInfoFetch): TermDateDetails => {
  const [unParsedStartDate, unParsedEndDate] = termInfo.offering_period.split(' - ');
  console.log(unParsedStartDate, unParsedEndDate);
  const startDate = parse(unParsedStartDate, 'dd/MM/yyyy', new Date());
  const endDate = parse(unParsedEndDate, 'dd/MM/yyyy', new Date());
  return { startDate, endDate };
};

const constructTermDetailsMap = async (): Promise<Map<string, TermDateDetails>> => {
  const termInfoMap = new Map<string, TermDateDetails>();
  const availableTermData = await client.query<{ classes: TermInfoFetch[] }>({ query: GET_CLASSES });

  availableTermData.data.classes.map((cls: TermInfoFetch) => {
    termInfoMap.set(cls.term, parseTermOfferingPeriods(cls));
  });

  return termInfoMap;
};

const getDateOfNthWeekMondayInTerm = async (term: Term, week: number = 0): Promise<Date> => {
  if (TERM_INFO_MAP.size === 0) {
    await constructTermDetailsMap();
  }
  const currTermStr = TERM_INFO_MAP.get(term)!;
  const nthMonday = startOfWeek(addWeeks(currTermStr.startDate, week), { weekStartsOn: 1 }); // 1 -> Monday
  return nthMonday;
};

/**
 * @param termInfoMap
 * @param todaysDate The current date to retrieve the latest term from
 * @returns the term data for the latest term
 */
const get_current_term = async (
  termInfoMap: Map<string, TermDateDetails>,
  todaysDate: Date = new Date(),
): Promise<Term> => {
  // Cycle through this and check if we are within a term
  // If we are not within a term but in between display the next term.
  for (let currTermIndex = 0; currTermIndex < SUPPORTED_TERMS.length; currTermIndex++) {
    const currTermStr: string = SUPPORTED_TERMS[currTermIndex];
    const termInfo = termInfoMap.get(currTermStr);
    if (!termInfo) continue;
    if (isWithinInterval(todaysDate, { start: termInfo.startDate, end: termInfo.endDate })) {
      // const seventhMondayDate = await getDateOfNthWeekMondayInTerm(currTermStr, 7);
      // if (isWithinInterval(todaysDate, { start: seventhMondayDate, end: termInfo.endDate })) {
      //   return SUPPORTED_TERMS[nextTermIdx(currTermIndex)]; // Return Next term assuming it is Week 7 and classes have been updated.
      // }
      return currTermStr;
    } else if (
      isWithinInterval(todaysDate, {
        start: termInfo.endDate,
        end: termInfoMap.get(SUPPORTED_TERMS[nextTermIdx(currTermIndex)])?.startDate!,
      })
    ) {
      return SUPPORTED_TERMS[nextTermIdx(currTermIndex)];
    }
  }

  return 'Invalid Term';
};

// TODO: remove
// interface ClassCensusDateInfo {
//   classes: ClassCensusDate[];
// }
// interface ClassCensusDate {
//   census_date: string;
//   term: string;
//   offering_period: string;
// }
// export const constructTermDetailsMap = async () => {
//   const { data } = await client.query<ClassCensusDateInfo>({ query: GET_CLASSES });

//   const classes = data.classes;
//   const termOfferingMap = new Map<string, Date[]>();
//   if (classes) {
//     classes.forEach((cls: { term: string; offering_period: string }) => {
//       const [unParsedStartDate, unParsedEndDate] = cls.offering_period.split(' - ');
//   const startDate = parse(unParsedStartDate, 'dd/MM/yyyy', new Date());
//   const endDate = parse(unParsedEndDate, 'dd/MM/yyyy', new Date());
//       if (cls.term in ['T1', 'T2', 'T3', 'U1']) {
//         termOfferingMap.set(cls.term, [startDate, endDate]);
//       }
//     });
//   }
//   console.log(termOfferingMap);
// };

const REGULAR_TERM_STR_LEN = 2;

const parseYear = (termDate: string) => {
  console.log(termDate);
  const regexp = /(\d{2})\/(\d{2})\/(\d{4})/;

  const matched = termDate.match(regexp);
  let extractedYear = '';
  if (matched != null) {
    extractedYear = matched[3];
  }
  return extractedYear;
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

  let year = termData.year || '0000';
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
    // TODO: maybe create a function to get the previous term - we need to figure out the logic for when exactly
    // we 'release' the latest term data and then transition?!?!
    const prevTermId = SUPPORTED_TERMS[Math.max(SUPPORTED_TERMS.findIndex((term) => term == currTermId) - 1, 0)];

    firstDayOfTerm = termMapInfo.get(currTermId)?.startDate.toLocaleDateString().split('/').reverse().join('-')!;

    const newTerm = parseTermData(currTermId);
    const prevTerm = parseTermData(prevTermId);

    const extractedCurrYear = parseYear(termMapInfo.get(currTermId)?.startDate.toLocaleDateString()!);
    if (extractedCurrYear.length > 0) {
      year = extractedCurrYear;
    }

    const prevYear = parseYear(termMapInfo.get(prevTermId)?.startDate.toLocaleDateString()!);

    const termsData: TermDataMap = {
      prevTerm: { year: prevYear, term: prevTerm.term },
      newTerm: { year: year, term: newTerm.term },
    };

    // Store the term details in local storage.
    localStorage.setItem(
      'termData',
      JSON.stringify({
        year: year,
        term: newTerm.term,
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
