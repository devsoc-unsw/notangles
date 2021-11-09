export enum Env {
  DEV = 'development',
  TEST = 'test',
  MOCK = 'mock',
  PROD = 'production',
}

const API_CONFIG: Record<string, string> = Object.freeze({
  [Env.DEV]: 'http://localhost:3001/api',
  [Env.TEST]: 'http://localhost:3001/api',
  [Env.MOCK]: 'https://timetable.csesoc.unsw.edu.au/api',
  [Env.PROD]: 'https://timetable.csesoc.unsw.edu.au/api',
});

export const API_URL: string = API_CONFIG[process.env.REACT_APP_ENVIRONMENT || Env.DEV];
