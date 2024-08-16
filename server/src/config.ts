import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT, 10) || 3000,
  auto: `${process.env.AUTO_SERVER_HOST_NAME}:${process.env.AUTO_SERVER_HOST_PORT}`,
  client: `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
  redirectLink:
    process.env.NODE_ENV == 'dev'
      ? `http://${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`
      : `https://${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
}));
