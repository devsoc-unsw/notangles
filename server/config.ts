import * as secret from './secret.json'

export enum Env {
  DEV = 'DEV',
  STAGING = 'STAGING',
  PROD = 'PROD',
}

interface IConfig {
  database: string
}

export const config: Record<Env, IConfig> = {
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
