// Router for user authentication
import { Issuer } from 'openid-client';
import { Router } from 'express';

const router = Router();

Issuer.discover('https://accounts.google.com')
  .then(issuer => {
    const client = new issuer.Client({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    });

    router.get('/google', (req, res) => {
      const authUrl = client.authorizationUrl({
        scope: 'openid email profile',
        state: 'mystate',
      });

      res.redirect(authUrl);
    });



export default router;
