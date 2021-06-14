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
    database: 'mongodb://localhost:27017/',
    scraper: 'mongodb://localhost:27017',
  },

  [Env.STAGING]: {
    database: 'mongodb://database.notangles-db:27017/',
    scraper: 'mongodb://localhost:27017',
  },

  [Env.PROD]: {
    database: 'mongodb://database.notangles-db:27017/',
    scraper: 'mongodb://database.notangles-db:27017',
  },
}
export const config: Config = allConfig[process.env.NODE_ENV || Env.DEV]
