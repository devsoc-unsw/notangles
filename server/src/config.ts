export enum Env {
  DEV = 'DEV',
  PROD = 'PROD',
}

interface Config {
  auto: string;
  client: string;
  redirect_link: string;
}

export const API_CONFIG: Record<Env, Config> = {
  [Env.DEV]: {
    auto: `${process.env.AUTO_SERVER_HOST_NAME}:${process.env.AUTO_SERVER_HOST_PORT}`,
    client: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
    redirect_link: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
  },
  [Env.PROD]: {
    auto: `${process.env.AUTO_SERVER_HOST_NAME}:${process.env.AUTO_SERVER_HOST_PORT}`,
    client: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
    redirect_link: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
  },
};
export const config: Config = API_CONFIG[process.env.NODE_ENV || Env.DEV];
