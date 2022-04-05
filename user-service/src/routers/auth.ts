// Router for user authentication
import { Issuer } from 'openid-client';
import { Router } from 'express';

const router = Router();

Issuer.discover('https://accounts.google.com').then((issuer) => {
  const client = new issuer.Client({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
  });

  // Redirect the user to the provider for authentication. When complete, the provider
  // will redirect the user back to the application at:
  //     /auth/google/return
  router.get('/google', (req, res) => {
    const authUrl = client.authorizationUrl({
      scope: 'openid email profile',
      state: 'mystate',
    });

    res.redirect(authUrl);
  });

  // Google will redirect the user to this URL after authentication. Finish the
  // authentication process by attempting to obtain an access token. If
  // access was granted, the user will be logged in. Otherwise, authentication
  // has failed.
  router.get('/google/return', (req, res) => {
    client.callback(req.url, { state: 'mystate' }).then((result) => {
      if (result.access_token) {
        res.send('You made it!');
      } else {
        res.send('Authentication failed.');
      }
    });
  });
});

export default router;
