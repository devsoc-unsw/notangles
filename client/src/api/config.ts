import { ApolloClient, InMemoryCache } from '@apollo/client';

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
const HASURAGRES_GRAPHQL_API = 'https://graphql.csesoc.app/v1/graphql';
const LOCAL = 'http://localhost:3001';

export const client = new ApolloClient({
  uri: HASURAGRES_GRAPHQL_API,
  cache: new InMemoryCache(),
});

const API_CONFIG: Record<string, Config> = Object.freeze({
  [Env.DEV]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.TEST]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
});
export const API_URL: Config = API_CONFIG[import.meta.env.VITE_APP_ENVIRONMENT || Env.DEV];
