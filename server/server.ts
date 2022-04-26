import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import app from './src/app';

// initializing sentry
Sentry.init({
  dsn: process.env.SENTRY_INGEST_SERVER,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: Number(process.env.SENTRY_TRACE_RATE_SERVER),
});

const server = app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});

export default server;
