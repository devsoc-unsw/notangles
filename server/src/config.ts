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
