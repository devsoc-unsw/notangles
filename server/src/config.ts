// Create a secret.json file. Go to the slack channel for the code
import * as secret from './secret.json'

export enum Env {
  DEV = 'DEV',
  STAGING = 'STAGING',
  PROD = 'PROD',
}

interface Config {
  database: string,
  scraper: string
}

export const allConfig: Record<Env, Config> = {
  [Env.DEV]: {
    // database: secret.dev,
    database: 'mongodb://database:27017/',
    scraper: 'mongodb://localhost:27017',
  },

  [Env.STAGING]: {
    database: secret.staging,
    scraper: 'mongodb://localhost:27017',
  },

  [Env.PROD]: {
    database: secret.prod,
    scraper: 'mongodb://localhost:27017',
  },
}
export const config: Config = allConfig[process.env.NODE_ENV || Env.DEV]
