export default () => ({
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT ?? '3001', 10),
});
