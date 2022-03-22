export const year = '2022';
const termNumber = 2;
export const term = `T${termNumber}`;
export const termName = `Term ${termNumber}`;
export const firstMomentOfTerm = `2022-05-30T04:00:00.000Z`; // must 12am of the first day, be correct in utc https://www.timestamp-converter.com/

export const colors: string[] = [
  '#137786', // dark cyan
  '#a843a4', // light purple
  '#134e86', // light blue
  '#138652', // light green
  '#861313', // dark red
  '#868413', // dark yellow
  '#2e89ff', // dark blue
  '#3323ad', // deep blue
  '#8AC352', // light green
];

export const defaultStartTime: number = 9;
export const defaultEndTime: number = 18;

export const maxAddedCourses = 8;

// TODO: uncomment below to enable preview mode
export const isPreview = false; // process.env.REACT_APP_SHOW_PREVIEW === 'true';
