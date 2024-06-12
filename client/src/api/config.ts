export enum Env {
  DEV = 'development',
  TEST = 'test',
  MOCK = 'mock',
  PROD = 'production',
}

interface Config {
  timetable: string;
  auto: string;
  server: string;
}

const LOCAL = 'http://localhost:3001';
const LIVE = 'https://timetable.devsoc.app';

const API_CONFIG: Record<string, Config> = Object.freeze({
  [Env.DEV]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.TEST]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.MOCK]: { timetable: `${LIVE}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.PROD]: { timetable: `${LIVE}/api`, auto: `/api/auto`, server: `${LOCAL}/api` },
});

export const API_URL: Config = API_CONFIG[import.meta.env.VITE_APP_ENVIRONMENT || Env.DEV];
