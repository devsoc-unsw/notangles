//Create a secret.json file. Go to the slack channel for the code
import * as secret from './secret.json'

export enum Env {
  DEV = 'DEV',
  STAGING = 'STAGING',
  PROD = 'PROD',
}

interface IConfig {
  database: string
}

export const allConfig: Record<Env, IConfig> = {
  [Env.DEV]: {
    database: secret.dev,
  },

  [Env.STAGING]: {
    database: secret.staging,
  },

  [Env.PROD]: {
    database: secret.prod,
  },
}
export const config: IConfig = allConfig[process.env.NODE_ENV || Env.DEV]
