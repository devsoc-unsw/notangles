export enum Env {
  DEV = 'DEV',
  PROD = 'PROD',
}

interface Config {
  auto: string;
}

export const API_CONFIG: Record<Env, Config> = {
  [Env.DEV]: {
    auto: 'localhost:50051',
  },
  [Env.PROD]: {
    auto: `${process.env.AUTO_SERVER_HOSTNAME}:50051`,
  },
};
export const config: Config = API_CONFIG[process.env.NODE_ENV || Env.DEV];
