export const year = '2022';
const termNumber = 1;
export const term = `T${termNumber}`;
export const termName = `Term ${termNumber}`;
export const firstMomentOfTerm = `${year}-01-14T9:00:00.000`

export const colors: string[] = [
  '#009689', // dark green
  '#9E28AE', // violet
  '#00963C', // emerald
  '#683BB5', // purple
  '#2e89ff', // sapphire
  '#00BCD4', // turqoise
  '#2e89ff', // dark blue
  '#3323ad', // deep blue
  '#8AC352', // light green
];

export const days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const defaultStartTime: number = 9;
export const defaultEndTime: number = 18;

export const maxAddedCourses = 8;

// TODO: uncomment below to enable preview mode
export const isPreview = false; // process.env.REACT_APP_SHOW_PREVIEW === 'true';
