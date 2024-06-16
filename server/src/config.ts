// export enum Env {
//   DEV = 'dev',
//   PROD = 'production',
// }

// interface Config {
//   auto: string;
//   client: string;
//   redirect_link: string;
// }

// export const API_CONFIG: Record<Env, Config> = {
//   [Env.DEV]: {
//     auto: 'localhost:50051',
//     client: 'http://localhost:5173',
//     redirect_link: 'http://localhost:5173',
//   },
//   [Env.PROD]: {
//     auto: process.env.AUTO_SERVER_HOST_NAME
//       ? 'localhost:50051'
//       : `${process.env.AUTO_SERVER_HOST_NAME}:${process.env.AUTO_SERVER_HOST_PORT}`,
//     client: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
//     redirect_link: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
//   },
// };
// export const config: Config = API_CONFIG[process.env.NODE_ENV || Env.DEV];

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT, 10) || 3000,
  auto: `${process.env.AUTO_SERVER_HOST_NAME}:${process.env.AUTO_SERVER_HOST_PORT}`,
  client: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
  redirectLink: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
}));

// export const REDIRECT_LINK = 'http://localhost:5173';
export const REDIRECT_LINK = 'https://notanglesstaging.devsoc.app/';
