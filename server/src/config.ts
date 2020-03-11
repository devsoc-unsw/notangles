// Create a secret.json file. Go to the slack channel for the code
import * as secret from './secret.json'

export enum Env {
  DEV = 'DEV',
  STAGING = 'STAGING',
  PROD = 'PROD',
}

interface Config {
  database: string
}

export const allConfig: Record<Env, Config> = {
  [Env.DEV]: {
    // database: secret.dev,
    database: 'mongodb://notangles_database:27017/'
  },

  [Env.STAGING]: {
    database: secret.staging,
  },

  [Env.PROD]: {
    database: secret.prod,
  },
}
export const config: Config = allConfig[process.env.NODE_ENV || Env.DEV]
