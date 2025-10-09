import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import axios from 'axios';

export enum Env {
  DEV = 'development',
  TEST = 'test',
  MOCK = 'mock',
  PROD = 'production',
}

interface Config {
  timetable?: string;
  auto: string;
  server: string;
}

// TODO: Load from .env file
const HASURAGRES_GRAPHQL_API = 'https://graphqlstaging.devsoc.app/v1/graphql';
const LOCAL = 'http://localhost:3001';

export const client = new ApolloClient({
  cache: new InMemoryCache(),

  link: new HttpLink({
    uri: HASURAGRES_GRAPHQL_API,
  }),
});

const API_CONFIG: Record<string, Config> = Object.freeze({
  [Env.DEV]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.TEST]: { timetable: `${LOCAL}/api`, auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.MOCK]: { auto: `${LOCAL}/api/auto`, server: `${LOCAL}/api` },
  [Env.PROD]: { auto: `/api/auto`, server: `/api` },
});
export const API_URL: Config = API_CONFIG[import.meta.env.VITE_APP_ENVIRONMENT || Env.DEV];

export const apiClient = axios.create({
  baseURL: API_URL.server,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
