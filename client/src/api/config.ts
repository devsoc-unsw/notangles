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

const LOCAL = 'http://localhost:3001';
const LIVE = 'https://timetable.csesoc.app';

const API_CONFIG: Record<string, Config> = Object.freeze({
  [Env.DEV]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/auto` },
  [Env.TEST]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/auto` },
  [Env.MOCK]: { timetable: `${LIVE}/api`, auto: `${LOCAL}/auto` },
  [Env.PROD]: { timetable: `${LIVE}/api`, auto: `${LIVE}/auto` },
});
export const API_URL: Config = API_CONFIG[import.meta.env.VITE_APP_ENVIRONMENT || Env.DEV];
