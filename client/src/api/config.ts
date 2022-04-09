export enum Env {
  DEV = 'development',
  TEST = 'test',
  MOCK = 'mock',
  PROD = 'production',
}

interface Config {
  timetable: string;
  auto: string;
}

const LOCALHOST = 'http://localhost:3001:';
const TIMETABLE = 'https://timetable.csesoc.app';
const AUTOTIMETABLER = 'http://localhost:3001';

const API_CONFIG: Record<string, Config> = Object.freeze({
  [Env.DEV]: { timetable: `${LOCALHOST}/api`, auto: `${LOCALHOST}/auto` },
  [Env.TEST]: { timetable: `${LOCALHOST}/api`, auto: `${LOCALHOST}/auto` },
  [Env.MOCK]: { timetable: `${TIMETABLE}/api`, auto: `${AUTOTIMETABLER}/auto` },
  [Env.PROD]: { timetable: `${TIMETABLE}/api`, auto: `${AUTOTIMETABLER}/auto` },
});

export const API_URL: Config = API_CONFIG[process.env.REACT_APP_ENVIRONMENT || Env.DEV];
