export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  auto: process.env.AUTO_SERVER_URL ?? 'localhost:50051',
});
